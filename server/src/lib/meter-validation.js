const { fail } = require('./domain');
const ensureUnbilled = async (tx, roomId, readingDate) => {
    const billed = await tx.invoice.count({
        where: {
            lease: { roomId, startDate: { lte: readingDate } },
            cycleIndex: { gt: 0 },
            periodStart: { gte: readingDate },
        },
    });
    const closed = await tx.leaseCloseout.count({
        where: {
            lease: { roomId, startDate: { lte: readingDate } },
            checkoutDate: { gte: readingDate },
        },
    });
    if (billed || closed)
        fail(
            409,
            'วันที่นี้มีบิลหรือปิดยอดแล้ว ต้องปรับยอดแยก ห้ามแก้มิเตอร์ย้อนหลังทับหลักฐานเดิม',
        );
};
module.exports = { ensureUnbilled };
