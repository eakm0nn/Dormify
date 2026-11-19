const prisma = require('./prisma');
const lockRoom = require('./room-lock');
const { notify } = require('./domain');

const expireRoom = async (tx, roomId) => {
    const expired = await tx.booking.findMany({ where: { roomId, status: 'CONFIRMED', holdExpiresAt: { lte: new Date() } } });
    for (const booking of expired) {
        await tx.booking.update({ where: { id: booking.id }, data: { status: 'EXPIRED' } });
        await notify(tx, booking.userId, 'หมดเวลากันห้อง', 'คำขอ #' + booking.id + ' หมดเวลากันห้องแล้ว');
        await tx.auditLog.create({ data: { actorName: 'ระบบ', action: 'EXPIRE_BOOKING', entityType: 'Booking', entityId: booking.id, summary: 'หมดเวลากันห้องตามเวลาฝั่ง Server', fixtureScope: process.env.DORMIFY_FIXTURE_SCOPE || null } });
    }
    if (expired.length && !await tx.booking.count({ where: { roomId, status: 'CONFIRMED' } }) && !await tx.lease.count({ where: { activeRoomId: roomId } })) await tx.room.update({ where: { id: roomId }, data: { isAvailable: true } });
};
const expireReservations = async () => {
    const scope = process.env.DORMIFY_FIXTURE_SCOPE;
    const rooms = await prisma.booking.findMany({ where: { room: { propertyId: await require('./installation').propertyId() }, status: 'CONFIRMED', holdExpiresAt: { lte: new Date() }, ...(scope ? { user: { email: { endsWith: '@' + scope + '.example.test' } } } : {}) }, select: { roomId: true }, distinct: ['roomId'] });
    for (const { roomId } of rooms) await prisma.$transaction(async tx => { await lockRoom(tx, roomId); await expireRoom(tx, roomId); });
};
module.exports = { expireRoom, expireReservations };
