const express = require('express');
const sharp = require('sharp');
const { createHash } = require('node:crypto');
const prisma = require('../lib/prisma');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const lockRoom = require('../lib/room-lock');
const { fail, id, text, audit, route } = require('../lib/domain');
const router = express.Router();
const admin = [auth, authorize('ADMIN')];
const installation = require('../lib/installation');
router.get(
    '/room-photos/:photoId',
    route(async (req, res) => {
        const photo = await prisma.roomPhoto.findUnique({
            where: { id: id(req.params.photoId) },
            include: { room: { select: { isActive: true } } },
        });
        if (!photo || !await installation.ensureRoom(photo.roomId)) fail(404, 'ไม่พบรูปภาพ');
        res.set({
            'Content-Type': 'image/webp',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'public, max-age=300',
            'Content-Security-Policy': "default-src 'none'; sandbox",
        });
        res.send(photo.data);
    }),
);
router.post(
    '/rooms/:roomId/photos',
    ...admin,
    express.raw({
        type: ['image/png', 'image/jpeg', 'image/webp'],
        limit: '5mb',
    }),
    route(async (req, res) => {
        const roomId = id(req.params.roomId);
        if (!await installation.ensureRoom(roomId)) fail(404, 'ไม่พบห้องพัก');
        if (!Buffer.isBuffer(req.body) || !req.body.length)
            fail(400, 'เลือกรูป PNG, JPEG หรือ WebP ขนาดไม่เกิน 5 MB');
        let data;
        try {
            const input = sharp(req.body, {
                limitInputPixels: 40000000,
                failOn: 'warning',
            });
            const meta = await input.metadata();
            if (
                !['png', 'jpeg', 'webp'].includes(meta.format) ||
                (meta.pages || 1) > 1
            )
                fail(400, 'รับเฉพาะภาพนิ่ง PNG, JPEG หรือ WebP');
            data = await input
                .rotate()
                .resize({
                    width: 2000,
                    height: 2000,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 85 })
                .toBuffer();
        } catch {
            fail(400, 'อ่านรูปภาพไม่ได้ หรือภาพมีขนาดพิกเซลเกินกำหนด');
        }
        const checksum = createHash('sha256').update(data).digest('hex');
        const photo = await prisma.$transaction(async (tx) => {
            await lockRoom(tx, roomId);
            if (!(await tx.room.findUnique({ where: { id: roomId } })))
                fail(404, 'ไม่พบห้องพัก');
            const photos = await tx.roomPhoto.findMany({
                where: { roomId },
                select: { id: true, checksum: true },
            });
            if (photos.length >= 8) fail(409, 'เพิ่มรูปได้สูงสุด 8 รูปต่อห้อง');
            if (photos.some((item) => item.checksum === checksum))
                fail(409, 'ห้องนี้มีรูปนี้แล้ว');
            const row = await tx.roomPhoto.create({
                data: { roomId, data, checksum },
                select: { id: true },
            });
            await audit(
                tx,
                req.user,
                'UPLOAD_ROOM_PHOTO',
                'Room',
                roomId,
                'เพิ่มรูปห้องที่ถอดรหัสและแปลงเป็น WebP แล้ว',
            );
            return row;
        });
        res.status(201).json({
            ...photo,
            url: '/api/properties/room-photos/' + photo.id,
        });
    }),
);
router.delete(
    '/rooms/:roomId/photos/:photoId',
    ...admin,
    route(async (req, res) => {
        const roomId = id(req.params.roomId),
            photoId = id(req.params.photoId);
        if (!await installation.ensureRoom(roomId)) fail(404, 'ไม่พบห้องพัก');
        await prisma.$transaction(async (tx) => {
            await lockRoom(tx, roomId);
            const result = await tx.roomPhoto.deleteMany({
                where: { id: photoId, roomId },
            });
            if (!result.count) fail(404, 'ไม่พบรูปของห้องนี้');
            await audit(
                tx,
                req.user,
                'DELETE_ROOM_PHOTO',
                'Room',
                roomId,
                'ลบรูปห้องตามคำสั่ง Admin',
            );
        });
        res.json({ success: true });
    }),
);
const saveAmenities = (model) =>
    route(async (req, res) => {
        const targetId = id(req.params.targetId),
            values = req.body.amenities;
        if (model === 'room' ? !await installation.ensureRoom(targetId) : targetId !== await installation.propertyId()) fail(404, 'ไม่พบข้อมูลหอพักหรือห้องพัก');
        if (!Array.isArray(values) || values.length > 30)
            fail(400, 'ระบุสิ่งอำนวยความสะดวกไม่เกิน 30 รายการ');
        const amenities = [...new Set(values.map((value) => text(value, 80)))];
        const result = await prisma.$transaction(async (tx) => {
            const row = await tx[model].update({
                where: { id: targetId },
                data: { amenities },
                select: { id: true, amenities: true },
            });
            await audit(
                tx,
                req.user,
                'SAVE_AMENITIES',
                model === 'room' ? 'Room' : 'Property',
                targetId,
                'บันทึกสิ่งอำนวยความสะดวกตามข้อมูลจริง',
            );
            return row;
        });
        res.json(result);
    });
router.put('/rooms/:targetId/amenities', ...admin, saveAmenities('room'));
router.put('/:targetId/amenities', ...admin, saveAmenities('property'));
module.exports = router;
