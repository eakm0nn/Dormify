const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const {
    fail,
    id,
    date,
    text,
    decimal,
    choice,
    audit,
    leaseAccess,
    route,
} = require('../lib/domain');
const router = express.Router();
const installation = require('../lib/installation');
router.use(auth);
const admin = authorize('ADMIN');
const json = (row) => JSON.parse(JSON.stringify(row));
router.get(
    '/leases/:leaseId/revisions',
    route(async (req, res) => {
        const lease = await leaseAccess(prisma, req.params.leaseId, req.user);
        res.json(
            await prisma.leaseRevision.findMany({
                where: { leaseId: lease.id },
                orderBy: { id: 'desc' },
            }),
        );
    }),
);
router.post(
    '/leases/:leaseId/amend',
    admin,
    route(async (req, res) => {
        const target = await leaseAccess(prisma, req.params.leaseId, req.user),
            reason = text(req.body.reason);
        const endDate = req.body.endDate ? date(req.body.endDate) : null;
        const row = await prisma.$transaction(async (tx) => {
            await lockRoom(tx, target.roomId);
            await tx.$queryRaw`SELECT id FROM Lease WHERE id = ${target.id} FOR UPDATE`;
            const current = await leaseAccess(tx, target.id, req.user);
            if (
                current.status !== 'ACTIVE' ||
                (endDate && endDate <= current.startDate)
            )
                fail(409, 'แก้ได้เฉพาะวันสิ้นสุดของสัญญาที่ใช้งาน และต้องอยู่หลังวันเริ่ม');
            const last = await tx.invoice.findFirst({
                where: { leaseId: current.id },
                orderBy: { periodEnd: 'desc' },
            });
            if (endDate && last && endDate < last.periodEnd)
                fail(409, 'มีบิลล่วงหน้าแล้ว หากย้ายออกก่อนกำหนดให้ใช้ปิดยอดสัญญา');
            const updated = await tx.lease.update({
                where: { id: current.id },
                data: { endDate },
            });
            await tx.leaseRevision.create({
                data: {
                    leaseId: current.id,
                    kind: 'AMEND',
                    before: json(current),
                    after: json(updated),
                    reason,
                    createdBy: req.user.userId,
                },
            });
            await audit(
                tx,
                req.user,
                'AMEND_LEASE',
                'Lease',
                current.id,
                reason,
            );
            return updated;
        });
        res.json(row);
    }),
);
router.post(
    '/leases/:leaseId/successor',
    admin,
    route(async (req, res) => {
        const target = await leaseAccess(prisma, req.params.leaseId, req.user),
            kind = choice(req.body.kind, ['RENEW', 'MOVE']),
            roomId = kind === 'RENEW' ? target.roomId : id(req.body.roomId);
        const startDate = date(req.body.startDate),
            endDate = req.body.endDate ? date(req.body.endDate) : null,
            signedDate = req.body.signedDate ? date(req.body.signedDate) : null;
        const monthlyRent = decimal(
                req.body.monthlyRent,
                2,
                '9999999999.99',
                true,
            ),
            reason = text(req.body.reason),
            contractNo = text(req.body.contractNo, 80);
        if (
            startDate < target.startDate ||
            (endDate && endDate <= startDate) ||
            (kind === 'MOVE' && roomId === target.roomId)
        )
            fail(400, 'ห้องหรือระยะสัญญาใหม่ไม่ถูกต้อง');
        const row = await prisma.$transaction(async (tx) => {
            // Stable room order also prevents deadlocks for opposite room moves.
            for (const room of [...new Set([target.roomId, roomId])].sort(
                (a, b) => a - b,
            ))
                await lockRoom(tx, room);
            await tx.$queryRaw`SELECT id FROM Lease WHERE id = ${target.id} FOR UPDATE`;
            const source = await leaseAccess(tx, target.id, req.user);
            if (
                !['ACTIVE', 'ENDED'].includes(source.status) ||
                (source.checkoutDate && startDate < source.checkoutDate)
            )
                fail(409, 'สัญญาต้นทางหรือวันเริ่มไม่พร้อม');
            if (
                !source.tenant.userId ||
                (
                    await tx.user.findUnique({
                        where: { id: source.tenant.userId },
                    })
                )?.role !== 'USER'
            )
                fail(409, 'ผู้รับผิดชอบต้องมีบัญชี User');
            const room = await tx.room.findUnique({ where: { id: roomId } });
            if (!await installation.ensureRoom(roomId, tx)) fail(404, 'ไม่พบห้องพัก');
            if (!room?.isActive || source.occupants.length + 1 > room.capacity)
                fail(409, 'ห้องใหม่ปิดใช้งานหรือมีความจุไม่พอ');
            const policy = await tx.rentalPolicy.findFirst({
                orderBy: { id: 'desc' },
            });
            if (!policy) fail(503, 'ยังไม่มีนโยบายเช่า');
            const created = await tx.lease.create({
                data: {
                    contractNo,
                    roomId,
                    tenantId: source.tenantId,
                    previousLeaseId: source.id,
                    startDate,
                    endDate,
                    signedDate,
                    monthlyRent,
                    depositRequired: decimal(
                        monthlyRent.mul(policy.depositMonths).toFixed(2),
                    ),
                    dueDaysSnapshot: policy.dueDays,
                    depositMonthsSnapshot: policy.depositMonths,
                    occupants: {
                        create: source.occupants.map((person) => ({
                            name: person.name,
                            phone: person.phone,
                        })),
                    },
                },
            });
            await tx.leaseRevision.create({
                data: {
                    leaseId: source.id,
                    kind,
                    before: json(source),
                    after: json(created),
                    reason,
                    createdBy: req.user.userId,
                },
            });
            await audit(
                tx,
                req.user,
                'SUCCESSOR_LEASE',
                'Lease',
                source.id,
                reason,
            );
            return created;
        });
        res.status(201).json(row);
    }),
);
module.exports = router;
