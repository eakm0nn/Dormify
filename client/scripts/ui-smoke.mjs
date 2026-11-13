// Browser integration checks against an actual, disposable SQLite database.
// Uses the installed Chrome and Node's WebSocket; no test package installation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';

const client = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(client);
const server = path.join(root, 'server');
const require = createRequire(path.join(server, 'package.json'));
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) throw new Error('Installed Chrome not found. Set CHROME_PATH to a local browser executable.');
const artifacts = path.join(client, '.ui-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dormify-ui-'));
const databasePath = path.join(temp, 'ui.db');
fs.writeFileSync(databasePath, '', { flag: 'wx' });
const databaseUrl = `file:${databasePath.replaceAll('\\', '/')}`;
const password = randomBytes(24).toString('hex');
const userEmail = 'ui-user@example.test';
const adminEmail = 'ui-admin@example.test';
const children = [];
const results = [];
let prisma, cdp;
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
    const frontendPort = await freePort();
    const frontendUrl = `http://127.0.0.1:${frontendPort}`;
    const env = { ...process.env, DATABASE_URL: databaseUrl, JWT_SECRET: randomBytes(48).toString('hex'), PORT: '0', CLIENT_ORIGIN: frontendUrl };
    const push = spawnSync(process.execPath, [path.join(server, 'node_modules/prisma/build/index.js'), 'db', 'push', '--skip-generate'], { cwd: server, env, encoding: 'utf8', windowsHide: true });
    assert.equal(push.status, 0, push.stderr);
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    const admin = await prisma.user.create({ data: { email: adminEmail, password: await bcrypt.hash(password, 10), name: 'ผู้ดูแลทดสอบหน้าจอ', role: 'ADMIN' } });
    const dormitory = await prisma.property.create({ data: { name: 'หอพักทดสอบ DORMIFY', address: 'ที่อยู่สำหรับการทดสอบหน้าจอเท่านั้น', city: 'กรุงเทพมหานคร', type: 'HOSTEL', ownerId: admin.id, rules: 'ข้อกำหนดสำหรับทดสอบการแสดงผลภาษาไทย' } });
    const room = await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '101', capacity: 2, price: 3500, type: 'AC' } });
    await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '102', capacity: 1, price: 2800, type: 'NON-AC' } });
    await prisma.room.create({ data: { propertyId: dormitory.id, roomNumber: '201', capacity: 2, price: 4200, type: 'AC', isAvailable: false } });
    const backend = launch(['src/index.js'], server, env);
    const backendUrl = await ready(backend, /http:\/\/127\.0\.0\.1:\d+/);
    const frontend = launch(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'], client,
        { ...process.env, VITE_API_URL: backendUrl, VITE_DORMITORY_ID: '' });
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
        await until(() => cdp.evaluate(`window.__uiNavigationMarker !== ${JSON.stringify(marker)} && document.readyState === 'complete' && !!document.querySelector('h1')`), 'page ' + route);
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
    await check('User sidebar is responsive and unavailable features are honest', async () => {
        await waitText('ข้อมูลส่วนตัว'); await noOverflow('mobile user');
        await click('button[aria-controls="workspace-navigation"]');
        assert.equal(await cdp.evaluate('document.querySelector("#workspace-navigation").hasAttribute("inert")'), false);
        await screenshot('user-mobile'); await click('a[href="/user/invoices"]'); await waitText('ส่วนนี้ยังไม่เปิดให้ใช้งาน');
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
        await waitText('เพิ่มห้อง 301 เรียบร้อยแล้ว'); assert.equal(await prisma.room.count(), 4);
    });
    await check('Admin confirmation dialog updates the real booking', async () => {
        await navigate('/admin/bookings'); await waitText('ผู้ใช้ทดสอบหน้าจอ');
        await cdp.evaluate('Array.from(document.querySelectorAll("tbody tr")).find(row=>row.innerText.includes("ผู้ใช้ทดสอบหน้าจอ")).querySelector("button").click()');
        await waitText('ยืนยันการอนุมัติคำขอ'); await click('dialog button[type=submit]'); await waitText('บันทึกสถานะรายการ');
        assert.equal((await prisma.booking.findFirst({ where: { roomId: room.id } })).status, 'CONFIRMED');
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
    await check('Reduced motion is respected and keyboard focus is visible', async () => {
        await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        assert.equal(await cdp.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'), true);
        assert.equal(await cdp.evaluate('(() => {const element=document.createElement("div");element.className="fade-in";document.body.append(element);const name=getComputedStyle(element).animationName;element.remove();return name;})()'), 'none');
        await cdp.evaluate('document.querySelector("button[aria-controls=workspace-navigation]").focus()');
        const style = await cdp.evaluate('({width:getComputedStyle(document.activeElement).outlineWidth,style:getComputedStyle(document.activeElement).outlineStyle})');
        assert.notEqual(style.style, 'none'); assert.notEqual(style.width, '0px');
    });
    assert.deepEqual(cdp.exceptions, [], 'Unexpected browser exceptions');
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: results.length, checks: results, database: 'temporary SQLite; production database untouched', screenshots: fs.readdirSync(artifacts).filter(file => file.endsWith('.png')) }, null, 2));
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
    if (prisma) await prisma.$disconnect();
}
