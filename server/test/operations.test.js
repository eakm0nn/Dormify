const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const bcrypt = require('bcryptjs');
const { createFixtureDatabase } = require('./helpers/mysql-fixtures');

test('Dormitory operations: real MySQL and HTTP lifecycle', { timeout: 120000 }, async t => {
    const fixtures = await createFixtureDatabase(), { prisma, scope } = fixtures;
    t.after(fixtures.cleanup);
    const password = randomBytes(20).toString('hex'), hashed = await bcrypt.hash(password, 10);
    const users = {};
    for (const [name, role] of [['admin', 'ADMIN'], ['alice', 'USER'], ['bob', 'USER']]) users[name] = await prisma.user.create({ data: { email: fixtures.email(name), name, role, password: hashed } });
    const child = spawn(process.execPath, ['src/index.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: '0', CLIENT_ORIGIN: 'http://127.0.0.1:5173', JWT_SECRET: randomBytes(48).toString('hex') }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    t.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, 'exit'); child.kill(); await closed; } });
    const base = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('API startup timeout')), 15000); let output = '';
        child.stdout.on('data', data => { output += data; const found = output.match(/http:\/\/127\.0\.0\.1:\d+/); if (found) { clearTimeout(timer); resolve(found[0]); } });
        child.stderr.on('data', () => {}); child.once('error', reject);
    });
    const tokens = {};
    const request = async (url, method = 'GET', body, actor = 'admin', expected = 200) => {
        const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(tokens[actor] ? { Authorization: 'Bearer ' + tokens[actor] } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
        const data = await response.json();
        assert.equal(response.status, expected, method + ' ' + url + ' ' + JSON.stringify(data)); return data;
    };
    const op = (url, method, body, actor, expected) => request('/api/operations' + url, method, body, actor, expected);
    for (const name of Object.keys(users)) tokens[name] = (await request('/api/auth/login', 'POST', { email: users[name].email, password }, 'none')).token;
    const policy = { holdHours: 72, depositMonths: 1, dueDays: 5 };
    let room, booking, tenant, lease, invoice0, invoice1, transfer;
    const year = 2404 + 400 * (parseInt(scope.slice(-4), 16) % 10);
    const start = year + '-01-31', boundary = year + '-02-29', march = year + '-03-31';
    const paidDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    await t.test('Admin settings are versioned; User and unauthenticated writes fail', async () => {
        await op('/policy', 'POST', policy, 'none', 401); await op('/policy', 'POST', policy, 'alice', 403);
        await op('/policy', 'POST', policy, 'admin', 201);
        await op('/policy', 'POST', { ...policy, holdHours: 0 }, 'admin', 400);
        const property = await request('/api/properties', 'POST', { name: scope, address: 'fixture only', city: 'กรุงเทพมหานคร', type: 'HOSTEL', hasMess: false, rules: '' }, 'admin', 201);
        room = await request('/api/properties/rooms', 'POST', { propertyId: property.id, roomNumber: scope, capacity: 2, price: '3000', type: 'AC' }, 'admin', 201);
    });
    await t.test('Approval snapshots 72 hours; expiration frees only the reserved room', async () => {
        booking = (await request('/api/bookings', 'POST', { roomId: room.id, startDate: '2027-01-01', endDate: '2027-02-01' }, 'alice', 201)).booking;
        await request('/api/bookings/' + booking.id + '/status', 'PUT', { status: 'CONFIRMED' });
        let current = await prisma.booking.findUnique({ where: { id: booking.id } }); assert.equal(current.holdHoursSnapshot, 72);
        assert.ok(Math.abs(new Date(current.holdExpiresAt).getTime() - Date.now() - 72 * 3600000) < 10000);
        await op('/policy', 'POST', { ...policy, holdHours: 24 }, 'admin', 201);
        assert.equal((await prisma.booking.findUnique({ where: { id: booking.id } })).holdHoursSnapshot, 72);
        await prisma.booking.update({ where: { id: booking.id }, data: { holdExpiresAt: new Date(Date.now() - 10000) } });
        await request('/api/properties/available-rooms');
        assert.equal((await prisma.booking.findUnique({ where: { id: booking.id } })).status, 'EXPIRED'); assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, true);
        await op('/policy', 'POST', policy, 'admin', 201);
        booking = (await request('/api/bookings', 'POST', { roomId: room.id, startDate: '2027-01-01', endDate: '2027-02-01' }, 'alice', 201)).booking;
        await request('/api/bookings/' + booking.id + '/status', 'PUT', { status: 'CONFIRMED' });
    });
    await t.test('Tenant must have a USER account; lease has a single responsible user', async () => {
        await op('/tenants', 'POST', { name: 'missing' }, 'admin', 400);
        await op('/tenants', 'POST', { userId: users.admin.id, name: 'wrong role' }, 'admin', 400);
        await op('/tenants', 'GET', undefined, 'alice', 403);
        tenant = await op('/tenants', 'POST', { userId: users.alice.id, name: 'ผู้เช่าทดสอบ', phone: '0000000000' }, 'admin', 201);
        const body = { contractNo: scope, tenantId: tenant.id, roomId: room.id, bookingId: booking.id, startDate: start, signedDate: paidDate, monthlyRent: '3000', occupants: [{ name: 'ผู้พักร่วม' }] };
        lease = await op('/leases', 'POST', body, 'admin', 201); assert.equal(Number(lease.depositRequired), 3000); assert.equal(lease.dueDaysSnapshot, 5);
        await op('/leases', 'POST', { ...body, contractNo: scope + '-overflow', bookingId: undefined, occupants: [{ name: 'a' }, { name: 'b' }] }, 'admin', 400);
        lease = await op('/leases/' + lease.id + '/activate', 'POST', {}); assert.equal(lease.status, 'ACTIVE');
        assert.equal((await prisma.booking.findUnique({ where: { id: booking.id } })).status, 'CONVERTED');
        await op('/leases/' + lease.id, 'GET', undefined, 'alice'); await op('/leases/' + lease.id, 'GET', undefined, 'bob', 404);
        await op('/tenants/' + tenant.id, 'PUT', { userId: users.bob.id, name: 'swap' }, 'admin', 409);
        await request('/api/properties/rooms/' + room.id + '/status', 'PATCH', { isActive: false }, 'admin', 409);
        assert.equal((await op('/leases', 'GET', undefined, 'bob')).length, 0);
    });
    await t.test('Advance rent first invoice; month-end dates, due-date snapshot and duplicate prevention', async () => {
        invoice0 = await op('/invoices', 'POST', { leaseId: lease.id, cycleIndex: 0 }, 'admin', 201);
        assert.equal(invoice0.items.length, 1); assert.equal(Number(invoice0.totalAmount), 3000);
        assert.equal(invoice0.periodStart.slice(0, 10), start); assert.equal(invoice0.periodEnd.slice(0, 10), boundary);
        const due = new Date(paidDate); due.setUTCDate(due.getUTCDate() + 5); assert.equal(invoice0.dueDate.slice(0, 10), due.toISOString().slice(0, 10));
        await op('/invoices', 'POST', { leaseId: lease.id, cycleIndex: 0 }, 'admin', 409);
        await op('/invoices', 'POST', { leaseId: lease.id, cycleIndex: 1 }, 'admin', 409);
        await op('/invoices/' + invoice0.id, 'GET', undefined, 'bob', 404);
    });
    await t.test('Actual meter readings, Decimal rounding and rent plus utilities in arrears', async () => {
        for (const [utilityType, price, opening, closing] of [['WATER', '7.125', '10', '13.5'], ['ELECTRICITY', '4.2', '100', '125']]) {
            await op('/rates', 'POST', { utilityType, unitPrice: price, effectiveFrom: start, sourceReference: scope }, 'admin', 201);
            for (const [readingDate, value] of [[start, opening], [boundary, closing]]) await op('/readings', 'POST', { roomId: room.id, utilityType, readingDate, value }, 'admin', 201);
        }
        await op('/readings', 'POST', { roomId: room.id, utilityType: 'WATER', readingDate: march, value: '1' }, 'admin', 409);
        const results = await Promise.all([0, 1].map(async () => { const response = await fetch(base + '/api/operations/invoices', { method: 'POST', headers: { Authorization: 'Bearer ' + tokens.admin, 'Content-Type': 'application/json' }, body: JSON.stringify({ leaseId: lease.id, cycleIndex: 1 }) }); return { status: response.status, data: await response.json() }; }));
        assert.deepEqual(results.map(r => r.status).sort(), [201, 409]); invoice1 = results.find(r => r.status === 201).data;
        assert.equal(Number(invoice1.totalAmount), 3129.94); assert.equal(Number(invoice1.items.find(i => i.itemType === 'WATER').amount), 24.94);
        assert.equal(invoice1.periodStart.slice(0, 10), boundary); assert.equal(invoice1.periodEnd.slice(0, 10), march);
        await op('/rates', 'POST', { utilityType: 'WATER', unitPrice: '8', effectiveFrom: boundary, sourceReference: scope }, 'admin', 201);
        await op('/policy', 'POST', { holdHours: 48, depositMonths: 2, dueDays: 10 }, 'admin', 201);
        const unchanged = await op('/invoices/' + invoice1.id); assert.equal(Number(unchanged.totalAmount), 3129.94); assert.equal(unchanged.dueDaysSnapshot, 5);
        await op('/rates', 'POST', { utilityType: 'WATER', unitPrice: '8.5', effectiveFrom: year + '-03-15', sourceReference: scope }, 'admin', 201);
        for (const [utilityType, value] of [['WATER', '20'], ['ELECTRICITY', '140']]) await op('/readings', 'POST', { roomId: room.id, utilityType, readingDate: march, value }, 'admin', 201);
        await op('/invoices', 'POST', { leaseId: lease.id, cycleIndex: 2 }, 'admin', 409);
        assert.equal(await prisma.invoice.count({ where: { leaseId: lease.id, cycleIndex: 2 } }), 0);
    });
    await t.test('Full payments only; transfer proof is private and mandatory before verification', async () => {
        const body = { invoiceId: invoice0.id, method: 'TRANSFER', paidDate, amount: '3000' };
        await op('/payments', 'POST', { ...body, amount: '100' }, 'alice', 400); await op('/payments', 'POST', { ...body, method: 'CASH' }, 'alice', 403);
        transfer = await op('/payments', 'POST', body, 'alice', 201); assert.equal(transfer.status, 'PENDING');
        assert.equal((await op('/invoices/' + invoice0.id, 'GET', undefined, 'alice')).status, 'ISSUED');
        await op('/payments/' + transfer.id + '/review', 'POST', { status: 'CONFIRMED' }, 'admin', 409);
        const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH6kAAAAASUVORK5CYII=', 'base64');
        const proofUrl = base + '/api/operations/payments/' + transfer.id + '/proof';
        const upload = (actor, content = png) => fetch(proofUrl, { method: 'POST', headers: { 'Content-Type': 'image/png', Authorization: 'Bearer ' + tokens[actor] }, body: content });
        assert.equal((await upload('bob')).status, 404); assert.equal((await upload('alice', Buffer.alloc(30))).status, 400); assert.equal((await upload('alice')).status, 201);
        assert.equal((await upload('alice', Buffer.alloc(2 * 1024 * 1024 + 1))).status, 413);
        assert.equal((await fetch(proofUrl)).status, 401); assert.equal((await fetch(proofUrl, { headers: { Authorization: 'Bearer ' + tokens.bob } })).status, 404);
        const download = await fetch(proofUrl, { headers: { Authorization: 'Bearer ' + tokens.alice } }); assert.equal(download.status, 200); assert.match(download.headers.get('content-disposition'), /attachment/); assert.equal(download.headers.get('cache-control'), 'no-store'); assert.deepEqual(Buffer.from(await download.arrayBuffer()), png);
        const listed = await op('/payments', 'GET', undefined, 'alice'); assert.equal(listed.find(p => p.id === transfer.id).proof.data, undefined); assert.equal((await op('/payments', 'GET', undefined, 'bob')).length, 0);
    });
    await t.test('Concurrent confirmations record exactly one settlement and one income', async () => {
        const cash = await op('/payments', 'POST', { invoiceId: invoice0.id, amount: '3000', method: 'CASH', paidDate }, 'admin', 201);
        const before = await op('/reports');
        const results = await Promise.all([transfer, cash].map(async payment => { const response = await fetch(base + '/api/operations/payments/' + payment.id + '/review', { method: 'POST', headers: { Authorization: 'Bearer ' + tokens.admin, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CONFIRMED' }) }); return response.status; }));
        assert.deepEqual(results.sort(), [200, 409]); assert.equal(await prisma.invoiceSettlement.count({ where: { invoiceId: invoice0.id } }), 1);
        assert.equal((await op('/invoices/' + invoice0.id)).status, 'PAID');
        const after = await op('/reports'); assert.equal(Number(after.receipts) - Number(before.receipts), 3000);
    });
    await t.test('Maintenance ownership, status resolution, announcements and own notifications', async () => {
        await op('/maintenance', 'POST', { leaseId: lease.id, title: 'x', description: 'x' }, 'bob', 404);
        const repair = await op('/maintenance', 'POST', { leaseId: lease.id, title: scope, description: 'ไฟห้องเสีย' }, 'alice', 201);
        assert.equal((await op('/maintenance', 'GET', undefined, 'bob')).length, 0);
        await op('/maintenance/' + repair.id, 'PUT', { status: 'RESOLVED' }, 'admin', 400);
        await op('/maintenance/' + repair.id, 'PUT', { status: 'IN_PROGRESS' }); await op('/maintenance/' + repair.id, 'PUT', { status: 'RESOLVED', resolution: 'เปลี่ยนหลอดไฟแล้ว' });
        await op('/announcements', 'POST', { title: scope, message: 'แจ้งข่าวทดสอบ' }, 'alice', 403);
        const news = await op('/announcements', 'POST', { title: scope, message: 'แจ้งข่าวทดสอบ' }, 'admin', 201); assert.ok((await op('/announcements', 'GET', undefined, 'alice')).some(n => n.id === news.id));
        const notifications = await op('/notifications', 'GET', undefined, 'alice'); assert.ok(notifications.length >= 3);
        await op('/notifications/' + notifications[0].id + '/read', 'PATCH', {}, 'bob', 404); await op('/notifications/' + notifications[0].id + '/read', 'PATCH', {}, 'alice');
    });
    await t.test('Expenses and audit are Admin-only; logs omit credentials and proof bytes', async () => {
        await op('/expenses', 'GET', undefined, 'alice', 403); await op('/reports', 'GET', undefined, 'bob', 403); await op('/audit', 'GET', undefined, 'alice', 403);
        const before = await op('/reports');
        await op('/expenses', 'POST', { description: scope, category: 'ซ่อมบำรุง', amount: '125.25', expenseDate: paidDate }, 'admin', 201);
        const after = await op('/reports'); assert.equal(Number(after.expenses) - Number(before.expenses), 125.25);
        const logs = await op('/audit?search=ISSUE_INVOICE'); assert.ok(logs.some(log => log.entityId === invoice1.id)); assert.equal(JSON.stringify(logs).includes(password), false); assert.equal(logs.some(log => 'token' in log || 'data' in log), false);
    });
    await t.test('Deposit receipt/refund separated from income, full amount and idempotent', async () => {
        const body = { leaseId: lease.id, kind: 'RECEIPT', amount: '3000', method: 'CASH' }, before = await op('/reports');
        await op('/deposits', 'POST', { ...body, amount: '100' }, 'admin', 409);
        const receipt = await op('/deposits', 'POST', body, 'admin', 201); assert.equal((await op('/deposits', 'POST', body, 'admin', 201)).id, receipt.id);
        await op('/deposits', 'POST', { ...body, kind: 'REFUND' }, 'admin', 409);
        await op('/leases/' + lease.id + '/end', 'POST', {}); assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isAvailable, true);
        const refund = await op('/deposits', 'POST', { ...body, kind: 'REFUND' }, 'admin', 201); assert.equal((await op('/deposits', 'POST', { ...body, kind: 'REFUND' }, 'admin', 201)).id, refund.id);
        assert.equal(await prisma.depositEntry.count({ where: { leaseId: lease.id } }), 2);
        const after = await op('/reports'); assert.equal(Number(after.receipts), Number(before.receipts)); assert.equal(Number(after.depositReceived) - Number(before.depositReceived), 3000); assert.equal(Number(after.depositRefunded) - Number(before.depositRefunded), 3000);
        assert.equal((await op('/invoices/' + invoice1.id, 'GET', undefined, 'alice')).totalAmount, invoice1.totalAmount);
    });
    await t.test('Invoice unit-price snapshots support the full valid rent range', async () => {
        const large = await op('/leases', 'POST', { contractNo: scope + '-large', tenantId: tenant.id, roomId: room.id, startDate: start, signedDate: paidDate, monthlyRent: '1234567.89', occupants: [] }, 'admin', 201);
        await op('/leases/' + large.id + '/activate', 'POST', {});
        const bill = await op('/invoices', 'POST', { leaseId: large.id, cycleIndex: 0 }, 'admin', 201);
        assert.equal(Number(bill.totalAmount), 1234567.89); assert.equal(Number(bill.items[0].unitPrice), 1234567.89);
        await op('/leases', 'POST', { contractNo: scope + '-overflow', tenantId: tenant.id, roomId: room.id, startDate: start, monthlyRent: '9999999999.99', occupants: [] }, 'admin', 400);
        const draft = await op('/leases', 'POST', { contractNo: scope + '-role', tenantId: tenant.id, roomId: room.id, startDate: start, signedDate: paidDate, monthlyRent: '3000', occupants: [] }, 'admin', 201);
        await prisma.user.update({ where: { id: users.alice.id }, data: { role: 'ADMIN' } });
        await op('/leases/' + draft.id + '/activate', 'POST', {}, 'admin', 409);
        await prisma.user.update({ where: { id: users.alice.id }, data: { role: 'USER' } });
    });
});
