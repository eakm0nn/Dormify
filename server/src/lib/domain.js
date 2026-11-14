const { Prisma } = require('@prisma/client');

class DomainError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new DomainError(status, message); };
const id = value => {
    if (!['string', 'number'].includes(typeof value) || !/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > 2147483647) fail(400, 'รหัสรายการไม่ถูกต้อง');
    return Number(value);
};
const text = (value, max = 500, optional = false) => {
    if (optional && (value === undefined || value === null || value === '')) return '';
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, 'กรุณากรอกข้อความให้ครบและไม่เกินความยาวที่กำหนด');
    return value.trim();
};
const date = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400, 'กรุณาระบุวันที่ให้ถูกต้อง');
    const result = new Date(value + 'T00:00:00Z');
    if (Number.isNaN(result.getTime()) || result.toISOString().slice(0, 10) !== value) fail(400, 'วันที่ไม่มีอยู่จริง');
    return result;
};
const decimal = (value, scale = 2, max = '9999999999.99', positive = false) => {
    if (!['string', 'number'].includes(typeof value) || !new RegExp('^\\d+(\\.\\d{1,' + scale + '})?$').test(String(value))) fail(400, 'จำนวนเงินหรือเลขมิเตอร์ไม่ถูกต้อง');
    const result = new Prisma.Decimal(value);
    if (result.gt(max) || (positive && result.lte(0))) fail(400, 'จำนวนเงินหรือเลขมิเตอร์เกินช่วงที่กำหนด');
    return result;
};
const choice = (value, choices) => { if (!choices.includes(value)) fail(400, 'สถานะหรือประเภทไม่ถูกต้อง'); return value; };
const audit = (tx, user, action, entityType, entityId, summary) => tx.auditLog.create({ data: {
    actorId: user.userId, actorName: user.name, action, entityType, entityId, summary,
    fixtureScope: process.env.DORMIFY_FIXTURE_SCOPE || null,
} });
const notify = (tx, userId, title, message) => userId ? tx.notification.create({ data: { userId, title, message } }) : Promise.resolve();
const leaseInclude = { tenant: true, room: true, occupants: true, deposits: true };
const leaseAccess = async (tx, leaseId, user) => {
    const lease = await tx.lease.findUnique({ where: { id: id(leaseId) }, include: leaseInclude });
    if (!lease || (user.role !== 'ADMIN' && lease.tenant.userId !== user.userId)) fail(404, 'ไม่พบสัญญาที่คุณมีสิทธิ์เข้าถึง');
    return lease;
};
const invoiceAccess = async (tx, invoiceId, user) => {
    const invoice = await tx.invoice.findUnique({ where: { id: id(invoiceId) }, include: { lease: { include: { tenant: true } }, items: true, settlement: true } });
    if (!invoice || (user.role !== 'ADMIN' && invoice.lease.tenant.userId !== user.userId)) fail(404, 'ไม่พบใบแจ้งหนี้ที่คุณมีสิทธิ์เข้าถึง');
    return invoice;
};
const route = handler => async (req, res) => {
    try { await handler(req, res); } catch (error) {
        if (error instanceof DomainError) return res.status(error.status).json({ error: error.message });
        if (error.code === 'P2002') return res.status(409).json({ error: 'มีข้อมูลรายการนี้แล้ว กรุณาโหลดข้อมูลล่าสุด' });
        if (error.code === 'P2025') return res.status(404).json({ error: 'ไม่พบรายการนี้' });
        if (['P2034', 'P2028', 'P1008'].includes(error.code)) return res.status(409).json({ error: 'ข้อมูลกำลังเปลี่ยน กรุณาลองใหม่' });
        res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาตรวจสอบข้อมูลหรือลองใหม่' });
    }
};
module.exports = { Prisma, fail, id, text, date, decimal, choice, audit, notify, leaseAccess, invoiceAccess, leaseInclude, route };
