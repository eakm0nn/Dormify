const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { validateDatabaseUrl } = require('../../src/lib/database-config');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const models = ['user', 'authSession', 'property', 'room', 'booking', 'payment', 'complaint'];
const digest = row => createHash('sha256').update(JSON.stringify(row)).digest('hex');

const createFixtureDatabase = async () => {
    const url = validateDatabaseUrl(process.env.DATABASE_URL);
    if (process.env.DORMIFY_DB_TESTS !== '1' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
        throw new Error('Use npm test/test:ui to run scoped fixtures against the local dormify database. No reset is allowed.');
    }
    const prisma = new PrismaClient();
    const scope = 'dormify-' + randomUUID().replaceAll('-', '');
    const suffix = `@${scope}.example.test`;
    const baseline = {};
    try {
        for (const model of models) {
            baseline[model] = (await prisma[model].findMany({ orderBy: { id: 'asc' } }))
                .map(row => ({ id: row.id, digest: digest(row) }));
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
                    await tx.booking.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { room: ownedRoom }] } });
                    await tx.room.deleteMany({ where: ownedRoom });
                    await tx.property.deleteMany({ where: { ownerId: { in: userIds } } });
                    await tx.user.deleteMany({ where: { id: { in: userIds } } });
                });
            }
            for (const model of models) {
                const previous = baseline[model];
                const rows = await prisma[model].findMany({ where: { id: { in: previous.map(row => row.id) } }, orderBy: { id: 'asc' } });
                const current = rows.map(row => ({ id: row.id, digest: digest(row) }));
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
