const prisma = require('./prisma');
const { anchorDate } = require('./billing-calculation');
const { issueInvoice, bangkokToday } = require('./invoice-service');
let running = false;
const runBilling = async (user) => {
    if (running) return { busy: true, issued: [], waiting: [] };
    running = true;
    try {
        const scope = process.env.DORMIFY_FIXTURE_SCOPE;
        const leases = await prisma.lease.findMany({
            where: {
                room: { propertyId: await require('./installation').propertyId() },
                status: 'ACTIVE',
                ...(scope
                    ? {
                          tenant: {
                              user: {
                                  email: {
                                      endsWith: '@' + scope + '.example.test',
                                  },
                              },
                          },
                      }
                    : {}),
            },
            select: { id: true, startDate: true, contractNo: true },
        });
        const issued = [],
            waiting = [],
            today = bangkokToday();
        for (const lease of leases) {
            for (
                let cycle = 0;
                cycle <= 1200 && anchorDate(lease.startDate, cycle) <= today;
                cycle++
            ) {
                if (issued.length >= 24)
                    return { issued, waiting, remaining: true };
                if (
                    await prisma.invoice.count({
                        where: { leaseId: lease.id, cycleIndex: cycle },
                    })
                )
                    continue;
                try {
                    const row = await issueInvoice(
                        lease.id,
                        cycle,
                        user || { userId: null, name: 'ระบบ', role: 'ADMIN' },
                    );
                    issued.push({
                        id: row.id,
                        invoiceNo: row.invoiceNo,
                        contractNo: lease.contractNo,
                    });
                } catch (error) {
                    waiting.push({
                        leaseId: lease.id,
                        contractNo: lease.contractNo,
                        reason: error.status
                            ? error.message
                            : 'ดำเนินการไม่ได้ กรุณาตรวจข้อมูลและลองใหม่',
                    });
                    break;
                }
            }
        }
        return { issued, waiting };
    } finally {
        running = false;
    }
};
const tickBilling = async () => {
    const policy = await prisma.rentalPolicy.findFirst({
        orderBy: { id: 'desc' },
    });
    if (policy?.autoBilling) await runBilling();
};
module.exports = { runBilling, tickBilling };
