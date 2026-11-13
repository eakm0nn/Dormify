// Apply the new constraint to an existing SQLite database without resetting it.
// Refuse duplicate data instead of choosing which user's room to remove.
const ensureRoomUniqueness = async prisma => {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Room'`;
    if (!tables.length) return;
    const duplicates = await prisma.$queryRaw`
        SELECT propertyId, roomNumber FROM Room
        GROUP BY propertyId, roomNumber HAVING COUNT(*) > 1
    `;
    if (duplicates.length) {
        throw new Error('Duplicate room numbers found. Resolve them before db:setup: ' + JSON.stringify(duplicates));
    }
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS Room_propertyId_roomNumber_key ON Room(propertyId, roomNumber)`;
};

module.exports = ensureRoomUniqueness;
