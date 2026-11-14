// Explicitly requested demo data. Append only: never reset, delete or update existing rooms.
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const { validateDatabaseUrl } = require('../src/lib/database-config');
const prisma = require('../src/lib/prisma');

const rooms = [
    { roomNumber: 'DEMO-101', capacity: 1, price: '2500.00', type: 'NON-AC' },
    { roomNumber: 'DEMO-102', capacity: 2, price: '2800.00', type: 'NON-AC' },
    { roomNumber: 'DEMO-103', capacity: 1, price: '3200.00', type: 'AC' },
    { roomNumber: 'DEMO-104', capacity: 2, price: '3500.00', type: 'AC' },
    { roomNumber: 'DEMO-201', capacity: 2, price: '3800.00', type: 'AC' },
    { roomNumber: 'DEMO-202', capacity: 2, price: '4000.00', type: 'AC' },
    { roomNumber: 'DEMO-203', capacity: 2, price: '4500.00', type: 'AC' },
    { roomNumber: 'DEMO-204', capacity: 2, price: '3500.00', type: 'AC', isActive: false },
];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const main = async () => {
    const url = validateDatabaseUrl(process.env.DATABASE_URL);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw Error('Local database required.');
    const result = await prisma.$transaction(async tx => {
        const properties = await tx.property.findMany({ select: { id: true } });
        if (properties.length !== 1) throw Error('Exactly one existing dormitory is required. No data changed.');
        const propertyId = properties[0].id;
        await tx.$queryRaw`SELECT id FROM Property WHERE id = ${propertyId} FOR UPDATE`;
        const property = await tx.property.findUnique({ where: { id: propertyId } });
        const previous = await tx.room.findMany({ where: { propertyId }, orderBy: { id: 'asc' } });
        const names = new Set(previous.map(room => room.roomNumber));
        let added = 0;
        for (const room of rooms) {
            if (names.has(room.roomNumber)) continue;
            await tx.room.create({ data: { ...room, propertyId, isAvailable: true } });
            added++;
        }
        if (added) await tx.auditLog.create({ data: {
            actorName: 'ระบบ', action: 'ADD_DEMO_ROOMS', entityType: 'Property', entityId: propertyId,
            summary: `เพิ่มห้องทดสอบ DEMO จำนวน ${added} ห้องตามคำขอ ไม่แก้ข้อมูลเดิม`,
        } });
        assert.equal(hash(await tx.property.findUnique({ where: { id: propertyId } })), hash(property));
        const preserved = await tx.room.findMany({ where: { id: { in: previous.map(room => room.id) } }, orderBy: { id: 'asc' } });
        assert.equal(hash(preserved), hash(previous));
        return { propertyId, added, existingRecordsPreserved: true };
    }, { timeout: 15000 });
    const persisted = await prisma.room.findMany({
        where: { propertyId: result.propertyId, roomNumber: { in: rooms.map(room => room.roomNumber) } },
        orderBy: { roomNumber: 'asc' },
        select: { id: true, roomNumber: true, price: true, type: true, capacity: true, isActive: true, isAvailable: true },
    });
    assert.equal(persisted.length, rooms.length);
    console.log(JSON.stringify({ ...result, demoRooms: persisted }, null, 2));
};
main().catch(() => {
    console.error('Could not add demo rooms. Check the local database and existing dormitory. No reset or overwrite was attempted.');
    process.exitCode = 1;
}).finally(() => prisma.$disconnect());
