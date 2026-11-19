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
    const dormitory = await prisma.property.create({ data: { name: 'หอพักทดสอบ DORMIFY', address: 'ที่อยู่สำหรับการทดสอบหน้าจอเท่านั้น', city: 'กรุงเทพมหานคร', type: 'HOSTEL', hasMess: true, ownerId: admin.id, rules: 'ข้อกำหนดสำหรับทดสอบการแสดงผลภาษาไทย' } });
    await prisma.dormitoryInstallation.create({ data: { id: fixtures.scope, propertyId: dormitory.id } });
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
        const destination = new URL(frontendUrl + route).href;
        const result = await cdp.send('Page.navigate', { url: destination });
        if(result.errorText)throw new Error('Page navigation failed: '+result.errorText);
        const arrived = result.loaderId
            ? `window.__uiNavigationMarker !== ${JSON.stringify(marker)}`
            : `location.href === ${JSON.stringify(destination)}`;
        await until(() => cdp.evaluate(`(${arrived}) && document.readyState === 'complete' && !!document.querySelector('h1, .empty-state h3')`), 'page ' + route);
    };
    const text = () => cdp.evaluate('document.body.innerText');
    const waitText = value => until(async () => (await text()).includes(value), value);
    const click = selector => until(() => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element || element.disabled) return false; element.click(); return true; })()`), 'click target ' + selector);
    const fill = (selector, value) => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles: true})); element.dispatchEvent(new Event('change', {bubbles: true})); })()`);
    const submit = selector => cdp.evaluate(`document.querySelector(${JSON.stringify(selector)}).requestSubmit()`);
    const screenshot = async name => { await delay(350); const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(artifacts, name + '.png'), Buffer.from(data, 'base64')); };
    const noOverflow = async label => { const dimensions = await cdp.evaluate('({viewport:innerWidth,width:document.documentElement.scrollWidth})'); assert.ok(dimensions.width <= dimensions.viewport + 1, label + ' horizontal overflow'); };
    const check = async (label, fn) => { await fn(); results.push(label); console.log('PASS ' + label); };
    const login = async (email) => { await navigate('/login'); await fill('input[name=email]', email); await fill('input[name=password]', password); await submit('form'); await until(() => cdp.evaluate('location.pathname === "/admin" || location.pathname === "/user"'), 'login redirect'); };
    const clickText = label => until(() => cdp.evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(element => element.textContent.trim() === ${JSON.stringify(label)} && !element.disabled); if (!button) return false; button.click(); return true; })()`), 'button ' + label);
    const travel = async delta => {
        const history = await cdp.send('Page.getNavigationHistory');
        const entry = history.entries[history.currentIndex + delta];
        assert.ok(entry, 'A browser history destination must exist');
        const target = new URL(entry.url);
        const route = target.pathname + target.search + target.hash;
        await cdp.send('Page.navigateToHistoryEntry', {entryId:entry.id});
        await until(()=>cdp.evaluate(`location.pathname + location.search + location.hash === ${JSON.stringify(route)} && !!document.querySelector('main h1')`),'browser history '+route);
    };
    const expectPublicScroll = async id => {
        const expression = id ? `(() => {
            const element = document.getElementById(${JSON.stringify(id)});
            if(!element)return false;
            const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
            const limit = Math.max(0,document.documentElement.scrollHeight-innerHeight);
            const target = Math.min(limit,Math.max(0,element.getBoundingClientRect().top+scrollY-padding));
            return Math.abs(scrollY-target) < 4;
        })()` : 'window.scrollY < 2';
        await until(()=>cdp.evaluate(expression),'visible public section '+(id || 'top'));
    };
    const escape = async () => {
        await cdp.send('Page.bringToFront');
        await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
        await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    };
    const navigationRoundTrips = async home => {
        const routes = await cdp.evaluate('[...document.querySelectorAll("#workspace-navigation nav a")].map(link=>link.getAttribute("href"))');
        const title = await cdp.evaluate('document.querySelector("main h1").innerText');
        for(const route of routes.filter(route=>route!==home)) {
            await click('#workspace-navigation nav a[href="'+route+'"]');
            await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(route)} && document.querySelector('main h1')?.innerText !== ${JSON.stringify(title)} && !!document.querySelector('main h1')`),'menu '+route);
            assert.equal((await text()).includes('ไม่พบหน้าที่ต้องการ'),false);
            await travel(-1); await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(home)} && document.querySelector('main h1')?.innerText === ${JSON.stringify(title)}`),'back to '+home);
            await travel(1); await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(route)} && document.querySelector('main h1')?.innerText !== ${JSON.stringify(title)}`),'forward to '+route);
            await travel(-1); await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(home)} && document.querySelector('main h1')?.innerText === ${JSON.stringify(title)}`),'return to '+home);
        }
    };

    await viewport(1440, 1000);
    await navigate('/');
    await check('Public website reads real rooms from the test API', async () => { await waitText('ห้อง 101'); assert.ok(!(await text()).includes('Mumbai')); assert.ok((await text()).includes('฿3,500')); assert.equal((await text()).includes('บริการอาหาร'),false); });
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
    await check('React Bits fade keeps content and keyboard access available and cleans up in StrictMode', async () => {
        assert.equal(await cdp.evaluate('import("/test/motion.tsx").then(module => module.checkFadeContent(false))'), true);
        await until(() => cdp.evaluate('import("/test/motion.tsx").then(module => module.heroMotionSettled())'), 'Hero fade completes');
    });
    await screenshot('public-desktop');
    await check('Home exposes room options in the desktop viewport with smaller corners', async () => {
        const layout = await cdp.evaluate(`(() => {
            const card = document.querySelector('#rooms article');
            return { priceBottom: card.querySelector('p').getBoundingClientRect().bottom, viewport: innerHeight,
                frameRadius: parseFloat(getComputedStyle(document.querySelector('.hero-brand-panel')).borderTopLeftRadius),
                buttonRadius: parseFloat(getComputedStyle(document.querySelector('.hero-copy .btn')).borderTopLeftRadius),
                fieldRadius: parseFloat(getComputedStyle(document.querySelector('#room-search')).borderTopLeftRadius),
                title: document.querySelector('h1').innerText.replace(/\\s/g, '') };
        })()`);
        assert.ok(layout.priceBottom < layout.viewport, 'Room prices should be visible in the first desktop viewport');
        assert.ok(layout.frameRadius <= 8 && layout.buttonRadius <= 8 && layout.fieldRadius <= 8);
        assert.equal(layout.title, 'ห้องที่ใช่สำหรับทุกวันของคุณ');
        assert.equal(await cdp.evaluate('document.querySelector(".hero-brand-panel img").getAttribute("fetchpriority")'), 'high');
    });
    await check('Residence rules use saved content, handle empty data and fit the public navigation', async () => {
        await click('header nav[aria-label="เมนูหลัก"] a[href="/#rules"]'); await expectPublicScroll('rules');
        assert.equal(await cdp.evaluate('document.querySelector("#rules h2").textContent'),'ข้อกำหนดการอยู่อาศัย');
        assert.ok((await cdp.evaluate('document.querySelector("#rules").innerText')).includes(dormitory.rules));
        for(const width of [1024,1279,1280,1440]) {
            await viewport(width,1000); await noOverflow('public rules navigation '+width);
            const menu = await cdp.evaluate('({desktop:getComputedStyle(document.querySelector("header nav[aria-label=เมนูหลัก]")).display!=="none",toggle:getComputedStyle(document.querySelector("button[aria-controls=public-mobile-navigation]")).display!=="none"})');
            assert.equal(menu.desktop,width>=1280); assert.equal(menu.toggle,width<1280);
        }
        await click('footer a[href="/#rules"]'); await expectPublicScroll('rules');
        await prisma.property.update({where:{id:dormitory.id},data:{rules:''}});
        await navigate('/rooms/'+room.id); await navigate('/#rules'); await waitText('ยังไม่ได้ระบุข้อกำหนดเพิ่มเติม'); await expectPublicScroll('rules');
        await prisma.property.update({where:{id:dormitory.id},data:{rules:dormitory.rules}});
        await navigate('/rooms/'+room.id); await navigate('/'); await waitText('ห้อง 101'); await expectPublicScroll(null);
    });
    await check('Public header Home returns to the top after section navigation', async () => {
        const header = 'header nav[aria-label="เมนูหลัก"]';
        for(const id of ['rooms','facilities','rules','contact']) {
            await click(header+' a[href="/#'+id+'"]'); await expectPublicScroll(id);
        }
        await cdp.evaluate('window.scrollTo({top:0,behavior:"instant"})');
        await click(header+' a[href="/#contact"]'); await expectPublicScroll('contact');
        await click(header+' a[href="/"]');
        await until(()=>cdp.evaluate('location.pathname === "/" && location.hash === "" && window.scrollY < 2'),'header Home returns to top');
        for(const id of ['contact','rules','facilities','rooms',null]) { await travel(-1); await expectPublicScroll(id); }
        for(const id of ['rooms','facilities','rules','contact',null]) { await travel(1); await expectPublicScroll(id); }
        await cdp.evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
        await click(header+' a[href="/"]'); await expectPublicScroll(null);
    });
    await check('Room search and filters update actual room cards', async () => {
        await fill('#room-search', '102'); await until(() => cdp.evaluate('document.querySelectorAll("#rooms article").length === 1'), 'room filter');
        await fill('#room-search', '');
        await cdp.evaluate('(() => { const e=document.querySelector("#room-availability"); e.value="available"; e.dispatchEvent(new Event("change",{bubbles:true})); })()');
        await until(() => cdp.evaluate('document.querySelectorAll("#rooms article").length === 2'), 'availability filter');
    });
    await check('Room search survives browser Back, Forward and the room return link', async () => {
        await fill('#room-search','102'); await fill('#room-budget','3000');
        await cdp.evaluate('(() => {const field=document.querySelector("#room-type");field.value="NON-AC";field.dispatchEvent(new Event("change",{bubbles:true}));})()');
        await until(()=>cdp.evaluate('document.querySelectorAll("#rooms article").length === 1'),'one filtered room');
        const snapshot = () => cdp.evaluate('["room-search","room-availability","room-type","room-budget"].map(id=>document.getElementById(id).value)');
        const saved = await snapshot();
        const target = await cdp.evaluate('document.querySelector(".room-details-link").getAttribute("href")');
        await click('.room-details-link'); await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(target)} && !!document.querySelector('.room-detail')`),'room detail from search');
        await travel(-1); await until(()=>cdp.evaluate('!!document.querySelector("#room-search")'),'search restored'); assert.deepEqual(await snapshot(),saved);
        await travel(1); await until(()=>cdp.evaluate('!!document.querySelector(".room-detail > a")'),'room forward');
        await click('.room-detail > a'); await until(()=>cdp.evaluate('location.pathname === "/" && !!document.querySelector("#room-search")'),'room back link'); assert.deepEqual(await snapshot(),saved);
        await click('.room-filters button:last-child'); await until(()=>cdp.evaluate('document.querySelectorAll("#rooms article").length === 3'),'search reset');
        await cdp.evaluate('window.scrollTo({top:0,behavior:"instant"})');
    });
    await check('Public mobile navigation and 390px layout', async () => {
        await viewport(390, 844); await noOverflow('mobile home');
        await click('button[aria-controls="public-mobile-navigation"]');
        assert.equal(await cdp.evaluate('document.querySelector("#public-mobile-navigation").innerText.includes("เข้าสู่ระบบ")'), true);
        await click('button[aria-controls="public-mobile-navigation"]'); await screenshot('public-mobile');
    });
    await check('Mobile public sections and the Home logo restore actual scroll positions', async () => {
        for(const id of ['rooms','facilities','rules','contact']) {
            await click('button[aria-controls="public-mobile-navigation"]');
            await click('#public-mobile-navigation a[href="/#'+id+'"]');
            await until(()=>cdp.evaluate('!document.querySelector("#public-mobile-navigation")'),'mobile section menu closes');
            await expectPublicScroll(id);
        }
        for(const id of ['rules','facilities','rooms']) { await travel(-1); await expectPublicScroll(id); }
        for(const id of ['facilities','rules','contact']) { await travel(1); await expectPublicScroll(id); }
        await click('header a[aria-label="DORMIFY หน้าหลัก"]'); await expectPublicScroll(null);
        await cdp.evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
        await click('header a[aria-label="DORMIFY หน้าหลัก"]'); await expectPublicScroll(null);
    });
    await check('Mobile room filters open by keyboard, filter and reset without losing controls', async () => {
        const toggle = 'button[aria-controls="room-filter-fields"]';
        assert.equal(await cdp.evaluate('document.querySelector("#room-budget").offsetParent === null'), true);
        await cdp.send('Page.bringToFront');
        await cdp.evaluate(`document.querySelector('${toggle}').focus()`);
        assert.equal(await cdp.evaluate(`document.activeElement === document.querySelector('${toggle}')`), true);
        await cdp.send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', text:'\r', unmodifiedText:'\r', windowsVirtualKeyCode:13 });
        await cdp.send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
        await until(()=>cdp.evaluate('document.querySelector("#room-budget").offsetParent !== null'),'mobile filters opened');
        assert.equal(await cdp.evaluate(`document.querySelector('${toggle}').getAttribute('aria-expanded')`), 'true');
        await fill('#room-budget', '3000');
        await until(()=>cdp.evaluate('document.querySelectorAll("#rooms article").length === 1'),'mobile budget filter');
        await click('.room-filters button:last-child');
        await until(()=>cdp.evaluate('document.querySelectorAll("#rooms article").length === 3'),'mobile filters reset');
        await click(toggle);
        assert.equal(await cdp.evaluate('document.querySelector("#room-budget").offsetParent === null'), true);
    });
    await check('Public room layout fits 320px, tablet and desktop widths', async () => {
        for (const [width,height] of [[320,844],[390,844],[768,1024],[1024,900]]) {
            await viewport(width,height); await noOverflow('public home ' + width);
            const sizes = await cdp.evaluate(`(() => {
                const link = document.querySelector('.room-details-link').getBoundingClientRect();
                const button = document.querySelector('.hero-copy .btn').getBoundingClientRect();
                return {linkHeight:link.height,buttonHeight:button.height,filtersVisible:document.querySelector('#room-budget').offsetParent!==null};
            })()`);
            assert.ok(sizes.linkHeight >= 44 && sizes.buttonHeight >= 44);
            assert.equal(sizes.filtersVisible, width >= 640);
            await screenshot('home-' + width);
        }
        await viewport(390,844);
    });
    await check('Direct section links and room-page menu links scroll correctly without losing filters', async () => {
        await viewport(1440,1000); await navigate('/#facilities'); await waitText('ห้อง 101'); await expectPublicScroll('facilities');
        await navigate('/rooms/'+room.id); await waitText('ห้อง 101');
        await click('header nav[aria-label="เมนูหลัก"] a[href="/#rooms"]'); await waitText('ห้อง 102'); await expectPublicScroll('rooms');
        const before=await cdp.evaluate('window.scrollY'); await fill('#room-search','102');
        await until(()=>cdp.evaluate('document.querySelectorAll("#rooms article").length === 1'),'room filter in place');
        assert.ok(Math.abs(await cdp.evaluate('window.scrollY')-before)<4,'Changing filters must not jump to the top');
        await click('header nav[aria-label="เมนูหลัก"] a[href="/#facilities"]'); await expectPublicScroll('facilities');
        await travel(-1); await expectPublicScroll('rooms'); assert.equal(await cdp.evaluate('document.querySelector("#room-search").value'),'102');
        await click('.room-details-link'); await until(()=>cdp.evaluate('!!document.querySelector(".room-detail")'),'filtered room detail');
        await click('header nav[aria-label="เมนูหลัก"] a[href="/#contact"]'); await expectPublicScroll('contact');
        assert.equal(await cdp.evaluate('document.querySelector("#room-search").value'),'102');
        await click('header nav[aria-label="เมนูหลัก"] a[href="/#rooms"]'); await expectPublicScroll('rooms');
        await click('.room-filters button:last-child'); await viewport(390,844);
    });
    await check('Public anchors, Login, Register and password visibility return correctly', async () => {
        await viewport(1440,1000); await navigate('/');
        await click('main a[href="/#rooms"]'); await until(()=>cdp.evaluate('location.hash === "#rooms"'),'room anchor');
        await travel(-1); await travel(1); await travel(-1);
        await click('main a[href="/#contact"]'); await until(()=>cdp.evaluate('location.hash === "#contact"'),'contact anchor'); await travel(-1);
        await click('header a[href="/login"]'); await waitText('กรอกข้อมูลเพื่อเข้าใช้งาน');
        await fill('input[name=password]','navigation-check'); await click('button[aria-label="แสดงรหัสผ่าน"]');
        assert.equal(await cdp.evaluate('document.querySelector("input[name=password]").type'),'text'); await click('button[aria-label="ซ่อนรหัสผ่าน"]');
        assert.equal(await cdp.evaluate('document.querySelector("input[name=password]").type'),'password');
        await click('main a[href="/register"]'); await waitText('สร้างบัญชีเพื่อส่งคำขอเช่า');
        await click('main a[href="/login"]'); await waitText('กรอกข้อมูลเพื่อเข้าใช้งาน');
        await travel(-1); await waitText('สร้างบัญชีเพื่อส่งคำขอเช่า');
        await click('main a.nav-link'); await until(()=>cdp.evaluate('location.pathname === "/" && !!document.querySelector("#rooms")'),'auth back home');
        await viewport(390,844);
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
    await check('User overview separates loading, failure and empty invoice states', async () => {
        cdp.pausedRequests = [];
        await cdp.send('Fetch.enable', {patterns:[{urlPattern:'*/api/operations/invoices',requestStage:'Request'}]});
        await navigate('/user');
        await until(()=>Promise.resolve(cdp.pausedRequests.some(request=>new URL(request.request.url).pathname==='/api/operations/invoices')),'overview invoice request paused');
        await waitText('กำลังโหลดใบแจ้งหนี้');
        assert.equal((await text()).includes('ยังไม่มีใบแจ้งหนี้ค้างชำระ'),false);
        const tried = new Set();
        await until(async()=>{
            const paused = cdp.pausedRequests.find(request=>new URL(request.request.url).pathname==='/api/operations/invoices' && !tried.has(request.requestId));
            if(!paused)return false;
            tried.add(paused.requestId);
            try { await cdp.send('Fetch.failRequest',{requestId:paused.requestId,errorReason:'ConnectionRefused'}); return true; }
            catch(error) { if(error.message.includes('Invalid InterceptionId'))return false; throw error; }
        },'active overview invoice request failed');
        await cdp.send('Fetch.disable');
        await waitText('เชื่อมต่อระบบไม่ได้');
        await click('[aria-labelledby="resident-invoice-heading"] button');
        await waitText('ยังไม่มีใบแจ้งหนี้ค้างชำระ'); await waitText('ยังไม่มีสัญญาเช่าที่ใช้งานอยู่');
        assert.equal((await text()).includes(adminEmail),false);
        await screenshot('resident-overview-empty');
    });
    await check('Grouped User navigation keeps all destinations and Escape restores focus', async () => {
        await click('button[aria-controls="workspace-navigation"]');
        const routes = await cdp.evaluate('[...document.querySelectorAll("#workspace-navigation nav a")].map(link=>link.getAttribute("href")).sort()');
        assert.deepEqual(routes,['/user','/user/room','/user/bookings','/user/contract','/user/invoices','/user/payments','/user/history','/user/maintenance','/user/notifications'].sort());
        assert.equal(await cdp.evaluate('document.querySelectorAll("#workspace-navigation .sidebar-group-label").length'),3);
        await cdp.send('Page.bringToFront');
        await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await until(()=>cdp.evaluate('document.querySelector("#workspace-navigation").hasAttribute("inert")'),'sidebar closes by Escape');
        assert.equal(await cdp.evaluate('document.activeElement === document.querySelector("button[aria-controls=workspace-navigation]")'),true);
    });
    await check('All nine User destinations support menu navigation and browser Back and Forward', async () => {
        await viewport(1440,1000); await navigationRoundTrips('/user'); await viewport(390,844);
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
    await check('Room price and booking form stay ahead of secondary details on mobile', async () => {
        await navigate('/rooms/' + room.id); await until(()=>cdp.evaluate('!!document.querySelector("#booking-form form")'),'booking form loaded');
        for (const [width,height] of [[320,844],[390,844],[768,1024],[1440,1000]]) {
            await viewport(width,height); await noOverflow('room detail ' + width);
            const order = await cdp.evaluate(`(() => {
                const heading = [...document.querySelectorAll('h2')].find(node=>node.textContent==='รายละเอียดห้องพัก');
                return { form:document.querySelector('#booking-form').getBoundingClientRect().top, details:heading.getBoundingClientRect().top,
                    price:document.querySelector('.room-detail-price').innerText, inputs:document.querySelectorAll('#booking-form input[type=date]').length };
            })()`);
            assert.ok(order.price.includes('3,500')); assert.equal(order.inputs,2);
            if(width<1024)assert.ok(order.form<order.details);
            if(width===390||width===1440)await screenshot('room-detail-'+width);
        }
        await viewport(390,844);
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
        const history = await cdp.send('Page.getNavigationHistory');
        await cdp.send('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex-1].id});
        await until(()=>cdp.evaluate('location.pathname === "/login" && !document.querySelector("#workspace-navigation")'),'Back after logout remains signed out');
    });
    await login(adminEmail);
    await check('Admin dashboard displays aggregate API data with Thai menus', async () => {
        await waitText('ภาพรวม'); await waitText('คำขอรอดำเนินการ');
        await until(() => cdp.evaluate('document.querySelector(".priority-count")?.innerText === "1" && Array.from(document.querySelectorAll("#room-summary dd")).slice(0,2).map(node=>node.innerText).join(",") === "3,2"'), 'summary counts');
        assert.equal(await cdp.evaluate('document.querySelectorAll("#workspace-navigation nav a").length'),13);
        assert.equal(await cdp.evaluate('document.querySelectorAll("#workspace-navigation .sidebar-group-label").length'),4);
        assert.ok(cdp.networkRequests.some(url => url.includes('/api/bookings/summary?propertyId=')));
        assert.equal(cdp.networkRequests.some(url => /\/api\/bookings\/admin(?:\?|$)/.test(url)), false);
        await screenshot('admin-desktop');
    });
    await check('All thirteen Admin destinations support menu navigation and browser Back and Forward', async () => {
        await navigationRoundTrips('/admin');
    });
    await check('Existing room API works from the redesigned Admin form', async () => {
        await navigate('/admin/rooms'); await waitText('ห้อง 101');
        await until(() => cdp.evaluate('Array.from(document.querySelectorAll("button")).some(button=>button.innerText.includes("เพิ่มห้องพัก") && !button.disabled)'), 'room form is ready');
        await cdp.evaluate('Array.from(document.querySelectorAll("button")).find(button=>button.innerText.includes("เพิ่มห้องพัก")).click()');
        await fill('input[name=roomNumber]', '301'); await fill('input[name=price]', '3900'); await fill('input[name=capacity]', '2'); await submit('main form');
        await waitText('เพิ่มห้อง 301 เรียบร้อยแล้ว'); assert.equal(await prisma.room.count({ where: { propertyId: dormitory.id } }), 4);
    });
    await check('Room edit, media, status and dormitory cancel buttons preserve saved data', async () => {
        const originalRoom = await prisma.room.findUnique({where:{id:room.id}});
        const originalDormitory = await prisma.property.findUnique({where:{id:dormitory.id}});
        await navigate('/admin/rooms'); await waitText('ห้อง 101');
        await click('button[aria-label="แก้ไขห้อง 101"]'); await fill('input[name=price]','9999'); await click('form button[type=button]');
        assert.equal(await cdp.evaluate('!!document.querySelector("input[name=price]")'),false);
        assert.equal(String((await prisma.room.findUnique({where:{id:room.id}})).price),String(originalRoom.price));
        await click('button[aria-label="จัดการรูปห้อง 101"]'); await waitText('ปิดการจัดการรูป'); await clickText('ปิดการจัดการรูป');
        assert.equal(await cdp.evaluate(`!!document.querySelector('input[aria-label="เพิ่มรูปห้อง"]')`),false);
        await click('button[aria-label="ปิดใช้งานห้อง 102"]'); await click('dialog[open] button[type=button]');
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'room status cancelled');
        await click('button[aria-label="ปิดใช้งานห้อง 102"]'); await escape();
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'room status escape');
        assert.equal((await prisma.room.findUnique({where:{propertyId_roomNumber:{propertyId:dormitory.id,roomNumber:'102'}}})).isActive,true);
        await navigate('/admin/dormitory'); await until(()=>cdp.evaluate('!!document.querySelector("button:has(svg.lucide-pencil)")'),'dormitory edit control');
        await click('button:has(svg.lucide-pencil)'); await fill('input[name=name]','Navigation draft'); await click('form button[type=button]');
        assert.equal(await cdp.evaluate('!!document.querySelector("input[name=name]")'),false);
        assert.equal((await prisma.property.findUnique({where:{id:dormitory.id}})).name,originalDormitory.name);
    });
    await check('Cancelling or escaping a booking confirmation leaves it pending', async () => {
        await navigate('/admin/bookings'); await waitText(userEmail);
        await click('tbody tr:first-child button'); await click('dialog[open] button[type=button]');
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'booking cancel button');
        await click('tbody tr:first-child button'); await escape();
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'booking cancel Escape');
        assert.equal((await prisma.booking.findFirst({where:{roomId:room.id,user:{email:userEmail}}})).status,'PENDING');
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
        assert.equal(await cdp.evaluate('!!document.querySelector("form select[name=type], form input[type=checkbox]")'),false);
        assert.equal((await text()).includes('มีบริการอาหารภายในหอพัก'),false);
        await fill('input[name=name]', 'DORMIFY Updated UI');
        await fill('input[name=address]', 'Updated UI address');
        await submit('form');
        await until(async () => (await prisma.property.findUnique({ where: { id: dormitory.id } })).name === 'DORMIFY Updated UI', 'property saved');
        assert.equal((await prisma.property.findUnique({where:{id:dormitory.id}})).hasMess,true,'editing dormitory must preserve historical food-service metadata');
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
        await escape();
    });
    await check('Mobile room edit and confirmation dialog do not overflow', async () => {
        await viewport(390, 844);
        await navigate('/admin/rooms'); await waitText('UI-EDIT-102');
        await click('button[aria-label="แก้ไขห้อง UI-EDIT-102"]');
        await noOverflow('mobile room editor');
        await click('form button[type=button]');
        await click('button[aria-label="ปิดใช้งานห้อง UI-EDIT-102"]');
        await noOverflow('mobile room confirmation');
        await escape();
    });
    await check('Tablet and mobile Admin layouts do not overflow', async () => {
        await navigate('/admin/rooms');
        for (const [width,height,label] of [[768,1024,'tablet'],[390,844,'mobile']]) {
            await viewport(width,height); await delay(200); await noOverflow('Admin ' + label); await screenshot('admin-' + label);
        }
        await click('button[aria-controls="workspace-navigation"]'); await screenshot('admin-mobile-menu');
        await escape();
        await until(() => cdp.evaluate('document.querySelector("#workspace-navigation").hasAttribute("inert")'), 'Escape closes menu');
    });
    const select = async (selector, value) => {
        await until(() => cdp.evaluate(`!!document.querySelector(${JSON.stringify(selector + ' option[value="' + value + '"]')})`), 'select option');
        await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(element, ${JSON.stringify(String(value))}); element.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    };
    const fillArea = (selector, value) => cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    const actualUser = await prisma.user.findUnique({ where: { email: userEmail } });
    const contractNo = fixtures.scope + '-ui';
    const readingYear = 1204 + 400 * (parseInt(fixtures.scope.slice(-4),16) % 2);
    const leaseStart = readingYear + '-01-31', nextBoundary = readingYear + '-02-29';
    let tenant, lease, invoice, transfer;
    const localDate = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Bangkok', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
    await viewport(1440, 1000);
    await check('Cancelling new tenant and lease forms creates no records', async () => {
        const beforeTenants=await prisma.tenantProfile.count(),beforeLeases=await prisma.lease.count();
        await navigate('/admin/tenants'); await clickText('เพิ่มผู้เช่า'); await fill('input[name=name]','Cancelled tenant'); await click('form button[type=button]');
        assert.equal(await cdp.evaluate('!!document.querySelector("input[name=name]")'),false);
        await navigate('/admin/contracts'); await clickText('เพิ่มสัญญาฉบับร่าง'); await fill('input[name=contractNo]','cancelled-contract'); await click('form button[type=button]');
        assert.equal(await cdp.evaluate(`[...document.querySelectorAll('form h2')].some(node=>node.textContent==='สร้างสัญญาฉบับร่าง')`),false);
        assert.equal(await prisma.tenantProfile.count(),beforeTenants);assert.equal(await prisma.lease.count(),beforeLeases);
    });
    await check('Admin creates a tenant bound to an existing User through the real form', async () => {
        await navigate('/admin/tenants'); await waitText('เพิ่มผู้เช่า');
        await until(() => cdp.evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="เพิ่มผู้เช่า" && !b.disabled)'), 'tenant options ready');
        await clickText('เพิ่มผู้เช่า'); await select('select[name=userId]', actualUser.id); await fill('input[name=name]', 'ผู้เช่าหน้าจอจริง'); await submit('form');
        await waitText('บันทึกทะเบียนผู้เช่าแล้ว'); tenant = await prisma.tenantProfile.findUnique({ where: { userId: actualUser.id } }); assert.ok(tenant);
    });
    await check('Admin uploads a real room image and amenities appear on the public room page', async () => {
        await navigate('/admin/rooms'); await waitText('101'); await click('button[aria-label="จัดการรูปห้อง 101"]');
        const imageFile=path.join(artifacts,'fixture-room.png'); const sharp=require('sharp');
        fs.writeFileSync(imageFile,await sharp({create:{width:20,height:12,channels:3,background:'#12bdf4'}}).png().toBuffer());
        const {root:dom}=await cdp.send('DOM.getDocument'); const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:dom.nodeId,selector:'input[aria-label="เพิ่มรูปห้อง"]'});
        await cdp.send('DOM.setFileInputFiles',{nodeId,files:[imageFile]}); await waitText('เพิ่มรูปห้องแล้ว');
        await fillArea('textarea[name=amenities]','โต๊ะทดสอบ\nตู้เสื้อผ้าทดสอบ'); await submit('form:has(textarea[name=amenities])');
        await until(async()=>(await prisma.room.findUnique({where:{id:room.id}})).amenities?.includes('โต๊ะทดสอบ'),'room amenities saved');
        await navigate('/rooms/'+room.id); await waitText('โต๊ะทดสอบ');
        assert.equal((await text()).includes('ความคิดเห็นเกี่ยวกับหอพัก'),false);
        assert.equal((await text()).includes('รายการอาหารประจำสัปดาห์'),false);
        assert.ok((await text()).includes('ข้อกำหนดการอยู่อาศัย'));
        await until(()=>cdp.evaluate('[...document.images].some(img=>img.src.includes("/room-photos/") && img.naturalWidth>0)'),'actual public photo loaded');
        await screenshot('room-photo-public');
        await check('Gallery arrows, thumbnails, zoom, close and Escape keep the room page', async () => {
            await navigate('/admin/rooms'); await click('button[aria-label="จัดการรูปห้อง 101"]');
            const secondFile=path.join(artifacts,'fixture-room-second.png'); fs.writeFileSync(secondFile,await sharp({create:{width:20,height:12,channels:3,background:'#0769f4'}}).png().toBuffer());
            const {root:secondDom}=await cdp.send('DOM.getDocument'); const {nodeId:secondInput}=await cdp.send('DOM.querySelector',{nodeId:secondDom.nodeId,selector:'input[aria-label="เพิ่มรูปห้อง"]'});
            await cdp.send('DOM.setFileInputFiles',{nodeId:secondInput,files:[secondFile]}); await until(async()=>await prisma.roomPhoto.count({where:{roomId:room.id}})===2,'second gallery image');
            await navigate('/rooms/'+room.id); await waitText('ภาพที่ 1 / 2');
            await click('button[aria-label="รูปภาพถัดไป"]'); await waitText('ภาพที่ 2 / 2');
            await click('button[aria-label="รูปภาพก่อนหน้า"]'); await waitText('ภาพที่ 1 / 2');
            await click('button[aria-label="ดูภาพที่ 2"]'); assert.equal(await cdp.evaluate(`document.querySelector('button[aria-label="ดูภาพที่ 2"]').getAttribute('aria-pressed')`),'true');
            await click('button[aria-label="ขยายรูปภาพ"]'); await clickText('ภาพก่อนหน้า'); await clickText('ภาพถัดไป'); await click('button[aria-label="ปิดรูปภาพ"]');
            await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'gallery close button');
            await click('button[aria-label="ขยายรูปภาพ"]'); await escape();
            await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'gallery Escape');
            assert.equal(await cdp.evaluate('location.pathname'),'/rooms/'+room.id);
        });
        await navigate('/admin/rooms'); await click('button[aria-label="จัดการรูปห้อง 101"]'); await waitText('ลบรูปที่ 1'); await clickText('ลบรูปที่ 1'); await click('dialog[open] button[type=submit]');
        await until(async()=>await prisma.roomPhoto.count({where:{roomId:room.id}})===1,'first gallery photo removed'); await clickText('ลบรูปที่ 1'); await click('dialog[open] button[type=submit]');
        await until(async()=>await prisma.roomPhoto.count({where:{roomId:room.id}})===0,'photo deleted');
    });
    await check('Admin creates and activates a signed lease, converting the approved booking', async () => {
        await navigate('/admin/contracts'); await waitText('เพิ่มสัญญาฉบับร่าง');
        await until(() => cdp.evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="เพิ่มสัญญาฉบับร่าง" && !b.disabled)'), 'lease options ready');
        await clickText('เพิ่มสัญญาฉบับร่าง');
        await fill('input[name=contractNo]', contractNo); await select('select[name=tenantId]', tenant.id); await select('select[name=roomId]', room.id);
        const approved = await prisma.booking.findFirst({ where: { roomId: room.id, userId: actualUser.id, status: 'CONFIRMED' } });
        await select('select[name=bookingId]', approved.id); await fill('input[name=startDate]', leaseStart); await fill('input[name=signedDate]', localDate); await fill('input[name=monthlyRent]', '3500'); await submit('form');
        await waitText('บันทึกสัญญาฉบับร่างแล้ว'); await waitText(contractNo);
        await clickText('แก้ไข'); await fill('input[name=monthlyRent]','9999'); await click('form button[type=button]');
        assert.equal(Number((await prisma.lease.findUnique({where:{contractNo}})).monthlyRent),3500);
        await clickText('เริ่มใช้สัญญา'); await click('dialog[open] button[type=submit]'); await waitText('เริ่มใช้สัญญาแล้ว');
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
            for(const [readingDate,value]of [[leaseStart,opening],[nextBoundary,closing],[readingYear+'-03-01',closing]]) {
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
    await check('User overview displays the active room and earliest unpaid invoice from real APIs', async () => {
        await login(userEmail); await waitText(contractNo); await waitText(invoice.invoiceNo);
        assert.ok(await cdp.evaluate('document.querySelector(".resident-amount").innerText.includes("3,500")'));
        assert.equal((await text()).includes(adminEmail),false);
        for (const [width,height]of [[320,844],[390,844],[768,1024],[1440,1000]]) {
            await viewport(width,height); await noOverflow('resident overview ' + width);
            if(width===390||width===1440)await screenshot('resident-overview-'+width);
        }
    });
    await check('Contract and invoice detail close buttons return to their lists', async () => {
        await navigate('/user/contract'); await waitText(contractNo); const leaseRows=await cdp.evaluate('document.querySelectorAll("tbody tr").length');
        await click('tbody tr:first-child button'); await waitText('ปิดรายละเอียด'); await clickText('ปิดรายละเอียด');
        assert.equal(await cdp.evaluate('document.querySelectorAll("tbody tr").length'),leaseRows);
        assert.equal(await cdp.evaluate('location.pathname'),'/user/contract');
        await navigate('/user/invoices'); await waitText(invoice.invoiceNo); const invoiceRows=await cdp.evaluate('document.querySelectorAll("tbody tr").length');
        await click('tbody tr:first-child button'); await waitText('ปิดรายละเอียด'); await clickText('ปิดรายละเอียด');
        assert.equal(await cdp.evaluate('document.querySelectorAll("tbody tr").length'),invoiceRows);
        assert.equal(await cdp.evaluate('location.pathname'),'/user/invoices');
    });
    await check('User sees own contract and invoice, submits transfer and uploads private proof', async () => {
        await navigate('/user/contract'); await waitText(contractNo); assert.equal((await text()).includes('เริ่มใช้สัญญา'), false);
        await navigate('/user/bookings'); await waitText('ทำสัญญาแล้ว');
        await navigate('/user/invoices'); await waitText(invoice.invoiceNo); assert.equal((await text()).includes('ออกบิลรายเดือน'), false);
        const paymentStart = cdp.networkRequests.length;
        await navigate('/user/payments'); await until(()=>cdp.evaluate(`Array.from(document.querySelector('select[name=invoiceId]')?.options ?? []).some(option=>option.value === '${invoice.id}')`),'payment invoice loaded');
        await until(()=>Promise.resolve(['payments','invoices','leases','deposits'].every(name=>cdp.networkRequests.slice(paymentStart).some(url=>new URL(url).pathname==='/api/operations/'+name))),'payment form resources requested');
        await submit('form');
        assert.match(await cdp.evaluate('document.querySelector("select[name=invoiceId]").validationMessage'), /กรุณาเลือก/);
        await select('select[name=invoiceId]', invoice.id); await submit('form'); await waitText('บันทึกรายการรอตรวจแล้ว');
        transfer = await prisma.invoicePayment.findFirst({ where: { invoiceId:invoice.id } }); assert.equal(transfer.status, 'PENDING');
        await until(() => cdp.evaluate('!!document.querySelector("input[type=file]")'), 'proof input');
        const proofFile = path.join(artifacts, 'fixture-proof.png'); fs.writeFileSync(proofFile, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH6kAAAAASUVORK5CYII=', 'base64'));
        const { root: domRoot } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId:domRoot.nodeId, selector:'input[type=file]' });
        await cdp.send('DOM.setFileInputFiles', {nodeId, files:[proofFile]}); await waitText('แนบหลักฐานแล้ว'); assert.ok(await prisma.paymentProof.findUnique({ where:{paymentId:transfer.id} }));
        await viewport(390,844); await noOverflow('mobile payment form and table'); await screenshot('user-payment-mobile'); await viewport(1440,1000);
    });
    await check('Downloading private payment proof keeps the current page', async () => {
        await navigate('/user/payments'); await waitText('ดาวน์โหลดหลักฐาน');
        const downloads=path.join(artifacts,'navigation-downloads'); fs.mkdirSync(downloads,{recursive:true});
        await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
        await clickText('ดาวน์โหลดหลักฐาน'); const file=path.join(downloads,'payment-'+transfer.id+'.png');
        await until(()=>fs.existsSync(file),'private proof download');
        assert.equal(fs.readFileSync(file).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
        assert.equal(await cdp.evaluate('location.pathname'),'/user/payments');
    });
    await check('Invoice amounts align right and mobile tables scroll by keyboard', async () => {
        await navigate('/user/invoices'); await waitText(invoice.invoiceNo); await viewport(320,844); await noOverflow('invoice table');
        assert.equal(await cdp.evaluate('[...document.querySelectorAll("td.numeric-cell")].every(cell=>getComputedStyle(cell).textAlign==="right")'),true);
        assert.ok(await cdp.evaluate('document.querySelectorAll("td.numeric-cell").length>0'));
        await cdp.send('Page.bringToFront');
        await cdp.evaluate('document.querySelector(".table-scroll").focus()');
        await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
        await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
        await until(()=>cdp.evaluate('document.querySelector(".table-scroll").scrollLeft>0'),'keyboard table scroll');
        await screenshot('invoice-table-mobile'); await viewport(1440,1000);
    });
    await check('User submits maintenance and reads only personal notifications', async () => {
        await navigate('/user/maintenance'); await select('select[name=leaseId]', lease.id); await fill('input[name=title]', 'แจ้งซ่อมจากหน้าจอ'); await fillArea('textarea[name=description]', 'ไฟห้องเสียสำหรับการทดสอบ'); await submit('form'); await waitText('ส่งเรื่องแจ้งซ่อมแล้ว');
        assert.equal(await prisma.maintenanceRequest.count({where:{leaseId:lease.id}}),1);
        const notificationStart = cdp.networkRequests.length;
        await navigate('/user/notifications'); await waitText('ใบแจ้งหนี้ใหม่');
        assert.ok(cdp.networkRequests.slice(notificationStart).some(url=>new URL(url).pathname==='/api/operations/history/notifications'));
        await cdp.send('Fetch.enable',{patterns:[{urlPattern:'*/api/operations/notifications/*/read',requestStage:'Request'}]});
        await clickText('ทำเครื่องหมายว่าอ่านแล้ว');
        await until(()=>Promise.resolve(cdp.pausedRequests.some(request=>/\/notifications\/\d+\/read$/.test(request.request.url))),'intercept read mutation');
        const pausedRead = cdp.pausedRequests.find(request=>/\/notifications\/\d+\/read$/.test(request.request.url));
        await cdp.send('Fetch.failRequest',{requestId:pausedRead.requestId,errorReason:'ConnectionRefused'}); await cdp.send('Fetch.disable');
        await waitText('เชื่อมต่อระบบไม่ได้'); await clickText('ทำเครื่องหมายว่าอ่านแล้ว');
        await until(async()=>await prisma.notification.count({where:{userId:actualUser.id,readAt:{not:null}}})>0,'notification read saved');
    });
    await check('Returning from a payment confirmation does not receive money', async () => {
        await login(adminEmail); await navigate('/admin/payments'); await waitText(invoice.invoiceNo);
        await clickText('ยืนยันรับเงิน'); await click('dialog[open] button[type=button]');
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'payment confirmation back');
        await clickText('ยืนยันรับเงิน'); await escape();
        await until(()=>cdp.evaluate('!document.querySelector("dialog[open]")'),'payment confirmation Escape');
        assert.equal((await prisma.invoicePayment.findUnique({where:{id:transfer.id}})).status,'PENDING');
        assert.equal(await prisma.invoiceSettlement.count({where:{invoiceId:invoice.id}}),0);
    });
    await check('Admin verifies transfer via confirmation; User payment history updates', async () => {
        await login(adminEmail); await navigate('/admin/payments'); await waitText(invoice.invoiceNo); await clickText('ยืนยันรับเงิน'); await click('dialog[open] button[type=submit]'); await waitText('ยืนยันรับเงินแล้ว');
        assert.equal((await prisma.invoice.findUnique({where:{id:invoice.id}})).status,'PAID'); assert.equal(await prisma.invoiceSettlement.count({where:{invoiceId:invoice.id}}),1);
        await login(userEmail);
        const historyStart = cdp.networkRequests.length;
        await navigate('/user/history'); await waitText(invoice.invoiceNo); await waitText('ยืนยันแล้ว');
        const historyPaths = cdp.networkRequests.slice(historyStart).map(url=>new URL(url).pathname);
        assert.ok(historyPaths.includes('/api/operations/payments'));
        assert.deepEqual(historyPaths.filter(url=>['invoices','leases','deposits'].some(name=>url==='/api/operations/'+name)),[]);
        await login(adminEmail);
    });
    await check('Admin news skips hidden notification history requests', async () => {
        const newsStart = cdp.networkRequests.length;
        await navigate('/admin/announcements'); await waitText('ยังไม่มีรายการ');
        const newsPaths = cdp.networkRequests.slice(newsStart).map(url=>new URL(url).pathname);
        assert.ok(newsPaths.includes('/api/operations/history/announcements'));
        assert.equal(newsPaths.includes('/api/operations/history/notifications'),false);
    });
    await check('Admin resolves maintenance and publishes news through actual forms', async () => {
        await navigate('/admin/maintenance'); await waitText('แจ้งซ่อมจากหน้าจอ');
        const repairBefore = await prisma.maintenanceRequest.findFirst({where:{leaseId:lease.id}});
        await clickText('อัปเดตงาน'); await fillArea('textarea[name=resolution]','Cancelled update'); await click('form:has(textarea[name=resolution]) button[type=button]');
        assert.equal((await prisma.maintenanceRequest.findUnique({where:{id:repairBefore.id}})).resolution,repairBefore.resolution);
        await clickText('อัปเดตงาน'); await select('select[name=status]','RESOLVED'); await fillArea('textarea[name=resolution]','เปลี่ยนหลอดไฟเรียบร้อย'); await submit('form:has(select[name=status])'); await waitText('อัปเดตงานแล้ว');
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
    await check('Cancelling news, expense and tenant edits restores the saved records', async () => {
        await navigate('/admin/announcements'); await waitText('ข่าวสารจริงจากการทดสอบหน้าจอ');
        const beforeNews=await prisma.announcement.findFirst({where:{createdBy:admin.id}});
        await clickText('แก้ไข'); await fill('input[name=title]','Cancelled news'); await click('form button[type=button]');
        assert.equal(await cdp.evaluate('document.querySelector("input[name=title]").value'),'');
        assert.equal((await prisma.announcement.findUnique({where:{id:beforeNews.id}})).title,beforeNews.title);
        await navigate('/admin/reports'); await waitText('100.25');
        const beforeExpense=await prisma.expense.findFirst({where:{recordedBy:admin.id}});
        await clickText('แก้ไข'); await fill('input[name=amount]','9999'); await click('form:has(input[name=amount]) button[type=button]');
        assert.equal(await cdp.evaluate('document.querySelector("input[name=amount]").value'),'');
        assert.equal(String((await prisma.expense.findUnique({where:{id:beforeExpense.id}})).amount),String(beforeExpense.amount));
        await navigate('/admin/tenants'); await waitText('ผู้เช่าหน้าจอจริง');
        const beforeTenant=await prisma.tenantProfile.findUnique({where:{id:tenant.id}});
        await clickText('แก้ไข'); await fill('input[name=name]','Cancelled rename'); await click('form button[type=button]');
        assert.equal((await prisma.tenantProfile.findUnique({where:{id:tenant.id}})).name,beforeTenant.name);
    });
    await check('Admin replaces a meter and corrects an unbilled reading with retained history', async () => {
        await navigate('/admin/meters'); const replacementForm='form:has(input[name=oldClosing])';
        await select(replacementForm+' select[name=roomId]',room.id); await select(replacementForm+' select[name=utilityType]','WATER'); await fill(replacementForm+' input[name=readingDate]',readingYear+'-03-10'); await fill(replacementForm+' input[name=oldClosing]','16'); await fill(replacementForm+' input[name=newOpening]','0'); await fill(replacementForm+' input[name=reason]','เปลี่ยนมิเตอร์จากหน้าจอ'); await submit(replacementForm);
        await until(async()=>await prisma.meterChange.count({where:{roomId:room.id,kind:'REPLACEMENT'}})===1,'replacement UI saved');
        const meterForm='form:has(input[name=value])'; await select(meterForm+' select[name=roomId]',room.id); await select(meterForm+' select[name=utilityType]','WATER'); await fill(meterForm+' input[name=readingDate]',readingYear+'-03-31'); await fill(meterForm+' input[name=value]','10'); await submit(meterForm);
        await until(async()=>await prisma.meterReading.count({where:{roomId:room.id,readingDate:new Date(readingYear+'-03-31'),utilityType:'WATER'}})===1,'replacement next reading');
        const reading=await prisma.meterReading.findFirst({where:{roomId:room.id,readingDate:new Date(readingYear+'-03-31'),utilityType:'WATER'}}); assert.equal(Number(reading.value),26);
        const correctionForm='form:has(select[name=readingId])'; await select(correctionForm+' select[name=readingId]',reading.id); await fill(correctionForm+' input[name=value]','9'); await fill(correctionForm+' input[name=reason]','แก้เลขก่อนออกบิลจากหน้าจอ'); await submit(correctionForm);
        await until(async()=>Number((await prisma.meterReading.findUnique({where:{id:reading.id}})).value)===25,'corrected cumulative reading'); await waitText('แก้เลขก่อนออกบิลจากหน้าจอ');
    });
    await check('Admin credit-note form preserves original invoice and exposes the adjusted balance', async () => {
        await navigate('/admin/invoices');
        const second=await prisma.invoice.findUnique({where:{leaseId_cycleIndex:{leaseId:lease.id,cycleIndex:1}}});
        const form='form:has(select[name=direction])';
        await select(form+' select[name=invoiceId]',second.id); await fill(form+' input[name=amount]','20'); await fill(form+' input[name=reason]','ปรับยอดทดสอบจากหน้าจอ'); await submit(form);
        await waitText('บันทึกปรับยอดแล้ว');
        assert.equal(Number((await prisma.invoice.findUnique({where:{id:second.id}})).totalAmount),3620);
        assert.equal(Number((await prisma.invoiceAdjustment.findFirst({where:{invoiceId:second.id}})).amount),-20);
        await navigate('/admin/payments'); await select('select[name=invoiceId]',second.id); await submit('form:has(select[name=invoiceId])'); await waitText('บันทึกรายการรอตรวจแล้ว'); await clickText('ยืนยันรับเงิน'); await click('dialog[open] button[type=submit]'); await waitText('ยืนยันรับเงินแล้ว');
        const paid = await prisma.invoicePayment.findFirst({where:{invoiceId:second.id,status:'CONFIRMED'}}); assert.equal(Number(paid.amount),3600);
        await navigate('/admin/invoices'); await waitText(second.invoiceNo);
        assert.equal((await text()).includes('คืนเงินใบลดหนี้ '+second.invoiceNo),false,'prepayment discount must not offer another cash refund');
    });
    await check('Admin receives deposit, ends lease and records refund separately', async () => {
        const form = 'form:has(select[name=kind])';
        await navigate('/admin/payments'); await select(form+' select[name=leaseId]',lease.id); await fill(form+' input[name=amount]','3500'); await submit(form); await waitText('บันทึกเงินประกันแล้ว');
        assert.equal(await prisma.depositEntry.count({where:{leaseId:lease.id,kind:'RECEIPT'}}),1);
        await navigate('/admin/contracts'); await waitText(contractNo); await clickText('ปิดยอดและจบสัญญา');
        const closeForm='form:has(input[name=checkoutDate])';
        await fill(closeForm+' input[name=checkoutDate]',readingYear+'-03-01'); await fill(closeForm+' input[name=reason]','ปิดสัญญาทดสอบตามวันจริง'); await submit(closeForm);
        await waitText('ตรวจยอดวันที่'); await waitText('(1/31 วัน)'); await clickText('ยืนยันปิดยอดและจบสัญญา'); await click('dialog[open] button[type=submit]');
        await until(async()=>(await prisma.lease.findUnique({where:{id:lease.id}})).status==='ENDED','lease closed through financial closeout');
        await navigate('/admin/payments'); await select(form+' select[name=leaseId]',lease.id); await select(form+' select[name=kind]','REFUND'); await fill(form+' input[name=amount]','3500'); await submit(form); await waitText('บันทึกเงินประกันแล้ว');
        assert.equal(await prisma.depositEntry.count({where:{leaseId:lease.id,kind:'REFUND'}}),1); assert.equal((await prisma.room.findUnique({where:{id:room.id}})).isAvailable,true);
    });
    await check('Room and operation tables paginate and provide CSV export controls', async () => {
        await prisma.auditLog.createMany({data:Array.from({length:503},(_,index)=>({actorId:admin.id,actorName:'CSV fixture',action:'TEST_EXPORT',entityType:'Fixture',summary:fixtures.scope+'-export-'+index,fixtureScope:fixtures.scope}))});
        await navigate('/admin/audit'); await waitText('หน้า 1');
        await fill('input[name=search]',fixtures.scope+'-export-'); await submit('form'); await waitText('ทั้งหมด 503 รายการ');
        assert.ok(await cdp.evaluate('document.querySelectorAll("tbody tr").length <= 10'));
        const next = await cdp.evaluate('[...document.querySelectorAll("button")].some(button=>button.textContent.trim()==="ถัดไป" && !button.disabled)');
        assert.ok(next); await clickText('ถัดไป'); await waitText('หน้า 2');
        assert.ok((await text()).includes('ส่งออกประวัติทั้งหมดที่กรอง (CSV)'));
        await cdp.evaluate(`window.fixtureCsv=null; window.savedCreateObjectURL=URL.createObjectURL; window.savedAnchorClick=HTMLAnchorElement.prototype.click; URL.createObjectURL=function(blob){blob.text().then(value=>window.fixtureCsv=value);return 'blob:fixture'}; HTMLAnchorElement.prototype.click=function(){};`);
        await clickText('ส่งออกประวัติทั้งหมดที่กรอง (CSV)');
        await until(()=>cdp.evaluate('typeof window.fixtureCsv === "string"'),'full history CSV generated');
        const csv=await cdp.evaluate('window.fixtureCsv'); assert.equal(csv.trim().split(/\r?\n/).length,504); assert.ok(csv.includes(fixtures.scope+'-export-502'));
        await cdp.evaluate('URL.createObjectURL=window.savedCreateObjectURL; HTMLAnchorElement.prototype.click=window.savedAnchorClick; delete window.fixtureCsv;');
        await navigate('/admin/rooms'); await waitText('ส่งออก CSV');
    });
    await check('Closeout UI calculates actual days, records cash refund, and successor contract retains history', async () => {
        await viewport(1440,1000);
        const closingNo=fixtures.scope+'-close-ui', historical='1104-01-31', checkout='1104-02-15';
        const closingRoom=await prisma.room.findUnique({where:{propertyId_roomNumber:{propertyId:dormitory.id,roomNumber:'301'}}});
        await navigate('/admin/contracts'); await until(()=>cdp.evaluate('[...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="เพิ่มสัญญาฉบับร่าง" && !b.disabled)'),'lease inputs'); await clickText('เพิ่มสัญญาฉบับร่าง');
        await fill('input[name=contractNo]',closingNo); await select('select[name=tenantId]',tenant.id); await select('select[name=roomId]',closingRoom.id); await fill('input[name=startDate]',historical); await fill('input[name=signedDate]',localDate); await fill('input[name=monthlyRent]','2900'); await submit('form'); await waitText('บันทึกสัญญาฉบับร่างแล้ว');
        await clickText('เริ่มใช้สัญญา'); await click('dialog[open] button[type=submit]'); await waitText('เริ่มใช้สัญญาแล้ว');
        const closingLease=await prisma.lease.findUnique({where:{contractNo:closingNo}});
        await navigate('/admin/invoices'); await select('select[name=leaseId]',closingLease.id); await submit('form');
        await until(async()=>await prisma.invoice.count({where:{leaseId:closingLease.id}})===1,'closing invoice'); const closingInvoice=await prisma.invoice.findFirst({where:{leaseId:closingLease.id}});
        await navigate('/admin/payments'); await select('select[name=invoiceId]',closingInvoice.id); await submit('form:has(select[name=invoiceId])'); await waitText('บันทึกรายการรอตรวจแล้ว'); await clickText('ยืนยันรับเงิน'); await click('dialog[open] button[type=submit]'); await waitText('ยืนยันรับเงินแล้ว');
        await navigate('/admin/meters'); const meterForm='form:has(input[name=value])',rateForm='form:has(input[name=unitPrice])';
        for(const [type,price,opening,last]of [['WATER','2','10','20'],['ELECTRICITY','4','100','110']]) {
            await select(rateForm+' select[name=utilityType]',type); await fill(rateForm+' input[name=unitPrice]',price); await fill(rateForm+' input[name=effectiveFrom]',historical); await fill(rateForm+' input[name=sourceReference]',fixtures.scope); await submit(rateForm);
            await until(async()=>await prisma.utilityRate.count({where:{createdBy:admin.id,utilityType:type,effectiveFrom:new Date(historical)}})===1,'closing rate');
            await select(meterForm+' select[name=roomId]',closingRoom.id); await select(meterForm+' select[name=utilityType]',type);
            for(const [readingDate,value]of [[historical,opening],[checkout,last],['1104-02-29',last]]) {
                await fill(meterForm+' input[name=readingDate]',readingDate); await fill(meterForm+' input[name=value]',value); await submit(meterForm);
                await until(async()=>await prisma.meterReading.count({where:{roomId:closingRoom.id,utilityType:type,readingDate:new Date(readingDate)}})===1,'closing reading');
                await until(()=>cdp.evaluate(`!document.querySelector(${JSON.stringify(meterForm+' button[type=submit]')}).disabled`),'reading form ready');
            }
        }
        await navigate('/admin/invoices'); await select('select[name=leaseId]',closingLease.id); await fill('input[name=cycleIndex]','2'); await submit('form:has(input[name=cycleIndex])');
        await until(async()=>await prisma.invoice.count({where:{leaseId:closingLease.id,cycleIndex:1}})===1,'future utilities invoice');
        const futureBill=await prisma.invoice.findUnique({where:{leaseId_cycleIndex:{leaseId:closingLease.id,cycleIndex:1}}});
        const adjustForm='form:has(select[name=direction])'; await select(adjustForm+' select[name=invoiceId]',futureBill.id); await select(adjustForm+' select[name=itemType]','WATER'); await fill(adjustForm+' input[name=amount]','10'); await fill(adjustForm+' input[name=reason]','ลดค่าน้ำตามหลักฐาน'); await submit(adjustForm); await waitText('บันทึกปรับยอดแล้ว');
        const adjustment=await prisma.invoiceAdjustment.findFirst({where:{invoiceId:futureBill.id}});
        await navigate('/admin/contracts'); const form='form:has(input[name=checkoutDate])';
        await select(form+' select[name=leaseId]',closingLease.id); await fill(form+' input[name=checkoutDate]',checkout); await fill(form+' input[name=reason]','สิ้นสุดกลางเดือนตามวันจริง'); await submit(form);
        await waitText('จัดสรรยอดปรับน้ำไฟตามหลักฐานมิเตอร์');
        assert.equal(await cdp.evaluate('[...document.querySelectorAll("button")].some(button=>button.textContent.trim()==="ยืนยันปิดยอดและจบสัญญา")'),false);
        const manualForm='form:has(input[name="amount-'+adjustment.id+'"])';
        await fill(manualForm+' input[name="amount-'+adjustment.id+'"]','5'); await fill(manualForm+' input[name="reason-'+adjustment.id+'"]','ตรวจเลขมิเตอร์จริงก่อนออก'); await fill(manualForm+' input[name="reference-'+adjustment.id+'"]','1104-01-31 ถึง 1104-02-15'); await submit(manualForm);
        await waitText('ต้องคืนผู้เช่า'); await waitText('฿1,345');
        await clickText('ยืนยันปิดยอดและจบสัญญา'); await click('dialog[open] button[type=submit]');
        await until(async()=>await prisma.leaseCloseout.count({where:{leaseId:closingLease.id}})===1,'closeout committed');
        const closing=await prisma.leaseCloseout.findUnique({where:{leaseId:closingLease.id}}); assert.equal(Number(closing.balance),-1345); assert.equal(closing.details.allocation[0].manual,true);
        const refundForm='form:has(select[name=closeoutId])'; await select(refundForm+' select[name=closeoutId]',closing.id); await select(refundForm+' select[name=method]','TRANSFER'); await fill(refundForm+' input[name=amount]','1345'); await submit(refundForm);
        await until(async()=>!!(await prisma.leaseCloseout.findUnique({where:{id:closing.id}})).settledAt,'refund recorded');
        const successorForm='form:has(select[name=kind])'; await select(successorForm+' select[name=leaseId]',closingLease.id); await fill(successorForm+' input[name=contractNo]',closingNo+'-renew'); await fill(successorForm+' input[name=startDate]',checkout); await fill(successorForm+' input[name=signedDate]',localDate); await fill(successorForm+' input[name=monthlyRent]','3000'); await fill(successorForm+' input[name=reason]','ต่ออายุฉบับใหม่'); await submit(successorForm);
        await until(async()=>await prisma.lease.count({where:{contractNo:closingNo+'-renew'}})===1,'successor created');
        assert.equal((await prisma.lease.findUnique({where:{contractNo:closingNo+'-renew'}})).previousLeaseId,closingLease.id);
        await until(()=>cdp.evaluate('[...document.querySelectorAll("button")].some(button=>button.textContent.trim()==="เริ่มใช้สัญญา" && !button.disabled)'),'successor activation button loaded');
        await clickText('เริ่มใช้สัญญา'); await click('dialog[open] button[type=submit]'); await waitText('เริ่มใช้สัญญาแล้ว');
        const successor=await prisma.lease.findUnique({where:{contractNo:closingNo+'-renew'}});
        const amendForm='form:has(input[name=endDate]):not(:has(select[name=kind]))';
        await select(amendForm+' select[name=leaseId]',successor.id); await fill(amendForm+' input[name=endDate]','1104-03-31'); await fill(amendForm+' input[name=reason]','แก้วันสิ้นสุดฉบับใหม่'); await submit(amendForm);
        await until(async()=>(await prisma.lease.findUnique({where:{id:successor.id}})).endDate?.toISOString().startsWith('1104-03-31'),'amendment UI saved');
        await login(userEmail); await navigate('/user/payments'); await waitText(closingNo); await waitText('คืนผู้เช่า'); assert.equal(await cdp.evaluate('!!document.querySelector("select[name=closeoutId]")'),false);
        await login(adminEmail);
    });
    await check('Admin can cancel an approved hold through the real confirmation dialog', async () => {
        const freeRoom=await prisma.room.findUnique({where:{propertyId_roomNumber:{propertyId:dormitory.id,roomNumber:'UI-EDIT-102'}}});
        await login(userEmail); await navigate('/rooms/'+freeRoom.id); await until(()=>cdp.evaluate('!!document.querySelector("input[name=startDate]")'),'booking form ready');
        await fill('input[name=startDate]','2027-01-01'); await fill('input[name=endDate]','2027-02-01'); await submit('form'); await waitText('ส่งคำขอเช่าเรียบร้อยแล้ว');
        const booking=await prisma.booking.findFirst({where:{roomId:freeRoom.id,userId:actualUser.id},orderBy:{id:'desc'}});
        await login(adminEmail); await navigate('/admin/bookings'); await waitText('UI-EDIT-102');
        const clickRow = () => cdp.evaluate(`(()=>{const row=[...document.querySelectorAll('tbody tr')].find(row=>row.innerText.includes(${JSON.stringify('#'+booking.id)})&&row.innerText.includes('UI-EDIT-102'));row.querySelector('button').click();})()`);
        await clickRow(); await click('dialog[open] button[type=submit]'); await until(async()=>(await prisma.booking.findUnique({where:{id:booking.id}})).status==='CONFIRMED','hold approved');
        await waitText('ยกเลิกการกันห้อง'); await clickRow(); await click('dialog[open] button[type=submit]'); await until(async()=>(await prisma.booking.findUnique({where:{id:booking.id}})).status==='CANCELLED','hold cancelled');
        assert.equal((await prisma.room.findUnique({where:{id:freeRoom.id}})).isAvailable,true);
    });
    await check('New Admin pages render actual data on mobile without page overflow', async () => {
        await viewport(390,844);
        for(const [route,label]of [['/admin/meters','บันทึกมิเตอร์'],['/admin/reports','รายงาน'],['/admin/audit','ประวัติ'],['/admin/announcements','ข่าวสาร'],['/admin/dormitory','นโยบาย']]) {
            await navigate(route); await waitText(label); await noOverflow(route);
        }
        await screenshot('admin-policy-mobile');
    });
    await check('Admin room details return to the original pagination page', async () => {
        await viewport(1440,1000);
        const existing=await prisma.room.count({where:{propertyId:dormitory.id}});
        if(existing<12)await prisma.room.createMany({data:Array.from({length:12-existing},(_,index)=>({propertyId:dormitory.id,roomNumber:'NAV-'+index,capacity:1,price:1000,type:'NON-AC'}))});
        await navigate('/admin/rooms'); await waitText('หน้า 1 / 2'); await clickText('ถัดไป'); await waitText('หน้า 2 / 2');
        const target=await cdp.evaluate('document.querySelector("tbody a").getAttribute("href")');
        await click('tbody a'); await until(()=>cdp.evaluate(`location.pathname === ${JSON.stringify(target)} && !!document.querySelector('.room-detail')`),'Admin room detail');
        await travel(-1); await waitText('หน้า 2 / 2'); await travel(1); await until(()=>cdp.evaluate('!!document.querySelector(".room-detail > a")'),'room detail forward');
        assert.equal(await cdp.evaluate('document.querySelector(".room-detail > a").getAttribute("href")'),'/admin/rooms');
        await click('.room-detail > a'); await waitText('หน้า 2 / 2'); assert.equal(await cdp.evaluate('location.pathname'),'/admin/rooms');
        await clickText('ก่อนหน้า'); await waitText('หน้า 1 / 2');
        await viewport(390,844);
    });
    await check('Closed room empty state also returns to the Admin source page', async () => {
        await viewport(1440,1000);
        const closed = await prisma.room.findUnique({where:{propertyId_roomNumber:{propertyId:dormitory.id,roomNumber:'NAV-0'}}});
        await prisma.room.update({where:{id:closed.id},data:{isActive:false}});
        await navigate('/admin/rooms'); await waitText('หน้า 1 / 2');
        const link='tbody a[href="/rooms/'+closed.id+'"]';
        if(!await cdp.evaluate(`!!document.querySelector(${JSON.stringify(link)})`)) { await clickText('ถัดไป'); await waitText('หน้า 2 / 2'); }
        const paging=await cdp.evaluate('document.querySelector(".table-toolbar p").innerText');
        await click(link); await waitText('ไม่พบห้องพักนี้');
        assert.equal(await cdp.evaluate('document.querySelector(".empty-state a").getAttribute("href")'),'/admin/rooms');
        await click('.empty-state a'); await waitText(paging); assert.equal(await cdp.evaluate('location.pathname'),'/admin/rooms');
        await prisma.room.update({where:{id:closed.id},data:{isActive:true}});
        await viewport(390,844);
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
    await check('React Bits respects reduced motion on load and while the Hero is animating', async () => {
        await navigate('/'); await waitText('ห้อง 101');
        assert.equal(await cdp.evaluate('import("/test/motion.tsx").then(module => module.checkFadeContent(true))'), true);
        assert.equal(await cdp.evaluate('import("/test/motion.tsx").then(module => module.heroMotionSettled())'), true);
        assert.equal(await cdp.evaluate('document.querySelector(".hero-brand-panel img").currentSrc.endsWith(".png")'), true);
        await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
        await until(() => cdp.evaluate('import("/test/motion.tsx").then(module => !module.heroMotionSettled())'), 'Hero fade starts after motion is enabled');
        await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        await until(() => cdp.evaluate('import("/test/motion.tsx").then(module => module.heroMotionSettled())'), 'Live reduced-motion change restores Hero visibility');
        await screenshot('react-bits-reduced-motion');
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
