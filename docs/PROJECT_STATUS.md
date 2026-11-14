# DORMIFY — สถานะล่าสุดสำหรับทำงานต่อ

อัปเดต 14 พฤศจิกายน 2026 (Asia/Bangkok)
อ่านร่วมกับ [บันทึกงาน](WORK_LOG.md), [กติกา](BUSINESS_RULES.md), [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)
สำหรับผู้เริ่มต้นมี [คู่มือ Prisma](PRISMA_START.md) อธิบายคำสั่ง/Schema/Query/Migration ตามโค้ดปัจจุบัน ไม่ได้เปลี่ยนฐานหรือเพิ่มฟีเจอร์จากงานคู่มือนี้
ตรวจ Working Tree/Git status ก่อนเสมอ บันทึกอาจเก่ากว่าโค้ดที่กำลังแก้

## จุดบันทึกล่าสุดสำหรับกลับมาทำต่อ

### สรุปส่งต่องานตามคำขอบันทึก — 14 พฤศจิกายน 2026

- ทำแล้ว: ธีมภาษาไทย/ขาวฟ้า Frontend TypeScript, Backend Express JavaScript, MySQL Docker + Prisma, ADMIN/USER และระบบห้อง ผู้เช่า คำขอ/กันห้อง สัญญา มิเตอร์ บิล เงิน/สลิป ประกัน ซ่อม ข่าวสาร การแจ้งเตือน รายจ่าย/รายงาน และ Audit พื้นฐาน ดู [วิธีใช้และข้อจำกัด](DORM_OPERATIONS.md)
- กติกายืนยันแล้ว: กันห้อง 72 ชั่วโมง ประกัน 1 เดือน ครบกำหนด 5 วัน ให้ Admin ปรับสำหรับรายการใหม่ ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง ต้องมีบัญชี USER ก่อนทำสัญญา รายการเดิมเก็บ Snapshot
- ข้อมูลทดสอบที่เพิ่มล่าสุด: ห้อง DEMO 8 ห้องในหอเดิม เปิดและว่าง 7 ห้อง ปิด DEMO-204 อีก 1 ห้อง เก็บไว้ให้ผู้ใช้ทดลอง ไม่สร้างหอที่สอง ไม่ทับข้อมูลเดิม สคริปต์ `server/scripts/add-demo-rooms.js` รันซ้ำไม่เพิ่มเลขห้องซ้ำ
- ผลจากรอบพัฒนาก่อนหน้า: API 40/40, Chrome 33 กลุ่ม, Unit 3/3, TypeScript/Lint/Format/Build ผ่าน; รอบเพิ่มข้อมูลตรวจ Syntax/รันซ้ำ/Hash เดิมและ Public API ผ่าน บันทึกรอบนี้ตรวจเอกสารเท่านั้น ไม่ได้รันทดสอบแอปหรือฐานข้อมูลใหม่
- ยังเหลือ: รูป/สิ่งอำนวยความสะดวกครบ แก้เลขมิเตอร์หรือเปลี่ยนมิเตอร์ย้อนหลัง วิธีคิดอัตรากลางรอบ บิลปิดสัญญากลางเดือน/แก้บิลหรือใบลดหนี้ ต่ออายุ/ย้ายห้อง/แก้สัญญาที่เริ่มใช้ แบ่งหน้า/ส่งออก และตรวจรับตาม PDF/ความปลอดภัยรอบสุดท้าย บางรายการเป็นส่วนต่อยอด ต้องตรวจขอบเขตก่อนทำ
- ข้อเสนอเริ่มต่อ: รูปห้องและสิ่งอำนวยความสะดวก แล้วลองกระบวนการจริงตั้งแต่ขอเช่าถึงจบสัญญา ข้อเสนอนี้ยังไม่ใช่คำสั่งอนุมัติให้เริ่มแก้โค้ด
- รับช่วงต่อให้อ่าน WORK_LOG/BUSINESS_RULES และตรวจ Git/โค้ด/ฐานจริงก่อน เพราะผู้ใช้อาจเพิ่มข้อมูลแล้ว ผลจำนวนข้อมูลและสถานะ Process ในบันทึกเก่าเป็นผล ณ เวลาที่ตรวจ ไม่ใช่ค่าปัจจุบันอัตโนมัติ
- Working Tree ยังมีไฟล์แก้ไข/ไฟล์ใหม่ที่ไม่ Commit/Push การบันทึกเอกสารไม่ได้ส่งโค้ดไป GitHub หรือย้าย MySQL volume/.env ไปอีกเครื่อง ให้ทำตาม SETUP_NEW_MACHINE.md เมื่อต้องย้ายเครื่อง

### เพิ่มข้อมูลห้องทดสอบตามคำขอ — 14 พฤศจิกายน 2026

- พบข้อมูลหอเดิมหนึ่งแห่งและไม่มีห้อง จึงเพิ่มห้อง DEMO-101 ถึง DEMO-104 และ DEMO-201 ถึง DEMO-204 รวม 8 ห้องในหอเดิม ไม่เพิ่มหอแห่งที่สองหรือแก้ข้อมูลหอเดิม
- ค่าเช่า 2,500–4,500 บาท/เดือน ห้องพัดลม 2 ห้อง ห้องแอร์ 6 ห้อง ความจุ 1–2 คน; 7 ห้องเปิดและว่าง ส่วน DEMO-204 ปิดใช้งานสำหรับทดสอบ ไม่สร้างสถานะมีผู้เช่าโดยไม่มีสัญญา
- ข้อมูลชุดนี้อยู่ใน MySQL เพื่อให้ผู้ใช้ลองใช้งานต่อ ไม่ใช่ Fixture ที่ลบเมื่อจบคำสั่ง ไม่สร้างบัญชี สัญญา บิล หรือราคาน้ำไฟจำลอง
- สคริปต์เพิ่มอย่างเดียว `node server/scripts/add-demo-rooms.js` ต้องมีหอเดิมแห่งเดียว รันซ้ำข้ามเลขห้องที่มีแล้ว ไม่ทับค่าเดิม ทดสอบรอบแรกเพิ่ม 8 รอบสองเพิ่ม 0 และ Hash หอ/ห้องที่มีอยู่ไม่เปลี่ยน
- ตรวจ Public API HTTP 200 พบหอเดียว/ห้อง DEMO 8 ห้อง; available-rooms แสดง 7 และซ่อน DEMO-204 เว็บ Local HTTP 200 งานนี้ไม่รันชุด API/UI เต็มซ้ำหรืออ้างผลเก่าเป็นผลรอบนี้ ไม่เปลี่ยน Schema/Environment

### ระบบบริหารหอพักมีการทำงานจริงแล้ว — 14 พฤศจิกายน 2026

- ยืนยันค่าเริ่มต้น 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วัน ให้ Admin ปรับได้ ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง และต้องมีบัญชี USER ก่อนทำสัญญา ยึด BUSINESS_RULES.md แทนข้อความรอยืนยันในประวัติเก่า
- เพิ่ม Schema, API และหน้าจอจริงสำหรับผู้เช่า สัญญา มิเตอร์ บิล เงิน/สลิป ประกัน แจ้งซ่อม รายงาน ข่าวสาร การแจ้งเตือน และ Audit พร้อมตรวจสิทธิ์ ADMIN/USER
- ใช้ Migration เพิ่ม 17 ตาราง/สองคอลัมน์ Booking และขยาย InvoiceItem.unitPrice บน dormify เดิมแล้ว ตรวจ Hash ของข้อมูลเดิมทั้งเจ็ด Models ตรงกัน
- API 40/40, Chrome 33 กลุ่ม, Unit 3/3, TypeScript/Lint/Format/Build ผ่านพร้อม Fixture cleanup ตรวจข้อมูลเดิมทุก Model; Entry 303.28 KB/gzip 100.42 KB
- db:check หลังทดสอบ User 1/AuthSession 2/RentalPolicy 1 อีก 21 Models 0; Schema diff ไม่พบความต่าง เปิด npm start กลับบน Local และไม่เปลี่ยน .env/Secret ดูบันทึกใน WORK_LOG.md
- วิธีใช้ รายการไฟล์ และข้อจำกัดที่ยังไม่พัฒนาอยู่ [DORM_OPERATIONS.md](DORM_OPERATIONS.md) ยังไม่มีแก้มิเตอร์ย้อนหลัง/บิลปิดสัญญากลางเดือน/ออกบิลอัตโนมัติ และหยุดออกบิลเมื่ออัตราเปลี่ยนกลางรอบ
- ไม่ Reset/Seed ไม่สร้างฐานเพิ่ม และยังไม่ Commit/Push

### แก้หอ/ห้อง และปิด–เปิดใช้งานพื้นฐานเสร็จ — 14 พฤศจิกายน 2026

- Admin แก้ข้อมูลหอ/เลขห้อง/ประเภท/ความจุ/ค่าเช่าและปิด–เปิดห้องได้ มี Dialog ยืนยันและข้อความไทย อ่านข้อมูล API จริง
- Room.isActive แยกจาก isAvailable; ปิดไม่ได้เมื่อมี PENDING/CONFIRMED, เปิดกลับไม่เปลี่ยนการถูกจอง, ข้อมูล Room/Booking ไม่ถูกลบและราคาในคำขอเดิมไม่ถูกแก้
- มีคำขออนุมัติแล้วแก้รายละเอียดห้องไม่ได้ ยกเว้น Base rent สำหรับคำขอใหม่; Public ซ่อนห้องปิด และ Backend กันส่งคำขอ/อนุมัติจริง
- ใช้ Room row lock เดียวในเส้นทางแก้/ปิด/ส่งคำขอ/อนุมัติ เพิ่ม Migration 20261114000000_room_active และใช้ migrate deploy แล้ว ตรวจ Hash ข้อมูลเดิมเจ็ดตารางตรงกัน ไม่ Reset/Seed หรือสร้างฐานเพิ่ม
- ผลรอบนี้: API 28/28, Chrome UI 22 กลุ่ม, Frontend unit 3/3, Lint/Format/TypeScript/Build ผ่าน; Schema diff ไม่พบความต่าง; Fixture cleanup ยืนยันข้อมูลเดิมไม่เปลี่ยน
- หลังทดสอบ User 1/AuthSession 2/อีกห้า Models 0 เปิด npm start กลับ เว็บ/API/phpMyAdmin HTTP 200 ไม่มีหอ/ห้องจำลองค้าง
- ไฟล์และข้อจำกัดอยู่ใน docs/ROOM_MANAGEMENT.md; ยังไม่ทำรูป/สิ่งอำนวยความสะดวกครบ ผู้เช่า/สัญญา/มิเตอร์/บิล/การเงินหรือ Audit ข้อ 3/6/9 ยังรอยืนยัน
- ยังไม่ Commit/Push รักษางานค้างก่อนหน้าไว้ครบ

### แก้ MySQL ตาม .env ล่าสุดและตรวจผ่าน Chrome — 14 พฤศจิกายน 2026

- ผู้ใช้เลือกให้แก้การเชื่อมต่อ MySQL ตาม Root .env ล่าสุดโดยชัดเจน ซิงก์บัญชี app/root เดิมกับ Server DATABASE_URL และโหลด MySQL Container ด้วย Volume เดิม
- ตรวจ Hash ของข้อมูลทั้งเจ็ดตารางก่อน–หลังตรงกัน JWT Secret เดิมไม่เปลี่ยน ไม่มี Reset/Seed/ลบ Volume หรือเปลี่ยน Schema/Grants
- ทดสอบ Chrome Headless จริงด้วย Profile ใหม่ กรอก dormify_app/รหัสจาก .env และคลิก Submit ผ่าน เข้าโครงสร้าง dormify เห็นทั้งเจ็ดตาราง; .env คงที่ตลอดรอบ Browser check
- ตรวจปิดงาน Root .env กับ Server URL ตรงกัน, db:check MySQL 8.4.13 ผ่าน User 1/AuthSession 2/อีกห้า Models 0; เว็บ 5173, API 5000, Properties API และ phpMyAdmin 8080 ตอบ 200
- เปิด npm start ค้างไว้แล้ว ยังไม่รันชุดทดสอบที่สร้าง Fixture เพิ่มและไม่ Commit/Push เปลี่ยนเฉพาะ Local Credentials ที่ Ignore และเอกสารบันทึก
- ใช้ MYSQL_PASSWORD จาก Root .env ปัจจุบันเข้า phpMyAdmin ไม่เปลี่ยนไฟล์อีกโดยไม่ซิงก์รหัสใน MySQL จริง

### ยัง Login ไม่สำเร็จเพราะ .env เปลี่ยนระหว่างทดสอบ — 14 พฤศจิกายน 2026

- ผู้ใช้แจ้งยังเข้าไม่ได้ ตรวจพบ Root .env ไม่ตรง Server อีกครั้ง จึงซิงก์ตามคำอนุญาตเดิมและตรวจเจ็ดตารางไม่เปลี่ยน พร้อมโหลด Container ใหม่
- ระหว่างทดสอบ Chrome จริง Root .env ถูกบันทึกอีกครั้งเวลา 12:26:51 UTC หลัง Server sync 12:26:33 UTC ประมาณ 18 วินาที ค่ารหัส app/root ใน Root .env จึงต่างจาก Container อีก ขณะที่ Container และ Server ยังตรงกัน
- Chrome Login รอบนี้ไม่ผ่าน จึงยังไม่ถือว่าปัญหาผู้ใช้แก้เสร็จ db:check ผ่านด้วยค่าของ Backend และเปิดเว็บกลับไว้แล้ว
- ถามให้ผู้ใช้ยืนยันว่าหยุดแก้ .env และใช้ค่าล่าสุดได้แล้วก่อนซิงก์/ทดสอบต่อ ไม่ทับไฟล์ .env ของผู้ใช้หรือหมุนรหัสซ้ำระหว่างแก้ค่า

### ซิงก์รหัส MySQL และแก้ Backend URL สำเร็จ — 14 พฤศจิกายน 2026

- หลังอธิบายขั้นตอนเปลี่ยนรหัส ผู้ใช้สั่งให้ทำให้ จึงมีคำยืนยันเปลี่ยน app/root ตามค่าปัจจุบันใน Root .env แล้ว ไม่ใช่สถานะรออนุมัติด้านล่างอีก
- ตรวจเพิ่มพบ DATABASE_URL ของ Server ถูกแก้จนขาด Host/Port และ Parse ไม่ผ่าน ซ่อมเป็น URL MySQL ของ dormify_app ที่ 127.0.0.1 ตาม MYSQL_PORT พร้อม Encode รหัส รักษา JWT Secret เดิม
- เปลี่ยนรหัสเฉพาะบัญชีเดิม dormify_app@% และ root สอง Host ตามค่าที่ผู้ใช้กำหนด ไม่เปลี่ยน Grants/Schema/ข้อมูล ไม่บันทึกรหัสในเอกสาร
- ตรวจ Hash ของทั้งเจ็ดตารางธุรกิจก่อน–หลังตรงกัน สร้าง Container MySQL ซ้ำด้วย Volume เดิมเพื่อโหลด Environment และ Healthcheck ผ่านทั้ง MySQL/phpMyAdmin
- db:check ผ่าน MySQL 8.4.13 จำนวน User 1/AuthSession 2/อีกห้า Models 0; ทดสอบ HTTP Session ใหม่ Login phpMyAdmin ด้วย .env ปัจจุบันผ่านและเปิดโครงสร้างครบเจ็ดตาราง
- เปิด npm start กลับแล้ว เว็บ 5173/API 5000; ไม่รัน App suites ที่สร้าง Fixture เพราะแก้ Local Credentials ไม่แก้ Runtime งานนี้เปลี่ยน server/.env ที่ Ignore และบันทึก ไม่มี Commit/Push

### ตรวจ Access denied ซ้ำหลังค่า .env เปลี่ยน — 14 พฤศจิกายน 2026

- ตรวจล่าสุด Root .env มีรหัส dormify_app ไม่ตรง DATABASE_URL ของ Server และรหัส app/root ไม่ตรง Environment ของ Container เดิม db:check ด้วยค่าฝั่ง Server ยังผ่าน แต่ HTTP Login phpMyAdmin ด้วย .env ปัจจุบันไม่ผ่าน
- ต่างจากผลตรวจครั้งก่อนที่ .env ตัวจริงยังตรงกัน จึงไม่สรุปว่าเป็นแค่ Browser Cache หรือไฟล์ตัวอย่างอีก
- เตรียมแนวทางเปลี่ยนรหัสบัญชีเดิมตามค่าผู้ใช้ใน .env พร้อมซิงก์ Backend โดยรักษาข้อมูล แต่คำสั่งถูก Auto-review ปฏิเสธก่อนเริ่ม Process เนื่องจากยังไม่มีคำยืนยันให้เปลี่ยนรหัสจริงของ app/root ชัดเจน ไม่มีการเปลี่ยนรหัส/Environment จากคำสั่งนั้น
- ถามยืนยันผู้ใช้แล้ว รอคำตอบก่อนแก้ Credentials ไม่ Retry หรือใช้ทางอ้อม เปิดเว็บกลับด้วย Backend config เดิมที่เชื่อม MySQL ได้

### ลบ Root .env.example เพื่อลดความสับสน — 14 พฤศจิกายน 2026

- ลบเฉพาะ .env.example ที่ Root ตามคำขอผู้ใช้ เก็บ .env ตัวจริงและตรวจ Hash ไม่เปลี่ยน ไม่เปลี่ยนรหัส MySQL
- client/.env.example และ server/.env.example ยังอยู่สำหรับ Environment ของแต่ละส่วน; setup สร้าง Root .env จากโค้ด ไม่พึ่งไฟล์ที่ลบ
- ปรับคู่มือเครื่องใหม่/phpMyAdmin และบันทึก ไม่รันทดสอบแอปซ้ำเพราะไม่ได้แก้ Runtime หรือข้อมูล ไม่มี Commit/Push

### ตรวจ phpMyAdmin แจ้ง Access denied 1045 — 14 พฤศจิกายน 2026

- db:check เชื่อม MySQL ได้; MYSQL_PASSWORD ใน Root .env ตรงกับ DATABASE_URL ของ Server ทดสอบ HTTP Login ใน phpMyAdmin ด้วย dormify_app และรหัสตัวจริงสำเร็จ เปิดโครงสร้างเห็นครบเจ็ดตาราง
- พบ .env.example ถูกแก้ให้มีค่ารหัสที่ไม่ตรงกับ .env ตัวจริง รักษางานผู้ใช้ไว้ ไม่พิมพ์ค่าใน Log; หากใช้รหัสจากไฟล์ตัวอย่างจะไม่ตรงกับบัญชีจริง
- ให้เข้าสู่ระบบด้วย MYSQL_PASSWORD จาก Root .env ไม่ใช่ .env.example หรือรหัส Admin ของเว็บ ยังไม่ยืนยันว่าการ Login ผ่าน Browser ของผู้ใช้สำเร็จจนผู้ใช้ลองใหม่
- ไม่เปลี่ยนรหัส/สิทธิ์/Secrets/Schema ไม่ Reset หรือลบ Volume แก้เฉพาะบันทึกและคู่มือ

### เก็บกวาดไฟล์ที่ไม่จำเป็น — 14 พฤศจิกายน 2026

- ตรวจ Import graph ของ Frontend จาก main.tsx และ test/resources.tsx แล้วไม่มีไฟล์แอปที่ไม่ถูกอ้างถึง จึงไม่ลบ Components/Pages ที่ยังใช้
- ลบเฉพาะ client/dist, client/.ui-artifacts และโฟลเดอร์ว่าง .local/client/src/data รวมไฟล์ Generated 32 ไฟล์ 3,736,596 Bytes ไม่สร้างสำเนาเพิ่ม
- รูปและ JSON ผลทดสอบเก่าถูกลบตามงานเก็บกวาดแล้ว ผลทดสอบที่บันทึกในเอกสารยังเป็นประวัติเดิม; Build/UI tests สร้างไฟล์เหล่านี้ใหม่ได้เมื่อสั่งรัน
- คง .env/SQLite archive/Backups/MySQL Volume/Dependencies/Cache Vite ที่กำลังใช้ เอกสารข้อกำหนดและชุดทดสอบ ไม่มี Source/Schema/Package ถูกเปลี่ยนในรอบนี้
- TypeScript typecheck ผ่าน ไม่รัน API/UI suites บนฐานที่กำลังใช้งาน และไม่ Build ซ้ำเพื่อสร้างผลลัพธ์ที่เพิ่งลบ

### เพิ่ม phpMyAdmin สำหรับดูฐานเดิม — 14 พฤศจิกายน 2026

- เปิดด้วย npm.cmd run db:admin แล้วเข้า http://127.0.0.1:8080 ใช้ dormify_app และค่า MYSQL_PASSWORD จาก Root .env (ไม่ใช่รหัส Admin ของเว็บ) คู่มือ docs/PHPMYADMIN.md
- phpMyAdmin 5.2.3 Apache ตรึง digest อยู่ใน Compose profile tools เชื่อม Service mysql เดิม ไม่สร้างฐานเพิ่ม ไม่แทน Prisma และไม่ฝังบัญชี Root/Auto-login
- ตรวจ HTTP 200, Cookie/CSRF Login และโครงสร้าง dormify เห็นเจ็ดตารางจริง; ทั้งสอง Container Healthy ผูกพอร์ตเฉพาะ 127.0.0.1
- เปลี่ยน db:status ให้แสดงทั้งสอง Service, db:stop หยุดทั้งคู่ และเพิ่ม db:admin:stop สำหรับหยุดเฉพาะเครื่องมือ ไม่ลบ Volume
- ข้อมูลล่าสุดที่ตรวจ: User 1, AuthSession 2, อีกห้า Models 0 มีข้อมูลใช้งานแล้ว ไม่ใช่ฐานว่างตามผลรอบเตรียมเครื่องก่อนหน้า
- เทียบ Hash หก Models ที่ไม่ใช่ AuthSession แล้วตรงเดิม; Session เปลี่ยนระหว่างเว็บเปิดใช้งาน จึงไม่อ้างว่าทั้งฐานไม่เปลี่ยน ไม่ลบ/ย้อนข้อมูลเพื่อให้ผลผ่าน ไม่รัน API/UI suites ซ้ำในรอบนี้
- แก้ Healthcheck ที่ใช้ PHP file_get_contents แล้วไม่ผ่าน เป็น curl ตรวจ HTTP; เปิดซ้ำแล้ว Healthy ตรวจ Compose/เอกสารตามผลรอบนี้ ไม่ใช่ผล Build/Test ใหม่ของแอป
- ไฟล์สำคัญ: compose.yaml, package.json, .env.example, README.md, docs/PHPMYADMIN.md, SETUP_NEW_MACHINE.md, PRISMA_START.md และบันทึก ไม่มี Dependencies npm ใหม่ ไม่มี Schema/Environment เดิมถูกเปลี่ยน ยังไม่ Commit/Push

### เตรียมและทดสอบ Local บนเครื่อง D:\Code\dormify สำเร็จ — 14 พฤศจิกายน 2026

- ติดตั้ง Dependencies ตาม Lockfile ทั้ง Root/server/client ด้วย npm ci; npm ls --depth=0 ผ่านครบ ไม่แก้ Package/Lockfile
- พบ Docker Desktop 4.99.0 แบบรายผู้ใช้และเปิด Engine 29.9.3 แล้ว MySQL 8.4.13 Container dormify-mysql-1 Healthy ที่ 127.0.0.1:3306 ใช้ฐาน dormify และ Volume dormify_mysql_data เท่านั้น
- ตรวจ SQLite เดิมแบบ Read-only: Integrity ok, FK ไม่มีปัญหา ทั้งเจ็ดตารางว่าง จึงไม่ต้อง Import รายการ เก็บไฟล์เดิมที่ server/prisma/backups/before-mysql-20261114.db และตรวจ SHA-256 ตรงเดิม
- เก็บ server/.env เดิมที่ server/.env.before-mysql-20261114 เปลี่ยนเฉพาะ DATABASE_URL เป็น MySQL; JWT Secret เดิมคงไว้ สุ่มรหัสผ่าน MySQL ใหม่ใน Root .env ไฟล์ส่วนตัวทั้งหมดถูก Ignore
- setup, Prisma Generate 5.22.0 และ migrate deploy ผ่าน ไม่มี Reset/Seed/Test/Shadow database; setup ซ้ำรักษา .env ทั้งสามไฟล์แบบ Byte-for-byte
- ผลรอบนี้: Backend 23/23, Chrome UI 17 กลุ่ม, Frontend unit 3/3, TypeScript/Build, Lint และ Format ผ่าน ทดสอบ API/UI ตามลำดับด้วย Fixture namespace เดียวต่อชุดและ Cleanup ยืนยันข้อมูลเดิมไม่เปลี่ยน
- Format check เริ่มต้นไม่ผ่านเพราะ Working Tree เป็น CRLF; รัน Prettier ปรับเป็น LF ตรวจเทียบ HEAD แล้วไม่มี Content diff เพิ่ม .gitattributes ให้ไฟล์ Frontend ที่ตรวจ Format คง LF เมื่อ Checkout ข้ามเครื่อง
- หลัง Cleanup ตรวจเจ็ด Models เป็น 0 ทั้งหมด ไม่มี Admin Default หรือห้องจำลองค้าง
- เปิด npm start ไว้ เว็บ http://127.0.0.1:5173 และ API http://127.0.0.1:5000 ตอบ 200; Properties/Available rooms ตอบ 200 และ /auth/me เมื่อไม่มี Token ตอบ 401 ไม่รับรองว่า Process จะยังเปิดอยู่เมื่อกลับมาครั้งหน้า
- งานต่อ: สร้าง Admin ด้วย npm.cmd --prefix server run admin:create ใน Terminal ให้ผู้ใช้ตั้งรหัสเอง แล้วบันทึกหอ/ห้องจริง จากนั้นพัฒนาจัดการห้องให้ครบตามคำสั่งต่อไป
- ยังไม่ Commit/Push เปลี่ยนเอกสารและ .gitattributes; Environment/SQLite archive/Dependencies/Volume เป็นข้อมูล Local ไม่ตาม Git

### อ่านเอกสารทั้งหมด — 14 พฤศจิกายน 2026

- อ่าน Markdown ทั้ง 20 ไฟล์ใน docs รวมโฟลเดอร์ analysis; PDF อีก 1 ไฟล์อ่านผ่าน PDF_TEXT_EXTRACTION.md ครบห้าหน้าและตรวจ SHA-256 ตรงต้นฉบับ ไม่ได้ตรวจภาพตารางเวลา
- ยึด BUSINESS_RULES.md สำหรับกติกา; รายงาน Phase 0/Auth/UI/TypeScript และ RTM เดิมเป็นหลักฐานในอดีต ไม่ใช้สถานะเก่าแทนโค้ดปัจจุบัน
- ข้อความยังไม่ Commit/Push และ Docker Healthy/ข้อมูลว่างบางส่วนเป็นบริบทเครื่องก่อนหน้า; เครื่องนี้รับ Commit 75ad050 แล้ว แต่ยังไม่ได้เตรียม MySQL ตามบันทึกการรับโค้ดด้านล่าง
- รอบนี้แก้เฉพาะบันทึกการอ่าน ไม่เปลี่ยน Runtime, Environment หรือข้อมูล และไม่รันทดสอบแอป; งานต่อให้ตรวจสถานะเครื่องจริงก่อนติดตั้ง/พัฒนา

### รับโค้ดจาก GitHub บนสำเนาเครื่องเดิม — 13 พฤศจิกายน 2026

- ปรับ main ให้ตรง origin/main ที่ Commit `75ad050` แล้ว Remote เริ่มประวัติใหม่จึง Pull แบบ Fast-forward จากสำเนานี้ไม่ได้
- เก็บประวัติ Local ที่ Branch `archive/local-before-github-sync-20261113` ไม่ Merge ประวัติเก่ากลับ Remote และไม่ได้ Push
- `.env` ของ server/client และ `server/prisma/dev.db` เดิมยังอยู่; server/.env เครื่องนี้ยังชี้ SQLite จึงยังไม่พร้อมรันโค้ด MySQL ล่าสุด
- รอบนี้รับโค้ดเท่านั้น ยังไม่ติดตั้ง Dependencies ใหม่ ตั้งค่า Docker/MySQL ย้ายข้อมูล หรือทดสอบแอป ผลทดสอบเดิมด้านล่างไม่ใช่ผลของเครื่องนี้
- ทำต่อโดยอ่าน SETUP_NEW_MACHINE.md และตรวจ Environment เดิมก่อนตั้งค่า ห้าม Reset/Seed หรือลบ SQLite เดิม

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
ยังคง ADMIN/USER และเป้าหมายเอกสาร Admin 13 + User 12 ข้อ มีระบบบริหารหอพักแล้วตาม DORM_OPERATIONS.md แต่ยังไม่อ้างว่าครบทุกข้อของ PDF

| ส่วน | สถานะ |
|---|---|
| Frontend | React 18 + Vite 5 + TypeScript strict + Tailwind 3 |
| Backend | Node.js + Express 5, CommonJS JavaScript |
| Database | MySQL 8.4.13 ใน Compose ตรึง digest + Prisma 5.22.0 |
| Migration | SQL ใน server/prisma/migrations ใช้ migrate deploy ไม่ Reset/Seed/Shadow |
| Models | 24 Models รวมเดิมเจ็ดและเพิ่มสัญญา/มิเตอร์/บิล/เงิน/ซ่อม/รายงาน/ข่าว/Audit/Policy |
| สิทธิ์ | ADMIN/USER; สมัครสาธารณะได้ USER เท่านั้น |
| Environment | Root/server/client .env สุ่มด้วย setup และ Ignore |
| ข้อมูล Local | มี Schema และนโยบายเริ่มต้น; จำนวนข้อมูลจริงดูผล db:check ล่าสุด ไม่มี Admin Default |
| วิธีรัน | เปิด Docker แล้ว npm run db:up; npm run dev เปิดเว็บ/API |

## ทำงานแล้ว

- สมัคร/Login/ตรวจบัญชี/Logout พร้อม Session เพิกถอนได้ ตรวจสิทธิ์/เจ้าของข้อมูลจาก Server
- Public อ่าน API จริง ค้นหา/กรองห้อง ดูรายละเอียด ไม่เติม Mock Data
- Admin สร้าง/แก้ข้อมูลหอ ดู/เพิ่ม/แก้/ปิดเปิดห้อง อนุมัติ/ปฏิเสธคำขอ และ Dashboard สรุป API
- User ดูบัญชี คำขอ/ข้อมูลห้องของตนเอง
- ตรวจ ID/วันที่/ความจุ/เงิน/เลขห้องซ้ำ และป้องกันอนุมัติสองคำขอให้ห้องเดียวกันแม้ส่งพร้อมกัน
- Prisma client กลาง, Lazy routes, Hook ยกเลิกคำขอเก่า, แยก RoomForm/RoomTable, ESLint/Prettier
- MySQL รองรับภาษาไทย เงิน DECIMAL(12,2), ENUM Role และ Unique เลขห้องต่อหอ
- Setup ซ้ำรักษาข้อมูล ใช้ Fixture namespace ในฐานเดียวแทนฐานทดสอบเพิ่มเติม
- ทะเบียนผู้เช่าเชื่อม USER, สัญญาร่าง/เริ่มใช้/จบ, กันห้องหมดเวลา, บิล Snapshot และรับเงินเต็มยอดพร้อมหลักฐานส่วนตัว
- เงินประกันแยกรับ/คืน แจ้งซ่อม/ข่าวสาร/การแจ้งเตือน รายจ่าย/รายงานจริง และ Audit กิจกรรมสำคัญ อ่านขั้นตอนใน DORM_OPERATIONS.md

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
- รูปภาพ/สิ่งอำนวยความสะดวกและ Audit/Version history ของทุกการแก้ไขยังไม่ครบ; แก้หอ/ห้อง/ปิดเปิดพื้นฐานทำแล้ว
- PENDING ไม่กันห้อง หลังอนุมัติใช้เวลาที่ Snapshot ตามนโยบาย หมดอายุอัตโนมัติเมื่อ Backend เปิด มีปุ่มยกเลิกการกันห้องใน Admin แล้ว
- Booking ยังไม่ใช่สัญญาหรือทะเบียนผู้เช่า ยอดคำขอเป็นค่าเช่ารายเดือน ไม่ใช่บิล
- ระบบผู้เช่า/สัญญา/มิเตอร์/บิล/เงิน/ซ่อม/ข่าว/รายงาน/Audit ใช้งานพื้นฐานแล้ว ข้อจำกัดเรื่องมิเตอร์ย้อนหลัง เปลี่ยนอัตรากลางรอบ และบิลปิดสัญญาดู DORM_OPERATIONS.md
- รีวิวส่งไม่ได้ รายการโปรดอยู่ในหน้าเว็บ รายการจองยังไม่มี Pagination
- ช่องโหว่/คำเตือน Dependency เดิมยังไม่ได้แก้ทั้ง Stack ในรอบนี้
- ผู้ใช้ยืนยันข้อ 3/6/9 แล้ว ค่าเริ่มต้น 72 ชั่วโมง/หนึ่งเดือน/ห้าวัน Admin เปลี่ยนสำหรับรายการใหม่ได้ ประวัติก่อนหน้านี้ที่ระบุรอยืนยันไม่ใช่สถานะปัจจุบัน

## Git และจุดเริ่มทำต่อ

ประวัติ main เริ่มใหม่แล้วในงานก่อนหน้า ดู WORK_LOG/GITHUB_WORKFLOW
งานย้ายฐานและเอกสารรอบนี้ยังไม่ Commit/Push รวมงานค้างก่อนเริ่ม ต้องส่งให้ครบก่อนเปลี่ยนเครื่อง
รักษางานลบ client/src/assets/fonts/OFL.txt เดิมไว้ การลบใบอนุญาตใน node_modules ไม่ตาม Git และ npm ci สร้างกลับ
ZIP/Manifest สำรองงานลบไฟล์นั้นถูกลบตามคำสั่งผู้ใช้แล้ว ไม่สร้างใหม่เอง; สำรองประวัติ Git งานก่อนหน้าเป็นอีกชุด
ไม่ Commit/Push อัตโนมัติ

จุดทำต่อ: ใช้บัญชี Admin ของผู้ใช้และข้อมูลหอจริง ตรวจอัตราน้ำไฟก่อนกรอก แล้วทำตาม DORM_OPERATIONS.md; ก่อนต่อยอดให้เลือกรายการที่ยังขาด เช่น รูป/สิ่งอำนวยความสะดวก หรือ Workflow แก้มิเตอร์/บิลปิดสัญญา ไม่เพิ่มนโยบายเอง
อัปเดต WORK_LOG/PROJECT_STATUS ทุกครั้งตาม AGENTS.md
