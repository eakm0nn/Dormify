const express = require('express');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { Prisma, fail, id, text, date, decimal, choice, audit, notify, leaseAccess, route } = require('../lib/domain');
const router = express.Router();
router.use(authenticate);
const admin = authorize('ADMIN');

router.get('/maintenance', route(async (req, res) => res.json(await prisma.maintenanceRequest.findMany({ where: req.user.role === 'ADMIN' ? {} : { lease: { tenant: { userId: req.user.userId } } }, include: { room: true, lease: { select: { contractNo: true } } }, orderBy: { id: 'desc' } }))));
router.post('/maintenance', route(async (req, res) => {
    const lease = await leaseAccess(prisma, req.body.leaseId, req.user);
    if (lease.status !== 'ACTIVE') fail(409, 'แจ้งซ่อมได้จากสัญญาที่ใช้งานอยู่เท่านั้น');
    const data = { leaseId: lease.id, roomId: lease.roomId, reportedBy: req.user.userId, title: text(req.body.title, 200), description: text(req.body.description, 5000) };
    const row = await prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM Lease WHERE id = ${lease.id} FOR UPDATE`;
        if ((await leaseAccess(tx, lease.id, req.user)).status !== 'ACTIVE') fail(409, 'สัญญาสิ้นสุดแล้ว ไม่สามารถแจ้งซ่อมเพิ่มได้');
        const result = await tx.maintenanceRequest.create({ data });
        await audit(tx, req.user, 'CREATE_MAINTENANCE', 'MaintenanceRequest', result.id, 'แจ้งปัญหาห้องพัก'); return result;
    }); res.status(201).json(row);
}));
router.put('/maintenance/:requestId', admin, route(async (req, res) => {
    const status = choice(req.body.status, ['IN_PROGRESS', 'RESOLVED']), resolution = text(req.body.resolution, 1000, status !== 'RESOLVED');
    const result = await prisma.$transaction(async tx => {
        const current = await tx.maintenanceRequest.findUnique({ where: { id: id(req.params.requestId) }, include: { lease: { include: { tenant: true } } } });
        if (!current) fail(404, 'ไม่พบรายการแจ้งซ่อม');
        if (current.status === 'RESOLVED') fail(409, 'เรื่องนี้ปิดงานแล้ว');
        const row = await tx.maintenanceRequest.update({ where: { id: current.id }, data: { status, resolution, resolvedAt: status === 'RESOLVED' ? new Date() : null } });
        await audit(tx, req.user, 'UPDATE_MAINTENANCE', 'MaintenanceRequest', row.id, 'สถานะงานซ่อม: ' + status);
        await notify(tx, current.lease.tenant.userId, 'ความคืบหน้าการแจ้งซ่อม', current.title + ': ' + (status === 'RESOLVED' ? 'ซ่อมเสร็จแล้ว' : 'กำลังดำเนินการ')); return row;
    }); res.json(result);
}));

router.get('/expenses', admin, route(async (req, res) => res.json(await prisma.expense.findMany({ orderBy: [{ expenseDate: 'desc' }, { id: 'desc' }] }))));
const saveExpense = async (req, res) => {
    const data = { description: text(req.body.description), category: text(req.body.category, 100), amount: decimal(req.body.amount, 2, '9999999999.99', true), expenseDate: date(req.body.expenseDate) };
    const row = await prisma.$transaction(async tx => {
        const result = req.params.expenseId ? await tx.expense.update({ where: { id: id(req.params.expenseId) }, data }) : await tx.expense.create({ data: { ...data, recordedBy: req.user.userId } });
        await audit(tx, req.user, 'SAVE_EXPENSE', 'Expense', result.id, 'บันทึกรายจ่ายตามจริง'); return result;
    }); res.status(req.params.expenseId ? 200 : 201).json(row);
};
router.post('/expenses', admin, route(saveExpense));
router.put('/expenses/:expenseId', admin, route(saveExpense));

router.get('/announcements', route(async (req, res) => res.json(await prisma.announcement.findMany({ orderBy: { id: 'desc' }, take: 100 }))));
const saveAnnouncement = async (req, res) => {
    const data = { title: text(req.body.title, 200), message: text(req.body.message, 5000) };
    const row = await prisma.$transaction(async tx => {
        const result = req.params.announcementId ? await tx.announcement.update({ where: { id: id(req.params.announcementId) }, data }) : await tx.announcement.create({ data: { ...data, createdBy: req.user.userId } });
        await audit(tx, req.user, 'SAVE_ANNOUNCEMENT', 'Announcement', result.id, 'เผยแพร่ข่าวสารหอพัก'); return result;
    }); res.status(req.params.announcementId ? 200 : 201).json(row);
};
router.post('/announcements', admin, route(saveAnnouncement));
router.put('/announcements/:announcementId', admin, route(saveAnnouncement));
router.get('/notifications', route(async (req, res) => res.json(await prisma.notification.findMany({ where: { userId: req.user.userId }, orderBy: { id: 'desc' }, take: 200 }))));
router.patch('/notifications/:notificationId/read', route(async (req, res) => {
    const result = await prisma.notification.updateMany({ where: { id: id(req.params.notificationId), userId: req.user.userId }, data: { readAt: new Date() } });
    if (!result.count) fail(404, 'ไม่พบการแจ้งเตือน'); res.json({ success: true });
}));
router.get('/audit', admin, route(async (req, res) => {
    const where = {};
    if (req.query.search) where.OR = ['actorName', 'action', 'entityType', 'summary'].map(key => ({ [key]: { contains: text(req.query.search, 100) } }));
    if (req.query.from || req.query.to) {
        where.createdAt = {};
        if (req.query.from) where.createdAt.gte = new Date(date(req.query.from).getTime() - 7 * 3600000);
        if (req.query.to) where.createdAt.lt = new Date(date(req.query.to).getTime() + 17 * 3600000);
    }
    res.json(await prisma.auditLog.findMany({ where, orderBy: { id: 'desc' }, take: 500 }));
}));
router.get('/reports', admin, route(async (req, res) => {
    const from = req.query.from ? date(req.query.from) : new Date('2000-01-01T00:00:00Z');
    const to = req.query.to ? date(req.query.to) : new Date('2100-01-01T00:00:00Z');
    if (to < from) fail(400, 'วันสิ้นสุดรายงานต้องไม่อยู่ก่อนวันเริ่ม');
    const times = { gte: new Date(from.getTime() - 7 * 3600000), lt: new Date(to.getTime() + 17 * 3600000) };
    const dates = { gte: from, lt: new Date(to.getTime() + 86400000) };
    const [receipts, expenses, depositReceived, depositRefunded, outstanding, totalRooms, vacantRooms, activeLeases, openRepairs] = await Promise.all([
        prisma.invoicePayment.aggregate({ where: { status: 'CONFIRMED', reviewedAt: times, settlement: { isNot: null } }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { expenseDate: dates }, _sum: { amount: true } }),
        prisma.depositEntry.aggregate({ where: { kind: 'RECEIPT', createdAt: times }, _sum: { amount: true } }),
        prisma.depositEntry.aggregate({ where: { kind: 'REFUND', createdAt: times }, _sum: { amount: true } }),
        prisma.invoice.aggregate({ where: { status: 'ISSUED' }, _sum: { totalAmount: true } }),
        prisma.room.count(), prisma.room.count({ where: { isActive: true, isAvailable: true } }),
        prisma.lease.count({ where: { status: 'ACTIVE' } }), prisma.maintenanceRequest.count({ where: { status: { not: 'RESOLVED' } } }),
    ]);
    const value = item => item || new Prisma.Decimal(0);
    res.json({ receipts: value(receipts._sum.amount), expenses: value(expenses._sum.amount), operatingBalance: value(receipts._sum.amount).sub(value(expenses._sum.amount)), depositReceived: value(depositReceived._sum.amount), depositRefunded: value(depositRefunded._sum.amount), depositMovement: value(depositReceived._sum.amount).sub(value(depositRefunded._sum.amount)), outstanding: value(outstanding._sum.totalAmount), totalRooms, vacantRooms, activeLeases, openRepairs });
}));
module.exports = router;
