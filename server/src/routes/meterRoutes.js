const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const {
    fail,
    id,
    text,
    date,
    decimal,
    choice,
    audit,
    route,
} = require('../lib/domain');
const { ensureUnbilled } = require('../lib/meter-validation');
const router = express.Router();
const installation = require('../lib/installation');
router.use(auth);
const admin = authorize('ADMIN');
const value = (raw) => decimal(raw, 3, '99999999999.999');
const json = (data) => JSON.parse(JSON.stringify(data));
router.get(
    '/meter-changes',
    admin,
    route(async (req, res) =>
        res.json(
            await prisma.meterChange.findMany({
                include: { room: { select: { roomNumber: true } } },
                orderBy: { id: 'desc' },
                take: 500,
            }),
        ),
    ),
);
router.put(
    '/readings/:readingId',
    admin,
    route(async (req, res) => {
        const target = await prisma.meterReading.findUnique({
            where: { id: id(req.params.readingId) },
        });
        if (!target || !await installation.ensureRoom(target.roomId)) fail(404, 'ไม่พบเลขมิเตอร์');
        const rawValue = value(req.body.value),
            reason = text(req.body.reason);
        const row = await prisma.$transaction(async (tx) => {
            await lockRoom(tx, target.roomId);
            const current = await tx.meterReading.findUnique({
                where: { id: target.id },
            });
            await ensureUnbilled(tx, current.roomId, current.readingDate);
            if (
                await tx.meterChange.count({
                    where: { readingId: current.id, kind: 'REPLACEMENT' },
                })
            )
                fail(409, 'จุดเปลี่ยนมิเตอร์เป็นหลักฐาน ห้ามแก้ด้วยแบบฟอร์มแก้เลขทั่วไป');
            const previous = await tx.meterReading.findFirst({
                where: {
                    roomId: current.roomId,
                    utilityType: current.utilityType,
                    readingDate: { lt: current.readingDate },
                },
                orderBy: { readingDate: 'desc' },
            });
            const next = await tx.meterReading.findFirst({
                where: {
                    roomId: current.roomId,
                    utilityType: current.utilityType,
                    readingDate: { gt: current.readingDate },
                },
                orderBy: { readingDate: 'asc' },
            });
            const cumulative = rawValue.add(current.offset);
            if (
                cumulative.lt(0) ||
                (previous && cumulative.lt(previous.value)) ||
                (next && cumulative.gt(next.value))
            )
                fail(409, 'เลขใหม่ต้องไม่ทำให้หน่วยสะสมลดลงหรือเกินจุดถัดไป');
            const updated = await tx.meterReading.update({
                where: { id: current.id },
                data: { value: cumulative, rawValue },
            });
            await tx.meterChange.create({
                data: {
                    roomId: current.roomId,
                    readingId: current.id,
                    kind: 'CORRECTION',
                    before: json(current),
                    after: json(updated),
                    reason,
                    createdBy: req.user.userId,
                },
            });
            await audit(
                tx,
                req.user,
                'CORRECT_METER',
                'MeterReading',
                current.id,
                reason,
            );
            return updated;
        });
        res.json(row);
    }),
);
router.post(
    '/meter-replacements',
    admin,
    route(async (req, res) => {
        const roomId = id(req.body.roomId),
            utilityType = choice(req.body.utilityType, [
                'WATER',
                'ELECTRICITY',
            ]),
            readingDate = date(req.body.readingDate),
            reason = text(req.body.reason);
        const oldClosing = value(req.body.oldClosing),
            newOpening = value(req.body.newOpening);
        const row = await prisma.$transaction(async (tx) => {
            await lockRoom(tx, roomId);
            if (!await installation.ensureRoom(roomId, tx)) fail(404, 'ไม่พบห้องพัก');
            await ensureUnbilled(tx, roomId, readingDate);
            const previous = await tx.meterReading.findFirst({
                where: { roomId, utilityType },
                orderBy: { readingDate: 'desc' },
            });
            if (
                !previous ||
                previous.readingDate >= readingDate ||
                oldClosing.lt(previous.rawValue || previous.value)
            )
                fail(
                    409,
                    'เปลี่ยนมิเตอร์ได้หลังจุดล่าสุด และเลขปิดมิเตอร์เดิมต้องไม่น้อยกว่าเลขล่าสุด',
                );
            const cumulative = previous.value.add(
                oldClosing.sub(previous.rawValue || previous.value),
            );
            const offset = cumulative.sub(newOpening);
            if (
                cumulative.gt('99999999999.999') ||
                offset.abs().gt('99999999999.999')
            )
                fail(400, 'เลขสะสมเกินช่วงที่รองรับ');
            const created = await tx.meterReading.create({
                data: {
                    roomId,
                    utilityType,
                    readingDate,
                    value: cumulative,
                    rawValue: newOpening,
                    offset,
                    createdBy: req.user.userId,
                },
            });
            await tx.meterChange.create({
                data: {
                    roomId,
                    readingId: created.id,
                    kind: 'REPLACEMENT',
                    reason,
                    before: {
                        previous: json(previous),
                        oldClosing: oldClosing.toString(),
                    },
                    after: json(created),
                    createdBy: req.user.userId,
                },
            });
            await audit(
                tx,
                req.user,
                'REPLACE_METER',
                'MeterReading',
                created.id,
                reason,
            );
            return created;
        });
        res.status(201).json(row);
    }),
);
module.exports = router;
