const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { validateDatabaseUrl } = require('../../src/lib/database-config');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const models = ['user', 'authSession', 'property', 'room', 'booking', 'payment', 'complaint', 'tenantProfile', 'lease', 'leaseOccupant', 'utilityRate', 'meterReading', 'invoice', 'invoiceItem', 'invoicePayment', 'paymentProof', 'invoiceSettlement', 'depositEntry', 'maintenanceRequest', 'expense', 'announcement', 'notification', 'auditLog', 'rentalPolicy', 'roomPhoto', 'meterChange', 'leaseRevision', 'leaseCloseout', 'invoiceAdjustment', 'dormitoryInstallation'];
const key = model => model === 'invoiceSettlement' ? 'invoiceId' : 'id';
const digest = row => createHash('sha256').update(JSON.stringify(row)).digest('hex');

const createFixtureDatabase = async () => {
    const url = validateDatabaseUrl(process.env.DATABASE_URL);
    if (process.env.DORMIFY_DB_TESTS !== '1' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
        throw new Error('Use npm test/test:ui to run scoped fixtures against the local dormify database. No reset is allowed.');
    }
    const prisma = new PrismaClient();
    const scope = 'dormify-' + randomUUID().replaceAll('-', '');
    process.env.DORMIFY_FIXTURE_SCOPE = scope;
    process.env.DORMIFY_INSTALLATION_KEY = scope;
    const suffix = `@${scope}.example.test`;
    const baseline = {};
    try {
        for (const model of models) {
            baseline[model] = (await prisma[model].findMany({ orderBy: { [key(model)]: 'asc' } }))
                .map(row => ({ id: row[key(model)], digest: digest(row) }));
        }
        if (await prisma.user.count({ where: { email: { endsWith: suffix } } })) {
            throw new Error('Fixture namespace unexpectedly exists; nothing was changed.');
        }
    } catch (error) { await prisma.$disconnect(); throw error; }

    const cleanup = async () => {
        try {
            const userIds = (await prisma.user.findMany({ where: { email: { endsWith: suffix } }, select: { id: true } })).map(row => row.id);
            if (userIds.length) {
                const ownedRoom = { property: { ownerId: { in: userIds } } };
                const outsider = await prisma.booking.count({ where: { room: ownedRoom, userId: { notIn: userIds } } });
                const payments = await prisma.payment.count({ where: { booking: { OR: [{ userId: { in: userIds } }, { room: ownedRoom }] } } });
                const complaints = await prisma.complaint.count({ where: { OR: [{ userId: { in: userIds } }, { property: { ownerId: { in: userIds } } }] } });
                if (outsider || payments || complaints) {
                    throw new Error('Fixture data has unexpected external links. Cleanup stopped to preserve those records.');
                }
                await prisma.$transaction(async tx => {
                    const tenantIds = (await tx.tenantProfile.findMany({ where: { OR: [{ createdBy: { in: userIds } }, { userId: { in: userIds } }] }, select: { id: true } })).map(row => row.id);
                    const leaseIds = (await tx.lease.findMany({ where: { OR: [{ tenantId: { in: tenantIds } }, { room: ownedRoom }] }, select: { id: true } })).map(row => row.id);
                    const invoiceScope = { invoice: { leaseId: { in: leaseIds } } };
                    await tx.invoiceSettlement.deleteMany({ where: invoiceScope });
                    await tx.invoiceAdjustment.deleteMany({ where: invoiceScope });
                    await tx.paymentProof.deleteMany({ where: { payment: invoiceScope } });
                    await tx.invoicePayment.deleteMany({ where: invoiceScope });
                    await tx.invoiceItem.deleteMany({ where: invoiceScope });
                    await tx.invoice.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.depositEntry.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.maintenanceRequest.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.leaseOccupant.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.leaseCloseout.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.leaseRevision.deleteMany({ where: { leaseId: { in: leaseIds } } });
                    await tx.lease.deleteMany({ where: { id: { in: leaseIds } } });
                    await tx.tenantProfile.deleteMany({ where: { id: { in: tenantIds } } });
                    await tx.meterReading.deleteMany({ where: { room: ownedRoom } });
                    await tx.meterChange.deleteMany({ where: { room: ownedRoom } });
                    await tx.roomPhoto.deleteMany({ where: { room: ownedRoom } });
                    await tx.utilityRate.deleteMany({ where: { createdBy: { in: userIds } } });
                    await tx.expense.deleteMany({ where: { recordedBy: { in: userIds } } });
                    await tx.announcement.deleteMany({ where: { createdBy: { in: userIds } } });
                    await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
                    await tx.rentalPolicy.deleteMany({ where: { createdBy: { in: userIds } } });
                    await tx.auditLog.deleteMany({ where: { OR: [{ fixtureScope: scope }, { actorId: { in: userIds } }] } });
                    await tx.booking.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { room: ownedRoom }] } });
                    await tx.room.deleteMany({ where: ownedRoom });
                    await tx.dormitoryInstallation.deleteMany({ where: { property: { ownerId: { in: userIds } } } });
                    await tx.property.deleteMany({ where: { ownerId: { in: userIds } } });
                    await tx.user.deleteMany({ where: { id: { in: userIds } } });
                }, { timeout: 30000 });
            }
            for (const model of models) {
                const previous = baseline[model];
                const rows = await prisma[model].findMany({ where: { [key(model)]: { in: previous.map(row => row.id) } }, orderBy: { [key(model)]: 'asc' } });
                const current = rows.map(row => ({ id: row[key(model)], digest: digest(row) }));
                if (JSON.stringify(current) !== JSON.stringify(previous)) {
                    throw new Error(`Pre-existing ${model} records changed during tests. Inspect before continuing.`);
                }
            }
            console.log('Fixture cleanup verified; pre-existing records unchanged.');
        } finally { await prisma.$disconnect(); }
    };
    console.log('Using scoped fixtures in the single dormify database; no reset or additional database.');
    return { prisma, scope, suffix, email: name => `${name}${suffix}`, cleanup };
};

module.exports = { createFixtureDatabase };
