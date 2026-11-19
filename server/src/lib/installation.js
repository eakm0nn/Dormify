const prisma = require('./prisma');
const key = process.env.DORMIFY_INSTALLATION_KEY || 'dormify';
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) throw Error('Invalid installation key');
const propertyId = async (tx = prisma) => (await tx.dormitoryInstallation.findUnique({ where: { id: key } }))?.propertyId || 0;
const ensureRoom = async (roomId, tx = prisma) => {
    const room = await tx.room.findUnique({ where: { id: roomId }, select: { propertyId: true } });
    return Boolean(room && room.propertyId === await propertyId(tx));
};
module.exports = { key, propertyId, ensureRoom };
