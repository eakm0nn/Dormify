const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/authMiddleware');
const installation = require('../lib/installation');
const { fail, text, date, route } = require('../lib/domain');
const router = express.Router(); router.use(auth);
const integer = (value, fallback, maximum) => {
    if (value === undefined) return fallback;
    if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > maximum) fail(400, 'เลขหน้าหรือจำนวนรายการไม่ถูกต้อง');
    return Number(value);
};
router.get('/history/:resource', route(async (req, res) => {
    const resources = {
        announcements: { model: 'announcement', public: true },
        notifications: { model: 'notification', personal: true },
        audit: { model: 'auditLog' },
        'meter-changes': { model: 'meterChange', include: { room: { select: { roomNumber: true } } } },
    };
    if (!Object.hasOwn(resources, req.params.resource)) fail(404, 'ไม่พบรายการประวัติ');
    const config = resources[req.params.resource];
    if (!config.public && !config.personal && req.user.role !== 'ADMIN') fail(403, 'คุณไม่มีสิทธิ์ดูประวัตินี้');
    const page = integer(req.query.page, 0, 100000000), limit = integer(req.query.limit, 10, 500);
    if (limit < 1 || page * limit > 2147483647) fail(400, 'เลขหน้าหรือจำนวนรายการไม่ถูกต้อง');
    const where = config.personal ? { userId: req.user.userId } : {};
    if (config.model === 'meterChange') where.room = { propertyId: await installation.propertyId() };
    if (req.query.search) where.OR = (config.model === 'auditLog' ? ['actorName','action','entityType','summary'] : config.model === 'meterChange' ? ['reason'] : ['title','message']).map(key => ({ [key]: { contains: text(req.query.search,100) } }));
    if (req.query.from || req.query.to) {
        where.createdAt = {};
        if (req.query.from) where.createdAt.gte = new Date(date(req.query.from).getTime() - 7 * 3600000);
        if (req.query.to) where.createdAt.lt = new Date(date(req.query.to).getTime() + 17 * 3600000);
        if (where.createdAt.gte && where.createdAt.lt && where.createdAt.gte >= where.createdAt.lt) fail(400, 'วันเริ่มต้องไม่เกินวันสิ้นสุด');
    }
    const requested = integer(req.query.snapshot, undefined, 2147483647);
    const snapshot = requested ?? (await prisma[config.model].aggregate({ where, _max: { id: true } }))._max.id ?? 0;
    where.id = { lte: snapshot };
    const [items,total] = await prisma.$transaction([
        prisma[config.model].findMany({ where, include: config.include, orderBy: { id: 'desc' }, skip: page * limit, take: limit }),
        prisma[config.model].count({ where }),
    ]);
    res.json({ items, total, page, limit, snapshot, hasNext: (page + 1) * limit < total });
}));
module.exports = router;
