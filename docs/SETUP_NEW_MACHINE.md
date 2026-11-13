# DORMIFY — เปิดโปรเจกต์และทำงานต่อบนเครื่องใหม่

อัปเดต: 13 พฤศจิกายน 2026 (Asia/Bangkok)
คำสั่งด้านล่างสำหรับ Windows/PowerShell และรันจาก Root ของ Repository
ใช้พาธเทียบจาก Root ไม่ผูกกับชื่อผู้ใช้หรือโฟลเดอร์ของเครื่องเดิม

## 1. รับโค้ดและบันทึกให้ครบ

อ่าน [PROJECT_STATUS.md](PROJECT_STATUS.md), [WORK_LOG.md](WORK_LOG.md) และ [BUSINESS_RULES.md](BUSINESS_RULES.md) ก่อน

ผู้ใช้สั่งให้เริ่มประวัติ main ใหม่วันที่ 13 พฤศจิกายน 2026 ดูสถานะการส่งใน PROJECT_STATUS.md
ส่ง Snapshot 4450c62 สำเร็จแล้ว ให้ใช้ main ล่าสุดที่รวมบันทึกผลตามมาด้วย
เมื่อส่งประวัติใหม่สำเร็จแล้ว สำเนาที่มีประวัติก่อนหน้านี้ให้ Clone main ลงโฟลเดอร์ใหม่ ไม่ Pull/Merge ประวัติเก่ากลับเข้ามา
ตัวอย่างคำสั่งอยู่ใน GITHUB_WORKFLOW.md; สำเนาที่ Clone หลังเริ่มประวัติใหม่แล้วจึงใช้ Pull ตามปกติได้
หากมีการทำงานเพิ่มหลังจากนั้น ให้ตรวจว่างานที่เปลี่ยนและไฟล์ใหม่ได้รับการ Commit/Push หรือส่งต่อครบก่อนสลับเครื่อง
ตรวจ Git status ทั้งสองฝั่ง และตรวจว่ามีไฟล์บันทึก/Hook/Components/Tests/Schema ล่าสุดก่อนเริ่ม

Remote ของสำเนาปัจจุบันตั้งไว้แล้ว ดูวิธี Commit/Push และ Clone/Pull ใน [คู่มือ GitHub](GITHUB_WORKFLOW.md)

node_modules, dist, .ui-artifacts, .env และฐาน SQLite ถูก Ignore จึงไม่ตามไปกับ Git
หากต้องใช้ข้อมูลเดิม ให้สำรองและย้าย SQLite แยกต่างหากโดยหยุด Backend ก่อน ไม่คัดลอกเฉพาะไฟล์ db ระหว่างที่ยังมีการเขียน
ไฟล์แนบจริงในอนาคตต้องสำรอง/ย้ายพร้อมฐานข้อมูลที่สอดคล้องกัน

## 2. เครื่องมือและ Dependencies

ต้องมี Node.js, npm และ Git; ผลทดสอบก่อนหน้าใช้ Node 24.18.0 และ npm 11.16.0
Chrome จำเป็นเฉพาะเมื่อรันทดสอบหน้าจอ ไม่จำเป็นต่อการ Build

```powershell
node --version
npm --version
git --version
npm ci
npm --prefix server ci
npm --prefix client ci
```

มี Lockfile แยกสามส่วน ให้ใช้ npm ci เพื่อได้แพ็กเกจตามชุดที่บันทึกไว้
Prisma ฝั่ง Server ตรึง 5.22.0; ไม่เรียกติดตั้ง Prisma รุ่นล่าสุดแทนโดยพลการ
ถ้า PowerShell ปฏิเสธ npm.ps1 ให้ใช้ npm.cmd แทน npm ในทุกคำสั่ง ไม่ต้องลด Execution Policy

## 3. Environment ของเครื่องนี้

คัดลอกเฉพาะเมื่อไฟล์ยังไม่มี:

```powershell
if (!(Test-Path -LiteralPath server/.env)) { Copy-Item -LiteralPath server/.env.example -Destination server/.env }
if (!(Test-Path -LiteralPath client/.env)) { Copy-Item -LiteralPath client/.env.example -Destination client/.env }
```

ตรวจ server/.env:

- DATABASE_URL ใช้ file:./dev.db สำหรับ SQLite ปัจจุบัน
- PORT ใช้ 5000 และ CLIENT_ORIGIN ใช้ http://127.0.0.1:5173
- JWT_SECRET ต้องเป็นค่าสุ่มเฉพาะเครื่องอย่างน้อย 32 ตัวอักษร ไม่ใช่ค่าว่างหรือ Placeholder

สร้างค่าสุ่มใน Terminal ของตนเองแล้วนำไปใส่ JWT_SECRET ได้ด้วย:

```powershell
node -p "require('node:crypto').randomBytes(48).toString('hex')"
```

อย่าใส่ค่าที่สร้างใน Work log แชต Source หรือ Git; หากเปลี่ยน Secret ต้องเข้าสู่ระบบใหม่
ตรวจ client/.env ให้ VITE_API_URL เป็น http://127.0.0.1:5000
ถ้ามีหลายหอในฐานเดิม ให้กำหนด VITE_DORMITORY_ID เป็น ID ของหอที่ต้องการแสดง; ถ้ามีหอเดียวไม่ต้องกำหนด
ห้ามใส่ JWT_SECRET หรือรหัสฐานข้อมูลในตัวแปร VITE_* เพราะ Frontend อ่านได้

## 4. ฐานข้อมูลและ Admin

หยุด Backend ก่อน Generate/Setup โดยเฉพาะ Windows ที่ Process เดิมอาจล็อก Prisma Engine
ถ้าใช้ข้อมูลเดิมให้สำรองก่อน แล้วรัน:

```powershell
npm --prefix server run db:setup
```

คำสั่งสร้างฐานใหม่เมื่อยังไม่มี ไม่ Reset/Seed ฐานเดิม และตรวจเลขห้องซ้ำก่อนเพิ่ม Unique Constraint
หากพบเลขห้องซ้ำจะหยุดให้แก้ข้อมูล ไม่เพิ่ม --accept-data-loss หรือ --force-reset เพื่อข้าม
ฐานเริ่มใหม่ไม่มีผู้ใช้ ห้อง หรือบัญชี Admin จำลอง

สร้าง Admin เฉพาะเมื่อยังไม่มีบัญชีที่จะใช้:

```powershell
npm --prefix server run admin:create
```

กรอก Email ชื่อ และรหัสผ่านใน Terminal; รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษรและไม่เกิน 72 UTF-8 bytes
ไม่มีบัญชี Default และ Script ไม่ยกสิทธิ์หรือเขียนทับบัญชีที่มี Email เดิม
ดูรายละเอียดใน [PHASE1_AUTH.md](PHASE1_AUTH.md)

## 5. เปิดระบบ

```powershell
npm run dev
```

- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:5000
- หยุดด้วย Ctrl+C

Root dev เรียก start และเปิดทั้งสองส่วน แต่ Backend ยังไม่ Restart เมื่อแก้ไฟล์
ถ้าต้องการ Restart Backend อัตโนมัติ ให้ใช้สอง Terminal แทน:

```powershell
npm --prefix server run dev
```

```powershell
npm --prefix client run dev
```

เข้าสู่ระบบเป็น Admin แล้วบันทึกข้อมูลหอพักและห้องจริงหากเริ่มจากฐานว่าง
หน้าเว็บที่ยังไม่มีข้อมูลจะแสดง Empty state ไม่เติม Mock Data ให้อัตโนมัติ

## 6. ตรวจสอบบนเครื่องใหม่

```powershell
npm --prefix server test
npm --prefix client test
npm --prefix client run lint
npm --prefix client run format:check
npm --prefix client run build
node client/scripts/ui-smoke.mjs
```

ชุดทดสอบ API/UI ใช้ SQLite ชั่วคราวแยกจากฐานใช้งาน
UI Test ใช้ Chrome ที่ติดตั้งไว้ หากพาธไม่ตรงให้กำหนด CHROME_PATH เป็นพาธไฟล์ Chrome ของเครื่องนั้น
ผลภาพและ results.json อยู่ใน client/.ui-artifacts/ ไม่ตาม Git จึงควรรันทดสอบใหม่และบันทึกผลของเครื่องใหม่ตามจริง
การทดสอบเดิมผ่าน 21 Backend Tests, 3 Frontend unit Tests และ 17 Chrome กลุ่ม แต่ไม่รับรองสภาพเครื่องใหม่โดยยังไม่รัน

## 7. เริ่มงานต่อและส่งต่อครั้งถัดไป

- ยึดกติกา 14 ข้อและสถานะข้อ 3/6/9 ที่ยังรอยืนยัน ไม่เปิดค่าข้อเสนอเอง
- อ่านงานค้างใน PROJECT_STATUS.md แล้วทำตามขอบเขตที่ผู้ใช้สั่งล่าสุด
- อัปเดต WORK_LOG.md และ PROJECT_STATUS.md ทุกครั้งที่มีการเปลี่ยนแปลงสำคัญ พร้อมบอกผลตรวจจริง
- ถ้าเปลี่ยนวิธีรัน/ตั้งค่า/ฐานข้อมูล ให้แก้คู่มือนี้ด้วย
- ก่อนย้ายเครื่องตรวจว่างานที่แก้และไฟล์ใหม่ถูกส่งไปครบ โดยแยก Secret/ข้อมูลจริงออกจาก Source
