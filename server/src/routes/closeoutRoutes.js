const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const {
    Prisma,
    fail,
    id,
    text,
    date,
    decimal,
    choice,
    audit,
    notify,
    leaseAccess,
    invoiceAccess,
    route,
} = require('../lib/domain');
const {
    anchorDate,
    utilityItems,
    rentUntil,
} = require('../lib/billing-calculation');
const { total: invoiceTotal } = require('../lib/invoice-totals');
const router = express.Router();
router.use(auth);
const admin = authorize('ADMIN');
const today = () =>
    new Date(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date()) + 'T00:00:00Z',
    );
const json = (value) => JSON.parse(JSON.stringify(value));
const lockLease = (tx, leaseId) =>
    tx.$queryRaw`SELECT id FROM Lease WHERE id = ${leaseId} FOR UPDATE`;

router.post(
    '/invoices/:invoiceId/adjustments',
    admin,
    route(async (req, res) => {
        const invoiceId = id(req.params.invoiceId),
            sign = choice(req.body.direction, ['DEBIT', 'CREDIT']),
            reason = text(req.body.reason);
        const absolute = decimal(req.body.amount, 2, '9999999999.99', true),
            amount = sign === 'CREDIT' ? absolute.neg() : absolute;
        const target = await invoiceAccess(prisma, invoiceId, req.user);
        const itemType = choice(req.body.itemType || 'RENT', ['RENT', 'WATER', 'ELECTRICITY']);
        const row = await prisma.$transaction(async (tx) => {
            await lockLease(tx, target.leaseId);
            await tx.$queryRaw`SELECT id FROM Invoice WHERE id = ${invoiceId} FOR UPDATE`;
            const invoice = await invoiceAccess(tx, invoiceId, req.user);
            const category = invoice.items.filter(item => item.itemType === itemType);
            if (!category.length) fail(400, 'บิลนี้ไม่มีค่าใช้จ่ายประเภทที่เลือก');
            const categoryBalance = category.reduce((sum, item) => sum.add(item.amount), new Prisma.Decimal(0))
                .add(invoice.adjustments.filter(row => row.itemType === itemType).reduce((sum, row) => sum.add(row.amount), new Prisma.Decimal(0)));
            if (categoryBalance.add(amount).lt(0)) fail(400, 'ยอดลดเกินค่าใช้จ่ายประเภทที่เลือก');
            if (
                !['ISSUED', 'PAID'].includes(invoice.status) ||
                (await tx.leaseCloseout.count({
                    where: { leaseId: invoice.leaseId },
                }))
            )
                fail(409, 'บิลยกเลิกหรือสัญญาปิดยอดแล้ว');
            if (invoiceTotal(invoice).add(amount).lt(0))
                fail(400, 'ยอดลดเกินยอดบิลคงเหลือ');
            if (invoice.settlement && amount.gt(0))
                fail(409, 'บิลชำระแล้ว ออกได้เฉพาะใบลดหนี้ ไม่เพิ่มยอดบิลที่ปิดแล้ว');
            if (
                await tx.invoicePayment.count({
                    where: { invoiceId, status: 'PENDING' },
                })
            )
                fail(409, 'กรุณาตรวจหรือปฏิเสธรายการชำระที่รอตรวจก่อนปรับยอด');
            const created = await tx.invoiceAdjustment.create({
                data: { invoiceId, amount, itemType, reason, createdBy: req.user.userId, refundEligible: Boolean(invoice.settlement) && amount.lt(0) },
            });
            if (!invoice.settlement && invoiceTotal(invoice).add(amount).eq(0))
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: { status: 'CANCELLED' },
                });
            await audit(
                tx,
                req.user,
                'ADJUST_INVOICE',
                'Invoice',
                invoiceId,
                reason,
            );
            await notify(
                tx,
                invoice.lease.tenant.userId,
                'บันทึกปรับยอดใบแจ้งหนี้',
                invoice.invoiceNo + ': ' + reason,
            );
            return created;
        });
        res.status(201).json(row);
    }),
);
router.post(
    '/adjustments/:adjustmentId/refund',
    admin,
    route(async (req, res) => {
        const target = await prisma.invoiceAdjustment.findUnique({
            where: { id: id(req.params.adjustmentId) },
            include: { invoice: { select: { leaseId: true } } },
        });
        if (!target) fail(404, 'ไม่พบใบลดหนี้');
        const method = choice(req.body.method, ['CASH', 'TRANSFER']);
        res.json(
            await prisma.$transaction(async (tx) => {
                await lockLease(tx, target.invoice.leaseId);
                await tx.$queryRaw`SELECT id FROM Invoice WHERE id = ${target.invoiceId} FOR UPDATE`;
                const invoice = await invoiceAccess(
                    tx,
                    target.invoiceId,
                    req.user,
                );
                const adjustment = await tx.invoiceAdjustment.findUnique({
                    where: { id: target.id },
                });
                if (
                    await tx.leaseCloseout.count({
                        where: { leaseId: invoice.leaseId },
                    })
                )
                    fail(409, 'สัญญาปิดยอดแล้ว ให้คืนเงินผ่านรายการปิดยอด');
                if (!invoice.settlement || adjustment.amount.gte(0))
                    fail(409, 'คืนเงินได้เฉพาะใบลดหนี้ของบิลที่ชำระแล้ว');
                if (adjustment.refundEligible !== true) fail(409, 'รายการนี้ไม่ได้ลดหนี้หลังรับชำระ หรือยังไม่ยืนยันสิทธิ์คืนเงิน ห้ามคืนซ้ำกับส่วนลดก่อนชำระ');
                if (adjustment.refundedAt) return adjustment;
                const row = await tx.invoiceAdjustment.update({
                    where: { id: adjustment.id },
                    data: { refundedAt: new Date(), refundMethod: method },
                });
                await audit(
                    tx,
                    req.user,
                    'REFUND_CREDIT',
                    'InvoiceAdjustment',
                    row.id,
                    'บันทึกคืนเงินจริงตามใบลดหนี้',
                );
                return row;
            }),
        );
    }),
);
router.get(
    '/closeouts',
    route(async (req, res) =>
        res.json(
            await prisma.leaseCloseout.findMany({
                where:
                    req.user.role === 'ADMIN'
                        ? {}
                        : { lease: { tenant: { userId: req.user.userId } } },
                include: {
                    lease: {
                        select: {
                            contractNo: true,
                            room: { select: { roomNumber: true } },
                        },
                    },
                },
                orderBy: { id: 'desc' },
            }),
        ),
    ),
);
const calculate = async (tx, lease, checkoutDate, manual = [], strict = true) => {
    if (!Array.isArray(manual) || manual.length > 1000) fail(400, 'รายการปรับน้ำไฟไม่ถูกต้อง');
    const supplied = new Map();
    for (const entry of manual) {
        if (!entry || typeof entry !== 'object') fail(400, 'รายการปรับน้ำไฟไม่ถูกต้อง');
        const adjustmentId = id(entry.adjustmentId);
        if (supplied.has(adjustmentId)) fail(400, 'ระบุใบปรับยอดซ้ำ');
        supplied.set(adjustmentId, { amount: decimal(entry.amount), reason: text(entry.reason), reference: text(entry.reference) });
    }
    const consumed = new Set();
    if (checkoutDate <= lease.startDate || checkoutDate > today())
        fail(400, 'วันย้ายออกต้องหลังวันเริ่มสัญญา และไม่เกินวันนี้');
    const rent = rentUntil(lease, checkoutDate),
        items = [];
    for (
        let cycle = 0;
        anchorDate(lease.startDate, cycle) < checkoutDate;
        cycle++
    ) {
        const from = anchorDate(lease.startDate, cycle),
            end = anchorDate(lease.startDate, cycle + 1),
            to = end < checkoutDate ? end : checkoutDate;
        const billed = await tx.invoice.findUnique({
            where: {
                leaseId_cycleIndex: {
                    leaseId: lease.id,
                    cycleIndex: cycle + 1,
                },
            },
            include: { items: true },
        });
        if (billed && to.getTime() === end.getTime())
            items.push(
                ...billed.items.filter((item) => item.itemType !== 'RENT'),
            );
        else items.push(...(await utilityItems(tx, lease.roomId, from, to)));
    }
    const utilitiesDue = items.reduce(
        (sum, item) => sum.add(item.amount),
        new Prisma.Decimal(0),
    );
    const payments = await tx.invoicePayment.findMany({
        where: {
            invoice: { leaseId: lease.id },
            status: 'CONFIRMED',
            settlement: { isNot: null },
        },
    });
    const adjustments = await tx.invoiceAdjustment.findMany({
        where: { invoice: { leaseId: lease.id } },
        include: { invoice: { select: { periodStart: true, periodEnd: true, cycleIndex: true } } },
    });
    const allocation = adjustments.map(row => {
        if (!row.itemType) fail(409, 'รายการปรับยอดเดิมยังไม่ระบุประเภทค่าใช้จ่าย ต้องตรวจหลักฐานก่อนปิดยอด');
        let applied = row.amount;
        if (row.itemType === 'RENT') {
            const from = row.invoice.periodStart, until = checkoutDate < row.invoice.periodEnd ? checkoutDate : row.invoice.periodEnd;
            const usedDays = Math.max(0, (until - from) / 86400000), cycleDays = (row.invoice.periodEnd - from) / 86400000;
            applied = row.amount.mul(usedDays).div(cycleDays).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
            return { adjustmentId: row.id, itemType: row.itemType, original: row.amount.toString(), applied: applied.toString(), usedDays, cycleDays };
        }
        const utilityStart = anchorDate(lease.startDate, row.invoice.cycleIndex - 1), utilityEnd = row.invoice.periodStart;
        if (utilityStart >= checkoutDate) applied = new Prisma.Decimal(0);
        else if (utilityEnd > checkoutDate) {
            const selected = supplied.get(row.id);
            if (!selected) {
                if (strict) fail(409, 'กรุณาระบุยอดปรับน้ำไฟตามหลักฐานมิเตอร์และตรวจตัวอย่างก่อนปิดยอด');
                return { adjustmentId: row.id, itemType: row.itemType, original: row.amount.toString(), applied: '0', requiresManual: true };
            }
            consumed.add(row.id);
            if (selected.amount.gt(row.amount.abs())) fail(400, 'ยอดปรับที่ใช้จริงเกินยอดรายการเดิม');
            applied = row.amount.lt(0) ? selected.amount.neg() : selected.amount;
            return { adjustmentId: row.id, itemType: row.itemType, original: row.amount.toString(), applied: applied.toString(), manual: true, reason: selected.reason, reference: selected.reference };
        }
        return { adjustmentId: row.id, itemType: row.itemType, original: row.amount.toString(), applied: applied.toString() };
    });
    if ([...supplied.keys()].some(key => !consumed.has(key))) fail(400, 'ใบปรับยอดไม่ใช่น้ำไฟคร่อมวันออกของสัญญานี้');
    for (const itemType of ['WATER', 'ELECTRICITY']) {
        const actual = items.filter(item => item.itemType === itemType).reduce((sum, item) => sum.add(item.amount), new Prisma.Decimal(0));
        const adjusted = allocation.filter(item => item.itemType === itemType).reduce((sum, item) => sum.add(item.applied), actual);
        if (adjusted.lt(0)) fail(400, 'ยอดลดน้ำไฟเกินค่าใช้จ่ายจริงของประเภทนั้น');
    }
    const credits = allocation.reduce((sum, row) => sum.add(row.applied), new Prisma.Decimal(0));
    const returned = adjustments
        .filter((row) => row.refundedAt)
        .reduce((sum, row) => sum.add(row.amount.abs()), new Prisma.Decimal(0));
    const previouslyPaid = payments
        .reduce(
            (sum, payment) => sum.add(payment.amount),
            new Prisma.Decimal(0),
        )
        .sub(returned);
    const balance = rent.amount
        .add(utilitiesDue)
        .add(credits)
        .sub(previouslyPaid);
    if (balance.lt(previouslyPaid.neg())) fail(409, 'ยอดลดหนี้เกินค่าใช้จ่ายตามวันจริง ต้องตรวจการจัดสรรส่วนลดก่อนปิดยอด ไม่คืนเกินเงินรับสุทธิ');
    if (
        [rent.amount, utilitiesDue, previouslyPaid, balance.abs()].some(
            (value) => value.gt('9999999999.99'),
        )
    )
        fail(400, 'ยอดปิดสัญญาเกินช่วงที่รองรับ');
    return {
        rentDue: rent.amount,
        utilitiesDue,
        previouslyPaid,
        balance,
        details: json({
            rent: rent.details,
            utilities: items,
            adjustments,
            allocation,
            adjustmentTotal: credits,
            previouslyRefunded: returned,
            convention: 'รวมวันเริ่ม ไม่รวมวันย้ายออก เงินประกันแยกต่างหาก',
        }),
    };
};
router.post(
    '/leases/:leaseId/closeout-preview',
    admin,
    route(async (req, res) => {
        const lease = await leaseAccess(prisma, req.params.leaseId, req.user);
        res.json(
            await prisma.$transaction(
                (tx) => calculate(tx, lease, date(req.body.checkoutDate), req.body.utilityAdjustments, false),
                { timeout: 30000 },
            ),
        );
    }),
);
const finalizeCloseout = async (req, res) => {
        const target = await leaseAccess(prisma, req.params.leaseId, req.user),
            checkoutDate = date(req.body.checkoutDate),
            reason = text(req.body.reason);
        const row = await prisma.$transaction(
            async (tx) => {
                await lockRoom(tx, target.roomId);
                await lockLease(tx, target.id);
                const lease = await leaseAccess(tx, target.id, req.user);
                const existing = await tx.leaseCloseout.findUnique({
                    where: { leaseId: lease.id },
                });
                if (existing) {
                    if (
                        existing.checkoutDate.getTime() !==
                        checkoutDate.getTime()
                    )
                        fail(409, 'ปิดยอดแล้วด้วยวันที่อื่น');
                    return existing;
                }
                if (!['ACTIVE', 'ENDED'].includes(lease.status))
                    fail(409, 'ต้องเริ่มใช้สัญญาก่อนปิดยอด');
                const invoices = await tx.invoice.findMany({
                    where: { leaseId: lease.id },
                    orderBy: { id: 'asc' },
                    select: { id: true },
                });
                for (const invoice of invoices)
                    await tx.$queryRaw`SELECT id FROM Invoice WHERE id = ${invoice.id} FOR UPDATE`;
                if (
                    await tx.invoicePayment.count({
                        where: {
                            invoice: { leaseId: lease.id },
                            status: 'PENDING',
                        },
                    })
                )
                    fail(409, 'ต้องตรวจหรือปฏิเสธการชำระที่รอตรวจก่อนปิดยอด');
                const totals = await calculate(tx, lease, checkoutDate, req.body.utilityAdjustments);
                if (req.body.utilityAdjustments?.length && req.body.expectedBalance === undefined)
                    fail(400, 'กรุณาตรวจตัวอย่างยอดปิดสัญญาก่อนยืนยันรายการปรับน้ำไฟ');
                if (
                    req.body.expectedBalance !== undefined &&
                    String(req.body.expectedBalance) !==
                        totals.balance.toString()
                )
                    fail(409, 'ยอดเปลี่ยนหลังตรวจ กรุณาคำนวณตัวอย่างใหม่ก่อนยืนยัน');
                const result = await tx.leaseCloseout.create({
                    data: {
                        leaseId: lease.id,
                        checkoutDate,
                        ...totals,
                        reason,
                        createdBy: req.user.userId,
                        settledAt: totals.balance.eq(0) ? new Date() : null,
                    },
                });
                await tx.invoice.updateMany({
                    where: { leaseId: lease.id, status: 'ISSUED' },
                    data: { status: 'CLOSED' },
                });
                await tx.lease.update({
                    where: { id: lease.id },
                    data: {
                        status: 'ENDED',
                        activeRoomId: null,
                        checkoutDate,
                        endedAt: new Date(),
                    },
                });
                if (
                    !(await tx.lease.count({
                        where: { activeRoomId: lease.roomId },
                    })) &&
                    !(await tx.booking.count({
                        where: { roomId: lease.roomId, status: 'CONFIRMED' },
                    }))
                )
                    await tx.room.update({
                        where: { id: lease.roomId },
                        data: { isAvailable: true },
                    });
                await audit(
                    tx,
                    req.user,
                    'CLOSEOUT_LEASE',
                    'Lease',
                    lease.id,
                    reason,
                );
                await notify(
                    tx,
                    lease.tenant.userId,
                    'สรุปยอดสิ้นสุดสัญญา',
                    'ตรวจรายการปิดยอดของสัญญา ' + lease.contractNo,
                );
                return result;
            },
            { timeout: 30000 },
        );
        res.status(201).json(row);

};
router.post('/leases/:leaseId/closeout', admin, route(finalizeCloseout));
router.post(
    '/closeouts/:closeoutId/settle',
    admin,
    route(async (req, res) => {
        const target = await prisma.leaseCloseout.findUnique({
            where: { id: id(req.params.closeoutId) },
        });
        if (!target) fail(404, 'ไม่พบรายการปิดยอด');
        const method = choice(req.body.method, ['CASH', 'TRANSFER']);
        res.json(
            await prisma.$transaction(async (tx) => {
                await lockLease(tx, target.leaseId);
                const row = await tx.leaseCloseout.findUnique({
                    where: { id: target.id },
                });
                if (row.settledAt) return row;
                if (
                    !decimal(req.body.amount, 2, '9999999999.99', true).eq(
                        row.balance.abs(),
                    )
                )
                    fail(400, 'ต้องรับหรือคืนเต็มยอดตามรายการปิดสัญญา');
                const result = await tx.leaseCloseout.update({
                    where: { id: row.id },
                    data: { settledAt: new Date(), method },
                });
                await audit(
                    tx,
                    req.user,
                    'SETTLE_CLOSEOUT',
                    'LeaseCloseout',
                    row.id,
                    row.balance.lt(0)
                        ? 'บันทึกคืนเงินค่าเช่าที่ชำระเกินจริง'
                        : 'ยืนยันรับชำระยอดปิดสัญญาเต็มจำนวน',
                );
                return result;
            }),
        );
    }),
);
router.finalizeCloseout = finalizeCloseout;
module.exports = router;
