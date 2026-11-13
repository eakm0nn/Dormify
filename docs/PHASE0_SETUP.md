# DORMIFY — Phase 0 Local Development

> เอกสารนี้เป็นประวัติ Phase 0 บน SQLite ปัจจุบันย้ายเป็น MySQL ผ่าน Docker แล้ว ให้ใช้ [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md) และ [สถานะล่าสุด](PROJECT_STATUS.md) สำหรับติดตั้ง/รันจริง

วันที่ตรวจสอบ: 12 พฤศจิกายน 2026 (Asia/Bangkok)

## ขอบเขต

เตรียมระบบให้รันบน Local ด้วย JavaScript, React, Vite, Express, Prisma 5 และ SQLite
ยังไม่ย้าย TypeScript/MySQL ไม่เปลี่ยน Schema และไม่เพิ่มฟีเจอร์ DORMIFY หรือออกแบบ UI ใหม่

## เครื่องมือที่ทดสอบจริง

- Windows / PowerShell
- Node.js 24.18.0
- npm 11.16.0
- Git 2.54.0.windows.1
- Prisma CLI และ Client 5.22.0
- Vite 5.4.21

เครื่องนี้มีเครื่องมือครบ ไม่ต้องติดตั้ง Node/npm/Git เพิ่ม ใช้ `npm.cmd` แทน `npm`
เพราะ PowerShell Execution Policy ปฏิเสธ `npm.ps1` โดยไม่ต้องลดระดับ Execution Policy

## การติดตั้งบนเครื่องใหม่

รันจาก Root ของ Repository:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd --prefix client ci
```

มี Lockfile แยก Root/Server/Client ไม่ได้ใช้ npm workspaces อย่าเรียก Prisma รุ่นล่าสุดจาก Root
Root ไม่มี Prisma แล้ว ฝั่ง Server ตรึง CLI และ Client เป็น 5.22.0 เท่ากัน

หาก npm รุ่นใหม่แจ้งว่าไม่รัน install scripts ของ Prisma/esbuild โดยอัตโนมัติ ให้ตรวจสอบแพ็กเกจ
ก่อนอนุญาตเฉพาะรายการนั้น ไม่เปิดให้ทุกแพ็กเกจรัน Script โดยไม่ตรวจสอบ
ในการเตรียมครั้งนี้ Generate Prisma แยกเอง และทดสอบ Build ด้วย esbuild ผ่านแล้ว

สร้าง Environment เฉพาะเมื่อยังไม่มีไฟล์อยู่ (อย่าเขียนทับ Secret เดิม):

```powershell
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
if (!(Test-Path client/.env)) { Copy-Item client/.env.example client/.env }
```

ตั้ง `server/.env`:

```dotenv
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="ใส่ค่าสุ่มอย่างน้อย 32 ตัวอักษร"
CLIENT_ORIGIN="http://127.0.0.1:5173"
```

สร้างค่าสุ่มสำหรับใส่ JWT_SECRET บนเครื่องของตนเองได้ด้วย:

```powershell
node -p "require('node:crypto').randomBytes(48).toString('hex')"
```

ไม่ส่ง Secret ในแชต ไม่ใส่ใน `VITE_*` และไม่ Commit `.env`
การเตรียมครั้งนี้สร้าง Secret แบบสุ่มและเขียนเข้า `server/.env` โดยไม่แสดงค่าแล้ว
Server โหลด `.env` ก่อน Controllers และจะไม่เริ่มทำงานถ้า Secret ว่าง สั้น หรือเป็น Placeholder เดิม

ตั้ง `client/.env`:

```dotenv
VITE_API_URL="http://127.0.0.1:5000"
```

## เตรียม SQLite

```powershell
npm.cmd --prefix server run db:setup
```

สคริปต์นี้ใช้ Schema เดิมและทำ Generate + db push ไม่รัน Seed หรือ Reset
ตรวจไฟล์ก่อนสร้างและใช้ `flag: wx` เพื่อไม่เขียนทับไฟล์เดิม ไม่ใช้ `--accept-data-loss`
หาก Prisma แจ้งว่าข้อมูลอาจสูญหาย ให้หยุดและตรวจ/สำรองก่อน ไม่เพิ่ม Flag ข้ามคำเตือน

`file:./dev.db` อ้างอิงจาก `server/prisma/schema.prisma` จึงได้ไฟล์ `server/prisma/dev.db`
Prisma 5 บนเครื่องนี้รายงาน `Schema engine error` เมื่อไฟล์ไม่มีอยู่ แต่ทำงานได้หลังสร้างไฟล์เปล่า
สคริปต์จัดการกรณีนี้แล้ว การเรียกซ้ำกับฐานที่สร้างไว้ผ่านโดยไม่ Reset

**อัปเดตหลังเก็บกวาดโปรเจกต์:** นำ `npm run seed`, `server/prisma/seed.js` และ `server/test_seed.js` ออกแล้ว
สคริปต์เดิมลบข้อมูลก่อนสร้างข้อมูลตัวอย่าง และไม่ได้ถูกรันใน Phase 0 ให้ใช้ `db:setup` และ `admin:create` แทน

## เปิดระบบ

จาก Root:

```powershell
npm.cmd start
```

- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:5000
- หยุดด้วย Ctrl+C

หรือเปิดคนละ Terminal ด้วย `npm.cmd --prefix server start` และ `npm.cmd --prefix client run dev`
Backend และ Vite ผูกกับ `127.0.0.1` โดยตรง Frontend ใช้ strictPort เพื่อไม่เลื่อนไปพอร์ตอื่นเงียบ ๆ
เปิดหน้าเว็บด้วย URL ด้านบนเพื่อให้ตรง CORS ไม่ใช้ `--host 0.0.0.0`, Tunnel หรือ Port Forwarding
การตั้งค่านี้สำหรับการพัฒนา Local ไม่ใช่การเตรียม Deploy สู่ Public Internet

## บัญชีและสิทธิ์ใน Phase 0

- ฐาน Local เริ่มว่าง ไม่มีบัญชี Admin/Owner/Tenant จาก Seed
- สมัครผ่านหน้าเดิมได้เป็น Tenant หรือ Owner ตามระบบรุ่นก่อน
- ถ้าไม่ส่ง role จะเป็น TENANT; Public API ไม่ยอมรับ ADMIN
- ยังไม่เปลี่ยนบทบาทเป็น Admin/User ของ DORMIFY ในระยะนี้
- การทดสอบ Admin สร้าง Fixture ผ่าน Prisma เฉพาะฐานทดสอบชั่วคราว ไม่มี Admin ถูกสร้างในฐาน Local
- Tenant ถูกปฏิเสธจาก API ฝั่งเจ้าของ และ Owner เข้าถึงห้อง/การจองของคนอื่นไม่ได้
- Admin อ่านรายการจองทั้งหมดได้ ไม่ถูกกรองด้วย ownerId ของ Admin
- สถานะการจองรับเฉพาะ CONFIRMED, REJECTED หรือ CANCELLED

## คำสั่งตรวจสอบ

```powershell
npm.cmd --prefix server test
npm.cmd --prefix client run build
git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --check
```

ชุดทดสอบใช้ Node test runner, HTTP Server บน loopback พอร์ตชั่วคราว และ SQLite แยกใน
โฟลเดอร์ชั่วคราว `dormify-phase0-*` ของระบบ ไม่เรียก Seed/Reset และไม่ชี้ไปที่ `dev.db`
ไฟล์ทดสอบชั่วคราวอาจยังอยู่หลังรันทดสอบ แต่ใช้ข้อมูลสมมติและรหัสผ่านสุ่มเท่านั้น

`.gitignore` ป้องกัน `.env`, SQLite รวม journal/wal/shm, node_modules และ dist
ยังอนุญาตให้ Commit `.env.example` ที่ไม่มี Secret จริง

ผลการทดสอบและข้อจำกัด: [PHASE0_TEST_RESULTS.md](PHASE0_TEST_RESULTS.md)
