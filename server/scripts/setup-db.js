const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cwd = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(cwd, '.env'), quiet: true });

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith('file:') || url.includes('?')) {
    throw new Error('This Phase 0 setup requires a plain SQLite file: DATABASE_URL');
}
const databasePath = path.resolve(cwd, 'prisma', url.slice(5));
if (!fs.existsSync(databasePath)) {
    // Prisma 5 on this Windows environment fails with a generic schema engine
    // error for a missing file. Create an empty file exclusively, never truncate.
    fs.writeFileSync(databasePath, '', { flag: 'wx' });
    console.log('Created a new empty SQLite file.');
} else {
    console.log('Existing SQLite file found; preserving data. No reset or seed will run.');
}
const cli = path.join(cwd, 'node_modules/prisma/build/index.js');
const run = args => {
    const result = spawnSync(process.execPath, [cli, ...args], { cwd, env: process.env, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
};

const setup = async () => {
    run(['generate']);
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        await require('./ensure-room-uniqueness')(prisma);
    } finally {
        await prisma.$disconnect();
    }
    run(['db', 'push', '--skip-generate']);
};

setup().catch(error => { console.error(error.message); process.exitCode = 1; });
