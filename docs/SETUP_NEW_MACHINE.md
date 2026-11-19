# ติดตั้ง รัน และย้ายเครื่อง DORMIFY

รวมคู่มือ 18 พฤศจิกายน 2026 (Asia/Bangkok) ใช้ MySQL ผ่าน Docker ฐาน dormify เดียว ไม่มีขั้นตอนติดตั้ง SQLite หรือ Seed รุ่นเดิมแล้ว อ่าน [สถานะ](PROJECT_STATUS.md) ก่อนเสมอ

## เครื่องมือและโค้ด

- Git, Node.js 20.19 ขึ้นไป (ชุดงานนี้ใช้ Node 24), npm, Docker Desktop ที่เปิด Engine แล้ว
- Chrome เฉพาะทดสอบ UI, VS Code สำหรับพัฒนา อินเทอร์เน็ตสำหรับติดตั้งแพ็กเกจ/Docker image ครั้งแรก
- ไม่ต้องติดตั้ง MySQL/XAMPP แยก ใช้ compose.yaml ที่ตรึง MySQL 8.4 และ phpMyAdmin แบบ Local

เครื่องเดิมต้องส่งงานล่าสุดขึ้น GitHub ให้ครบก่อน Clone จึงจะได้งานใหม่ Git ไม่ส่ง .env/ฐานข้อมูลไปด้วย

```powershell
git clone https://github.com/eakm0nn/Dormify.git
cd Dormify
node --version
npm.cmd --version
git --version
docker version
```

PowerShell ใช้ npm.cmd เพื่อเลี่ยง Execution Policy ของ npm.ps1 ระบบอื่นใช้ npm ได้ ตรวจ docker version ต้องมี Server ไม่ใช่เพียง CLI

หาก Docker ติดตั้งรายผู้ใช้และ Terminal เก่าหาไม่เจอ เปิด Terminal ใหม่ หรือเพิ่ม PATH เฉพาะ Terminal:

```powershell
$env:Path = (Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin') + ';' + $env:Path
```

## ติดตั้งครั้งแรก

รันจาก Root:

```powershell
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd --prefix client ci
npm.cmd run setup
npm.cmd run db:up
npm.cmd run db:setup
npm.cmd --prefix server run db:check
npm.cmd --prefix server run admin:create
npm.cmd start
```

- ci ใช้ Lockfile ทั้งสามส่วน ไม่ติดตั้งรุ่นล่าสุดแทนเอง Prisma ตรึง 5.22.0
- setup สร้าง Root .env, server/.env และ client/.env สุ่มรหัส MySQL/JWT Secret ไม่แสดงค่าและรักษาค่าที่มีอยู่ ตัวอย่าง Frontend/Backend เป็นคำอธิบาย ไม่ใช่ค่าจริงของเครื่อง
- db:setup Generate Client และ migrate deploy จาก SQL ที่มี 7 Migrations รวม 30 Models ไม่มี Reset/Seed/Test/Shadow database
- Admin CLI ถามอีเมล ชื่อ รหัสอย่างน้อย 12 ตัวอักษร/ไม่เกิน 72 UTF-8 bytes ซ่อนรหัส ไม่มี Default account และไม่ยกสิทธิ์อีเมลเดิม สมัครทั่วไปได้เฉพาะ USER
- เว็บ http://127.0.0.1:5173 และ API http://127.0.0.1:5000 เปิดเฉพาะ Local loopback

ฐานใหม่ไม่มีหอ/ห้อง/ผู้เช่าอัตโนมัติ เพิ่มผ่าน Admin ตาม [คู่มือ](ADMIN_MANUAL.md) หากต้องการข้อมูลเดิมต้องนำเข้าฐานแยก ไม่เริ่มฐานว่างแทนโดยไม่ตรวจ

## เปิดงานประจำและรับโค้ดใหม่

```powershell
npm.cmd run db:up
npm.cmd start
```

Ctrl+C หยุดเว็บ/API แต่ MySQL ยังอยู่ Root start/dev ใช้ node กับ Backend ไม่ Restart เมื่อแก้ไฟล์ ถ้าพัฒนาต่อเปิดสอง Terminal:

```powershell
npm.cmd --prefix server run dev
npm.cmd --prefix client run dev
```

เมื่อรับ Schema/Migration ใหม่ **หยุด Backend ก่อน db:setup** โดยเฉพาะ Windows ที่ล็อก Prisma Engine อัปเดตด้วย ci หาก Lockfile เปลี่ยน ไม่ใช้ db push/reset/migrate dev ข้ามประวัติ

## ดูฐานข้อมูล

| เครื่องมือ | เปิด/เข้าใช้งาน | ข้อควรทราบ |
|---|---|---|
| Prisma Studio | npm.cmd run db:studio → http://127.0.0.1:5555 | ใช้ server/.env เปิด Terminal ค้างไว้ Ctrl+C หยุด |
| phpMyAdmin | npm.cmd run db:admin → http://127.0.0.1:8080 | User dormify_app; รหัส MYSQL_PASSWORD จาก Root .env ไม่ใช่รหัส Admin เว็บ |
| Workbench/DBeaver | Host 127.0.0.1, Port 3306 หรือ MYSQL_PORT, Database dormify, User dormify_app | ใช้รหัส MySQL ของเครื่อง พอร์ตนี้ไม่ใช่ HTTP |

phpMyAdmin ตั้ง Server เป็น mysql ใน Docker ไม่มี Auto-login หรือฝัง Root password เครื่องมือทั้งหมดแก้/ลบข้อมูลจริงและข้าม Validation เว็บ เพิ่มห้อง/บัญชี/การเงินผ่านเว็บหรือ CLI ที่กำหนด อย่ากรอกรหัสผ่านธรรมดาลง User และอย่าแก้โครงสร้างจน Schema/Migration ไม่ตรง

```powershell
npm.cmd run db:status
npm.cmd run db:admin:stop
npm.cmd run db:stop
```

admin:stop หยุดเฉพาะ phpMyAdmin; db:stop หยุด phpMyAdmin/MySQL ไม่ลบ Volume; db:up เปิดเฉพาะ MySQL

## Environment และแก้ปัญหา

- Root .env คุม Compose, server/.env ใช้ DATABASE_URL/JWT_SECRET, client/.env ใช้ VITE_API_URL ห้ามใส่รหัสฐานหรือ Secret ใน VITE_* เพราะเว็บอ่านได้
- Access denied 1045: ตรวจบัญชี/รหัส .env ตัวจริง ไม่ใช่ .env.example ล้างรหัสเก่าที่ Browser เติม ตรวจ DATABASE_URL ให้ Host/Port/รหัสตรงกัน การแก้ .env ไม่เปลี่ยนรหัสใน Volume เดิม ต้องซิงก์บัญชีฐานให้ถูกต้องแล้ว Restart **ห้ามลบ Volume เพื่อแก้รหัส**
- พอร์ตชน: ตรวจโปรแกรมเดิมก่อน MYSQL_PORT/PHPMYADMIN_PORT อยู่ใน Root .env เปลี่ยนแล้วปรับ URL ฝั่ง Server ให้ตรง ไม่เปิด Public interface
- ถ้าพบ URL แบบ file: หรือ server/prisma/dev.db สคริปต์หยุดรักษาข้อมูล ต้องตรวจ Mapping/นำเข้า/กระทบยอดก่อน ไม่ย้ายไฟล์หลบ Guard หรือ Reset
- ทะเบียนหอผูก Property เดิมอัตโนมัติเฉพาะพบหนึ่งแห่ง หากหลายแห่งจะไม่เดา ต้องตรวจข้อมูลเดิมก่อน ไม่ใช้ VITE_DORMITORY_ID ข้าม Backend หอเดียว และไม่ต้องตั้ง DORMIFY_INSTALLATION_KEY ในการใช้ปกติ
- ใบปรับเก่า itemType/refundEligible เป็น NULL ต้องตรวจหลักฐาน ไม่เติม true อัตโนมัติ

## ย้ายข้อมูลไปเครื่องอื่น

ข้อมูลอยู่ใน Named volume dormify_mysql_data รวมรูปห้อง/หลักฐานใน MySQL หยุดหรือสร้าง Container ใหม่ด้วย Volume เดิมไม่ทำให้หาย ห้ามลบ Volume หรือ docker compose down -v

Git ส่ง Source/Compose/Schema/Migrations ไม่ส่งฐาน .env หรือรหัส Admin ย้ายข้อมูลด้วย Export/Import ผ่านช่องทางส่วนตัว ตรวจจำนวน/ยอด/ความสัมพันธ์ก่อน–หลัง ไม่ Import ทับฐานที่มีข้อมูลโดยไม่ตรวจ ไม่ Commit dump/สลิป/Secret ไม่มีระบบ Sync อัตโนมัติ

สำรอง SQLite/Environment เก่าที่ Ignore ยังอาจอยู่ ห้ามสรุปว่าฐานนั้นว่างตามผลเก่าของอีกเครื่อง ประวัติวันที่ 13–14 พฤศจิกายนอยู่ใน WORK_LOG.md

## ส่งและรับงานผ่าน GitHub

ตรวจรายการก่อนทำคำสั่งส่งงาน ไม่ Commit/Push อัตโนมัติเมื่อผู้ใช้ไม่ได้สั่ง:

```powershell
npm.cmd run check:delivery
git status
git diff --stat
git add .
git diff --cached --stat
git status
git commit -m "Update Dormify and project documentation"
git push -u origin main
```

add . รวมไฟล์ใหม่ที่ไม่ Ignore ด้วย ห้าม add -f ไฟล์ลับ ถ้า Git ขอ Login ใช้บัญชีที่มีสิทธิ์ของตน ไม่ส่ง Token/รหัสในแชท ถ้าไม่ใช่ Fast-forward ให้ตรวจ/รวมงานทั้งสองฝั่ง ไม่ Force Push หรือ Reset ทิ้งงาน

สำเนาที่ Clone หลังเริ่มประวัติ main ใหม่วันที่ 13 พฤศจิกายนและ Working Tree สะอาด ใช้:

```powershell
git status
git pull --ff-only origin main
```

สำเนาก่อนเริ่ม main ใหม่ควร Clone โฟลเดอร์ใหม่ ไม่ Merge/Rebase ประวัติเก่ากลับ ตรวจงานค้าง .env/ฐานของสำเนาเก่าก่อนเปลี่ยน เครื่องที่มี origin แล้วไม่ต้อง git init/remote add ซ้ำ

ก่อนย้ายเครื่องอัปเดต PROJECT_STATUS/WORK_LOG ตรวจส่งไฟล์ใหม่ครบและ Push สำเร็จ แล้วอ่านสองไฟล์นี้ที่เครื่องปลายทางก่อนพัฒนาต่อ

## ทดสอบ

เปิด MySQL/db:setup ให้พร้อม หยุดใช้งานจริงชั่วคราว รัน API ก่อน UI ตามลำดับ ห้ามรันคู่กันหรือระหว่างแก้ข้อมูลจริง:

```powershell
npm.cmd run check:delivery
npm.cmd --prefix server test
npm.cmd --prefix client run test:ui
npm.cmd --prefix client test
npm.cmd --prefix client run lint
npm.cmd --prefix client run format:check
npm.cmd --prefix client run build
npm.cmd --prefix server run db:check
```

Fixture namespace สุ่มอยู่ใน dormify เดียว ลบเฉพาะของตนและเทียบ Hash ข้อมูลเดิมครบ 30 Models หากมีคนนอกเชื่อมข้อมูล/Cleanup ไม่ผ่านให้ตรวจและหยุด ไม่ล้างตาราง Chrome พาธต่างตั้ง CHROME_PATH ผล/ภาพใน client/.ui-artifacts/ ที่ Ignore

ผลที่ผ่านมาอ่าน [TEST_RESULTS.md](TEST_RESULTS.md) แบบตรวจเครื่องอื่นจริงอยู่ใน [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) Build เครื่องเดิมไม่ยืนยันการติดตั้งอีกเครื่อง
