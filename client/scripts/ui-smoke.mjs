// Browser integration checks with scoped fixtures in the single MySQL database.
// Uses the installed Chrome and Node's WebSocket; no test package installation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const client = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(client);
const server = path.join(root, 'server');
const require = createRequire(path.join(server, 'package.json'));
const { createFixtureDatabase } = require('./test/helpers/mysql-fixtures');
const bcrypt = require('bcryptjs');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) throw new Error('Installed Chrome not found. Set CHROME_PATH to a local browser executable.');
const artifacts = path.join(client, '.ui-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dormify-ui-chrome-'));
const password = randomBytes(24).toString('hex');
let userEmail;
let adminEmail;
const children = [];
const results = [];
let prisma, cdp, fixtures;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const until = async (fn, label, timeout = 15000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) { if (await fn()) return; await delay(100); }
    throw new Error('Timed out: ' + label);
};
const freePort = async () => {
    const listener = net.createServer();
    listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
    const port = listener.address().port;
    await new Promise(resolve => listener.close(resolve));
    return port;
};
const launch = (args, cwd, env) => {
    const child = spawn(process.execPath, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push(child); return child;
};
const ready = (child, pattern) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Local server startup timed out')), 15000);
    let output = '';
    child.stdout.on('data', data => { output += data; const match = output.match(pattern); if (match) { clearTimeout(timer); resolve(match[0]); } });
    child.stderr.on('data', () => {});
    child.once('error', err => { clearTimeout(timer); reject(err); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Local server exited before startup')); });
});

class DevTools {
    constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.exceptions = []; this.pausedRequests = []; this.networkRequests = []; }
    static async connect(url) {
        const ws = new WebSocket(url); await once(ws, 'open');
        const instance = new DevTools(ws);
        ws.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            if (message.method === 'Runtime.exceptionThrown') instance.exceptions.push(message.params.exceptionDetails.text);
            if (message.method === 'Fetch.requestPaused') instance.pausedRequests.push(message.params);
            if (message.method === 'Network.requestWillBeSent') instance.networkRequests.push(message.params.request.url);
            if (message.id) {
                const pending = instance.pending.get(message.id);
                if (!pending) return;
                instance.pending.delete(message.id); clearTimeout(pending.timer);
                if (message.error) pending.reject(new Error(message.error.message)); else pending.resolve(message.result);
            }
        });
        return instance;
    }
    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.id;
            const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('DevTools timeout: ' + method)); }, 15000);
            this.pending.set(id, { resolve, reject, timer });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }
    async evaluate(expression) {
        const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (result.exceptionDetails) throw new Error('Browser evaluation failed: ' + result.exceptionDetails.text);
        return result.result.value;
    }
}

try {
    fixtures = await createFixtureDatabase();
    prisma = fixtures.prisma;
    userEmail = fixtures.email('ui-user');
    adminEmail = fixtures.email('ui-admin');
    const frontendPort = await freePort();
    const frontendUrl = `http://127.0.0.1:${frontendPort}`;
    const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL, JWT_SECRET: randomBytes(48).toString('hex'), PORT: '0', CLIENT_ORIGIN: frontendUrl };
    const admin = await prisma.user.create({ data: { email: adminEmail, password: await bcrypt.hash(password, 10), name: 'ผู้ดูแลทดสอบหน้าจอ', role: 'ADMIN' } });
    await prisma.rentalPolicy.create({ data:{ holdHours:72, depositMonths:1, dueDays:5, createdBy:admin.id } });
    const dormitory = await prisma.property.create({ data: { name: 'หอพักทดสอบ DORMIFY', address: 'ที่อยู่สำหรับการทดสอบหน้าจอเท่านั้น', city: 'กรุงเทพมหานคร', type: 'HOSTEL', ownerId: admin.id, rules: 'ข้อกำหนดสำหรับทดสอบการแสดงผลภาษาไทย' } });
    const room = await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '101', capacity: 2, price: 3500, type: 'AC' } });
    await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '102', capacity: 1, price: 2800, type: 'NON-AC' } });
    await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '201', capacity: 2, price: 4200, type: 'AC', isAvailable: false } });
    const backend = launch(['src/index.js'], server, env);
    const backendUrl = await ready(backend, /http:\/\/127\.0\.0\.1:\d+/);
    const frontend = launch(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'], client,
        { ...process.env, VITE_API_URL: backendUrl, VITE_DORMITORY_ID: String(dormitory.id) });
    await ready(frontend, /http:\/\/127\.0\.0\.1:\d+/);
    const profile = path.join(temp, 'chrome');
    const browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--lang=th-TH', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    children.push(browser);
    const devToolsPort = path.join(profile, 'DevToolsActivePort');
    await until(() => fs.existsSync(devToolsPort), 'Chrome startup');
    const port = fs.readFileSync(devToolsPort, 'utf8').split('\n')[0].trim();
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    cdp = await DevTools.connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    await cdp.send('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*', '*picsum.photos*'] });
    const viewport = (width, height) => cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const navigate = async route => {
        const marker = randomBytes(8).toString('hex');
        await cdp.evaluate(`window.__uiNavigationMarker = ${JSON.stringify(marker)}`);
        await cdp.send('Page.navigate', { url: frontendUrl + route });
        await until(() => cdp.evaluate(`window.__uiNavigationMarker !== ${JSON.stringify(marker)} && document.readyState === 'complete' && !!document.querySelector('h1, .empty-state h3')`), 'page ' + route);
    };
    const text = () => cdp.evaluate('document.body.innerText');
    const waitText = value => until(async () => (await text()).includes(value), value);
    const click = selector => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing click target'); element.click(); })()`);
    const fill = (selector, value) => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles: true})); element.dispatchEvent(new Event('change', {bubbles: true})); })()`);
    const submit = selector => cdp.evaluate(`document.querySelector(${JSON.stringify(selector)}).requestSubmit()`);
    const screenshot = async name => { await delay(350); const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(artifacts, name + '.png'), Buffer.from(data, 'base64')); };
    const noOverflow = async label => { const dimensions = await cdp.evaluate('({viewport:innerWidth,width:document.documentElement.scrollWidth})'); assert.ok(dimensions.width <= dimensions.viewport + 1, label + ' horizontal overflow'); };
    const check = async (label, fn) => { await fn(); results.push(label); console.log('PASS ' + label); };
    const login = async (email) => { await navigate('/login'); await fill('input[name=email]', email); await fill('input[name=password]', password); await submit('form'); await until(() => cdp.evaluate('location.pathname === "/admin" || location.pathname === "/user"'), 'login redirect'); };

    await viewport(1440, 1000);
    await navigate('/');
    await check('Public website reads real rooms from the test API', async () => { await waitText('ห้อง 101'); assert.ok(!(await text()).includes('Mumbai')); assert.ok((await text()).includes('฿3,500')); });
    await check('Resource hook ignores stale responses and cancels obsolete requests', async () => {
        const checks = await cdp.evaluate('import("/test/resources.tsx").then(module => module.runResourceChecks())');
        assert.equal(checks.length, 3);
    });
    await check('Local Thai font, light theme and original logo load', async () => {
        await cdp.evaluate('document.fonts.ready');
        assert.equal(await cdp.evaluate('document.fonts.check(\'16px "Noto Sans Thai"\')'), true);
        assert.equal(await cdp.evaluate('getComputedStyle(document.body).backgroundColor'), 'rgb(255, 255, 255)');
        assert.equal(await cdp.evaluate('document.documentElement.lang'), 'th');
        assert.equal(await cdp.evaluate('Array.from(document.images).filter(image => image.alt.includes("DORMIFY")).every(image => image.complete && image.naturalWidth > 0)'), true);
    });
    await screenshot('public-desktop');
    await check('Room search and filters update actual room cards', async () => {
        await fill('#room-search', '102'); await until(() => cdp.evaluate('document.querySelectorAll("#rooms article").length === 1'), 'room filter');
        await fill('#room-search', '');
        await cdp.evaluate('(() => { const e=document.querySelector("#room-availability"); e.value="available"; e.dispatchEvent(new Event("change",{bubbles:true})); })()');
        await until(() => cdp.evaluate('document.querySelectorAll("#rooms article").length === 2'), 'availability filter');
    });
    await check('Public mobile navigation and 390px layout', async () => {
        await viewport(390, 844); await noOverflow('mobile home');
        await click('button[aria-controls="public-mobile-navigation"]');
        assert.equal(await cdp.evaluate('document.querySelector("#public-mobile-navigation").innerText.includes("เข้าสู่ระบบ")'), true);
        await click('button[aria-controls="public-mobile-navigation"]'); await screenshot('public-mobile');
    });
    await check('Thai registration UI creates a USER in the backend', async () => {
        await navigate('/register');
        await fill('input[name=name]', 'ผู้ใช้ทดสอบหน้าจอ'); await fill('input[name=email]', userEmail); await fill('input[name=password]', password);
        await submit('form'); await waitText('สมัครสมาชิกเรียบร้อยแล้ว');
        const user = await prisma.user.findUnique({ where: { email: userEmail } }); assert.equal(user.role, 'USER');
    });
    await check('Wrong password displays a Thai error', async () => {
        await fill('input[name=email]', userEmail); await fill('input[name=password]', 'incorrect-password'); await submit('form');
        await waitText('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); await screenshot('login-mobile');
    });
    await login(userEmail);
    await check('Public rooms remain usable while account verification is pending', async () => {
        cdp.pausedRequests = [];
        await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*/api/auth/me', requestStage: 'Request' }] });
        try {
            await navigate('/');
            await until(() => cdp.pausedRequests.length > 0, 'paused account verification');
            await waitText('ห้อง 101');
            assert.ok((await text()).includes('ค้นหาด้วยเลขห้อง') || await cdp.evaluate('!!document.querySelector("#room-search")'));
        } finally {
            await cdp.send('Fetch.disable');
        }
        await until(() => cdp.evaluate('!!document.querySelector(\'a[href="/user"]\')'), 'account verification resumes');
        await navigate('/user');
    });
    await check('User sidebar is responsive and invoice empty state uses actual data', async () => {
        await waitText('ข้อมูลส่วนตัว'); await noOverflow('mobile user');
        await click('button[aria-controls="workspace-navigation"]');
        assert.equal(await cdp.evaluate('document.querySelector("#workspace-navigation").hasAttribute("inert")'), false);
        await screenshot('user-mobile'); await click('a[href="/user/invoices"]'); await waitText('ยังไม่มีรายการ');
        assert.equal(await cdp.evaluate('!!document.querySelector("main form")'), false);
    });
    await check('User cannot gain Admin UI by changing cached role', async () => {
        await cdp.evaluate('localStorage.setItem("user",JSON.stringify({role:"ADMIN",name:"fake"}))'); await navigate('/admin');
        await until(() => cdp.evaluate('location.pathname === "/"'), 'Admin route guard');
        assert.equal(await cdp.evaluate(`Boolean(document.querySelector('a[href="/admin"]'))`), false);
    });
    await check('Room form creates a real pending booking without fake success', async () => {
        await navigate('/rooms/' + room.id); await fill('input[name=startDate]', '2027-05-01'); await fill('input[name=endDate]', '2027-06-01');
        await submit('#booking-form form'); await waitText('ส่งคำขอเช่าเรียบร้อยแล้ว');
        assert.equal(await prisma.booking.count({ where: { roomId: room.id, status: 'PENDING' } }), 1);
        await navigate('/user/bookings'); await waitText('รอดำเนินการ'); assert.ok((await text()).includes('ห้อง 101'));
        assert.ok((await text()).includes('2570'), 'Thai Buddhist year is displayed');
    });
    await check('Logout clears UI session and revokes token on the backend', async () => {
        await viewport(1440, 1000);
        const token = await cdp.evaluate('localStorage.getItem("token")'); await click('button[aria-label="ออกจากระบบ"]');
        await until(() => cdp.evaluate('location.pathname === "/login" && !localStorage.getItem("token")'), 'logout');
        const response = await fetch(backendUrl + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } }); assert.equal(response.status, 401);
    });
    await login(adminEmail);
    await check('Admin dashboard displays aggregate API data with Thai menus', async () => {
        await waitText('ภาพรวม'); await waitText('คำขอรอดำเนินการ');
        await until(() => cdp.evaluate('Array.from(document.querySelectorAll(".stat-number")).map(node => node.innerText).join(",") === "3,2,1"'), 'summary counts');
        assert.ok(cdp.networkRequests.some(url => url.includes('/api/bookings/summary?propertyId=')));
        assert.equal(cdp.networkRequests.some(url => /\/api\/bookings\/admin(?:\?|$)/.test(url)), false);
        await screenshot('admin-desktop');
    });
    await check('Existing room API works from the redesigned Admin form', async () => {
        await navigate('/admin/rooms'); await waitText('ห้อง 101');
        await until(() => cdp.evaluate('Array.from(document.querySelectorAll("button")).some(button=>button.innerText.includes("เพิ่มห้องพัก") && !button.disabled)'), 'room form is ready');
        await cdp.evaluate('Array.from(document.querySelectorAll("button")).find(button=>button.innerText.includes("เพิ่มห้องพัก")).click()');
        await fill('input[name=roomNumber]', '301'); await fill('input[name=price]', '3900'); await fill('input[name=capacity]', '2'); await submit('main form');
        await waitText('เพิ่มห้อง 301 เรียบร้อยแล้ว'); assert.equal(await prisma.room.count({ where: { propertyId: dormitory.id } }), 4);
    });
    await check('Admin confirmation dialog updates the real booking', async () => {
        await navigate('/admin/bookings'); await waitText(userEmail);
        await cdp.evaluate(`Array.from(document.querySelectorAll("tbody tr")).find(row=>row.innerText.includes(${JSON.stringify(userEmail)})).querySelector("button").click()`);
        await waitText('ยืนยันการอนุมัติคำขอ'); await click('dialog button[type=submit]'); await waitText('บันทึกสถานะรายการ');
        assert.equal((await prisma.booking.findFirst({ where: { roomId: room.id } })).status, 'CONFIRMED');
    });
    await check('Admin edits dormitory details and public website reflects persisted data', async () => {
        await navigate('/admin/dormitory');
        await click('button:has(svg.lucide-pencil)');
        await fill('input[name=name]', 'DORMIFY Updated UI');
        await fill('input[name=address]', 'Updated UI address');
        await submit('form');
        await until(async () => (await prisma.property.findUnique({ where: { id: dormitory.id } })).name === 'DORMIFY Updated UI', 'property saved');
        await navigate('/'); await waitText('DORMIFY Updated UI');
        await navigate('/admin/dormitory'); await waitText('Updated UI address');
    });
    await check('Admin edits room rent and rejects duplicate room numbers', async () => {
        await navigate('/admin/rooms');
        await waitText('102');
        await click('button[aria-label="แก้ไขห้อง 102"]');
        await fill('input[name=roomNumber]', '101');
        await submit('form');
        await waitText('เลขห้องนี้มีอยู่ในหอพักแล้ว');
        await fill('input[name=roomNumber]', 'UI-EDIT-102');
        await fill('input[name=price]', '4567.89');
        await submit('form');
        await until(async () => !!await prisma.room.findFirst({ where: { propertyId: dormitory.id, roomNumber: 'UI-EDIT-102', price: '4567.89' } }), 'room edit committed');
        await navigate('/'); await waitText('UI-EDIT-102'); await waitText('4,567.89');
    });
    await check('Room deactivation hides public cards and direct links; reactivation restores them', async () => {
        const edited = await prisma.room.findFirst({ where: { propertyId: dormitory.id, roomNumber: 'UI-EDIT-102' } });
        await navigate('/admin/rooms'); await waitText('UI-EDIT-102');
        await click('button[aria-label="ปิดใช้งานห้อง UI-EDIT-102"]');
        await click('dialog button[type=submit]');
        await until(async () => !(await prisma.room.findUnique({ where: { id: edited.id } })).isActive, 'room deactivated');
        await navigate('/');
        await until(() => cdp.evaluate('document.querySelectorAll("#rooms article").length >= 2'), 'public cards loaded');
        assert.equal(await cdp.evaluate('document.querySelector("#rooms").innerText.includes("UI-EDIT-102")'), false);
        await navigate('/rooms/' + edited.id); await waitText('ไม่พบห้องพักนี้');
        await navigate('/admin/rooms'); await waitText('UI-EDIT-102');
        await click('button[aria-label="เปิดใช้งานห้อง UI-EDIT-102"]');
        await click('dialog button[type=submit]');
        await until(async () => (await prisma.room.findUnique({ where: { id: edited.id } })).isActive, 'room reactivated');
        await navigate('/'); await waitText('UI-EDIT-102');
    });
    await check('Admin cannot close a confirmed room and prior booking stays intact', async () => {
        await navigate('/admin/rooms'); await waitText('101');
        await click('button[aria-label="ปิดใช้งานห้อง 101"]');
        await click('dialog button[type=submit]');
        await waitText('ยังปิดห้องไม่ได้');
        assert.equal((await prisma.room.findUnique({ where: { id: room.id } })).isActive, true);
        assert.equal((await prisma.booking.findFirst({ where: { roomId: room.id } })).status, 'CONFIRMED');
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    });
    await check('Mobile room edit and confirmation dialog do not overflow', async () => {
        await viewport(390, 844);
        await navigate('/admin/rooms'); await waitText('UI-EDIT-102');
        await click('button[aria-label="แก้ไขห้อง UI-EDIT-102"]');
        await noOverflow('mobile room editor');
        await click('form button[type=button]');
        await click('button[aria-label="ปิดใช้งานห้อง UI-EDIT-102"]');
        await noOverflow('mobile room confirmation');
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    });
    await check('Tablet and mobile Admin layouts do not overflow', async () => {
        await navigate('/admin/rooms');
        for (const [width,height,label] of [[768,1024,'tablet'],[390,844,'mobile']]) {
            await viewport(width,height); await delay(200); await noOverflow('Admin ' + label); await screenshot('admin-' + label);
        }
        await click('button[aria-controls="workspace-navigation"]'); await screenshot('admin-mobile-menu');
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
        await until(() => cdp.evaluate('document.querySelector("#workspace-navigation").hasAttribute("inert")'), 'Escape closes menu');
    });
    const clickText = label => cdp.evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(element => element.textContent.trim() === ${JSON.stringify(label)}); if (!button) throw Error('Button missing'); button.click(); })()`);
    const select = async (selector, value) => {
        await until(() => cdp.evaluate(`!!document.querySelector(${JSON.stringify(selector + ' option[value="' + value + '"]')})`), 'select option');
        await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(element, ${JSON.stringify(String(value))}); element.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    };
    const fillArea = (selector, value) => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    const actualUser = await prisma.user.findUnique({ where: { email: userEmail } });
    const contractNo = fixtures.scope + '-ui';
    const readingYear = 6404 + 400 * (parseInt(fixtures.scope.slice(-4),16) % 7);
    const leaseStart = readingYear + '-01-31', nextBoundary = readingYear + '-02-29';
    let tenant, lease, invoice, transfer;
    const localDate = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Bangkok', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
    await viewport(1440, 1000);
    await check('Admin creates a tenant bound to an existing User through the real form', async () => {
        await navigate('/admin/tenants'); await waitText('เพิ่มผู้เช่า');
        await until(() => cdp.evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="เพิ่มผู้เช่า" && !b.disabled)'), 'tenant options ready');
        await clickText('เพิ่มผู้เช่า'); await select('select[name=userId]', actualUser.id); await fill('input[name=name]', 'ผู้เช่าหน้าจอจริง'); await submit('form');
        await waitText('บันทึกทะเบียนผู้เช่าแล้ว'); tenant = await prisma.tenantProfile.findUnique({ where: { userId: actualUser.id } }); assert.ok(tenant);
    });
    await check('Admin creates and activates a signed lease, converting the approved booking', async () => {
        await navigate('/admin/contracts'); await waitText('เพิ่มสัญญาฉบับร่าง');
        await until(() => cdp.evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="เพิ่มสัญญาฉบับร่าง" && !b.disabled)'), 'lease options ready');
        await clickText('เพิ่มสัญญาฉบับร่าง');
        await fill('input[name=contractNo]', contractNo); await select('select[name=tenantId]', tenant.id); await select('select[name=roomId]', room.id);
        const approved = await prisma.booking.findFirst({ where: { roomId: room.id, userId: actualUser.id, status: 'CONFIRMED' } });
        await select('select[name=bookingId]', approved.id); await fill('input[name=startDate]', leaseStart); await fill('input[name=signedDate]', localDate); await fill('input[name=monthlyRent]', '3500'); await submit('form');
        await waitText('บันทึกสัญญาฉบับร่างแล้ว'); await waitText(contractNo); await clickText('เริ่มใช้สัญญา'); await click('dialog[open] button[type=submit]'); await waitText('เริ่มใช้สัญญาแล้ว');
        lease = await prisma.lease.findUnique({ where: { contractNo } }); assert.equal(lease.status, 'ACTIVE'); assert.equal(Number(lease.depositRequired), 3500); assert.equal((await prisma.booking.findUnique({ where:{id:approved.id} })).status, 'CONVERTED');
    });
    await check('Admin issues a real first-cycle invoice with advance rent only', async () => {
        await navigate('/admin/invoices'); await select('select[name=leaseId]', lease.id); await submit('form'); await waitText('INV-');
        invoice = await prisma.invoice.findFirst({ where: { leaseId: lease.id }, include:{items:true} }); assert.ok(invoice); assert.equal(invoice.items.length, 1); assert.equal(Number(invoice.totalAmount), 3500); await screenshot('admin-invoice');
        assert.equal(/\?{4,}|�/.test(await text()),false,'UI contains corrupted text');
    });
    await check('Admin meter and rate forms calculate a real second-cycle bill', async () => {
        await navigate('/admin/meters');
        const meterForm = 'form:has(input[name=value])', rateForm = 'form:has(input[name=unitPrice])';
        for(const [utilityType,price,opening,closing]of [['WATER','8','10','15'],['ELECTRICITY','4','100','120']]) {
            await select(rateForm+' select[name=utilityType]',utilityType); await fill(rateForm+' input[name=unitPrice]',price); await fill(rateForm+' input[name=effectiveFrom]',leaseStart); await fill(rateForm+' input[name=sourceReference]',fixtures.scope); await submit(rateForm);
            await until(async()=>await prisma.utilityRate.count({where:{createdBy:admin.id,utilityType}})===1,'rate persisted');
            await until(()=>cdp.evaluate(`!document.querySelector(${JSON.stringify(rateForm+' button[type=submit]')}).disabled`),'rate form ready');
            await select(meterForm+' select[name=roomId]',room.id); await select(meterForm+' select[name=utilityType]',utilityType);
            for(const [readingDate,value]of [[leaseStart,opening],[nextBoundary,closing]]) {
                await fill(meterForm+' input[name=readingDate]',readingDate); await fill(meterForm+' input[name=value]',value); await submit(meterForm);
                await until(async()=>await prisma.meterReading.count({where:{roomId:room.id,utilityType,readingDate:new Date(readingDate)}})===1,'reading persisted');
                await until(()=>cdp.evaluate(`!document.querySelector(${JSON.stringify(meterForm+' button[type=submit]')}).disabled`),'meter form ready');
            }
        }
        await navigate('/admin/invoices'); await select('select[name=leaseId]',lease.id); await fill('input[name=cycleIndex]','2'); await submit('form');
        await until(async()=>await prisma.invoice.count({where:{leaseId:lease.id,cycleIndex:1}})===1,'second bill persisted');
        const second = await prisma.invoice.findUnique({where:{leaseId_cycleIndex:{leaseId:lease.id,cycleIndex:1}}}); assert.equal(Number(second.totalAmount),3620);
        await waitText('฿3,620');
    });
    await check('User sees own contract and invoice, submits transfer and uploads private proof', async () => {
        await login(userEmail); await navigate('/user/contract'); await waitText(contractNo); assert.equal((await text()).includes('เริ่มใช้สัญญา'), false);
        await navigate('/user/bookings'); await waitText('ทำสัญญาแล้ว');
        await navigate('/user/invoices'); await waitText(invoice.invoiceNo); assert.equal((await text()).includes('ออกบิลรายเดือน'), false);
        await navigate('/user/payments'); await until(()=>cdp.evaluate('!!document.querySelector("select[name=invoiceId]")'),'payment form'); await submit('form');
        assert.match(await cdp.evaluate('document.querySelector("select[name=invoiceId]").validationMessage'), /กรุณาเลือก/);
        await select('select[name=invoiceId]', invoice.id); await submit('form'); await waitText('บันทึกรายการรอตรวจแล้ว');
        transfer = await prisma.invoicePayment.findFirst({ where: { invoiceId:invoice.id } }); assert.equal(transfer.status, 'PENDING');
        await until(() => cdp.evaluate('!!document.querySelector("input[type=file]")'), 'proof input');
        const proofFile = path.join(artifacts, 'fixture-proof.png'); fs.writeFileSync(proofFile, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH6kAAAAASUVORK5CYII=', 'base64'));
        const { root: domRoot } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId:domRoot.nodeId, selector:'input[type=file]' });
        await cdp.send('DOM.setFileInputFiles', {nodeId, files:[proofFile]}); await waitText('แนบหลักฐานแล้ว'); assert.ok(await prisma.paymentProof.findUnique({ where:{paymentId:transfer.id} }));
        await viewport(390,844); await noOverflow('mobile payment form and table'); await screenshot('user-payment-mobile'); await viewport(1440,1000);
    });
    await check('User submits maintenance and reads only personal notifications', async () => {
        await navigate('/user/maintenance'); await select('select[name=leaseId]', lease.id); await fill('input[name=title]', 'แจ้งซ่อมจากหน้าจอ'); await fillArea('textarea[name=description]', 'ไฟห้องเสียสำหรับการทดสอบ'); await submit('form'); await waitText('ส่งเรื่องแจ้งซ่อมแล้ว');
        assert.equal(await prisma.maintenanceRequest.count({where:{leaseId:lease.id}}),1);
        await navigate('/user/notifications'); await waitText('ใบแจ้งหนี้ใหม่');
        await cdp.send('Fetch.enable',{patterns:[{urlPattern:'*/api/operations/notifications/*/read',requestStage:'Request'}]});
        await clickText('ทำเครื่องหมายว่าอ่านแล้ว');
        await until(()=>Promise.resolve(cdp.pausedRequests.some(request=>/\/notifications\/\d+\/read$/.test(request.request.url))),'intercept read mutation');
        const pausedRead = cdp.pausedRequests.find(request=>/\/notifications\/\d+\/read$/.test(request.request.url));
        await cdp.send('Fetch.failRequest',{requestId:pausedRead.requestId,errorReason:'ConnectionRefused'}); await cdp.send('Fetch.disable');
        await waitText('เชื่อมต่อระบบไม่ได้'); await clickText('ทำเครื่องหมายว่าอ่านแล้ว');
        await until(async()=>await prisma.notification.count({where:{userId:actualUser.id,readAt:{not:null}}})>0,'notification read saved');
    });
    await check('Admin verifies transfer via confirmation; User payment history updates', async () => {
        await login(adminEmail); await navigate('/admin/payments'); await waitText(invoice.invoiceNo); await clickText('ยืนยันรับเงิน'); await click('dialog[open] button[type=submit]'); await waitText('ยืนยันรับเงินแล้ว');
        assert.equal((await prisma.invoice.findUnique({where:{id:invoice.id}})).status,'PAID'); assert.equal(await prisma.invoiceSettlement.count({where:{invoiceId:invoice.id}}),1);
        await login(userEmail); await navigate('/user/history'); await waitText(invoice.invoiceNo); await waitText('ยืนยันแล้ว');
        await login(adminEmail);
    });
    await check('Admin resolves maintenance and publishes news through actual forms', async () => {
        await navigate('/admin/maintenance'); await waitText('แจ้งซ่อมจากหน้าจอ'); await clickText('อัปเดตงาน'); await select('select[name=status]','RESOLVED'); await fillArea('textarea[name=resolution]','เปลี่ยนหลอดไฟเรียบร้อย'); await submit('form:has(select[name=status])'); await waitText('อัปเดตงานแล้ว');
        assert.equal((await prisma.maintenanceRequest.findFirst({where:{leaseId:lease.id}})).status,'RESOLVED');
        await navigate('/admin/announcements'); await fill('input[name=title]',fixtures.scope); await fillArea('textarea[name=message]','ข่าวสารจริงจากการทดสอบหน้าจอ'); await submit('form');
        await until(async()=>await prisma.announcement.count({where:{createdBy:admin.id,title:fixtures.scope}})===1,'news persisted'); await waitText('ข่าวสารจริงจากการทดสอบหน้าจอ');
    });
    await check('Admin records expense, filters reports and changes policy without changing signed lease', async () => {
        await navigate('/admin/reports'); await fill('input[name=description]',fixtures.scope); await fill('input[name=category]','ซ่อมบำรุง'); await fill('input[name=amount]','100.25'); await fill('input[name=expenseDate]',localDate); await submit('form:has(input[name=category])');
        await until(async()=>await prisma.expense.count({where:{recordedBy:admin.id}})===1,'expense persisted'); await waitText('฿100.25');
        await fill('input[name=from]',localDate); await fill('input[name=to]',localDate); await submit('form:has(input[name=from])'); await waitText('฿3,500');
        await navigate('/admin/dormitory'); await until(()=>cdp.evaluate('!!document.querySelector("input[name=holdHours]")'),'policy loaded'); await fill('input[name=holdHours]','48'); await submit('form:has(input[name=holdHours])');
        await until(async()=>(await prisma.rentalPolicy.findFirst({orderBy:{id:'desc'}})).holdHours===48,'policy persisted'); assert.equal((await prisma.lease.findUnique({where:{id:lease.id}})).dueDaysSnapshot,5);
        await navigate('/admin/audit'); await fill('input[name=search]','ISSUE_INVOICE'); await submit('form'); await waitText('ออกบิล');
    });
    await check('Admin receives deposit, ends lease and records refund separately', async () => {
        const form = 'form:has(select[name=kind])';
        await navigate('/admin/payments'); await select(form+' select[name=leaseId]',lease.id); await fill(form+' input[name=amount]','3500'); await submit(form); await waitText('บันทึกเงินประกันแล้ว');
        assert.equal(await prisma.depositEntry.count({where:{leaseId:lease.id,kind:'RECEIPT'}}),1);
        await navigate('/admin/contracts'); await waitText(contractNo); await clickText('จบสัญญา'); await click('dialog[open] button[type=submit]'); await waitText('จบสัญญาแล้ว');
        await navigate('/admin/payments'); await select(form+' select[name=leaseId]',lease.id); await select(form+' select[name=kind]','REFUND'); await fill(form+' input[name=amount]','3500'); await submit(form); await waitText('บันทึกเงินประกันแล้ว');
        assert.equal(await prisma.depositEntry.count({where:{leaseId:lease.id,kind:'REFUND'}}),1); assert.equal((await prisma.room.findUnique({where:{id:room.id}})).isAvailable,true);
    });
    await check('New Admin pages render actual data on mobile without page overflow', async () => {
        await viewport(390,844);
        for(const [route,label]of [['/admin/meters','บันทึกมิเตอร์'],['/admin/reports','รายงาน'],['/admin/audit','ประวัติ'],['/admin/announcements','ข่าวสาร'],['/admin/dormitory','นโยบาย']]) {
            await navigate(route); await waitText(label); await noOverflow(route);
        }
        await screenshot('admin-policy-mobile');
    });
    await check('Reduced motion is respected and keyboard focus is visible', async () => {
        await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        assert.equal(await cdp.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'), true);
        assert.equal(await cdp.evaluate('(() => {const element=document.createElement("div");element.className="fade-in";document.body.append(element);const name=getComputedStyle(element).animationName;element.remove();return name;})()'), 'none');
        await cdp.send('Input.dispatchKeyEvent', { type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9 });
        await cdp.send('Input.dispatchKeyEvent', { type:'keyUp', key:'Tab', code:'Tab', windowsVirtualKeyCode:9 });
        await cdp.evaluate('document.querySelector("button[aria-controls=workspace-navigation]").focus()');
        const style = await cdp.evaluate('({width:getComputedStyle(document.activeElement).outlineWidth,style:getComputedStyle(document.activeElement).outlineStyle})');
        assert.notEqual(style.style, 'none'); assert.notEqual(style.width, '0px');
    });
    assert.deepEqual(cdp.exceptions, [], 'Unexpected browser exceptions');
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: results.length, checks: results, database: 'MySQL dormify; no reset or additional database', fixtureScope: fixtures.scope, fixtureCleanup: 'pending', screenshots: fs.readdirSync(artifacts).filter(file => file.endsWith('.png')) }, null, 2));
    console.log('Browser checks passed:', results.length, '| Artifacts:', artifacts);
} finally {
    if (cdp) {
        try { await cdp.send('Browser.close'); } catch {}
        for (const pending of cdp.pending.values()) { clearTimeout(pending.timer); pending.resolve({}); }
        cdp.ws.close();
    }
    for (const child of children.reverse()) if (child.exitCode === null && child.signalCode === null) {
        const ended = once(child, 'exit'); child.kill(); await Promise.race([ended, delay(3000)]);
    }
    if (fixtures) {
        await fixtures.cleanup();
        const resultFile = path.join(artifacts, 'results.json');
        if (fs.existsSync(resultFile)) {
            const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
            if (result.fixtureScope === fixtures.scope) {
                result.fixtureCleanup = 'verified; pre-existing records unchanged';
                fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
            }
        }
    }
}
