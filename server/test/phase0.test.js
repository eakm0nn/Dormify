const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const { createFixtureDatabase } = require('./helpers/mysql-fixtures');
const { validateDatabaseUrl } = require('../src/lib/database-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashToken } = require('../src/lib/session');

test('database configuration rejects non-MySQL and unintended databases', () => {
    for (const value of ['', 'file:./dev.db', 'mysql://app:password@localhost/other']) {
        assert.throws(() => validateDatabaseUrl(value));
    }
    assert.equal(validateDatabaseUrl('mysql://app:password@127.0.0.1:3306/dormify').pathname, '/dormify');
});

test('Admin/User authentication: real HTTP API with scoped MySQL fixtures', { timeout: 60000 }, async (t) => {
    const cwd = path.resolve(__dirname, '..');
    const fixtures = await createFixtureDatabase();
    const { prisma, scope: runTag, suffix } = fixtures;
    const databaseUrl = process.env.DATABASE_URL;
    const env = { ...process.env, DATABASE_URL: databaseUrl, JWT_SECRET: randomBytes(48).toString('hex'), PORT: '0', CLIENT_ORIGIN: 'http://127.0.0.1:5173' };
    t.after(fixtures.cleanup);

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
    const adminEmail = `admin@${runTag}.example.test`;
    const bootstrap = (data) => spawnSync(process.execPath, ['scripts/create-admin.js'], {
        cwd, env, input: JSON.stringify(data), encoding: 'utf8', timeout: 15000,
    });

    await t.test('public property APIs remain available before fixtures are created', async () => {
        assert.equal(await prisma.user.count({ where: { email: { endsWith: suffix } } }), 0);
        assert.equal((await request('/')).status, 200);
        assert.ok(Array.isArray((await request('/api/properties')).data));
        assert.ok(Array.isArray((await request('/api/properties/available-rooms')).data));
    });
    await t.test('public registration only creates USER; email normalization and password hashing', async () => {
        for (const role of ['ADMIN', 'OWNER', 'TENANT', 'UNKNOWN']) {
            assert.equal((await register(`blocked@${runTag}.example.test`, role)).status, 400);
        }
        assert.equal((await register(` User@${runTag}.Example.Test `)).status, 201);
        const user = await prisma.user.findUnique({ where: { email: `user@${runTag}.example.test` } });
        assert.equal(user.role, 'USER');
        assert.notEqual(user.password, password);
        assert.equal(await bcrypt.compare(password, user.password), true);
        assert.equal((await register(`USER@${runTag}.EXAMPLE.TEST`)).status, 409);
        assert.equal((await register(`other@${runTag}.example.test`, 'USER')).status, 201);
        assert.equal(await prisma.user.count({ where: { role: 'ADMIN', email: { endsWith: suffix } } }), 0);
    });
    await t.test('registration validates password length, UTF-8 bcrypt limit and input types', async () => {
        for (const candidate of ['short', 'x'.repeat(73), '\u0e01'.repeat(25), null, 12345678]) {
            const result = await request('/api/auth/register', 'POST', { email: `invalid@${runTag}.example.test`, password: candidate, name: 'Test' });
            assert.equal(result.status, 400);
        }
        assert.equal((await request('/api/auth/register', 'POST', { email: 'invalid', password, name: 'Test' })).status, 400);
        assert.equal((await request('/api/auth/register', 'POST', { email: `invalid@${runTag}.example.test`, password, name: '  ' })).status, 400);
    });
    await t.test('local Admin bootstrap creates a hashed password and never promotes existing users', async () => {
        const result = bootstrap({ email: adminEmail, name: 'Test Admin', password });
        assert.equal(result.status, 0, result.stderr);
        assert.equal((result.stdout + result.stderr).includes(password), false);
        const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
        assert.equal(admin.role, 'ADMIN');
        assert.equal(await bcrypt.compare(password, admin.password), true);
        assert.notEqual(bootstrap({ email: `user@${runTag}.example.test`, name: 'Escalation', password }).status, 0);
        assert.equal((await prisma.user.findUnique({ where: { email: `user@${runTag}.example.test` } })).role, 'USER');
        assert.notEqual(bootstrap({ email: adminEmail, name: 'Overwrite', password: 'Replacement1234' }).status, 0);
        assert.equal((await prisma.user.findUnique({ where: { email: adminEmail } })).password, admin.password);
        assert.notEqual(bootstrap({ email: `invalid-admin@${runTag}.example.test`, name: 'Test', password: 'short' }).status, 0);
    });
    await t.test('login creates a persistent hashed session and /me returns current safe profile', async () => {
        assert.equal((await request('/api/auth/login', 'POST', { email: `user@${runTag}.example.test`, password: 'incorrect' })).status, 401);
        userToken = await login(` USER@${runTag}.EXAMPLE.TEST `);
        otherToken = await login(`other@${runTag}.example.test`);
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
    await t.test('MySQL setup is repeatable and preserves existing room data', async () => {
        const before = await prisma.room.findUnique({ where: { id: roomId } });
        const result = spawnSync(process.execPath, ['scripts/setup-db.js', '--skip-generate'], { cwd, env, encoding: 'utf8', windowsHide: true });
        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(await prisma.room.findUnique({ where: { id: roomId } }), before);
    });
    await t.test('MySQL preserves Thai text, exact rent and scoped uniqueness', async () => {
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        const text = String.fromCodePoint(0x0e2b, 0x0e2d, 0x0e1e, 0x0e31, 0x0e01);
        await prisma.property.update({ where: { id: propertyId }, data: { name: text } });
        assert.equal((await request('/api/properties/' + propertyId)).data.name, text);
        const created = await request('/api/properties/rooms', 'POST', { propertyId, roomNumber: 'DECIMAL', capacity: 2, price: 4321.09, type: 'AC' }, adminToken);
        assert.equal(created.status, 201);
        assert.equal((await prisma.room.findUnique({ where: { id: created.data.id } })).price.toFixed(2), '4321.09');
        assert.equal((await request('/api/properties/rooms', 'POST', { propertyId, roomNumber: 'decimal', capacity: 1, price: 2000, type: 'AC' }, adminToken)).status, 409);
        await prisma.room.delete({ where: { id: created.data.id } });
        await prisma.property.update({ where: { id: propertyId }, data: { name: property.name } });
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
            { ...room, price: 10000000000 }, { ...room, price: '3000.001' }, { ...room, price: 'Infinity' },
            { ...room, capacity: 0 }, { ...room, capacity: 1.5 }, { ...room, capacity: 2147483648 },
            { ...room, propertyId: '1junk' }, { ...room, roomNumber: '   ' },
            { ...room, roomNumber: 101 },
        ]) assert.equal((await request('/api/properties/rooms', 'POST', body, adminToken)).status, 400);
        assert.equal((await request('/api/properties', 'POST', { name: 'Test', address: 'Test', city: 'Test', type: 'HOSTEL', hasMess: 'true' }, adminToken)).status, 400);
        assert.equal((await request('/api/properties/rooms', 'POST', { ...room, roomNumber: ' TEST-101 ' }, adminToken)).status, 409);
        await assert.rejects(prisma.room.create({ data: room }), { code: 'P2002' });
        const otherProperty = await request('/api/properties', 'POST', { name: 'Second property', address: 'Test', city: 'Bangkok', type: 'HOSTEL' }, adminToken);
        assert.equal(otherProperty.status, 409);
        const legacy = await prisma.property.create({ data: { name: 'Legacy outside installation', address: 'Fixture', city: 'Fixture', type: 'HOSTEL', ownerId: jwt.decode(adminToken).userId } });
        assert.equal((await request('/api/properties/rooms', 'POST', { ...room, propertyId: legacy.id, price: 0 }, adminToken)).status, 404);
        assert.equal((await request('/api/properties/' + legacy.id)).status, 404);
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
    await t.test('only Admin can edit property details; identity and relations stay intact', async () => {
        const original = await prisma.property.findUnique({ where: { id: propertyId } });
        const values = { name: 'Updated dormitory', address: 'Updated address', city: 'Bangkok', type: 'HOSTEL', rules: 'Updated rules', hasMess: false };
        const endpoint = '/api/properties/' + propertyId;
        assert.equal((await request(endpoint, 'PUT', values)).status, 401);
        assert.equal((await request(endpoint, 'PUT', values, userToken)).status, 403);
        for (const body of [{ ...values, name: ' ' }, { ...values, address: '' }, { ...values, hasMess: 'false' }, { ...values, ownerId: original.ownerId + 1 }]) {
            assert.equal((await request(endpoint, 'PUT', body, adminToken)).status, 400);
        }
        assert.equal((await request('/api/properties/1junk', 'PUT', values, adminToken)).status, 400);
        assert.equal((await request('/api/properties/2147483647', 'PUT', values, adminToken)).status, 404);
        const result = await request(endpoint, 'PUT', values, adminToken);
        assert.equal(result.status, 200);
        assert.equal(result.data.ownerId, original.ownerId);
        assert.equal(result.data.id, original.id);
        assert.equal((await request(endpoint)).data.name, values.name);
    });
    await t.test('room edits validate fields and duplicates without rewriting prior rent quotes', async () => {
        const created = await prisma.room.create({ data: { propertyId, roomNumber: 'EDIT-101', capacity: 2, price: 3000, type: 'AC' } });
        const booking = await request('/api/bookings', 'POST', { roomId: created.id, startDate: '2027-01-01', endDate: '2027-02-01' }, userToken);
        assert.equal(booking.status, 201);
        const endpoint = '/api/properties/rooms/' + created.id;
        const values = { roomNumber: ' EDIT-102 ', capacity: 3, price: '3456.78', type: 'NON-AC' };
        assert.equal((await request(endpoint, 'PUT', values)).status, 401);
        assert.equal((await request(endpoint, 'PUT', values, userToken)).status, 403);
        for (const body of [{ ...values, roomNumber: '' }, { ...values, price: '-1' }, { ...values, price: '123.001' }, { ...values, capacity: 0 }, { ...values, type: 'BAD' }, { ...values, isAvailable: true }, { ...values, propertyId }]) {
            assert.equal((await request(endpoint, 'PUT', body, adminToken)).status, 400);
        }
        assert.equal((await request('/api/properties/rooms/1junk', 'PUT', values, adminToken)).status, 400);
        assert.equal((await request('/api/properties/rooms/2147483647', 'PUT', values, adminToken)).status, 404);
        assert.equal((await request(endpoint, 'PUT', { ...values, roomNumber: 'TEST-101' }, adminToken)).status, 409);
        const edited = await request(endpoint, 'PUT', values, adminToken);
        assert.equal(edited.status, 200);
        assert.equal(edited.data.roomNumber, 'EDIT-102');
        assert.equal(edited.data.price, '3456.78');
        assert.equal(edited.data.id, created.id);
        assert.equal(edited.data.isActive, true);
        assert.equal((await prisma.booking.findUnique({ where: { id: booking.data.booking.id } })).totalAmount.toString(), '3000');
        assert.equal((await request('/api/bookings/' + booking.data.booking.id + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 200);
        const current = { ...values, roomNumber: 'EDIT-102' };
        assert.equal((await request(endpoint, 'PUT', { ...current, capacity: 4 }, adminToken)).status, 409);
        assert.equal((await request(endpoint, 'PUT', { ...current, price: '4000' }, adminToken)).status, 200);
        assert.equal((await prisma.room.findUnique({ where: { id: created.id } })).isAvailable, false);
        assert.equal((await prisma.booking.findUnique({ where: { id: booking.data.booking.id } })).totalAmount.toString(), '3000');
    });
    await t.test('deactivation guards active requests, preserves history and can be reversed', async () => {
        const room = await prisma.room.create({ data: { propertyId, roomNumber: 'CLOSE-101', capacity: 1, price: 2000, type: 'AC' } });
        const endpoint = '/api/properties/rooms/' + room.id + '/status';
        const body = { roomId: room.id, startDate: '2027-01-01', endDate: '2027-02-01' };
        assert.equal((await request(endpoint, 'PATCH', { isActive: false })).status, 401);
        assert.equal((await request(endpoint, 'PATCH', { isActive: false }, userToken)).status, 403);
        for (const payload of [{ isActive: 'false' }, {}, { isActive: 0 }, { isActive: false, isAvailable: true }]) assert.equal((await request(endpoint, 'PATCH', payload, adminToken)).status, 400);
        assert.equal((await request('/api/properties/rooms/2147483647/status', 'PATCH', { isActive: false }, adminToken)).status, 404);
        const booking = await request('/api/bookings', 'POST', body, userToken);
        assert.equal((await request(endpoint, 'PATCH', { isActive: false }, adminToken)).status, 409);
        assert.equal((await request('/api/bookings/' + booking.data.booking.id + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 200);
        assert.equal((await request(endpoint, 'PATCH', { isActive: false }, adminToken)).status, 409);
        assert.equal((await request('/api/bookings/' + booking.data.booking.id + '/status', 'PUT', { status: 'CANCELLED' }, adminToken)).status, 200);
        const summaryBefore = (await request('/api/bookings/summary?propertyId=' + propertyId, 'GET', undefined, adminToken)).data;
        const closed = await request(endpoint, 'PATCH', { isActive: false }, adminToken);
        assert.equal(closed.status, 200);
        assert.equal(closed.data.isAvailable, true);
        assert.equal(closed.data.isActive, false);
        assert.equal((await request(endpoint, 'PATCH', { isActive: false }, adminToken)).status, 200);
        assert.equal((await request('/api/bookings', 'POST', body, userToken)).status, 409);
        assert.equal((await request('/api/properties/available-rooms')).data.some(item => item.id === room.id), false);
        const summaryAfter = (await request('/api/bookings/summary?propertyId=' + propertyId, 'GET', undefined, adminToken)).data;
        assert.equal(summaryAfter.totalRooms, summaryBefore.totalRooms);
        assert.equal(summaryAfter.availableRooms, summaryBefore.availableRooms - 1);
        const history = (await request('/api/bookings/my-bookings', 'GET', undefined, userToken)).data.find(item => item.id === booking.data.booking.id);
        assert.equal(history.status, 'CANCELLED');
        assert.equal(history.room.isActive, false);
        assert.equal((await request(endpoint, 'PATCH', { isActive: true }, adminToken)).status, 200);
        assert.equal((await request('/api/bookings', 'POST', body, userToken)).status, 201);
        const legacy = await prisma.room.create({ data: { propertyId, roomNumber: 'CLOSE-LEGACY', capacity: 1, price: 1000, type: 'AC', isAvailable: false } });
        const legacyUrl = '/api/properties/rooms/' + legacy.id + '/status';
        await request(legacyUrl, 'PATCH', { isActive: false }, adminToken);
        await request(legacyUrl, 'PATCH', { isActive: true }, adminToken);
        assert.equal((await prisma.room.findUnique({ where: { id: legacy.id } })).isAvailable, false);
    });
    await t.test('a concurrent booking and deactivation never leave an active request in a closed room', async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
            const room = await prisma.room.create({ data: { propertyId, roomNumber: 'CLOSE-RACE-' + attempt, capacity: 1, price: 2000, type: 'AC' } });
            const [booking, close] = await Promise.all([
                request('/api/bookings', 'POST', { roomId: room.id, startDate: '2027-01-01', endDate: '2027-02-01' }, userToken),
                request('/api/properties/rooms/' + room.id + '/status', 'PATCH', { isActive: false }, adminToken),
            ]);
            assert.ok((booking.status === 201 && close.status === 409) || (booking.status === 409 && close.status === 200));
            const current = await prisma.room.findUnique({ where: { id: room.id } });
            const requests = await prisma.booking.count({ where: { roomId: room.id, status: { in: ['PENDING', 'CONFIRMED'] } } });
            assert.equal(!current.isActive && requests > 0, false);
        }
    });
    await t.test('approval cannot bypass an inactive room, including legacy data', async () => {
        const room = await prisma.room.create({ data: { propertyId, roomNumber: 'INACTIVE-LEGACY', capacity: 1, price: 2000, type: 'AC', isActive: false } });
        const booking = await prisma.booking.create({ data: { roomId: room.id, userId: jwt.decode(userToken).userId, startDate: new Date('2027-01-01'), endDate: new Date('2027-02-01'), status: 'PENDING', totalAmount: 2000 } });
        assert.equal((await request('/api/bookings/' + booking.id + '/status', 'PUT', { status: 'CONFIRMED' }, adminToken)).status, 409);
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, true);
    });
    await t.test('logout revokes only the authenticated session, including replay protection', async () => {
        const secondToken = await login(`user@${runTag}.example.test`);
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
        const expiringToken = await login(`user@${runTag}.example.test`);
        await prisma.authSession.update({ where: { id: jwt.decode(expiringToken).jti }, data: { expiresAt: new Date(Date.now() - 1000) } });
        assert.equal((await request('/api/auth/me', 'GET', undefined, expiringToken)).status, 401);
    });
    await t.test('current database role is authoritative and deleted accounts lose access', async () => {
        const adminId = jwt.decode(adminToken).userId;
        await prisma.user.update({ where: { id: adminId }, data: { role: 'USER' } });
        assert.equal((await request('/api/bookings/admin', 'GET', undefined, adminToken)).status, 401);
        const downgradedToken = await login(adminEmail);
        assert.equal((await request('/api/bookings/admin', 'GET', undefined, downgradedToken)).status, 403);
        await assert.rejects(prisma.user.create({ data: { email: `legacy@${runTag}.example.test`, name: 'Unsupported role fixture', role: 'OWNER', password: await bcrypt.hash(password, 10) } }));
        await register(`deleted@${runTag}.example.test`);
        const deletedToken = await login(`deleted@${runTag}.example.test`);
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
