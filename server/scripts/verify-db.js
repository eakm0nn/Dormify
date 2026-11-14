const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const { validateDatabaseUrl } = require('../src/lib/database-config');
const { PrismaClient } = require('@prisma/client');

const main = async () => {
    validateDatabaseUrl(process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    try {
        const [server] = await prisma.$queryRaw`SELECT VERSION() AS version, DATABASE() AS name`;
        const counts = {};
        for (const model of ['user', 'authSession', 'property', 'room', 'booking', 'payment', 'complaint', 'tenantProfile', 'lease', 'leaseOccupant', 'utilityRate', 'meterReading', 'invoice', 'invoiceItem', 'invoicePayment', 'paymentProof', 'invoiceSettlement', 'depositEntry', 'maintenanceRequest', 'expense', 'announcement', 'notification', 'auditLog', 'rentalPolicy']) {
            counts[model] = await prisma[model].count();
        }
        console.log(JSON.stringify({ database: server.name, mysql: server.version, counts }, null, 2));
    } finally { await prisma.$disconnect(); }
};
main().catch(() => { console.error('Database verification failed. Check MySQL readiness and local configuration.'); process.exitCode = 1; });
