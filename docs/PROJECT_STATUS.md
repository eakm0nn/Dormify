# DORMIFY — สถานะล่าสุดสำหรับทำงานต่อ

อัปเดต 13 พฤศจิกายน 2026 (Asia/Bangkok)
อ่านร่วมกับ [บันทึกงาน](WORK_LOG.md), [กติกา](BUSINESS_RULES.md), [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)
สำหรับผู้เริ่มต้นมี [คู่มือ Prisma](PRISMA_START.md) อธิบายคำสั่ง/Schema/Query/Migration ตามโค้ดปัจจุบัน ไม่ได้เปลี่ยนฐานหรือเพิ่มฟีเจอร์จากงานคู่มือนี้
ตรวจ Working Tree/Git status ก่อนเสมอ บันทึกอาจเก่ากว่าโค้ดที่กำลังแก้

## จุดบันทึกล่าสุดสำหรับกลับมาทำต่อ

บันทึกตามคำขอผู้ใช้ 13 พฤศจิกายน 2026 เวลา 18:37 น. (Asia/Bangkok)

- โค้ดและคู่มืออยู่ในไฟล์ Local แล้ว งานย้าย MySQL/Studio/คู่มือ Prisma และงานค้างก่อนหน้ายังไม่ Commit/Push
- โครงสร้างปัจจุบัน: React → Express → Prisma 5.22.0 → MySQL ผ่าน Docker ฐาน dormify เดียว มี ADMIN/USER
- ผู้ใช้ชี้ว่าพยายามเปิดจากลิงก์พอร์ต 3306 ใน Docker จึงอธิบายว่าเป็นพอร์ต MySQL ไม่ใช่ HTTP; ดูตารางผ่าน Studio พอร์ต 5555 หรือเชื่อมโปรแกรม MySQL ได้
- อธิบายทางเลือก phpMyAdmin แล้ว แต่ยังไม่ได้ติดตั้งหรือเปลี่ยนเครื่องมือ และยังคง Prisma ใน Backend
- มี [คู่มือเริ่มใช้ Prisma](PRISMA_START.md) พร้อมคำสั่งเปิดฐาน/เว็บ/Studio และข้อแตกต่างระหว่าง Schema, Client, Migration และการแก้ข้อมูล
- เริ่มครั้งถัดไป: อ่านไฟล์นี้และ WORK_LOG ตรวจ Git status แล้วใช้คู่มือเครื่องใหม่ ไม่สมมติว่า Docker/Studio ยังเปิดอยู่
- จุดทำงานต่อ: ตรวจ/สร้าง Admin ของผู้ใช้และข้อมูลหอจริง แล้วพัฒนาฟีเจอร์ที่ยังค้างตามขอบเขตที่ผู้ใช้สั่ง ข้อ 3/6/9 ยังรอยืนยัน
- รอบบันทึกนี้ตรวจเอกสารและลิงก์เท่านั้น ไม่รันทดสอบแอป/ฐานข้อมูลซ้ำ ผลทดสอบด้านล่างเป็นผลจากรอบย้ายฐานก่อนหน้า

## สถานะปัจจุบัน

ย้าย SQLite ไปใช้ MySQL 8.4.13 ผ่าน Docker แล้วตามคำสั่งเริ่มงานล่าสุด
ใช้ฐานแอปเดียว dormify ไม่แยก Dev/Test/Shadow หรือแยกฐาน Admin/User
ยังคง ADMIN/USER และเป้าหมายเอกสาร Admin 13 + User 12 ข้อ การย้ายฐานรอบนี้ครอบคลุมระบบเดิม ไม่ใช่ทุกฟีเจอร์เสร็จแล้ว

| ส่วน | สถานะ |
|---|---|
| Frontend | React 18 + Vite 5 + TypeScript strict + Tailwind 3 |
| Backend | Node.js + Express 5, CommonJS JavaScript |
| Database | MySQL 8.4.13 ใน Compose ตรึง digest + Prisma 5.22.0 |
| Migration | SQL ใน server/prisma/migrations ใช้ migrate deploy ไม่ Reset/Seed/Shadow |
| Models | User, AuthSession, Property, Room, Booking, Payment, Complaint |
| สิทธิ์ | ADMIN/USER; สมัครสาธารณะได้ USER เท่านั้น |
| Environment | Root/server/client .env สุ่มด้วย setup และ Ignore |
| ข้อมูล Local | มี schema แล้ว เจ็ด Models ว่าง ไม่มี Admin Default |
| วิธีรัน | เปิด Docker แล้ว npm run db:up; npm run dev เปิดเว็บ/API |

## ทำงานแล้ว

- สมัคร/Login/ตรวจบัญชี/Logout พร้อม Session เพิกถอนได้ ตรวจสิทธิ์/เจ้าของข้อมูลจาก Server
- Public อ่าน API จริง ค้นหา/กรองห้อง ดูรายละเอียด ไม่เติม Mock Data
- Admin สร้างข้อมูลหอครั้งแรก ดู/เพิ่มห้อง อนุมัติ/ปฏิเสธคำขอ และ Dashboard สรุป API
- User ดูบัญชี คำขอ/ข้อมูลห้องของตนเอง
- ตรวจ ID/วันที่/ความจุ/เงิน/เลขห้องซ้ำ และป้องกันอนุมัติสองคำขอให้ห้องเดียวกันแม้ส่งพร้อมกัน
- Prisma client กลาง, Lazy routes, Hook ยกเลิกคำขอเก่า, แยก RoomForm/RoomTable, ESLint/Prettier
- MySQL รองรับภาษาไทย เงิน DECIMAL(12,2), ENUM Role และ Unique เลขห้องต่อหอ
- Setup ซ้ำรักษาข้อมูล ใช้ Fixture namespace ในฐานเดียวแทนฐานทดสอบเพิ่มเติม

## ผลตรวจรอบย้าย MySQL

| ตรวจ | ผลจริง |
|---|---|
| npm --prefix server test | 23/23 บน MySQL 8.4.13 |
| npm --prefix client run test:ui | Chrome 17 กลุ่มบน MySQL |
| npm --prefix client test | 3/3 |
| lint / format:check | ผ่าน ไม่มี Warning |
| build รวม TypeScript | ผ่าน; Entry 300.57 KB / gzip 99.65 KB |
| db:setup ซ้ำ | ผ่านและข้อมูลห้องเดิมอยู่ครบ |
| db:check หลัง Fixture cleanup | เจ็ด Models เป็น 0 ไม่มีข้อมูลทดสอบค้าง |
| Schema เทียบฐานจริง | migrate diff ไม่พบความต่าง |
| setup ซ้ำ | แฮช .env ทั้งสามไฟล์เดิมไม่เปลี่ยน |

Build ใน sandbox ถูกจำกัดพาธ esbuild จึงรันซ้ำแบบยกระดับสิทธิ์แล้วผ่าน ไม่ได้เปลี่ยนโค้ดเพื่อข้ามผลตรวจ
API/UI ตรวจข้อมูลเดิมด้วยแฮชและลบเฉพาะ Fixture ห้ามรันพร้อมกันหรือขณะคนแก้ข้อมูล
ภาพ/results.json อยู่ client/.ui-artifacts/ ไม่ตาม Git
ผล SQLite ในเอกสารเก่าเป็นประวัติ ไม่ใช่ผลตรวจ MySQL รอบนี้

## Environment และข้อมูลที่ต้องส่งต่อ

Docker ทำงานแล้ว Container dormify-mysql-1 Healthy ข้อมูลอยู่ dormify_mysql_data พอร์ต 127.0.0.1:3306
ตรวจในรอบผู้ใช้แจ้งเข้าไม่ได้: db:check เชื่อมได้และข้อมูลยังว่าง เพิ่ม npm run db:studio เปิดดูตารางที่ http://127.0.0.1:5555 และตรวจ HTTP 200 สำเร็จ ต่อมาผู้ใช้ส่งภาพลิงก์พอร์ต 3306 ใน Docker จึงอธิบายว่าไม่ใช่หน้าเว็บ ไม่ได้เปลี่ยนรหัสผ่านหรือฐานข้อมูล; สถานะ Process/จำนวนข้อมูลนี้เป็นผลตรวจรอบนั้น ต้องตรวจใหม่เมื่อกลับมาเปิดงาน
ไม่ได้แตะ Container/Volume ของโปรเจกต์อื่น ไม่สร้างฐานแอปเพิ่มเติม
ก่อนเริ่มเครื่องนี้ไม่มี .env/dev.db จึงสร้าง MySQL ว่าง ไม่ได้ย้ายข้อมูลจริงจากอีกเครื่อง
setup/db:setup หยุดเมื่อพบ SQLite เดิม ต้องวางแผน Import แยก ห้ามลบทิ้งเพื่อให้ผ่าน
Volume และ .env ไม่ตาม Git การ Clone ไม่ได้ Sync ข้อมูลจริง ดูคู่มือเครื่องใหม่
Root dev เป็น Alias start เปิดทั้งสองส่วน แต่ Backend ไม่ Restart อัตโนมัติ ใช้ server run dev แยกหากต้องการ
PowerShell ใช้ npm.cmd แทน npm เมื่อ npm.ps1 ถูกจำกัด

## งานที่ยังไม่เสร็จ

- Backend ยังเป็น JavaScript
- แก้ไขหอ/ห้อง ปิดใช้งานพร้อมเก็บประวัติ รูปภาพ/สิ่งอำนวยความสะดวกยังไม่ครบ
- PENDING ไม่กันห้อง หลังอนุมัติห้องไม่ว่าง แต่ยังไม่มีการถือสิทธิ์ชั่วคราว/หมดอายุตามนโยบายใหม่
- UI Admin ยังไม่มีปุ่มยกเลิก แม้ API รับ CANCELLED
- Booking ยังไม่ใช่สัญญาหรือทะเบียนผู้เช่า ยอดคำขอเป็นค่าเช่ารายเดือน ไม่ใช่บิล
- ผู้เช่า/ผู้พักร่วม/Lease/เงินประกัน/มิเตอร์/Invoice/การเงิน/แจ้งซ่อม/รายจ่าย/รายงาน/Notifications/Audit ยังต้องทำ
- รีวิวส่งไม่ได้ รายการโปรดอยู่ในหน้าเว็บ รายการจองยังไม่มี Pagination
- ช่องโหว่/คำเตือน Dependency เดิมยังไม่ได้แก้ทั้ง Stack ในรอบนี้
- ข้อ 3/6/9 ทั้งแนวทางยังรอเจ้าของยืนยัน ไม่เปิด 72 ชั่วโมง/หนึ่งเดือน/ห้าวันเอง

## Git และจุดเริ่มทำต่อ

ประวัติ main เริ่มใหม่แล้วในงานก่อนหน้า ดู WORK_LOG/GITHUB_WORKFLOW
งานย้ายฐานและเอกสารรอบนี้ยังไม่ Commit/Push รวมงานค้างก่อนเริ่ม ต้องส่งให้ครบก่อนเปลี่ยนเครื่อง
รักษางานลบ client/src/assets/fonts/OFL.txt เดิมไว้ การลบใบอนุญาตใน node_modules ไม่ตาม Git และ npm ci สร้างกลับ
ZIP/Manifest สำรองงานลบไฟล์นั้นถูกลบตามคำสั่งผู้ใช้แล้ว ไม่สร้างใหม่เอง; สำรองประวัติ Git งานก่อนหน้าเป็นอีกชุด
ไม่ Commit/Push อัตโนมัติ

จุดทำต่อ: สร้าง Admin ของผู้ใช้ผ่าน Terminal และข้อมูลหอจริง จากนั้นทำจัดการหอ/ห้องให้ครบ → ผู้เช่า/สัญญา → มิเตอร์/บิล → การเงิน → ระบบประกอบ
อัปเดต WORK_LOG/PROJECT_STATUS ทุกครั้งตาม AGENTS.md
