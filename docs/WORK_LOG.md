# DORMIFY — บันทึกการทำงาน

ใช้ร่วมกับ [สถานะล่าสุด](PROJECT_STATUS.md) และ [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)
เพิ่มรายการใหม่ไว้ด้านบนของส่วนประวัติ ไม่แก้ผลทดสอบเก่าให้ดูเหมือนเพิ่งรัน
รายการตั้งต้นด้านล่างสรุปย้อนหลังจากงานและผลเครื่องมือในบทสนทนา ไม่ได้รันทดสอบใหม่เพื่อสร้างประวัติ

## รูปแบบรายการใหม่

```text
### YYYY-MM-DD — ชื่องาน (Asia/Bangkok)
- คำขอ/ขอบเขต:
- ทำแล้ว/การตัดสินใจ:
- ไฟล์สำคัญ:
- ตรวจสอบ: คำสั่งและผลจริง หรือระบุว่าไม่ได้รันพร้อมเหตุผล
- ข้อมูล/Environment/แพ็กเกจ: ผลกระทบและสิ่งที่ต้องเตรียมบนเครื่องใหม่
- งานค้าง/เริ่มต่อ:
```

## ประวัติ

### 2026-11-13 เวลา 18:37 — บันทึกงานเพื่อทำต่อ (Asia/Bangkok)

- คำขอ: ผู้ใช้ให้เซฟสิ่งที่ทำไว้
- บันทึกแล้ว: สรุปสถานะโค้ด MySQL ผ่าน Docker ฐาน dormify เดียว, Express/Prisma, สิทธิ์ ADMIN/USER, คำสั่งเปิดดูฐาน และคู่มือเริ่มใช้ Prisma ใน PROJECT_STATUS/WORK_LOG
- บริบทล่าสุด: ผู้ใช้ส่งภาพลิงก์พอร์ต 3306 จาก Docker จึงอธิบายว่าเป็น MySQL ไม่ใช่หน้าเว็บ; Prisma Studio ใช้พอร์ต 5555; phpMyAdmin เป็นทางเลือกที่อธิบายไว้ ยังไม่มีการติดตั้งหรือสั่งเปลี่ยน ORM
- เริ่มต่อ: อ่าน PROJECT_STATUS → WORK_LOG → BUSINESS_RULES ตรวจ Git status; ดู SETUP_NEW_MACHINE สำหรับเปิดระบบ และ PRISMA_START สำหรับการใช้ Prisma ไม่สมมติว่า Process ที่เปิดไว้ก่อนหน้ายังทำงาน
- หลักฐานเดิม: ผล Backend 23/23, UI 17 กลุ่ม, Frontend unit 3/3, Lint/Format/Build ผ่านอยู่ในรายการย้าย MySQL ก่อนหน้า รอบนี้ไม่ได้รันซ้ำและไม่อ้างเป็นผลตรวจใหม่
- ตรวจรอบนี้: อ่าน Working Tree/คู่มือจริง ตรวจ git diff --check และลิงก์เอกสารที่ใช้ส่งต่องาน
- ผลต่อข้อมูล/Environment: แก้เอกสารเท่านั้น ไม่แก้ฐาน/Secrets/Dependencies ไม่สร้าง ZIP หรือสำเนาเพิ่ม
- Git: งานยังอยู่ Local และยังไม่ Commit/Push ตามขอบเขตคำขอเซฟงาน หากย้ายเครื่องต้องส่งโค้ด/ไฟล์ใหม่ให้ครบ ส่วน .env และข้อมูลใน Volume ไม่ตาม Git
- งานค้าง: ผู้ใช้สร้าง Admin/ข้อมูลหอจริงตามจำเป็น แล้วทำระบบจัดการหอ/ห้อง ผู้เช่า/สัญญา มิเตอร์/บิล การเงินและระบบประกอบต่อ; เป้าหมาย Admin 13 + User 12 ข้อยังไม่ครบ และข้อ 3/6/9 ยังรอยืนยัน

### 2026-11-13 — คู่มือเริ่มใช้ Prisma สำหรับผู้เริ่มต้น (Asia/Bangkok)

- คำขอ: ผู้ใช้ไม่เคยใช้ Prisma และถามว่าต้องทำอะไรบ้าง
- ตรวจจริง: อ่าน Package scripts, Schema, Prisma Client กลาง, Setup และ Controller/Routes ของระบบปัจจุบัน ยืนยัน CLI/Client 5.22.0, CommonJS, MySQL และ migrate deploy ตามโค้ด
- ทำแล้ว: เพิ่ม docs/PRISMA_START.md อธิบาย Express/Client/MySQL/Studio, คำสั่งรายวัน, Schema, ตัวอย่าง Query อ่านอย่างเดียว และแยกการเปลี่ยนข้อมูลจากการเปลี่ยนโครงสร้าง
- ระบุข้อจำกัด: db:setup Apply Migration ที่มีแล้ว ไม่สร้าง Migration ใหม่; Generate ไม่เปลี่ยนตาราง; ไม่ใช้ migrate dev เพื่อเลี่ยง Shadow database ตามข้อกำหนดฐานเดียว
- อ้างอิง: ตรวจเอกสารทางการ Prisma เรื่อง CRUD/Generate/Shadow เป็นแนวคิด ยึดคำสั่ง/Config ตาม Prisma 5.22.0 ในโปรเจกต์ ไม่อัปเกรด Dependencies
- ตรวจสอบ: ตรวจพาธ/ลิงก์ภายในและ git diff --check; ไม่รัน API/UI หรือ Query เพิ่มข้อมูล เพราะเป็นงานอธิบาย/เอกสาร ไม่มีการเปลี่ยนโค้ดหรือโครงสร้างฐาน
- ข้อมูล/Environment: ไม่เปลี่ยน Secrets/Database/Container/บัญชี ไม่ติดตั้งเพิ่ม ไม่ Commit/Push
- เริ่มต่อ: ใช้คู่มือเปิดดูตาราง/อ่าน Controller เดิม หากเพิ่มฟีเจอร์ให้ทำ Schema/Migration/API ตามขอบเขตที่ผู้ใช้สั่งและบันทึกผลจริง

### 2026-11-13 — ตรวจการเข้าฐานข้อมูลและเพิ่ม Prisma Studio (Asia/Bangkok)

- คำขอ: ผู้ใช้แจ้งว่าเข้าฐานไม่ได้ ยังไม่ระบุโปรแกรม/ข้อความผิดพลาด จึงถามเพิ่มเติมพร้อมตรวจระบบจริง
- ผลตรวจ: npm.cmd --prefix server run db:check เชื่อม MySQL 8.4.13 ฐาน dormify ได้ ครบเจ็ด Models จำนวนแถว 0; docker compose ps mysql แสดง Healthy และพอร์ต 127.0.0.1:3306 ไม่มีหลักฐานว่าฐานล่มหรือรหัสของแอปผิด
- ทำแล้ว: เพิ่ม npm.cmd run db:studio จาก Root เรียก Prisma Studio ของ Server ที่ 127.0.0.1:5555 ใช้ Environment เดิม ไม่ต้องส่งรหัสผ่านให้ผู้ใช้ผ่านแชต; เปิด Process Studio ไว้และตรวจ HTTP 200/HTML Prisma สำเร็จ
- คู่มือ: เพิ่มวิธีเปิด Studio และค่าการเชื่อม Workbench/DBeaver ใน SETUP_NEW_MACHINE/README อธิบายว่าพอร์ต 3306 ไม่ใช่หน้าเว็บ และรหัส MySQL แยกจากบัญชี Admin ของเว็บ
- ไฟล์สำคัญ: package.json, server/package.json, README.md, docs/SETUP_NEW_MACHINE.md, PROJECT_STATUS และ WORK_LOG
- ข้อมูล/Environment: ไม่เปลี่ยนรหัสผ่าน ไม่สร้างฐาน/ผู้ใช้ ไม่ Reset/Seed หรือแก้ข้อมูลในตาราง ไม่มี Dependencies ใหม่; ไม่รัน API/UI suite ซ้ำเพราะเปลี่ยนเฉพาะคำสั่งเปิดเครื่องมือและเอกสาร
- จุดทำต่อ: ใช้ Studio ที่เปิดไว้ หรือแจ้งโปรแกรม/ข้อความผิดพลาดหากปัญหาที่พบเป็นการเชื่อมจาก Client อื่น; ยังไม่สรุปว่าการเข้าผ่าน Client ของผู้ใช้แก้แล้วจนได้รับผลจากผู้ใช้ งานยังไม่ Commit/Push

### 2026-11-13 — ย้ายระบบเดิมไป MySQL ผ่าน Docker สำเร็จ (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้สั่งเริ่มหลังคุย Node.js/Express และ MySQL ฐานเดียว คง ADMIN/USER และเป้าหมาย Admin 13 + User 12 ข้อ รอบนี้ย้ายโครงสร้างระบบเดิม ไม่อ้างว่าฟีเจอร์ทั้งหมดเสร็จ
- ทำแล้ว: Compose ใช้ MySQL 8.4.13 ตรึง image digest มี Named volume dormify_mysql_data เปิดเฉพาะ 127.0.0.1:3306; บัญชี dormify_app แยกจาก Root; ไม่แตะ Container/Volume ของงานอื่น
- Schema: MySQL เจ็ด Models เดิม พร้อม ENUM ADMIN/USER, utf8mb4_unicode_ci, DATETIME(3), DECIMAL(12,2), Unique เลขห้องต่อหอ และ Migration เริ่มต้น 20261113000000_init_mysql
- เงิน: ปรับ Validation ให้รับไม่เกินสองตำแหน่งและขนาด Decimal ป้องกันปัดเศษเงียบ/เกินขนาด ตรวจค่าเช่า 4321.09 และปฏิเสธ 3000.001/เกินขนาดแล้ว
- Setup: npm run setup สร้าง .env ทั้งสามส่วนด้วยค่าสุ่ม ไม่แสดง Secrets/ทับค่าที่มีอยู่; db:setup ใช้ generate + migrate deploy ไม่ db push/reset/seed/shadow; เปลี่ยน create-admin ให้ใช้ MySQL
- ทดสอบ: npm.cmd --prefix server test ผ่าน 23/23 บน MySQL 8.4.13 รวม Auth/สิทธิ์/ข้อมูลส่วนตัว/การอนุมัติพร้อมกัน/ภาษาไทย/เงิน/Setup ซ้ำรักษาห้องเดิม; npm.cmd --prefix client run test:ui ผ่าน Chrome 17 กลุ่ม
- ตรวจ Frontend: unit 3/3, ESLint ไม่มี Warning, format:check และ TypeScript/Build ผ่าน Entry 300.57 KB / gzip 99.65 KB; Build ใน sandbox ถูกปฏิเสธพาธ esbuild จึงยกระดับสิทธิ์รันซ้ำแล้วผ่าน
- วิธีรักษาฐานเดียว: API/UI ใช้ Fixture namespace สุ่ม ลบเฉพาะที่สร้างเองและเทียบแฮชข้อมูลเดิมเจ็ดตาราง ไม่สร้าง dormify_test/dormify_dev/Shadow database และไม่ Reset/Seed; รันสองชุดตามลำดับระหว่างไม่มีคนแก้ข้อมูล
- ข้อมูล/Environment: ก่อนเริ่มไม่พบ SQLite/.env เครื่องนี้ จึงสร้าง MySQL ว่าง ไม่ได้ Import ข้อมูลจากอีกเครื่อง; หลัง Fixture cleanup db:check พบเจ็ด Models เป็น 0 ไม่มีบัญชี Admin Default หรือข้อมูลห้องจำลองค้าง ถ้ามี SQLite เดิมที่เครื่องอื่น Setup จะหยุดให้วางแผน Import ก่อน
- ไฟล์สำคัญ: compose.yaml, scripts/setup-local.js, .env.example, server/prisma/schema.prisma และ migrations, server/scripts/setup-db.js/create-admin.js/verify-db.js/run-db-tests.js, server/src/lib/database-config.js, server/test/helpers/mysql-fixtures.js, API/UI tests และ Package scripts
- คู่มือ: ปรับ README, SETUP_NEW_MACHINE, DATABASE_PREPARATION, PROJECT_STATUS, AGENTS และหัวแผนข้อมูลให้ตรง MySQL; แก้การส่งข้อความไทยผ่าน PowerShell ระหว่างจัดทำเอกสารและตรวจ UTF-8 อีกครั้ง
- งานค้าง/เริ่มต่อ: ผู้ใช้สร้าง Admin ใน Terminal แล้วเพิ่มข้อมูลหอจริง; ทำจัดการหอ/ห้อง → ผู้เช่า/สัญญา → มิเตอร์/บิล → การเงิน/ระบบประกอบ; ข้อ 3/6/9 ทั้งแนวทางยังรอยืนยัน ไม่เปิดค่าที่เสนอเอง
- Git: งานรอบนี้ยังไม่ Commit/Push รักษางานค้างก่อนเริ่มรวมการลบ OFL.txt; Volume/.env ไม่ตาม Git ต้องส่งโค้ดและจัดการข้อมูลจริงแยกเมื่อย้ายเครื่อง
- ตรวจปิดงาน: Prisma migrate diff ระหว่างฐานจริงกับ Schema ออก No difference detected (exit 0); Compose หลังตรึง digest สร้าง Container ซ้ำแล้ว Healthy; รัน UI ซ้ำหลังเปลี่ยน Validation ผ่าน 17 กลุ่มและลบ Fixture ครบ; setup ซ้ำเทียบแฮช .env ทั้งสามไฟล์ไม่เปลี่ยน; ตรวจ UTF-8 ไทย/ลิงก์เอกสารปัจจุบันและ git diff --check ผ่าน

### 2026-11-13 — เริ่มย้าย SQLite ไป MySQL ผ่าน Docker (กำลังดำเนินการ)

- คำขอ: ผู้ใช้สั่งเริ่มงานหลังยืนยัน Node.js/Express และฐาน dormify เดียว พร้อม ADMIN/USER และขอบเขตครบตามเอกสาร
- ตรวจเริ่มต้น: ไม่มี server/.env หรือ dev.db ในสำเนานี้; มีงานลบไฟล์/แก้เอกสารที่ยังไม่ Commit อยู่ก่อนแล้ว รักษาไว้
- ความคืบหน้า: เริ่ม Docker Desktop สำเร็จ Engine 29.7.2 พร้อม; พอร์ต 3306 ว่าง มี Container/Volume ของงานอื่นอยู่และไม่ได้แก้ไข
- แนวทาง: MySQL ใน Compose ฐาน dormify เดียวและ Named volume เฉพาะงาน; ไม่สร้าง Dev/Test/Shadow database เพิ่ม ใช้ SQL Migration ที่สร้างจาก Schema แล้ว migrate deploy
- ขอบเขตรอบนี้: ย้ายการเชื่อมต่อและ Models/API ที่ทำงานอยู่ ปรับ Setup/Admin/Tests และคู่มือ ไม่อ้างว่าฟีเจอร์สัญญา/บิล/เงินที่ยังไม่มีเสร็จแล้ว
- Secrets: จะสร้างค่า Local แบบสุ่มเฉพาะใน .env ที่ Ignore ไม่แสดงค่า และไม่เขียนทับค่าที่มีอยู่
- การทดสอบที่วางไว้: ใช้ข้อมูล Fixture ระบุขอบเขตในฐานเดียว ลบเฉพาะ Fixture ที่สร้างเอง ไม่ Reset/Seed/ล้างข้อมูลใช้งาน
- จุดรับช่วงต่อ: เตรียม Compose/Environment แล้ว ปรับ Schema/Migration และชุดทดสอบต่อ; ยังไม่ยืนยันผล MySQL จนรันทดสอบจริง

### 2026-11-13 — ย้ำฐานเดียวแต่ต้องมี Admin/User และขอบเขตครบ (Asia/Bangkok)

- คำขอ: ผู้ใช้ย้ำว่าฐานเดียวต้องยังมี Admin/User และระบบครบตามเอกสาร
- ยืนยันขอบเขต: ใช้ฐาน dormify เดียว หลายตาราง หลายบัญชี มี Role ADMIN/USER และตรวจสิทธิ์/เจ้าของข้อมูลที่ Backend; ไม่แยกฐานตามบทบาทและไม่ลดฟีเจอร์
- ข้อกำหนดเป้าหมาย: Admin 13 ข้อ + User 12 ข้อ รวม 25 ข้อยังอยู่ครบ ส่วนระบบที่ยังไม่พัฒนาต้องทำต่อ ไม่ถือว่าเสร็จจากการมีเมนูหรือ Model
- ทำแล้ว: บันทึกคำชี้แจงใน DATABASE_PREPARATION.md และ PROJECT_STATUS.md
- ตรวจสอบ: แก้เฉพาะเอกสาร ตรวจ Whitespace ไม่รันทดสอบแอปซ้ำ
- ข้อมูล/Environment: ไม่เปลี่ยน Schema/Role/API ไม่สร้างฐานหรือเริ่ม Container
- เริ่มต่อ: วางฐานข้อมูลและพัฒนาทีละระบบตามข้อกำหนด โดยรักษาสองบทบาทและสถานะข้อ 3/6/9 ที่รอยืนยัน

### 2026-11-13 — เปรียบเทียบ MySQL ติดตั้งตรงกับ Docker (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามว่าแนะนำวิธีใดสำหรับ MySQL
- ตรวจจริง: Docker CLI 29.7.2 และ Compose v5.5.1 มีแล้ว; docker version ใน sandbox มีคำเตือนสิทธิ์อ่าน Config จึงตรวจนอก sandbox อีกครั้ง ยังเชื่อมต่อ Engine ไม่ได้เพราะไม่พบ Pipe
- ข้อเสนอ: แนะนำ Docker Compose สำหรับการพัฒนาข้ามเครื่อง โดยรันเฉพาะ MySQL ใน Container เก็บข้อมูลใน Named volume และให้ Frontend/Backend ใช้ npm ตามเดิม
- ขอบเขตฐาน: ยังคงฐานหลัก dormify ฐานเดียว ไม่แยก Dev/Test; ข้อมูล Volume ไม่ Sync ผ่าน Git ส่วน Compose/Schema และคู่มือเก็บใน Git ได้
- ทางเลือก: ติดตั้ง MySQL ตรงได้หากไม่พร้อมใช้ Docker หรือต้องการลดขั้นตอน Docker Desktop; ไม่ได้สรุปว่า Docker ทำให้ Query เร็วกว่า
- ตรวจอ้างอิง: เอกสาร Docker Compose, Windows/WSL และ Containerized databases/Volumes; ไม่รันทดสอบแอปในรอบเปรียบเทียบ
- ข้อมูล/Environment: ไม่เปิด Docker Desktop ไม่ Pull Image ไม่สร้าง Container/Volume/ฐานข้อมูล และไม่เปลี่ยน Environment หรือ Schema
- เริ่มต่อ: รอผู้ใช้เลือกวิธีรันก่อนเริ่มงานติดตั้งจริง หากเลือก Docker ต้องตรวจ Engine ให้พร้อมก่อน

### 2026-11-13 — ปรับแผนให้ใช้ฐานข้อมูลหลักเดียว (Asia/Bangkok)

- คำขอ: ผู้ใช้ระบุว่าฐานข้อมูลไม่ต้องแยก
- การตัดสินใจ: ใช้ฐานหลักชื่อ dormify ในแผน MySQL รวมตารางทุกระบบไว้ฐานเดียว ไม่แยก Dev/Test หรือ Admin/User เป็นคนละฐาน
- ทำแล้ว: ปรับ DATABASE_PREPARATION.md และแผนข้อมูลเดิม พร้อมบันทึกข้อกำหนดใน AGENTS.md/PROJECT_STATUS.md
- การทดสอบ: ไม่เปลี่ยนชุดทดสอบปัจจุบันให้ชี้ฐานใช้งาน หากเพิ่ม MySQL test ต้องกำหนดวิธีที่ไม่ทำลายข้อมูลในฐานเดียวก่อน ไม่สร้างฐานถาวรเพิ่มเติมเอง
- ขอบเขต: ยังไม่ได้เริ่ม MySQL ไม่สร้างฐาน/ตาราง ไม่เปลี่ยน DATABASE_URL หรือ Schema; เป็นการปรับแผนตามความต้องการ
- ตรวจสอบ: ตรวจข้อความและลิงก์ที่ปรับ รวม Git whitespace; ไม่รันทดสอบแอปเพราะไม่มีโค้ดเปลี่ยน
- เริ่มต่อ: เหลือเลือกวิธีรัน MySQL และสถานะข้อมูลที่จะเริ่มใหม่/ย้ายจากอีกเครื่อง โดยใช้แผนฐานเดียวนี้

### 2026-11-13 — ตรวจสิ่งที่ต้องเตรียมสำหรับฐานข้อมูล (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามว่าหากเริ่มทำฐานข้อมูลต้องเตรียมอะไรบ้าง
- ตรวจจริง: Schema ยังเป็น SQLite/Prisma 5.22.0 มี 7 Models; ไม่พบ server/.env, dev.db และ migrations ในสำเนานี้; ไม่พบ mysql ใน PATH แต่พบ Docker CLI โดยยังไม่ตรวจ Docker Engine
- ทำแล้ว: เพิ่ม DATABASE_PREPARATION.md แยกการใช้ SQLite ต่อกับการย้าย MySQL พร้อมรายการ Server/Connection/ฐาน Dev-Test/Schema/Migration/Tests/การย้ายเครื่อง
- ข้อจำกัด: db:setup/admin:create และชุดทดสอบยังเจาะจง SQLite ต้องปรับเมื่อเริ่ม MySQL; การเปลี่ยน Provider ไม่ย้ายข้อมูลให้อัตโนมัติ
- กติกา: ข้อ 3, 6, 9 ยังรอยืนยัน ไม่เปิดค่าข้อเสนอเอง และไม่ถือว่าการถามรายการเตรียมเป็นคำสั่งให้สร้างฐานหรือย้ายข้อมูล
- ตรวจสอบ: อ่าน Source/ไฟล์ตัวอย่างและตรวจการมีอยู่ของไฟล์แบบอ่านอย่างเดียว ตรวจเอกสารทางการ MySQL/Prisma และลิงก์/Whitespace; ไม่รันทดสอบแอปในงานเอกสารนี้
- ข้อมูล/Environment: ไม่ติดตั้ง MySQL ไม่เปิด Docker ไม่สร้าง .env/ฐาน/Migration ไม่อ่านหรือเขียน Secret
- เริ่มต่อ: เลือกแนวทาง SQLite ต่อหรือ MySQL และวิธีรัน Server/สถานะข้อมูลอีกเครื่องก่อนเริ่ม Implementation

### 2026-11-13 — เสนองานพัฒนาถัดไปหลังเก็บกวาดไฟล์ (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามว่าควรทำอะไรต่อ
- ตรวจสถานะ: อ่าน PROJECT_STATUS, BUSINESS_RULES และ Git status; ระบบยังดู/เพิ่มห้องได้ แต่ยังแก้ไขหอ/ห้องหรือปิดใช้งานห้องไม่ได้
- ข้อเสนอรอบถัดไป: ทำจัดการห้องให้ครบก่อนบน SQLite เดิม ได้แก่ แก้ไขข้อมูลหอ แก้เลขห้อง/ประเภท/ความจุ/ค่าเช่า ปิดใช้งานห้องโดยไม่ลบประวัติ และทดสอบสิทธิ์/Validation/UI/API
- ข้อจำกัด: แยกความพร้อมใช้งานของห้องออกจากสถานะถูกจอง/พัก; การปิดห้องต้องตรวจคำขอและสัญญาที่เกี่ยวข้อง ไม่เปลี่ยนห้องที่มีผู้ถือสิทธิ์เป็นห้องว่าง
- ลำดับต่อจากนั้น: เตรียม MySQL ตามขอบเขตที่ผู้ใช้สั่ง แล้วผู้เช่า/สัญญา → มิเตอร์/บิล → ชำระเงิน/แจ้งซ่อม → รายงาน/Notifications/Audit
- กติกา: ข้อ 3, 6, 9 ยังรอยืนยัน ไม่เปิด 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วันเอง
- สถานะ: เป็นข้อเสนอ ยังไม่ได้เริ่ม Implementation หรือย้ายฐานข้อมูล; งานลบไฟล์/เอกสารก่อนหน้ายังไม่ Commit/Push
- ตรวจสอบ: อ่านโค้ดและสถานะที่มีหลักฐานแล้ว แก้เฉพาะบันทึก ไม่รันทดสอบแอปซ้ำ

### 2026-11-13 — ลบ ZIP สำรองของงานลบไฟล์ใบอนุญาต (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามตำแหน่งสำรองและระบุว่าไม่ต้องสำรองก็ได้
- ทำแล้ว: ลบ .git-backups/license-files-20261113.zip และ .git-backups/license-files-20261113.json ซึ่งเป็นสำรองและรายการจากงานลบไฟล์ 512 รายการ
- ขอบเขต: ไม่ลบ Bundle/Patch ที่สำรองประวัติ Git จากงานเปลี่ยน main เพราะเป็นคนละงานและยังไม่มีคำสั่งให้ลบ
- ความชอบผู้ใช้: งานลบไฟล์ทั่วไปที่ผู้ใช้สั่งชัดเจนไม่ต้องสร้าง ZIP/สำเนาเพิ่มเติมอัตโนมัติ บันทึกไว้ใน AGENTS.md
- ตรวจสอบจริง: ตรวจพาธให้อยู่ใน .git-backups ก่อนลบ และ Test-Path ยืนยันว่าสองไฟล์ไม่มีแล้ว; ไม่รันทดสอบแอปซ้ำเพราะลบเฉพาะสำรองและแก้บันทึก
- ไฟล์เอกสาร: AGENTS.md, docs/PROJECT_STATUS.md, docs/SETUP_NEW_MACHINE.md และ docs/WORK_LOG.md
- ข้อมูล/Environment: ไม่เปลี่ยนโค้ด .env หรือฐานข้อมูล; การติดตั้ง npm ci ยังสร้างไฟล์ของ Dependencies กลับได้ตามปกติ
- สถานะ Git: งานค้างก่อนหน้าและบันทึกรอบนี้ยังไม่ Commit/Push

### 2026-11-13 — ลบไฟล์ข้อความใบอนุญาตทั้งหมดในไฟล์งาน (Asia/Bangkok)

- คำขอ: ผู้ใช้สั่งให้ลบไฟล์ใบอนุญาตทั้งหมดและข้อความเกี่ยวกับบัญชีต้นทางที่เคยระบุ
- ตรวจรายการ: พบไฟล์ข้อความ 512 ไฟล์ แบ่งเป็น Root node_modules 29, server/node_modules 120, client/node_modules 362 และ client/src/assets/fonts/OFL.txt อีก 1 ไฟล์
- ทำแล้ว: ตรวจพาธจริงทุกไฟล์ให้อยู่ใน Workspace สำรองเป็น ZIP และตรวจความสมบูรณ์ก่อนลบ แล้วลบเฉพาะไฟล์ทั้ง 512 รายการ ไม่มีการลบ Directory
- ข้อยกเว้นตามประเภทไฟล์: ไม่ลบโค้ดไอคอน copyright.js หรือ Source map ที่ชื่อคล้ายกัน ไม่แก้โค้ดทำงาน/Package metadata/ข้อมูลผู้ใช้ในฐาน
- ตรวจชื่อ: ไม่พบชื่อบัญชีต้นทางที่ระบุก่อนหน้านี้ใน Source/README/เอกสารปัจจุบัน จึงไม่มีข้อมูลบัญชีหรือ Credentials ที่ต้องลบเพิ่ม
- สำรองและรายการจริง: .git-backups/license-files-20261113.zip และ .git-backups/license-files-20261113.json ถูก Ignore ไม่ส่งขึ้น GitHub
- เอกสาร: นำลิงก์ OFL.txt ที่ลบแล้วออกจาก README และเพิ่มหมายเหตุในคู่มือเครื่องใหม่
- ผลตรวจหลังลบ: ค้นไฟล์ข้อความตามเกณฑ์เดิมเหลือ 0 ไฟล์, ตรวจ ZIP สำรองครบ 512 รายการ, npm ls --depth=0 ทั้ง Root/Client/Server ผ่าน, Backend Tests ผ่าน 21/21 และ Frontend TypeScript/Production Build ผ่าน
- เอกสาร: ตรวจลิงก์ภายในเอกสารที่เปลี่ยนผ่าน ไม่ได้รัน Browser UI ใหม่เพราะไม่มีการเปลี่ยนโค้ดหน้าจอ
- ข้อจำกัดการย้ายเครื่อง: ไฟล์ node_modules ถูก Ignore และถูกสร้างคืนเมื่อ npm ci; ไม่เพิ่ม Postinstall เพื่อลบไฟล์ในเครื่องอื่นอัตโนมัติ
- สถานะ Git: การลบ OFL.txt และบันทึกรอบนี้ยังไม่ Commit/Push; การลบใน node_modules เป็นการเปลี่ยนเฉพาะเครื่อง

### 2026-11-13 — ลบไฟล์ LICENSE ตามคำสั่งผู้ใช้ (Asia/Bangkok)

- คำขอ: หลังอธิบายเงื่อนไข MIT แล้ว ผู้ใช้ยืนยันว่าให้ลบไฟล์ LICENSE
- ทำแล้ว: ตรวจพบว่าไฟล์ไม่มีใน Working Tree อยู่แล้ว จึงบันทึกการลบใน Git ตามคำสั่ง พร้อมอัปเดตสถานะสำหรับส่งต่อ
- ไฟล์ที่เกี่ยวข้อง: LICENSE, docs/PROJECT_STATUS.md และ docs/WORK_LOG.md
- ขอบเขต: ลบเฉพาะ LICENSE ระดับ Root ไม่แก้ใบอนุญาตฟอนต์หรือไฟล์ของ Dependencies และไม่เปลี่ยนประวัติ Git ซ้ำ
- ตรวจสอบจริง: Test-Path LICENSE เป็น False; ตรวจ Diff/Whitespace และรายการไฟล์ก่อน Commit; ไม่รันทดสอบแอปซ้ำเพราะไม่ได้เปลี่ยนโค้ดทำงาน
- ผลส่งจริง: Commit 22e1a1d ลบ LICENSE และอัปเดตบันทึกแล้ว; git push -u origin main สำเร็จจาก 06e4c76 เป็น 22e1a1d โดยไม่ Force Push
- ตรวจหลังส่ง: Working Tree สะอาด, main/origin/main ต่างกัน 0 Commit, Test-Path LICENSE เป็น False และ git ls-tree HEAD -- LICENSE ไม่พบไฟล์
- ข้อมูล/Environment: ไม่เปลี่ยนฐานข้อมูล .env หรือแพ็กเกจ
- เริ่มต่อ: อย่า Restore LICENSE โดยถือว่าการลบเป็นข้อผิดพลาด เพราะผู้ใช้สั่งลบชัดเจนแล้ว; คำอธิบายเงื่อนไขที่ตรวจไว้ยังอยู่ในประวัติรายการก่อนหน้า

### 2026-11-13 — ตรวจเงื่อนไขการนำ MIT License ออก (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามว่าลบเงื่อนไข MIT จะมีผลหรือไม่ ยังไม่ได้สั่งให้เปลี่ยนไฟล์ในคำถามนี้
- ตรวจสอบ: อ่านข้อความ MIT จาก Open Source Initiative และคู่มือ License ของ GitHub; MIT อนุญาตใช้/แก้ไข/แจกจ่ายโดยกำหนดให้เก็บข้อความลิขสิทธิ์และใบอนุญาตกับสำเนาหรือส่วนสำคัญของซอฟต์แวร์
- ข้ออธิบาย: การลบไฟล์ไม่ได้ทำให้ลิขสิทธิ์หรือเงื่อนไขของโค้ดที่นำมาใช้หายไป; การแจกจ่ายโค้ดที่ยังอยู่ภายใต้ MIT โดยไม่มี Notice อาจไม่เป็นไปตามเงื่อนไข แนะนำเก็บไว้หรือขออนุญาตเจ้าของสิทธิ์แยกต่างหาก
- ขอบเขต: เป็นข้อมูลทั่วไปจากข้อความใบอนุญาต ไม่ได้วินิจฉัยสิทธิ์หรือผลทางกฎหมายเฉพาะกรณี และไม่เปลี่ยน License/Restore ไฟล์/Commit/Push ในรอบอธิบายนี้
- สถานะไฟล์: LICENSE ยังถูกลบใน Working Tree โดยไม่ Stage; ฉบับใน main ที่ส่งขึ้น GitHub ยังคงมีอยู่
- ผลตรวจ: แก้เฉพาะบันทึก ไม่รันทดสอบแอป; ตรวจ Whitespace
- แหล่งอ้างอิง: https://opensource.org/license/mit และ https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- เริ่มต่อ: อย่าส่งการลบ Notice โดยถือว่าการเปลี่ยนชื่อโปรเจกต์หรือประวัติ Git ทำให้เงื่อนไขเดิมสิ้นสุด ให้ตรวจสิทธิ์ที่ใช้จริงก่อนเปลี่ยน

### 2026-11-13 — ส่ง Snapshot ประวัติใหม่ขึ้น GitHub สำเร็จ (Asia/Bangkok)

- ผลจริง: สร้าง Root Snapshot 4450c62 จากไฟล์งานทั้งหมดที่ตรวจแล้ว และส่งแทน main เดิมด้วย Force-with-lease เฉพาะ refs/heads/main สำเร็จ
- การป้องกัน: Lease คาดหมาย Remote เดิม 5fd595c; เก็บ Bundle และ Patch ก่อนเปลี่ยนไว้ใน .git-backups/ ซึ่งไม่ถูกส่งขึ้น GitHub
- ตรวจ Snapshot: ไฟล์ตรงกับ Working Tree/Index ก่อนส่ง ไม่มีไฟล์ Secret/ฐานข้อมูล/Bundle; ค้นไม่พบชื่อบัญชีหรือแบรนด์โครงการก่อนหน้านอก LICENSE
- ตรวจหลังส่ง: main ในเครื่องและ origin/main ชี้ 4450c62 ตรงกัน; git shortlog main -sn พบผู้เขียน eak คนเดียว ไม่ได้แก้ชื่อผู้เขียนใน Commit ของบุคคลอื่น
- ไฟล์หลักที่เปลี่ยน: Package/Lockfile หลัก, ข้อความ Health API, README, บันทึก/คู่มือส่งต่อ, .gitignore และ LICENSE ที่เก็บเงื่อนไข MIT
- Tests รอบนี้: Backend 21/21 ผ่าน และ Package/Lockfile ตรงกัน; Frontend ไม่เปลี่ยน ไม่รันทดสอบหน้าจอซ้ำ
- ข้อจำกัด: ข้อความลิขสิทธิ์ใน LICENSE ยังคงอยู่ตามเงื่อนไขการแจกจ่าย; GitHub อาจ Cache รายชื่อ Contributors ประมาณ 24 ชั่วโมงหลัง Rewrite
- เริ่มต่อ: อีกเครื่องที่มีประวัติเก่าให้ Clone โฟลเดอร์ใหม่ตาม GITHUB_WORKFLOW.md และย้าย Environment/ข้อมูลที่สำรองไว้แยกต่างหาก ไม่ Merge ประวัติเก่ากลับมา
- บันทึกผลส่งต่อ: เพิ่มรายการนี้หลัง Push Snapshot แล้ว ส่งเอกสารสถานะตามด้วย Commit ปกติในประวัติใหม่
- ข้อสังเกต Working Tree: หลังส่งพบการลบ LICENSE ในเครื่องซึ่งไม่ได้ Stage; ไม่เขียนทับการเปลี่ยนแปลงที่พบและไม่ส่งการลบนี้ ข้อความใบอนุญาตยังอยู่ใน Snapshot บน GitHub

### 2026-11-13 — เปลี่ยนแบรนด์และเตรียมประวัติ Dormify ใหม่ (Asia/Bangkok)

- คำขอ: ผู้ใช้สั่งให้นำชื่อและสิ่งระบุต้นทางของโครงการก่อนหน้าออก หลังแจ้งผลกระทบเรื่อง Commit และการ Clone ใหม่
- ทำแล้ว: เปลี่ยนชื่อ Package หลัก/Lockfile เป็น dormify, เปลี่ยน Health API เป็น DORMIFY และนำชื่อบัญชี/แบรนด์ก่อนหน้าออกจาก README/บันทึก/เอกสาร
- ใบอนุญาต: คงข้อความลิขสิทธิ์และเงื่อนไข MIT ใน LICENSE และใบอนุญาตฟอนต์ที่ยังใช้งาน ไม่เปลี่ยนชื่อผู้เขียนใน Commit ของบุคคลอื่น
- สำรอง: Git bundle ครบทุก Ref และ Patch ของงานค้างที่ .git-backups/; ตรวจ bundle verify ผ่าน และ Ignore โฟลเดอร์สำรองเพื่อไม่ส่งขึ้น GitHub
- เตรียมส่ง: สร้าง Root Snapshot ใหม่จากไฟล์งานปัจจุบัน แล้วใช้ Force-with-lease เฉพาะ main โดยคาดหมาย Remote เดิม 5fd595c เพื่อไม่ทับงานที่อีกเครื่องส่งเพิ่ม
- ตรวจสอบจริง: npm --prefix server test ผ่าน 21/21; ตรวจชื่อ Package/Lockfile ตรงกัน; Whitespace ผ่าน; ไม่มีการเปลี่ยนไฟล์ Frontend ในรอบนี้
- ข้อมูล/Environment: ไม่ Reset ฐาน ไม่เปลี่ยน .env ไม่ส่ง Bundle หรือ Secret ขึ้น GitHub
- สถานะ: ยังเตรียม Snapshot; จะบันทึกผล Push จริงแยกเมื่อส่งสำเร็จ
- เริ่มต่อ: หลังเปลี่ยนประวัติสำเร็จ ให้ Clone อีกเครื่องลงโฟลเดอร์ใหม่และย้าย .env/ฐานที่สำรองไว้แยกต่างหาก ห้าม Merge ประวัติเก่ากลับมา

### 2026-11-13 — ตรวจชื่อที่ไม่รู้จักใน GitHub Contributors (Asia/Bangkok)

- คำขอ: ผู้ใช้พบชื่อ บัญชีผู้เขียนโค้ดรุ่นก่อน / ผู้เขียนโค้ดรุ่นก่อน ในภาพ Contributors ของ Repository
- ข้อค้นพบ: git shortlog --all -sn พบผู้เขียน ผู้เขียนโค้ดรุ่นก่อน จำนวน 7 Commit เดิม ตั้งแต่ efa0f61 ถึง c161ce3 ก่อน Commit 2fa41d1/59e5bae และก่อนงานที่ส่งจากเครื่องนี้
- หลักฐาน: git log --all --reverse แสดง efa0f61 เป็น Initial commit: ระบบเวอร์ชันก่อน ของ ผู้เขียนโค้ดรุ่นก่อน; Commit งานล่าสุด 903ad79/5fd595c ใช้ผู้เขียน eak
- ข้อสรุป: มีประวัติผู้เขียนโค้ดเดิมติดอยู่ใน Repository จึงอธิบายชื่อ Contributors ในภาพได้; Contributors เป็นข้อมูลผลงานจาก Commit ไม่ใช่หลักฐานสิทธิ์เขียน Repository
- ขอบเขต: ไม่ได้เพิ่ม Collaborator ไม่เปลี่ยนสิทธิ์ ไม่แก้ผู้เขียน/ลบประวัติ และไม่ได้ตรวจรายชื่อ Collaborators จริงบน GitHub; เจ้าของดูได้ที่ Settings > Collaborators
- ตรวจสอบ: อ่าน Git log/shortlog/status และเอกสาร GitHub เรื่อง Contributors/Access; ไม่รันทดสอบแอปเพราะตรวจประวัติและแก้เฉพาะบันทึก
- เริ่มต่อ: บันทึกการตรวจนี้ยังไม่ได้ Commit/Push; หากต้องตรวจสิทธิ์จริงให้ดูรายชื่อ Access ของ Repository แยกจาก Contributors

### 2026-11-13 — Commit และ Push งานจากเครื่องนี้สำเร็จ (Asia/Bangkok)

- คำขอ: ผู้ใช้ต้องการส่งงานที่ทำในเครื่องนี้ขึ้น Repository เดิมบน GitHub
- ตรวจบัญชี: Git ใช้ Credential Manager; การอ่าน Credential Store ใน sandbox ถูกจำกัด จึงตรวจนอก sandbox พบโปรไฟล์ GitHub และ git push --dry-run origin main ผ่าน โดยไม่แสดง Token/รหัสผ่าน
- ตรวจไฟล์: งานทั้งหมดถูก Stage แล้ว ตรวจ git diff --cached --check ผ่าน; รายการ Stage ไม่มี .env จริงหรือฐาน SQLite
- ทำแล้ว: git commit -m "Improve Dormify booking safety and add project handoff documentation" ได้ Commit 903ad79 รวม 71 ไฟล์
- ผลจริง: git push -u origin main สำเร็จ โดย Remote https://github.com/eakm0nn/Dormify.git เลื่อนจาก 59e5bae เป็น 903ad79 และ main ติดตาม origin/main แล้ว
- ไฟล์บันทึกผลส่งต่อ: docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/GITHUB_WORKFLOW.md, docs/SETUP_NEW_MACHINE.md
- ตรวจสอบ: ใช้ผลทดสอบโค้ดที่บันทึกไว้ก่อนหน้า ไม่รันแอปซ้ำในงานส่ง Git; ตรวจ Whitespace ของเอกสารผล Push ก่อนส่งตาม
- ข้อมูล/Environment: ไม่เปลี่ยน Remote ไม่ Force Push ไม่สร้างฐานใช้งาน และไม่ส่ง Secret/ฐานข้อมูล; ยังต้องเตรียม .env และ Dependencies บนอีกเครื่อง
- เริ่มต่อ: Clone/Pull main ล่าสุด อ่าน PROJECT_STATUS.md และทำตาม SETUP_NEW_MACHINE.md; เอกสารผล Push ส่งตามเป็น Commit แยกจากโค้ดงานหลัก

### 2026-11-13 — ตรวจ Remote และอธิบายการส่งงานผ่าน GitHub (Asia/Bangkok)

- คำขอ: วิธีเชื่อมโปรเจกต์กับ GitHub เพื่อส่งต่องาน
- ข้อค้นพบ: มี Remote origin ที่ https://github.com/eakm0nn/Dormify.git อยู่แล้ว และอยู่ Branch main จึงไม่ต้อง git init/add origin ซ้ำ
- ทำแล้ว: เพิ่มคู่มือ GitHub ที่อธิบายตรวจ/Stage/Commit/Push, Clone/Pull และการตั้งเครื่องปลายทาง พร้อมเชื่อมลิงก์กับคู่มือส่งต่อ
- ไฟล์สำคัญ: docs/GITHUB_WORKFLOW.md, docs/PROJECT_STATUS.md, docs/SETUP_NEW_MACHINE.md, docs/WORK_LOG.md, README.md
- ตรวจสอบ: git remote -v, git branch --show-current และ Git status แบบอ่านอย่างเดียว; ตรวจลิงก์/Whitespace ของเอกสาร ไม่รันทดสอบแอปซ้ำ
- ข้อมูล/Environment: ไม่อ่าน Credentials ไม่เปลี่ยน Remote ไม่ Stage/Commit/Push และยังไม่ตรวจ Authentication/สิทธิ์ Push/ประวัติ Remote ผ่านเครือข่าย
- เริ่มต่อ: ตรวจไฟล์ที่จะส่งแล้ว Commit/Push เมื่อผู้ใช้ต้องการส่งงานจริง; บนอีกเครื่อง Clone/Pull และทำตาม SETUP_NEW_MACHINE.md

### 2026-11-13 — เพิ่มระบบบันทึกและส่งต่องาน (Asia/Bangkok)

- คำขอ: ทุกครั้งที่ทำงานให้เก็บบันทึก เพื่อทำต่อบนอีกเครื่องได้
- ทำแล้ว: เพิ่มแนวทาง AGENTS.md, สถานะล่าสุด, Work log และคู่มือติดตั้ง/รับช่วงต่อ; ใส่ลิงก์เข้า README
- ไฟล์สำคัญ: AGENTS.md, docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/SETUP_NEW_MACHINE.md, README.md
- ตรวจสอบ: ตรวจคำสั่งกับ package.json ทั้งสามส่วน ตรวจลิงก์ภายในเอกสารส่งต่อ และ Git whitespace; ไม่รันแอปซ้ำเพราะแก้เฉพาะเอกสาร
- ข้อมูล: ตรวจเฉพาะการมีอยู่ของไฟล์ พบว่ายังไม่มี .env ทั้งสองส่วนและ dev.db บนเครื่องนี้ ไม่อ่าน/เขียน Secret หรือสร้างฐานใช้งาน
- สถานะส่งต่อ: main / Base commit 59e5bae มีงานก่อนหน้าและไฟล์ใหม่ยังไม่ Commit ต้องนำ Working Tree ไปให้ครบ
- งานค้าง: ไม่มีงานโค้ดเพิ่มในรอบนี้ งานพัฒนาถัดไปให้ยึดขอบเขตที่ผู้ใช้สั่งและกติกาล่าสุด

### 2026-11-13 — ยืนยันข้อความกติกาสำหรับออกแบบ (Asia/Bangkok)

- คำขอ: ผู้ใช้ให้กติกา 14 ข้อ และระบุข้อ 3, 6, 9 เป็นข้อเสนอรอเจ้าของหอยืนยัน
- ทำแล้ว: บันทึกข้อความครบ 14 ข้อ และแก้สถานะในเอกสารออกแบบ/แผนข้อมูลให้ตรงกัน โดยเฉพาะข้อ 9 ที่เดิมเขียนว่ายืนยันฐานรอบบิลแล้ว
- ไฟล์สำคัญ: docs/BUSINESS_RULES.md, docs/analysis/PHASE1_BUSINESS_RULES_DESIGN.md, docs/analysis/MIGRATION_AND_DATA_MODEL.md, docs/analysis/README.md, README.md
- ตรวจสอบ: ตรวจจำนวนข้อ ข้อความสถานะ และ Git diff --check; ไม่รันทดสอบแอปเพราะไม่มีการเปลี่ยนโค้ด
- ข้อมูล/Environment: ไม่เปลี่ยนฐานข้อมูลหรือค่าตั้งระบบ ไม่เปิดใช้ 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วัน
- เริ่มต่อ: ใช้ BUSINESS_RULES.md เป็นข้อความต้นทาง แผนข้อมูลและ Workflow ยังเป็นแบบเสนอ ไม่ใช่ฟีเจอร์ที่ติดตั้งแล้ว

### 2026-11-13 — ปรับคุณภาพโค้ด ความถูกต้อง และการโหลดข้อมูล (Asia/Bangkok)

- คำขอ: ปรับปรุงตามผลรีวิวโค้ด โดยเน้นความถูกต้อง การดูแลต่อ และประสิทธิภาพ
- Backend: ใช้ PrismaClient/Validation กลาง ตรวจข้อมูลให้ครบ ป้องกันอนุมัติห้องซ้ำด้วย Transaction/Conditional Update เพิ่ม Unique roomNumber ต่อหอและ Index ที่เกี่ยวข้อง
- API: เพิ่ม GET /api/properties/:propertyId และ GET /api/bookings/summary?propertyId=...; เส้นทางเดิมยังรองรับ
- Frontend: Lazy Loading, useApiResource พร้อมยกเลิก/กันผลเก่า, Public ไม่รอ /me ทั้งหน้า, แยก RoomForm/RoomTable และข้อมูลเมนู, ใช้ Formatter ซ้ำและแยกค่าว่างจากราคา 0
- เครื่องมือ: เพิ่ม Dev Dependencies Prettier และ @typescript-eslint/parser/eslint-plugin, ตั้ง ESLint/Prettier, เปิด noUnusedLocals/noUnusedParameters และจัดรูปแบบ Frontend
- ไฟล์หลัก: client/src/App.tsx, hooks/useApiResource.ts, components/RoomForm.tsx/RoomTable.tsx, config/navigation.ts, context/*, pages/*, utils/format.ts; server/src/controllers/*, routes/*, lib/*, middleware/validate.js; server/prisma/schema.prisma, server/scripts/setup-db.js/ensure-room-uniqueness.js
- หลักฐาน: npm --prefix server test ผ่าน 21/21; npm --prefix client test ผ่าน 3/3; lint/format:check/build ผ่าน; node client/scripts/ui-smoke.mjs ผ่าน 17 กลุ่ม
- ตรวจฐานเก่า: จำลอง SQLite ที่มีข้อมูลแล้วอัปเกรดและ Setup ซ้ำ ข้อมูลเดิมครบ; กรณีเลขห้องซ้ำหยุดให้แก้ข้อมูล ไม่ลบรายการ
- ผลขนาด Build: Entry JS 340.98 → 300.57 KB, gzip 108.31 → 99.65 KB; เป็นขนาด Entry ไม่ใช่เวลาโหลดจริงหรือขนาดรวมทุกหน้า
- ข้อมูล/Environment: ใช้ฐานทดสอบชั่วคราว ไม่ย้าย MySQL ไม่แก้ .env หรือฐานใช้งาน; เครื่องอื่นต้อง npm ci และ db:setup หลังรับโค้ด
- งานค้าง: PENDING/การหมดอายุตามนโยบายใหม่, ผู้เช่า/สัญญา/เงิน/บิลและระบบอื่นตาม PROJECT_STATUS.md
- รายละเอียด: docs/CODE_QUALITY_IMPROVEMENTS.md
