const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cwd = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(cwd, '.env'), quiet: true });
const { validateDatabaseUrl } = require('../src/lib/database-config');

const main = () => {
    validateDatabaseUrl(process.env.DATABASE_URL);
    if (fs.existsSync(path.join(cwd, 'prisma/dev.db'))) {
        throw new Error('Existing SQLite data found. This command does not import or remove it. Plan the data transfer before using MySQL.');
    }
    const cli = path.join(cwd, 'node_modules/prisma/build/index.js');
    const commands = process.argv.includes('--skip-generate') ? [] : [['generate']];
    commands.push(['migrate', 'deploy']);
    for (const args of commands) {
        const result = spawnSync(process.execPath, [cli, ...args], { cwd, env: process.env, stdio: 'inherit', windowsHide: true });
        if (result.error) throw result.error;
        if (result.status !== 0) { process.exitCode = result.status || 1; return; }
    }
    console.log('MySQL migrations applied. No reset, seed, test database or shadow database was created.');
};
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
