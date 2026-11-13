# DORMIFY — เปิดโปรเจกต์บนเครื่องใหม่

อัปเดต 13 พฤศจิกายน 2026 (Asia/Bangkok)
อ่าน [สถานะ](PROJECT_STATUS.md), [บันทึกงาน](WORK_LOG.md), [กติกา](BUSINESS_RULES.md) และตรวจ Git status ก่อนเริ่ม
งานย้าย MySQL รอบนี้ยังไม่ Commit/Push ต้องส่งโค้ดและเอกสารให้ครบก่อนสลับเครื่อง
สำเนาที่มีประวัติก่อนเริ่ม main ใหม่วันที่ 13 พฤศจิกายน ให้ Clone ใหม่ตาม [คู่มือ GitHub](GITHUB_WORKFLOW.md)

## เครื่องมือและติดตั้ง

ต้องมี Git, Node.js/npm, Docker Desktop ที่เปิด Engine แล้ว และ Chrome เฉพาะทดสอบหน้าจอ
เครื่องนี้ตรวจด้วย Windows, Node 24.15.0, npm 11.12.1, Docker Engine 29.7.2, Compose 5.5.1
รันจาก Root ใช้ npm.cmd บน PowerShell เพื่อเลี่ยง npm.ps1 ระบบอื่นใช้ npm ได้

~~~powershell
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd --prefix client ci
npm.cmd run setup
npm.cmd run db:up
npm.cmd run db:setup
npm.cmd --prefix server run db:check
~~~

ใช้ Lockfile ทั้งสามส่วน Prisma ตรึง 5.22.0 ไม่ติดตั้งรุ่นล่าสุดแทนเอง
การลบใบอนุญาตใน node_modules ที่เคยสั่งเป็นสถานะเฉพาะเครื่อง npm ci สร้างกลับตามแพ็กเกจ ไม่มีระบบลบอัตโนมัติ

## Environment และฐานข้อมูล

setup สร้าง Root .env, server/.env, client/.env พร้อมสุ่มรหัสผ่าน/JWT Secret ไม่แสดงค่าและไม่ทับค่าที่มีอยู่
รูปแบบอยู่ใน .env.example ของแต่ละส่วน ค่าจริงห้ามใส่ในแชต บันทึก หรือ Git
ห้ามใส่รหัสฐาน/JWT_SECRET ใน VITE_* เพราะ Frontend อ่านได้

Compose ใช้ MySQL 8.4 ตรึง digest พอร์ต 127.0.0.1:3306 ฐาน dormify บัญชีแอป dormify_app แยกจาก Root
db:setup สร้าง Prisma Client และใช้ migrate deploy ไม่ Reset/Seed หรือสร้าง Test/Shadow database
หยุด Backend ก่อน db:setup โดยเฉพาะ Windows ที่อาจล็อก Prisma Engine

หากพอร์ตชน ตั้ง MYSQL_PORT ใน Root .env ก่อน setup ครั้งแรก
หาก DATABASE_URL เดิมไม่ตรง Compose สคริปต์หยุดให้ตรวจเอง ไม่เขียนทับ
หากพบ SQLite เดิม (file: URL หรือ server/prisma/dev.db) สคริปต์หยุดรักษาข้อมูล ต้องวางแผนนำเข้าก่อน ไม่มีการนำเข้าอัตโนมัติ
หากมีหลายหอในข้อมูลเดิม ตั้ง VITE_DORMITORY_ID ใน client/.env เป็นหอที่ต้องการ

## สร้าง Admin และเปิดระบบ

~~~powershell
npm.cmd --prefix server run admin:create
npm.cmd run dev
~~~

กรอกอีเมล ชื่อ และรหัสผ่านอย่างน้อย 12 ตัวอักษร ไม่เกิน 72 UTF-8 bytes ใน Terminal
ไม่มีบัญชี Default ไม่ยกสิทธิ์/เขียนทับอีเมลเดิม จากนั้นเข้าสู่ระบบ Admin เพื่อบันทึกข้อมูลหอพักและห้องจริง

- เว็บ http://127.0.0.1:5173
- API http://127.0.0.1:5000
- Ctrl+C หยุดเว็บ/API ส่วน MySQL ยังทำงาน

Root dev เปิดสองส่วน แต่ Backend ใช้ node จึงไม่ Restart เมื่อแก้ไฟล์
ถ้าต้องการ Restart เปิดสอง Terminal ด้วย npm.cmd --prefix server run dev และ npm.cmd --prefix client run dev

## การเก็บข้อมูลและข้ามเครื่อง

ดูตารางผ่านเบราว์เซอร์ได้ด้วย npm.cmd run db:studio จาก Root แล้วเปิด http://127.0.0.1:5555 และเปิด Terminal นี้ค้างไว้ กด Ctrl+C เพื่อหยุด Studio
MySQL พอร์ต 3306 เป็นการเชื่อมต่อฐานข้อมูลโดยตรง ไม่ใช่ HTTP และยังไม่มี phpMyAdmin
หากใช้ Workbench/DBeaver ให้ตั้ง Host 127.0.0.1, Port ตาม MYSQL_PORT (ปกติ 3306), Database dormify, User dormify_app และใช้รหัสจาก MYSQL_PASSWORD ใน Root .env ของเครื่องตนเอง ไม่ใช้รหัสผ่านบัญชี Admin ของเว็บ
Studio ใช้ค่าฝั่ง Server โดยอัตโนมัติ ไม่ต้องคัดลอกรหัสผ่าน และแก้ไข/ลบข้อมูลจริงได้ จึงตรวจรายการก่อนบันทึก

~~~powershell
npm.cmd run db:status
npm.cmd run db:stop
npm.cmd run db:up
~~~

ข้อมูลอยู่ใน Named volume dormify_mysql_data ไม่หายเมื่อหยุด/สร้าง Container ใหม่ ห้ามลบ Volume หรือใช้ docker compose down -v เพื่อแก้การติดตั้ง
ค่า MYSQL_* ใช้ตอนเริ่ม Volume ครั้งแรก การแก้รหัสใน .env ไม่เปลี่ยนรหัสในฐานเดิม
Compose/Schema/Migrations ตาม Git แต่ Volume และ .env ไม่ตาม Git ไม่ใช่ระบบ Sync
หากต้องการข้อมูลเดิม ต้องย้าย MySQL/ไฟล์แนบด้วย Export/Import ที่กระทบยอดแยกก่อน ไม่เริ่มฐานว่างแทนโดยพลการ

## ตรวจสอบ

เปิด MySQL และทำ db:setup ก่อน หยุดการใช้งานจริงชั่วคราว รัน API/UI ตามลำดับ:

~~~powershell
npm.cmd --prefix server test
npm.cmd --prefix client run test:ui
npm.cmd --prefix client test
npm.cmd --prefix client run lint
npm.cmd --prefix client run format:check
npm.cmd --prefix client run build
npm.cmd --prefix server run db:check
~~~

API/UI ใช้ Fixture namespace สุ่มใน dormify เดียว ลบเฉพาะข้อมูลที่สร้างเอง และเทียบแฮชข้อมูลเดิมเจ็ดตาราง ไม่ Reset/Seed/สร้างฐานเพิ่ม
หากมีข้อมูลอื่นเชื่อมเข้า Fixture จะหยุดลบเพื่อรักษาข้อมูล
Fixture มองเห็นระหว่างทดสอบ ถ้า Process ถูกบังคับหยุดให้ตรวจ namespace ที่ค้าง ไม่ล้างตารางทั้งหมด
ห้ามรัน API/UI พร้อมกันหรือระหว่างคนแก้ข้อมูล เพราะการตรวจข้อมูลเดิมจะรายงานความเปลี่ยนแปลงนั้นด้วย
UI ใช้ Chrome ที่ติดตั้ง หากพาธต่างตั้ง CHROME_PATH ผลอยู่ใน client/.ui-artifacts/ ไม่ตาม Git

ผลเครื่องนี้: Backend 23/23, Frontend 3/3, Chrome 17 กลุ่ม, Lint/Format/Build ผ่าน ต้องทดสอบใหม่บนเครื่องใหม่
อัปเดต WORK_LOG/PROJECT_STATUS ทุกครั้งตาม AGENTS.md ระบบสัญญา/มิเตอร์/บิล/การเงินยังต้องพัฒนาต่อ ข้อ 3/6/9 ยังรอยืนยัน
