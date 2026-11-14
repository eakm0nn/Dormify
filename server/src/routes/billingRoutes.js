const express = require('express');
const { randomUUID, createHash } = require('node:crypto');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const { Prisma, fail, id, text, date, decimal, choice, audit, notify, leaseAccess, invoiceAccess, route } = require('../lib/domain');
const router = express.Router();
router.use(authenticate);
const admin = authorize('ADMIN');
const lockLease = (tx, leaseId) => tx.$queryRaw`SELECT id FROM Lease WHERE id = ${leaseId} FOR UPDATE`;
const lockInvoice = (tx, invoiceId) => tx.$queryRaw`SELECT id FROM Invoice WHERE id = ${invoiceId} FOR UPDATE`;
const utility = value => choice(value, ['WATER', 'ELECTRICITY']);
const method = value => choice(value, ['CASH', 'TRANSFER']);
const money = value => decimal(value, 2, '9999999999.99', true);
const anchorDate = (start, index) => {
    const month = start.getUTCMonth() + index, year = start.getUTCFullYear();
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(start.getUTCDate(), last)));
};
const bangkokToday = () => date(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));

router.get('/policy', admin, route(async (req, res) => res.json(await prisma.rentalPolicy.findFirst({ orderBy: { id: 'desc' } }))));
router.post('/policy', admin, route(async (req, res) => {
    const { holdHours, depositMonths, dueDays } = req.body;
    if (![holdHours, depositMonths, dueDays].every(Number.isSafeInteger) || holdHours < 1 || holdHours > 8760 || depositMonths < 0 || depositMonths > 120 || dueDays < 0 || dueDays > 365) fail(400, 'ค่านโยบายไม่อยู่ในช่วงที่กำหนด');
    res.status(201).json(await prisma.$transaction(async tx => {
        const result = await tx.rentalPolicy.create({ data: { holdHours, depositMonths, dueDays, createdBy: req.user.userId } });
        await audit(tx, req.user, 'CHANGE_POLICY', 'RentalPolicy', result.id, 'เปลี่ยนนโยบายสำหรับรายการใหม่เท่านั้น'); return result;
    }));
}));
router.get('/rates', admin, route(async (req, res) => res.json(await prisma.utilityRate.findMany({ orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }] }))));
router.post('/rates', admin, route(async (req, res) => {
    const data = { utilityType: utility(req.body.utilityType), unitPrice: decimal(req.body.unitPrice, 6, '999999.999999'), effectiveFrom: date(req.body.effectiveFrom), sourceReference: text(req.body.sourceReference), createdBy: req.user.userId };
    res.status(201).json(await prisma.$transaction(async tx => { const row = await tx.utilityRate.create({ data }); await audit(tx, req.user, 'CREATE_RATE', 'UtilityRate', row.id, 'บันทึกอัตราและที่มาของอัตรารุ่นใหม่'); return row; }));
}));
router.get('/readings', admin, route(async (req, res) => res.json(await prisma.meterReading.findMany({ where: req.query.roomId ? { roomId: id(req.query.roomId) } : {}, include: { room: true }, orderBy: [{ readingDate: 'desc' }, { id: 'desc' }] }))));
router.post('/readings', admin, route(async (req, res) => {
    const data = { roomId: id(req.body.roomId), utilityType: utility(req.body.utilityType), readingDate: date(req.body.readingDate), value: decimal(req.body.value, 3, '99999999999.999'), createdBy: req.user.userId };
    res.status(201).json(await prisma.$transaction(async tx => {
        await lockRoom(tx, data.roomId);
        if (!await tx.room.findUnique({ where: { id: data.roomId } })) fail(404, 'ไม่พบห้องพัก');
        const previous = await tx.meterReading.findFirst({ where: { roomId: data.roomId, utilityType: data.utilityType }, orderBy: { readingDate: 'desc' } });
        if (previous && (data.readingDate <= previous.readingDate || data.value.lt(previous.value))) fail(409, 'ต้องบันทึกวันที่ถัดจากเดิม และเลขมิเตอร์ต้องไม่ลดลง');
        const row = await tx.meterReading.create({ data }); await audit(tx, req.user, 'RECORD_METER', 'MeterReading', row.id, 'บันทึกเลขมิเตอร์ตามวันที่จริง'); return row;
    }));
}));

router.get('/invoices', route(async (req, res) => res.json(await prisma.invoice.findMany({ where: req.user.role === 'ADMIN' ? {} : { lease: { tenant: { userId: req.user.userId } } }, include: { items: true, settlement: true }, orderBy: { id: 'desc' } }))));
router.get('/invoices/:invoiceId', route(async (req, res) => res.json(await invoiceAccess(prisma, req.params.invoiceId, req.user))));
router.post('/invoices', admin, route(async (req, res) => {
    const leaseId = id(req.body.leaseId), cycleIndex = req.body.cycleIndex;
    if (!Number.isSafeInteger(cycleIndex) || cycleIndex < 0 || cycleIndex > 1200) fail(400, 'ลำดับรอบบิลไม่ถูกต้อง');
    const invoice = await prisma.$transaction(async tx => {
        await lockLease(tx, leaseId);
        const lease = await leaseAccess(tx, leaseId, req.user);
        if (!['ACTIVE', 'ENDED'].includes(lease.status)) fail(409, 'ออกบิลได้เมื่อสัญญาเริ่มใช้งานแล้ว');
        const periodStart = anchorDate(lease.startDate, cycleIndex), periodEnd = anchorDate(lease.startDate, cycleIndex + 1);
        if (lease.endDate && periodStart >= lease.endDate) fail(409, 'รอบบิลเกินวันสิ้นสุดสัญญา');
        if (lease.status === 'ENDED' && periodStart > lease.endedAt) fail(409, 'ไม่ออกบิลอนาคตของสัญญาที่จบแล้ว');
        if (await tx.invoice.findUnique({ where: { leaseId_cycleIndex: { leaseId, cycleIndex } } })) fail(409, 'ออกบิลรอบนี้แล้ว');
        const items = [{ itemType: 'RENT', quantity: new Prisma.Decimal(1), unitPrice: lease.monthlyRent, amount: lease.monthlyRent }];
        // Rent is for the coming cycle. Utilities use exact readings for the preceding cycle.
        if (cycleIndex > 0) {
            const utilityStart = anchorDate(lease.startDate, cycleIndex - 1);
            for (const utilityType of ['WATER', 'ELECTRICITY']) {
                const readings = await tx.meterReading.findMany({ where: { roomId: lease.roomId, utilityType, readingDate: { in: [utilityStart, periodStart] } }, orderBy: { readingDate: 'asc' } });
                if (readings.length !== 2) fail(409, 'เลขมิเตอร์ต้นและปลายรอบย้อนหลังยังไม่ครบ จึงยังออกบิลไม่ได้');
                const rate = await tx.utilityRate.findFirst({ where: { utilityType, effectiveFrom: { lte: utilityStart } }, orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }] });
                if (!rate) fail(409, 'ยังไม่มีอัตราน้ำไฟที่มีผลตั้งแต่ต้นรอบ');
                const changedMidCycle = await tx.utilityRate.count({ where: { utilityType, effectiveFrom: { gt: utilityStart, lt: periodStart } } });
                if (changedMidCycle) fail(409, 'อัตราเปลี่ยนกลางรอบ ต้องตกลงวิธีแบ่งช่วงก่อน ไม่คำนวณประมาณให้เอง');
                const quantity = readings[1].value.sub(readings[0].value);
                if (quantity.lt(0)) fail(409, 'เลขมิเตอร์ปลายรอบน้อยกว่าต้นรอบ');
                items.push({ itemType: utilityType, quantity, unitPrice: rate.unitPrice, amount: quantity.mul(rate.unitPrice).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP), openingValue: readings[0].value, closingValue: readings[1].value, sourceReference: rate.sourceReference });
            }
        }
        const totalAmount = items.reduce((sum, item) => sum.add(item.amount), new Prisma.Decimal(0)); money(totalAmount.toFixed(2));
        const dueDate = bangkokToday(); dueDate.setUTCDate(dueDate.getUTCDate() + lease.dueDaysSnapshot);
        const row = await tx.invoice.create({ data: { invoiceNo: 'INV-' + randomUUID().slice(0, 18), leaseId, cycleIndex, periodStart, periodEnd, dueDate, dueDaysSnapshot: lease.dueDaysSnapshot, tenantNameSnapshot: lease.tenant.name, roomNumberSnapshot: lease.room.roomNumber, totalAmount, items: { create: items } }, include: { items: true } });
        await audit(tx, req.user, 'ISSUE_INVOICE', 'Invoice', row.id, 'ออกบิลค่าเช่าล่วงหน้าและน้ำไฟย้อนหลัง เก็บอัตราเดิม');
        await notify(tx, lease.tenant.userId, 'ใบแจ้งหนี้ใหม่', 'ใบแจ้งหนี้ ' + row.invoiceNo + ' พร้อมตรวจสอบแล้ว'); return row;
    });
    res.status(201).json(invoice);
}));

const paymentInclude = { invoice: { select: { id: true, invoiceNo: true, totalAmount: true, status: true, leaseId: true } }, proof: { select: { id: true, mime: true, size: true } } };
router.get('/payments', route(async (req, res) => res.json(await prisma.invoicePayment.findMany({ where: req.user.role === 'ADMIN' ? {} : { invoice: { lease: { tenant: { userId: req.user.userId } } } }, include: paymentInclude, orderBy: { id: 'desc' } }))));
router.post('/payments', route(async (req, res) => {
    const invoiceId = id(req.body.invoiceId), paymentMethod = method(req.body.method), amount = money(req.body.amount), paidDate = date(req.body.paidDate);
    if (paymentMethod === 'CASH' && req.user.role !== 'ADMIN') fail(403, 'เงินสดต้องให้ Admin บันทึกเมื่อรับเงินจริง');
    const payment = await prisma.$transaction(async tx => {
        await lockInvoice(tx, invoiceId);
        const invoice = await invoiceAccess(tx, invoiceId, req.user);
        if (invoice.status !== 'ISSUED' || invoice.settlement) fail(409, 'ใบแจ้งหนี้นี้ชำระแล้ว');
        if (!amount.eq(invoice.totalAmount)) fail(400, 'ต้องชำระเต็มยอดตามบิล ไม่มีการแบ่งชำระ');
        const row = await tx.invoicePayment.create({ data: { invoiceId, method: paymentMethod, amount, paidDate, submittedBy: req.user.userId }, include: paymentInclude });
        await audit(tx, req.user, 'SUBMIT_PAYMENT', 'InvoicePayment', row.id, 'แจ้งชำระเงิน รอตรวจสอบ ไม่ถือเป็นรับเงินแล้ว'); return row;
    }); res.status(201).json(payment);
}));
router.post('/payments/:paymentId/proof', express.raw({ type: ['image/png', 'image/jpeg'], limit: '2mb' }), route(async (req, res) => {
    const paymentId = id(req.params.paymentId), buffer = req.body, mime = req.headers['content-type']?.split(';')[0];
    if (!Buffer.isBuffer(buffer) || buffer.length < 24 || buffer.length > 2 * 1024 * 1024) fail(400, 'รับเฉพาะภาพ PNG/JPEG ขนาดไม่เกิน 2 MB');
    const png = mime === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && buffer.subarray(12, 16).toString() === 'IHDR' && buffer.subarray(-8, -4).toString() === 'IEND';
    const jpeg = mime === 'image/jpeg' && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 && buffer[buffer.length - 2] === 255 && buffer[buffer.length - 1] === 217;
    if (!png && !jpeg) fail(400, 'ชนิดไฟล์กับเนื้อหาภาพไม่ตรงกัน');
    const result = await prisma.$transaction(async tx => {
        const target = await tx.invoicePayment.findUnique({ where: { id: paymentId } }); if (!target) fail(404, 'ไม่พบการชำระเงิน');
        await lockInvoice(tx, target.invoiceId); await invoiceAccess(tx, target.invoiceId, req.user);
        const payment = await tx.invoicePayment.findUnique({ where: { id: paymentId } });
        if (payment.method !== 'TRANSFER' || payment.status !== 'PENDING') fail(409, 'แนบหลักฐานได้เฉพาะรายการโอนที่รอตรวจ');
        const proof = await tx.paymentProof.upsert({ where: { paymentId }, create: { paymentId, data: buffer, mime, size: buffer.length, checksum: createHash('sha256').update(buffer).digest('hex') }, update: { data: buffer, mime, size: buffer.length, checksum: createHash('sha256').update(buffer).digest('hex') }, select: { id: true, size: true, mime: true } });
        await audit(tx, req.user, 'UPLOAD_PROOF', 'InvoicePayment', paymentId, 'แนบภาพหลักฐานส่วนตัว'); return proof;
    }); res.status(201).json(result);
}));
router.get('/payments/:paymentId/proof', route(async (req, res) => {
    const payment = await prisma.invoicePayment.findUnique({ where: { id: id(req.params.paymentId) } }); if (!payment) fail(404, 'ไม่พบหลักฐาน');
    await invoiceAccess(prisma, payment.invoiceId, req.user);
    const proof = await prisma.paymentProof.findUnique({ where: { paymentId: payment.id } }); if (!proof) fail(404, 'ยังไม่ได้แนบหลักฐาน');
    res.set({ 'Content-Type': proof.mime, 'Content-Disposition': 'attachment; filename="payment-' + payment.id + (proof.mime === 'image/png' ? '.png"' : '.jpg"'), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.send(proof.data);
}));
router.post('/payments/:paymentId/review', admin, route(async (req, res) => {
    const paymentId = id(req.params.paymentId), status = choice(req.body.status, ['CONFIRMED', 'REJECTED']);
    const target = await prisma.invoicePayment.findUnique({ where: { id: paymentId } }); if (!target) fail(404, 'ไม่พบการชำระเงิน');
    res.json(await prisma.$transaction(async tx => {
        await lockInvoice(tx, target.invoiceId);
        const payment = await tx.invoicePayment.findUnique({ where: { id: paymentId }, include: { proof: { select: { id: true } } } });
        const invoice = await invoiceAccess(tx, payment.invoiceId, req.user);
        if (payment.status === status) return { id: payment.id, status: payment.status };
        if (payment.status !== 'PENDING' || invoice.settlement) fail(409, 'รายการนี้ถูกตรวจหรือบิลชำระแล้ว');
        if (status === 'CONFIRMED') {
            if (payment.method === 'TRANSFER' && !payment.proof) fail(409, 'ต้องมีหลักฐานโอนก่อนยืนยัน');
            if (!payment.amount.eq(invoice.totalAmount)) fail(409, 'ยอดไม่ตรงบิล');
            await tx.invoiceSettlement.create({ data: { invoiceId: invoice.id, paymentId, confirmedBy: req.user.userId } });
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID' } });
        }
        const result = await tx.invoicePayment.update({ where: { id: paymentId }, data: { status, reviewedBy: req.user.userId, reviewedAt: new Date(), reason: status === 'REJECTED' ? text(req.body.reason) : null }, include: paymentInclude });
        await audit(tx, req.user, 'REVIEW_PAYMENT', 'InvoicePayment', paymentId, 'ตรวจการชำระ: ' + status);
        await notify(tx, invoice.lease.tenant.userId, 'ผลตรวจการชำระเงิน', invoice.invoiceNo + ': ' + (status === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'ไม่อนุมัติ กรุณาตรวจเหตุผลและส่งใหม่')); return result;
    }));
}));

router.get('/deposits', route(async (req, res) => res.json(await prisma.depositEntry.findMany({ where: req.user.role === 'ADMIN' ? {} : { lease: { tenant: { userId: req.user.userId } } }, orderBy: { id: 'desc' } }))));
router.post('/deposits', admin, route(async (req, res) => {
    const leaseId = id(req.body.leaseId), kind = choice(req.body.kind, ['RECEIPT', 'REFUND']), paymentMethod = method(req.body.method), amount = money(req.body.amount);
    res.status(201).json(await prisma.$transaction(async tx => {
        await lockLease(tx, leaseId); const lease = await leaseAccess(tx, leaseId, req.user);
        const previous = await tx.depositEntry.findUnique({ where: { leaseId_kind: { leaseId, kind } } });
        if (previous) { if (!previous.amount.eq(amount) || previous.method !== paymentMethod) fail(409, 'รายการเดิมมีจำนวนเงินหรือวิธีรับคืนต่างกัน'); return previous; }
        if (kind === 'RECEIPT' && (!['ACTIVE', 'ENDED'].includes(lease.status) || !amount.eq(lease.depositRequired))) fail(409, 'รับประกันเต็มยอดตามสัญญาที่เริ่มใช้แล้วเท่านั้น');
        if (kind === 'REFUND') {
            const receipt = await tx.depositEntry.findUnique({ where: { leaseId_kind: { leaseId, kind: 'RECEIPT' } } });
            if (lease.status !== 'ENDED' || !receipt || !amount.eq(receipt.amount)) fail(409, 'คืนเต็มยอดที่รับจริงได้หลังจบสัญญาเท่านั้น');
        }
        const row = await tx.depositEntry.create({ data: { leaseId, kind, amount, method: paymentMethod, recordedBy: req.user.userId } });
        await audit(tx, req.user, 'DEPOSIT_' + kind, 'DepositEntry', row.id, 'รับหรือคืนเงินจริง แยกจากรายรับค่าเช่า');
        await notify(tx, lease.tenant.userId, kind === 'RECEIPT' ? 'บันทึกรับเงินประกัน' : 'บันทึกคืนเงินประกัน', 'สัญญา ' + lease.contractNo + ' บันทึกตามเงินจริงแล้ว'); return row;
    }));
}));
module.exports = router;
