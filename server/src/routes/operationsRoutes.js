const express = require('express');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const { expireRoom, expireReservations } = require('../lib/reservations');
const { fail, id, text, date, decimal, audit, notify, leaseAccess, leaseInclude, route } = require('../lib/domain');
const router = express.Router();
router.use(authenticate);
const admin = authorize('ADMIN');
const installation = require('../lib/installation');

router.get('/options', admin, route(async (req, res) => {
    await expireReservations();
    const propertyId = await installation.propertyId();
    const [users, rooms, tenants, leases, bookings] = await Promise.all([
        prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, name: true, email: true }, orderBy: { id: 'desc' } }),
        prisma.room.findMany({ where: { propertyId }, orderBy: { roomNumber: 'asc' } }),
        prisma.tenantProfile.findMany({ orderBy: { id: 'desc' } }),
        prisma.lease.findMany({ where: { room: { propertyId } }, include: { tenant: true, room: true }, orderBy: { id: 'desc' } }),
        prisma.booking.findMany({ where: { room: { propertyId }, status: 'CONFIRMED', lease: null }, include: { room: true, user: { select: { id: true, name: true } } } }),
    ]);
    res.json({ users, rooms, tenants, leases, bookings });
}));

router.get('/tenants', admin, route(async (req, res) => {
    res.json(await prisma.tenantProfile.findMany({ include: { leases: { select: { id: true, contractNo: true, status: true, roomId: true } } }, orderBy: { id: 'desc' } }));
}));
const saveTenant = async (req, res) => {
    const userId = req.body.userId ? id(req.body.userId) : null;
    // The confirmed workflow requires an existing USER account before a contract.
    if (!userId) fail(400, 'กรุณาเลือกบัญชีผู้ใช้งานของผู้เช่า');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== 'USER') fail(400, 'ต้องผูกทะเบียนกับบัญชี User เท่านั้น');
    const data = { userId, name: text(req.body.name, 100), phone: text(req.body.phone, 30, true), address: text(req.body.address, 500, true) };
    const tenant = await prisma.$transaction(async tx => {
        let result;
        if (req.params.tenantId) {
            const tenantId = id(req.params.tenantId);
            await tx.$queryRaw`SELECT id FROM TenantProfile WHERE id = ${tenantId} FOR UPDATE`;
            const current = await tx.tenantProfile.findUnique({ where: { id: id(req.params.tenantId) } });
            if (!current) fail(404, 'ไม่พบผู้เช่า');
            if (current.userId !== userId && await tx.lease.count({ where: { tenantId: current.id } })) fail(409, 'ทะเบียนมีสัญญาแล้ว ไม่สามารถเปลี่ยนบัญชีที่ผูกได้');
            result = await tx.tenantProfile.update({ where: { id: current.id }, data });
        } else result = await tx.tenantProfile.create({ data: { ...data, createdBy: req.user.userId } });
        await audit(tx, req.user, 'SAVE_TENANT', 'TenantProfile', result.id, 'บันทึกทะเบียนผู้เช่า');
        return result;
    });
    res.status(req.params.tenantId ? 200 : 201).json(tenant);
};
router.post('/tenants', admin, route(saveTenant));
router.put('/tenants/:tenantId', admin, route(saveTenant));

router.get('/leases', route(async (req, res) => {
    const where = { room: { propertyId: await installation.propertyId() }, ...(req.user.role === 'ADMIN' ? {} : { tenant: { userId: req.user.userId } }) };
    res.json(await prisma.lease.findMany({ where, include: leaseInclude, orderBy: { id: 'desc' } }));
}));
router.get('/leases/:leaseId', route(async (req, res) => res.json(await leaseAccess(prisma, req.params.leaseId, req.user))));
const saveLease = async (req, res) => {
    const body = req.body, startDate = date(body.startDate), endDate = body.endDate ? date(body.endDate) : null;
    if (endDate && endDate <= startDate) fail(400, 'วันสิ้นสุดต้องอยู่หลังวันเริ่มสัญญา');
    const policy = await prisma.rentalPolicy.findFirst({ orderBy: { id: 'desc' } });
    if (!policy) fail(503, 'กรุณาติดตั้งนโยบายเช่าก่อนใช้งาน');
    const monthlyRent = decimal(body.monthlyRent, 2, '9999999999.99', true);
    const data = {
        contractNo: text(body.contractNo, 80), tenantId: id(body.tenantId), roomId: id(body.roomId),
        bookingId: body.bookingId ? id(body.bookingId) : null, startDate, endDate,
        monthlyRent, depositRequired: body.depositRequired === undefined ? decimal(monthlyRent.mul(policy.depositMonths).toFixed(2)) : decimal(body.depositRequired),
        dueDaysSnapshot: policy.dueDays, depositMonthsSnapshot: policy.depositMonths,
        signedDate: body.signedDate ? date(body.signedDate) : null,
    };
    if (!await installation.ensureRoom(data.roomId)) fail(404, 'ไม่พบห้องพักของหอแห่งนี้');
    if (!Array.isArray(body.occupants) || body.occupants.length > 50) fail(400, 'ข้อมูลผู้พักร่วมไม่ถูกต้อง');
    const occupants = body.occupants.map(person => { if (!person || typeof person !== 'object') fail(400, 'ข้อมูลผู้พักร่วมไม่ถูกต้อง'); return { name: text(person.name, 100), phone: text(person.phone, 30, true) }; });
    const result = await prisma.$transaction(async tx => {
        await lockRoom(tx, data.roomId);
        await tx.$queryRaw`SELECT id FROM TenantProfile WHERE id = ${data.tenantId} FOR UPDATE`;
        const tenant = await tx.tenantProfile.findUnique({ where: { id: data.tenantId } });
        const room = await tx.room.findUnique({ where: { id: data.roomId } });
        if (!tenant?.userId || !room || !room.isActive) fail(400, 'ผู้เช่าต้องมีบัญชี User และห้องต้องพร้อมใช้งาน');
        if ((await tx.user.findUnique({ where: { id: tenant.userId } }))?.role !== 'USER') fail(400, 'ผู้เช่าต้องมีบัญชี User');
        if (occupants.length + 1 > room.capacity) fail(400, 'จำนวนผู้พักรวมผู้รับผิดชอบเกินความจุห้อง');
        if (data.bookingId) {
            const booking = await tx.booking.findUnique({ where: { id: data.bookingId } });
            if (!booking || booking.roomId !== room.id || booking.userId !== tenant.userId || booking.status !== 'CONFIRMED') fail(409, 'คำขอที่อนุมัติไม่ตรงกับห้องและบัญชีผู้รับผิดชอบ');
        }
        let lease;
        if (req.params.leaseId) {
            const current = await tx.lease.findUnique({ where: { id: id(req.params.leaseId) } });
            if (!current || current.status !== 'DRAFT') fail(409, 'แก้ไขได้เฉพาะสัญญาฉบับร่าง');
            if (current.roomId !== data.roomId) fail(400, 'หากต้องเปลี่ยนห้องให้สร้างร่างสัญญาใหม่');
            await tx.leaseOccupant.deleteMany({ where: { leaseId: current.id } });
            lease = await tx.lease.update({ where: { id: current.id }, data: { ...data, occupants: { create: occupants } }, include: leaseInclude });
        } else lease = await tx.lease.create({ data: { ...data, occupants: { create: occupants } }, include: leaseInclude });
        await audit(tx, req.user, 'SAVE_LEASE', 'Lease', lease.id, 'บันทึกสัญญาฉบับร่างและอัตราตามสัญญา');
        return lease;
    });
    res.status(req.params.leaseId ? 200 : 201).json(result);
};
router.post('/leases', admin, route(saveLease));
router.put('/leases/:leaseId', admin, route(saveLease));
router.post('/leases/:leaseId/activate', admin, route(async (req, res) => {
    const target = await leaseAccess(prisma, req.params.leaseId, req.user);
    const result = await prisma.$transaction(async tx => {
        await lockRoom(tx, target.roomId);
        await tx.$queryRaw`SELECT id FROM Lease WHERE id = ${target.id} FOR UPDATE`;
        await expireRoom(tx, target.roomId);
        const lease = await leaseAccess(tx, target.id, req.user);
        if (lease.status === 'ACTIVE') return lease;
        if (lease.status !== 'DRAFT' || !lease.signedDate) fail(409, 'ต้องเป็นฉบับร่างที่บันทึกวันลงนามแล้ว');
        if (lease.previousLeaseId) {
            const previous = await tx.lease.findUnique({ where: { id: lease.previousLeaseId } });
            if (previous?.status !== 'ENDED' || !previous.checkoutDate || lease.startDate < previous.checkoutDate) fail(409, 'ต้องปิดยอดสัญญาเดิมก่อนเริ่มสัญญาต่ออายุหรือย้ายห้อง');
        }
        if (!lease.tenant.userId || (await tx.user.findUnique({ where: { id: lease.tenant.userId } }))?.role !== 'USER') fail(409, 'ผู้เช่าต้องมีบัญชี User ก่อนเริ่มใช้สัญญา');
        const room = await tx.room.findUnique({ where: { id: lease.roomId } });
        if (!room.isActive || await tx.lease.count({ where: { activeRoomId: room.id } })) fail(409, 'ห้องมีสัญญาใช้งานหรือปิดใช้งานอยู่');
        if (lease.bookingId) {
            const booking = await tx.booking.findUnique({ where: { id: lease.bookingId } });
            if (booking.status !== 'CONFIRMED' || booking.userId !== lease.tenant.userId) fail(409, 'คำขอเช่าไม่พร้อมเปลี่ยนเป็นสัญญา');
            await tx.booking.update({ where: { id: booking.id }, data: { status: 'CONVERTED' } });
        } else if (!room.isAvailable || await tx.booking.count({ where: { roomId: room.id, status: 'CONFIRMED' } })) fail(409, 'ห้องถูกกันให้คำขออื่นแล้ว');
        const updated = await tx.lease.update({ where: { id: lease.id }, data: { status: 'ACTIVE', activeRoomId: room.id }, include: leaseInclude });
        await tx.room.update({ where: { id: room.id }, data: { isAvailable: false } });
        await audit(tx, req.user, 'ACTIVATE_LEASE', 'Lease', lease.id, 'เริ่มใช้สัญญาที่ลงนามแล้ว');
        await notify(tx, lease.tenant.userId, 'บันทึกสัญญาเช่าแล้ว', 'สัญญา ' + lease.contractNo + ' เริ่มใช้งานในระบบ');
        return updated;
    });
    res.json(result);
}));
router.post('/leases/:leaseId/end', admin, route(require('./closeoutRoutes').finalizeCloseout));

module.exports = router;
