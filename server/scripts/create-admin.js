const path = require('node:path');
const readline = require('node:readline/promises');
const { Writable } = require('node:stream');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const prisma = require('../src/lib/prisma');

const readCredentials = async () => {
    if (!process.stdin.isTTY) {
        // Automation/tests may pass JSON through stdin. Never accept a password
        // in command arguments, a committed file, or log output.
        let input = '';
        for await (const chunk of process.stdin) {
            input += chunk;
            if (Buffer.byteLength(input) > 4096) throw new Error('Input is too large');
        }
        return JSON.parse(input);
    }
    let muted = false;
    const output = new Writable({ write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding);
        callback();
    } });
    const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
    try {
        const email = await rl.question('Admin email: ');
        const name = await rl.question('Admin name: ');
        process.stdout.write('Password (12+ characters; input hidden): ');
        muted = true;
        const password = await rl.question('');
        muted = false;
        process.stdout.write('\nConfirm password (input hidden): ');
        muted = true;
        const confirmation = await rl.question('');
        muted = false;
        process.stdout.write('\n');
        if (password !== confirmation) throw new Error('Passwords do not match');
        return { email, name, password };
    } finally { rl.close(); }
};

const main = async () => {
    if (!process.env.DATABASE_URL?.startsWith('file:')) {
        throw new Error('This bootstrap command only supports the local SQLite database');
    }
    const req = { body: await readCredentials() };
    const checks = [
        body('email').isString().bail().trim().toLowerCase().isEmail().isLength({ max: 254 }),
        body('name').isString().bail().trim().isLength({ min: 1, max: 100 }),
        body('password').isString().bail().isLength({ min: 12 })
            .custom(value => Buffer.byteLength(value, 'utf8') <= 72),
    ];
    for (const check of checks) await check.run(req);
    if (!validationResult(req).isEmpty()) throw new Error('Invalid email/name/password (password: 12+ characters, at most 72 UTF-8 bytes)');
    const { email, name, password } = req.body;
    if (await prisma.user.findUnique({ where: { email } })) {
        throw new Error('Email already exists. No existing account was changed or promoted.');
    }
    await prisma.user.create({ data: { email, name, password: await bcrypt.hash(password, 10), role: 'ADMIN' } });
    console.log('Admin created successfully. Password is not stored in plaintext or printed.');
};

main().catch(() => {
    // Avoid accidental credential logging in errors from the database/JSON parser.
    console.error('Admin creation failed. Check the local database, input validation and duplicate email. No existing account was overwritten.');
    process.exitCode = 1;
}).finally(() => prisma.$disconnect());
