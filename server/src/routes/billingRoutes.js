const express = require('express');
const { createHash } = require('node:crypto');
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
const { issueInvoice } = require('../lib/invoice-service');
const { ensureUnbilled } = require('../lib/meter-validation');
const { total: invoiceTotal, presentInvoice } = require('../lib/invoice-totals');
router.post('/billing-runs', admin, route(async (req, res) => res.json(await require('../lib/auto-billing').runBilling(req.user))));

router.get('/policy', admin, route(async (req, res) => res.json(await prisma.rentalPolicy.findFirst({ orderBy: { id: 'desc' } }))));
router.post('/policy', admin, route(async (req, res) => {
    const { holdHours, depositMonths, dueDays } = req.body;
    const autoBilling = req.body.autoBilling ?? false;
    if (typeof autoBilling !== 'boolean') fail(400, 'ค่าออกบิลอัตโนมัติไม่ถูกต้อง');
    if (![holdHours, depositMonths, dueDays].every(Number.isSafeInteger) || holdHours < 1 || holdHours > 8760 || depositMonths < 0 || depositMonths > 120 || dueDays < 0 || dueDays > 365) fail(400, 'ค่านโยบายไม่อยู่ในช่วงที่กำหนด');
    res.status(201).json(await prisma.$transaction(async tx => {
        const result = await tx.rentalPolicy.create({ data: { holdHours, depositMonths, dueDays, autoBilling, createdBy: req.user.userId } });
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
    if (!await require('../lib/installation').ensureRoom(data.roomId)) fail(404, 'ไม่พบห้องพักของหอแห่งนี้');
    res.status(201).json(await prisma.$transaction(async tx => {
        await lockRoom(tx, data.roomId);
        if (!await require('../lib/installation').ensureRoom(data.roomId, tx)) fail(404, 'ไม่พบห้องพัก');
        await ensureUnbilled(tx, data.roomId, data.readingDate);
        const previous = await tx.meterReading.findFirst({ where: { roomId: data.roomId, utilityType: data.utilityType, readingDate: { lt: data.readingDate } }, orderBy: { readingDate: 'desc' } });
        const next = await tx.meterReading.findFirst({ where: { roomId: data.roomId, utilityType: data.utilityType, readingDate: { gt: data.readingDate } }, orderBy: { readingDate: 'asc' } });
        data.rawValue = data.value; data.offset = previous?.offset || new Prisma.Decimal(0); data.value = data.rawValue.add(data.offset);
        if ((previous && data.value.lt(previous.value)) || (next && data.value.gt(next.value)) || data.value.lt(0)) fail(409, 'เลขมิเตอร์ต้องอยู่ระหว่างเลขสะสมก่อนและหลัง');
        const row = await tx.meterReading.create({ data }); await audit(tx, req.user, 'RECORD_METER', 'MeterReading', row.id, 'บันทึกเลขมิเตอร์ตามวันที่จริง'); return row;
    }));
}));

router.get('/invoices', route(async (req, res) => res.json((await prisma.invoice.findMany({ where: req.user.role === 'ADMIN' ? {} : { lease: { tenant: { userId: req.user.userId } } }, include: { items: true, settlement: true, adjustments: true }, orderBy: { id: 'desc' } })).map(presentInvoice))));
router.get('/invoices/:invoiceId', route(async (req, res) => res.json(presentInvoice(await invoiceAccess(prisma, req.params.invoiceId, req.user)))));
router.post('/invoices', admin, route(async (req, res) => {
    const leaseId = id(req.body.leaseId), cycleIndex = req.body.cycleIndex;
    if (!Number.isSafeInteger(cycleIndex) || cycleIndex < 0 || cycleIndex > 1200) fail(400, 'ลำดับรอบบิลไม่ถูกต้อง');
    const invoice = await issueInvoice(leaseId, cycleIndex, req.user);
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
        if (await tx.leaseCloseout.count({ where: { leaseId: invoice.leaseId } })) fail(409, 'สัญญาปิดยอดแล้ว ให้ชำระตามรายการปิดยอด');
        if (!amount.eq(invoiceTotal(invoice))) fail(400, 'ต้องชำระเต็มยอดตามบิล ไม่มีการแบ่งชำระ');
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
    const target = await prisma.invoicePayment.findUnique({ where: { id: paymentId } }); if (!target) fail(404, 'ไม่พบการชำระเงิน');
    const result = await prisma.$transaction(async tx => {
        await lockInvoice(tx, target.invoiceId); const invoice = await invoiceAccess(tx, target.invoiceId, req.user);
        const payment = await tx.invoicePayment.findUnique({ where: { id: paymentId } });
        if (payment.method !== 'TRANSFER' || payment.status !== 'PENDING' || invoice.settlement || invoice.status !== 'ISSUED') fail(409, 'แนบหลักฐานได้เฉพาะรายการโอนที่รอตรวจและบิลยังไม่ชำระ');
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
        if (payment.status !== 'PENDING' || (status === 'CONFIRMED' && invoice.settlement)) fail(409, 'รายการนี้ถูกตรวจหรือบิลชำระแล้ว');
        if (status === 'CONFIRMED') {
            if (payment.method === 'TRANSFER' && !payment.proof) fail(409, 'ต้องมีหลักฐานโอนก่อนยืนยัน');
            if (await tx.leaseCloseout.count({ where: { leaseId: invoice.leaseId } })) fail(409, 'สัญญาปิดยอดแล้ว ไม่รับเงินบิลเดิมซ้ำ');
            if (!payment.amount.eq(invoiceTotal(invoice))) fail(409, 'ยอดไม่ตรงบิล');
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
