// All request/approval/edit/deactivation paths lock the same room first.
// Prisma binds roomId as a parameter, never as SQL text.
const lockRoom = async (tx, roomId) => {
    await tx.$queryRaw`SELECT id FROM Room WHERE id = ${roomId} FOR UPDATE`;
};

module.exports = lockRoom;
