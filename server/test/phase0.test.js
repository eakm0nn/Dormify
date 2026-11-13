const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashToken } = require('../src/lib/session');

// Never run seed/reset or point these tests at the local development database.
test('existing SQLite room constraint refuses duplicates and preserves data', async () => {
    const temp = mkdtempSync(path.join(tmpdir(), 'dormify-constraint-'));
    const databasePath = path.join(temp, 'legacy.db');
    writeFileSync(databasePath, '', { flag: 'wx' });
    const prisma = new PrismaClient({ datasources: { db: { url: `file:${databasePath.replaceAll('\\', '/')}` } } });
    const ensureRoomUniqueness = require('../scripts/ensure-room-uniqueness');
    try {
        await ensureRoomUniqueness(prisma); // A new database has no Room table yet.
        await prisma.$executeRaw`CREATE TABLE Room (id INTEGER PRIMARY KEY, propertyId INTEGER, roomNumber TEXT)`;
        await prisma.$executeRaw`INSERT INTO Room VALUES (1, 1, '101'), (2, 1, '101')`;
        await assert.rejects(ensureRoomUniqueness(prisma), /Duplicate room numbers found/);
        assert.equal(Number((await prisma.$queryRaw`SELECT COUNT(*) AS count FROM Room`)[0].count), 2);
        await prisma.$executeRaw`UPDATE Room SET roomNumber = '102' WHERE id = 2`;
        await ensureRoomUniqueness(prisma);
        await ensureRoomUniqueness(prisma); // Re-running setup is safe.
        await assert.rejects(prisma.$executeRaw`INSERT INTO Room VALUES (3, 1, '101')`);
        assert.equal(Number((await prisma.$queryRaw`SELECT COUNT(*) AS count FROM Room`)[0].count), 2);
    } finally {
        await prisma.$disconnect();
    }
});

test('Admin/User authentication: real HTTP API with isolated SQLite', { timeout: 60000 }, async (t) => {
    const cwd = path.resolve(__dirname, '..');
    const temp = mkdtempSync(path.join(tmpdir(), 'dormify-phase0-'));
    writeFileSync(path.join(temp, 'test.db'), '', { flag: 'wx' });
    const databaseUrl = `file:${path.join(temp, 'test.db').replaceAll('\\', '/')}`;
    const env = { ...process.env, DATABASE_URL: databaseUrl, JWT_SECRET: randomBytes(48).toString('hex'), PORT: '0', CLIENT_ORIGIN: 'http://127.0.0.1:5173' };
    const push = spawnSync(process.execPath, [path.join(cwd, 'node_modules/prisma/build/index.js'), 'db', 'push', '--skip-generate'], { cwd, env, encoding: 'utf8' });
    assert.equal(push.status, 0, push.stderr || push.stdout);
    const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    t.after(() => prisma.$disconnect());

    await t.test('server fails closed with a missing or placeholder secret', () => {
        for (const secret of ['', 'secret', 'your_secure_jwt_secret_here']) {
            const result = spawnSync(process.execPath, ['-e', "require('./src/config')"], { cwd, env: { ...env, JWT_SECRET: secret }, encoding: 'utf8' });
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, /JWT_SECRET must be set/);
        }
    });

    const child = spawn(process.execPath, ['src/index.js'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    t.after(async () => {
        if (child.exitCode === null && child.signalCode === null) {
            const closed = once(child, 'exit');
            child.kill();
            await closed;
        }
    });
    const base = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { child.kill(); reject(new Error('API startup timed out')); }, 15000);
        let output = '';
        child.stdout.on('data', (data) => {
            output += data;
            const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
            if (match) { clearTimeout(timer); resolve(match[0]); }
        });
        child.once('error', (error) => { clearTimeout(timer); reject(error); });
        child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`API exited: ${code}`)); });
        child.stderr.on('data', () => {});
    });
    const request = async (route, method = 'GET', body, token) => {
        const response = await fetch(base + route, {
            method,
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return { status: response.status, data };
    };
    const password = randomBytes(20).toString('hex');
    const register = (email, role) => request('/api/auth/register', 'POST', { email, password, name: 'Phase 0 Test', ...(role ? { role } : {}) });
    const login = async (email) => {
        const result = await request('/api/auth/login', 'POST', { email, password });
        assert.equal(result.status, 200);
        assert.ok(result.data.token);
        return result.data.token;
    };
    let userToken, otherToken, adminToken, revokedToken, propertyId, roomId, bookingId;
    const adminEmail = 'admin@example.test';
    const bootstrap = (data) => spawnSync(process.execPath, ['scripts/create-admin.js'], {
        cwd, env, input: JSON.stringify(data), encoding: 'utf8', timeout: 15000,
    });

    await t.test('database is empty; public property APIs remain available', async () => {
        assert.equal(await prisma.user.count(), 0);
        assert.equal((await request('/')).status, 200);
        assert.deepEqual((await request('/api/properties')).data, []);
        assert.deepEqual((await request('/api/properties/available-rooms')).data, []);
    });
    await t.test('public registration only creates USER; email normalization and password hashing', async () => {
        for (const role of ['ADMIN', 'OWNER', 'TENANT', 'UNKNOWN']) {
            assert.equal((await register('blocked@example.test', role)).status, 400);
        }
        assert.equal((await register(' User@Example.Test ')).status, 201);
        const user = await prisma.user.findUnique({ where: { email: 'user@example.test' } });
        assert.equal(user.role, 'USER');
        assert.notEqual(user.password, password);
        assert.equal(await bcrypt.compare(password, user.password), true);
        assert.equal((await register('USER@EXAMPLE.TEST')).status, 409);
        assert.equal((await register('other@example.test', 'USER')).status, 201);
        assert.equal(await prisma.user.count({ where: { role: 'ADMIN' } }), 0);
    });
    await t.test('registration validates password length, UTF-8 bcrypt limit and input types', async () => {
        for (const candidate of ['short', 'x'.repeat(73), '\u0e01'.repeat(25), null, 12345678]) {
            const result = await request('/api/auth/register', 'POST', { email: 'invalid@example.test', password: candidate, name: 'Test' });
            assert.equal(result.status, 400);
        }
        assert.equal((await request('/api/auth/register', 'POST', { email: 'invalid', password, name: 'Test' })).status, 400);
        assert.equal((await request('/api/auth/register', 'POST', { email: 'invalid@example.test', password, name: '  ' })).status, 400);
    });
    await t.test('local Admin bootstrap creates a hashed password and never promotes existing users', async () => {
        const result = bootstrap({ email: adminEmail, name: 'Test Admin', password });
        assert.equal(result.status, 0, result.stderr);
        assert.equal((result.stdout + result.stderr).includes(password), false);
        const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
        assert.equal(admin.role, 'ADMIN');
        assert.equal(await bcrypt.compare(password, admin.password), true);
        assert.notEqual(bootstrap({ email: 'user@example.test', name: 'Escalation', password }).status, 0);
        assert.equal((await prisma.user.findUnique({ where: { email: 'user@example.test' } })).role, 'USER');
        assert.notEqual(bootstrap({ email: adminEmail, name: 'Overwrite', password: 'Replacement1234' }).status, 0);
        assert.equal((await prisma.user.findUnique({ where: { email: adminEmail } })).password, admin.password);
        assert.notEqual(bootstrap({ email: 'invalid-admin@example.test', name: 'Test', password: 'short' }).status, 0);
    });
    await t.test('login creates a persistent hashed session and /me returns current safe profile', async () => {
        assert.equal((await request('/api/auth/login', 'POST', { email: 'user@example.test', password: 'incorrect' })).status, 401);
        userToken = await login(' USER@EXAMPLE.TEST ');
        otherToken = await login('other@example.test');
        adminToken = await login(adminEmail);
        const claims = jwt.decode(userToken);
        const session = await prisma.authSession.findUnique({ where: { id: claims.jti } });
        assert.equal(session.tokenHash, hashToken(userToken));
        assert.notEqual(session.tokenHash, userToken);
        assert.ok(session.expiresAt > new Date());
        const profile = await request('/api/auth/me', 'GET', undefined, userToken);
        assert.equal(profile.status, 200);
        assert.equal(profile.data.user.role, 'USER');
        assert.deepEqual(Object.keys(profile.data.user).sort(), ['email', 'id', 'name', 'role']);
        await prisma.user.update({ where: { id: claims.userId }, data: { name: 'Updated profile' } });
        assert.equal((await request('/api/auth/me', 'GET', undefined, userToken)).data.user.name, 'Updated profile');
    });
    await t.test('missing, forged, expired and pre-session tokens are rejected', async () => {
        assert.equal((await request('/api/auth/me')).status, 401);
        assert.equal((await request('/api/auth/me', 'GET', undefined, 'invalid')).status, 401);
        const id = jwt.decode(userToken).userId;
        const forged = jwt.sign({ userId: id, role: 'ADMIN' }, env.JWT_SECRET, { expiresIn: '1h' });
        assert.equal((await request('/api/auth/me', 'GET', undefined, forged)).status, 401);
        const legacy = jwt.sign({ userId: id, role: 'USER' }, env.JWT_SECRET, { expiresIn: '1h' });
        assert.equal((await request('/api/auth/me', 'GET', undefined, legacy)).status, 401);
        const expired = jwt.sign({ userId: id, role: 'USER' }, env.JWT_SECRET, { expiresIn: -1 });
        assert.equal((await request('/api/auth/me', 'GET', undefined, expired)).status, 401);
        const malformed = await fetch(base + '/api/auth/me', { headers: { Authorization: 'Basic ' + userToken } });
        assert.equal(malformed.status, 401);
        const edited = jwt.sign({ userId: id, role: 'ADMIN' }, env.JWT_SECRET, { jwtid: jwt.decode(userToken).jti, expiresIn: '1h' });
        assert.equal((await request('/api/auth/me', 'GET', undefined, edited)).status, 401);
    });
    await t.test('User cannot access Admin APIs; Admin can create properties and rooms', async () => {
        const property = { name: 'Auth test hostel', address: 'Local test only', city: 'Bangkok', type: 'HOSTEL' };
        assert.equal((await request('/api/properties', 'POST', property)).status, 401);
        assert.equal((await request('/api/properties', 'POST', property, userToken)).status, 403);
        const created = await request('/api/properties', 'POST', property, adminToken);
        assert.equal(created.status, 201);
        propertyId = created.data.id;
        const room = { propertyId, roomNumber: 'TEST-101', capacity: 1, price: 3000, type: 'AC' };
        assert.equal((await request('/api/properties/rooms', 'POST', room, userToken)).status, 403);
        const createdRoom = await request('/api/properties/rooms', 'POST', room, adminToken);
        assert.equal(createdRoom.status, 201);
        roomId = createdRoom.data.id;
        for (const route of ['/api/bookings/admin', '/api/bookings/owner']) {
            assert.equal((await request(route, 'GET', undefined, userToken)).status, 403);
            assert.equal((await request(route, 'GET', undefined, adminToken)).status, 200);
        }
        assert.equal((await request('/api/bookings/my-bookings', 'GET', undefined, adminToken)).status, 403);
    });
    await t.test('User bookings stay private and only Admin can confirm or reject', async () => {
        const booking = { roomId, startDate: '2027-01-01', endDate: '2027-02-01' };
        assert.equal((await request('/api/bookings', 'POST', booking, adminToken)).status, 403);
        const created = await request('/api/bookings', 'POST', booking, userToken);
        assert.equal(created.status, 201);
        bookingId = created.data.booking.id;
        assert.equal((await request('/api/bookings/my-bookings', 'GET', undefined, userToken)).data.length, 1);
        assert.equal((await request('/api/bookings/my-bookings', 'GET', undefined, otherToken)).data.length, 0);
        const route = '/api/bookings/' + bookingId + '/status';
        assert.equal((await request(route, 'PUT', { status: 'CONFIRMED' }, otherToken)).status, 403);
        assert.equal((await request(route, 'PUT', { status: 'CONFIRMED' }, userToken)).status, 403);
        assert.equal((await request(route, 'PUT', { status: 'UNKNOWN' }, adminToken)).status, 400);
        assert.equal((await request(route, 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: roomId } })).isAvailable, false);
        assert.equal((await request(route, 'PUT', { status: 'REJECTED' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: roomId } })).isAvailable, true);
    });
    await t.test('invalid dates, reversed periods and malformed IDs never create bookings', async () => {
        const valid = { roomId, startDate: '2027-01-01', endDate: '2027-02-01' };
        const before = await prisma.booking.count();
        for (const body of [
            { ...valid, startDate: '2027-02-30' },
            { ...valid, startDate: 'invalid' },
            { ...valid, endDate: '2026-01-01' },
            { ...valid, endDate: valid.startDate },
            ...[0, -1, 1.5, '1junk', 2147483648, '999999999999999999999', null, [roomId], true].map(id => ({ ...valid, roomId: id })),
        ]) assert.equal((await request('/api/bookings', 'POST', body, userToken)).status, 400, JSON.stringify(body));
        assert.equal(await prisma.booking.count(), before);
        assert.equal((await request('/api/bookings/1junk/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 400);
    });
    await t.test('room validation, unique constraint and scoped public details', async () => {
        const room = { propertyId, roomNumber: 'TEST-101', capacity: 1, price: 3000, type: 'AC' };
        for (const body of [
            { ...room, price: -1 }, { ...room, price: null }, { ...room, price: [3000] },
            { ...room, capacity: 0 }, { ...room, capacity: 1.5 }, { ...room, capacity: 2147483648 },
            { ...room, propertyId: '1junk' }, { ...room, roomNumber: '   ' },
            { ...room, roomNumber: 101 },
        ]) assert.equal((await request('/api/properties/rooms', 'POST', body, adminToken)).status, 400);
        assert.equal((await request('/api/properties', 'POST', { name: 'Test', address: 'Test', city: 'Test', type: 'HOSTEL', hasMess: 'true' }, adminToken)).status, 400);
        assert.equal((await request('/api/properties/rooms', 'POST', { ...room, roomNumber: ' TEST-101 ' }, adminToken)).status, 409);
        await assert.rejects(prisma.room.create({ data: room }), { code: 'P2002' });
        const otherProperty = await request('/api/properties', 'POST', { name: 'Second property', address: 'Test', city: 'Bangkok', type: 'HOSTEL' }, adminToken);
        assert.equal(otherProperty.status, 201);
        assert.equal((await request('/api/properties/rooms', 'POST', { ...room, propertyId: otherProperty.data.id, price: 0 }, adminToken)).status, 201);
        const details = await request('/api/properties/' + propertyId);
        assert.equal(details.status, 200);
        assert.equal(details.data.id, propertyId);
        assert.equal(details.data.rooms.length, 1);
        assert.equal('password' in details.data.owner, false);
        assert.equal((await request('/api/properties/1junk')).status, 400);
        assert.equal((await request('/api/properties/2147483647')).status, 404);
    });
    await t.test('competing approvals cannot confirm two requests for one room', async () => {
        const room = await prisma.room.create({ data: { propertyId, roomNumber: 'RACE-101', capacity: 1, price: 2500, type: 'AC' } });
        const body = { roomId: room.id, startDate: '2027-01-01', endDate: '2027-02-01' };
        const first = await request('/api/bookings', 'POST', body, userToken);
        const second = await request('/api/bookings', 'POST', body, otherToken);
        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        const ids = [first.data.booking.id, second.data.booking.id];
        const responses = await Promise.all(ids.map(id => request('/api/bookings/' + id + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)));
        assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
        assert.equal(await prisma.booking.count({ where: { roomId: room.id, status: 'CONFIRMED' } }), 1);
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, false);
        const winner = ids[responses.findIndex(response => response.status === 200)];
        const loser = ids.find(id => id !== winner);
        assert.equal((await request('/api/bookings/' + loser + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 409);
        assert.equal((await request('/api/bookings/' + winner + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 409);
        assert.equal((await request('/api/bookings', 'POST', body, userToken)).status, 409);
        assert.equal((await request('/api/bookings/' + winner + '/status', 'PUT', { status: 'CANCELLED' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, true);
        assert.equal((await request('/api/bookings/' + winner + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 409);
        assert.equal((await request('/api/bookings/' + loser + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 200);
        // A legacy conflict must not free an occupied room when one record is cancelled.
        const legacy = await prisma.booking.create({ data: { userId: jwt.decode(userToken).userId, roomId: room.id, startDate: new Date(body.startDate), endDate: new Date(body.endDate), status: 'CONFIRMED', totalAmount: 2500 } });
        assert.equal((await request('/api/bookings/' + loser + '/status', 'PUT', { status: 'REJECTED' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, false);
        assert.equal((await request('/api/bookings/' + legacy.id + '/status', 'PUT', { status: 'CANCELLED' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, true);
    });
    await t.test('concurrent room creation produces one room and one conflict', async () => {
        const room = { propertyId, roomNumber: 'UNIQUE-RACE', capacity: 1, price: 2800, type: 'NON-AC' };
        const responses = await Promise.all([request('/api/properties/rooms', 'POST', room, adminToken), request('/api/properties/rooms', 'POST', room, adminToken)]);
        assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
        assert.equal(await prisma.room.count({ where: { propertyId, roomNumber: room.roomNumber } }), 1);
    });
    await t.test('Admin summary counts only the selected property without returning booking records', async () => {
        const route = '/api/bookings/summary?propertyId=' + propertyId;
        assert.equal((await request(route, 'GET', undefined, userToken)).status, 403);
        assert.equal((await request('/api/bookings/summary?propertyId=bad', 'GET', undefined, adminToken)).status, 400);
        const result = await request(route, 'GET', undefined, adminToken);
        assert.equal(result.status, 200);
        assert.deepEqual(result.data, {
            totalRooms: await prisma.room.count({ where: { propertyId } }),
            availableRooms: await prisma.room.count({ where: { propertyId, isAvailable: true } }),
            pendingBookings: await prisma.booking.count({ where: { status: 'PENDING', room: { propertyId } } }),
        });
    });
    await t.test('logout revokes only the authenticated session, including replay protection', async () => {
        const secondToken = await login('user@example.test');
        revokedToken = userToken;
        const otherSessionId = jwt.decode(otherToken).jti;
        assert.equal((await request('/api/auth/logout', 'POST', { sessionId: otherSessionId }, userToken)).status, 200);
        assert.equal((await request('/api/auth/me', 'GET', undefined, userToken)).status, 401);
        assert.equal((await request('/api/auth/logout', 'POST', {}, userToken)).status, 401);
        assert.equal((await request('/api/auth/me', 'GET', undefined, otherToken)).status, 200);
        assert.equal((await request('/api/auth/me', 'GET', undefined, secondToken)).status, 200);
        assert.ok((await prisma.authSession.findUnique({ where: { id: jwt.decode(userToken).jti } })).revokedAt);
        userToken = secondToken;
    });
    await t.test('database session expiry is enforced even when JWT has not expired', async () => {
        const expiringToken = await login('user@example.test');
        await prisma.authSession.update({ where: { id: jwt.decode(expiringToken).jti }, data: { expiresAt: new Date(Date.now() - 1000) } });
        assert.equal((await request('/api/auth/me', 'GET', undefined, expiringToken)).status, 401);
    });
    await t.test('current database role is authoritative and deleted accounts lose access', async () => {
        const adminId = jwt.decode(adminToken).userId;
        await prisma.user.update({ where: { id: adminId }, data: { role: 'USER' } });
        assert.equal((await request('/api/bookings/admin', 'GET', undefined, adminToken)).status, 401);
        const downgradedToken = await login(adminEmail);
        assert.equal((await request('/api/bookings/admin', 'GET', undefined, downgradedToken)).status, 403);
        await prisma.user.create({ data: { email: 'legacy@example.test', name: 'Legacy fixture', role: 'OWNER', password: await bcrypt.hash(password, 10) } });
        assert.equal((await request('/api/auth/login', 'POST', { email: 'legacy@example.test', password })).status, 403);
        assert.equal((await prisma.user.findUnique({ where: { email: 'legacy@example.test' } })).role, 'OWNER');
        await register('deleted@example.test');
        const deletedToken = await login('deleted@example.test');
        await prisma.user.delete({ where: { id: jwt.decode(deletedToken).userId } });
        assert.equal((await request('/api/auth/me', 'GET', undefined, deletedToken)).status, 401);
    });
    await t.test('CORS remains limited to the local frontend', async () => {
        const response = await fetch(base + '/api/properties', { headers: { Origin: 'https://untrusted.example' } });
        assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173');
    });
    await t.test('session revocation survives API restart while other valid sessions still work', async () => {
        const exited = once(child, 'exit');
        child.kill();
        await exited;
        const restarted = spawn(process.execPath, ['src/index.js'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
        try {
            const newBase = await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Restart timed out')), 10000);
                let output = '';
                restarted.stdout.on('data', data => {
                    output += data;
                    const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
                    if (match) { clearTimeout(timer); resolve(match[0]); }
                });
                restarted.once('error', error => { clearTimeout(timer); reject(error); });
                restarted.once('exit', () => { clearTimeout(timer); reject(new Error('Restart failed')); });
                restarted.stderr.on('data', () => {});
            });
            const profile = token => fetch(newBase + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
            assert.equal((await profile(revokedToken)).status, 401);
            assert.equal((await profile(userToken)).status, 200);
        } finally {
            if (restarted.exitCode === null && restarted.signalCode === null) {
                const closed = once(restarted, 'exit');
                restarted.kill();
                await closed;
            }
        }
    });
});
