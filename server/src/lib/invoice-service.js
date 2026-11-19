const prisma = require('./prisma');
const lockRoom = require('./room-lock');
const { randomUUID } = require('node:crypto');
const {
    Prisma,
    fail,
    decimal,
    audit,
    notify,
    leaseAccess,
} = require('./domain');
const { anchorDate, utilityItems } = require('./billing-calculation');
const bangkokToday = () =>
    new Date(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date()) + 'T00:00:00Z',
    );
const money = (value) => decimal(value, 2, '9999999999.99', true);
const lockLease = (tx, id) =>
    tx.$queryRaw`SELECT id FROM Lease WHERE id = ${id} FOR UPDATE`;
const issueInvoice = async (leaseId, cycleIndex, user) => {
    const target = await prisma.lease.findUnique({
        where: { id: leaseId },
        select: { roomId: true },
    });
    if (!target) fail(404, 'Lease not found');
    return prisma.$transaction(
        async (tx) => {
            await lockRoom(tx, target.roomId);

            await lockLease(tx, leaseId);
            const lease = await leaseAccess(tx, leaseId, user);
            if (await tx.leaseCloseout.count({ where: { leaseId } }))
                fail(409, 'สัญญาปิดยอดแล้ว ไม่สามารถออกบิลเพิ่มได้');
            if (!['ACTIVE', 'ENDED'].includes(lease.status))
                fail(409, 'ออกบิลได้เมื่อสัญญาเริ่มใช้งานแล้ว');
            const periodStart = anchorDate(lease.startDate, cycleIndex),
                periodEnd = anchorDate(lease.startDate, cycleIndex + 1);
            if (lease.endDate && periodStart >= lease.endDate)
                fail(409, 'รอบบิลเกินวันสิ้นสุดสัญญา');
            if (lease.status === 'ENDED' && periodStart > lease.endedAt)
                fail(409, 'ไม่ออกบิลอนาคตของสัญญาที่จบแล้ว');
            if (
                await tx.invoice.findUnique({
                    where: { leaseId_cycleIndex: { leaseId, cycleIndex } },
                })
            )
                fail(409, 'ออกบิลรอบนี้แล้ว');
            const items = [
                {
                    itemType: 'RENT',
                    quantity: new Prisma.Decimal(1),
                    unitPrice: lease.monthlyRent,
                    amount: lease.monthlyRent,
                },
            ];
            // Rent is for the coming cycle. Utilities use exact readings for the preceding cycle.
            if (cycleIndex > 0) {
                const utilityStart = anchorDate(
                    lease.startDate,
                    cycleIndex - 1,
                );
                items.push(
                    ...(await utilityItems(
                        tx,
                        lease.roomId,
                        utilityStart,
                        periodStart,
                    )),
                );
            }
            const totalAmount = items.reduce(
                (sum, item) => sum.add(item.amount),
                new Prisma.Decimal(0),
            );
            money(totalAmount.toFixed(2));
            const dueDate = bangkokToday();
            dueDate.setUTCDate(dueDate.getUTCDate() + lease.dueDaysSnapshot);
            const row = await tx.invoice.create({
                data: {
                    invoiceNo: 'INV-' + randomUUID().slice(0, 18),
                    leaseId,
                    cycleIndex,
                    periodStart,
                    periodEnd,
                    dueDate,
                    dueDaysSnapshot: lease.dueDaysSnapshot,
                    tenantNameSnapshot: lease.tenant.name,
                    roomNumberSnapshot: lease.room.roomNumber,
                    totalAmount,
                    items: { create: items },
                },
                include: { items: true },
            });
            await audit(
                tx,
                user,
                'ISSUE_INVOICE',
                'Invoice',
                row.id,
                'ออกบิลค่าเช่าล่วงหน้าและน้ำไฟย้อนหลัง เก็บอัตราเดิม',
            );
            await notify(
                tx,
                lease.tenant.userId,
                'ใบแจ้งหนี้ใหม่',
                'ใบแจ้งหนี้ ' + row.invoiceNo + ' พร้อมตรวจสอบแล้ว',
            );
            return row;
        },
        { timeout: 30000 },
    );
};
module.exports = { issueInvoice, bangkokToday };
