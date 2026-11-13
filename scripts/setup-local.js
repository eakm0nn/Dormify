const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const dotenv = require('../server/node_modules/dotenv');
const root = path.resolve(__dirname, '..');

const parse = file => fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {};
const addMissing = (file, values) => {
    const existing = parse(file);
    const missing = Object.entries(values).filter(([key]) => !existing[key]);
    if (!missing.length) return;
    let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    for (const [key, value] of missing) {
        const entry = `${key}=${JSON.stringify(String(value))}`;
        const pattern = new RegExp(`^${key}=.*$`, 'm');
        if (pattern.test(text)) text = text.replace(pattern, entry);
        else text += `${text && !text.endsWith('\n') ? '\n' : ''}${entry}\n`;
    }
    fs.writeFileSync(file, text, { mode: 0o600 });
};

try {
    const composeFile = path.join(root, '.env');
    const serverFile = path.join(root, 'server/.env');
    const existingServer = parse(serverFile);
    if (existingServer.DATABASE_URL?.startsWith('file:') || fs.existsSync(path.join(root, 'server/prisma/dev.db'))) {
        throw new Error('Existing SQLite configuration/data found. Preserve it and plan data import before switching to MySQL.');
    }
    addMissing(composeFile, {
        MYSQL_PORT: '3306', MYSQL_PASSWORD: randomBytes(32).toString('hex'),
        MYSQL_ROOT_PASSWORD: randomBytes(48).toString('hex'),
    });
    const compose = parse(composeFile);
    if (!/^\d+$/.test(compose.MYSQL_PORT) || Number(compose.MYSQL_PORT) < 1 || Number(compose.MYSQL_PORT) > 65535) {
        throw new Error('MYSQL_PORT must be a valid TCP port.');
    }
    const databaseUrl = `mysql://dormify_app:${encodeURIComponent(compose.MYSQL_PASSWORD)}@127.0.0.1:${compose.MYSQL_PORT}/dormify`;
    if (existingServer.DATABASE_URL && existingServer.DATABASE_URL !== databaseUrl) {
        throw new Error('Existing DATABASE_URL differs from Docker settings. No existing server credentials were overwritten.');
    }
    addMissing(serverFile, {
        DATABASE_URL: databaseUrl, PORT: '5000', JWT_SECRET: randomBytes(48).toString('hex'),
        CLIENT_ORIGIN: 'http://127.0.0.1:5173',
    });
    addMissing(path.join(root, 'client/.env'), { VITE_API_URL: 'http://127.0.0.1:5000' });
    console.log('Local environment files are ready. Existing non-empty values were preserved; secret values are hidden.');
    console.log('Next: npm run db:up, then npm run db:setup');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
