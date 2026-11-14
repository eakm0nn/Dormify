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

### 2026-11-14 — บันทึกสรุปสิ่งที่ทำและจุดเริ่มต่อ (Asia/Bangkok)

- คำขอ: ผู้ใช้ให้บันทึกสิ่งที่ทำแล้ว หลังเพิ่มข้อมูลทดสอบและสรุประบบที่ยังเหลือ
- ทำแล้วในรอบนี้: ตรวจ PROJECT_STATUS/WORK_LOG/BUSINESS_RULES และ Git status แล้วเพิ่มสรุปส่งต่อใน PROJECT_STATUS.md โดยคงประวัติเดิม แยกระบบพื้นฐานที่มีจริง ข้อมูล DEMO ผลทดสอบก่อนหน้า และงานค้างออกจากข้อเสนอเริ่มต่อ
- สรุปงานก่อนหน้า: UI ภาษาไทยขาวฟ้า/TypeScript, Express JavaScript + MySQL Docker/Prisma, ADMIN/USER, ห้อง ผู้เช่า คำขอ/กันห้อง สัญญา มิเตอร์ บิล ชำระเงิน/สลิป ประกัน แจ้งซ่อม ข่าวสาร การแจ้งเตือน รายจ่าย/รายงาน และ Audit; ค่าเริ่มต้น 72 ชั่วโมง/1 เดือน/5 วัน Admin ปรับได้ ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง ต้องมีบัญชี USER ก่อนสัญญา
- ข้อมูลทดสอบก่อนหน้า: เพิ่มห้อง DEMO 8 ห้องในหอเดิม ราคา 2,500–4,500 บาท 7 ห้องเปิดและว่าง DEMO-204 ปิดหนึ่งห้อง ไม่ทับข้อมูลหอ/ห้องเดิม มีสคริปต์เพิ่มอย่างเดียวที่รันซ้ำได้ ไม่สร้างสัญญาหรือเงินจำลอง
- ไฟล์รอบนี้: docs/PROJECT_STATUS.md และ docs/WORK_LOG.md; รายการไฟล์งานระบบเดิมและรายละเอียดผลตรวจอยู่ docs/DORM_OPERATIONS.md และรายการก่อนหน้า
- ตรวจสอบรอบนี้: ตรวจความสอดคล้องเอกสาร ลิงก์ Local และ git diff --check ไม่รัน API/UI/Build/ฐานข้อมูลใหม่เพราะแก้เฉพาะเอกสาร ผล API 40/40, Chrome 33 กลุ่ม, Unit 3/3 และ Build ผ่านเป็นผลจากรอบพัฒนาที่บันทึกไว้ก่อนหน้า ไม่ใช่ผลรันใหม่
- ผลต่อข้อมูล/Environment: ไม่แก้โค้ด Schema แพ็กเกจ .env หรือฐานข้อมูล ไม่มี Reset/Seed/ลบข้อมูล ไม่บันทึก Secret หรือข้อมูลส่วนตัว และไม่ Commit/Push
- งานค้าง: รูป/สิ่งอำนวยความสะดวก มิเตอร์ย้อนหลัง/เปลี่ยนมิเตอร์ อัตรากลางรอบ บิลปิดสัญญา/แก้บิล ต่ออายุ/ย้ายห้อง/แก้สัญญาที่เริ่มใช้ แบ่งหน้า/ส่งออก และตรวจขอบเขต PDF/ความปลอดภัยรอบสุดท้าย บางอย่างเป็นส่วนต่อยอด ไม่ถือว่าทุกข้ออนุมัติให้ทำ
- จุดเริ่มต่อ: อ่านบันทึกและตรวจ Working Tree/ข้อมูลจริงก่อน ข้อเสนอคือทำรูปห้อง/สิ่งอำนวยความสะดวกแล้วทดลองวงจรเช่าครบกระบวนการ รอผู้ใช้เลือกงานถัดไป; งานที่ยังไม่ Commit/Push และ MySQL volume/.env ไม่ได้ย้ายเครื่องผ่านการบันทึกเอกสาร

### 2026-11-14 — เพิ่มห้องทดสอบในหอเดิม (Asia/Bangkok)

- คำขอ: สร้างข้อมูลหอพักเพื่อให้ผู้ใช้ทดสอบ ตรวจฐานจริงพบมีหอเดิมหนึ่งแห่งแต่ไม่มีห้อง จึงรักษาข้อมูลเดิมและเพิ่มห้องในหอนั้น
- ทำแล้ว: เพิ่ม DEMO-101/102/103/104/201/202/203/204 รวม 8 ห้อง ราคา 2,500–4,500 บาท ความจุ 1–2 คน พัดลม 2/แอร์ 6 เปิดรับเช่า 7 และปิด DEMO-204 หนึ่งห้อง พร้อม Audit กิจกรรมเพิ่มข้อมูลทดสอบ
- ไฟล์: server/scripts/add-demo-rooms.js, docs/PROJECT_STATUS.md, docs/WORK_LOG.md สคริปต์ใช้ Transaction เพิ่มอย่างเดียว ไม่ Reset/Seed/ลบ/แก้รายการเดิม และไม่สร้างหอแห่งที่สอง
- ตรวจจริง: node --check ผ่าน; รันสคริปต์ครั้งแรกเพิ่ม 8 ครั้งที่สองเพิ่ม 0 และตรวจ Hash หอ/ห้องเดิมตรงกัน; GET /api/properties HTTP 200 หอเดียว/ห้อง DEMO 8; GET /api/properties/available-rooms HTTP 200 พบ 7 ห้อง ไม่แสดง DEMO-204; เว็บ 5173 HTTP 200
- ข้อมูล/Environment: เก็บข้อมูลทดสอบนี้ไว้ตามคำขอ ไม่ล้างเมื่อจบ ไม่เปลี่ยนบัญชี/Session/สัญญา/บิล/อัตราน้ำไฟ/Schema/.env และไม่เพิ่ม Dependency; ไม่รันชุดทดสอบเต็มหรือ Build เพราะเป็นการเพิ่มข้อมูลและสคริปต์เฉพาะ ไม่เปลี่ยนแอป
- เริ่มต่อ: รีเฟรชเว็บ เลือกห้อง DEMO เพื่อส่งคำขอ จากนั้นใช้ Admin อนุมัติและทดลองทำสัญญาตาม DORM_OPERATIONS.md อัตราน้ำไฟยังต้องตั้งก่อนทดสอบบิลน้ำไฟ งานยังไม่ Commit/Push

### 2026-11-14 — ระบบบริหารหอพัก สัญญา บิล การเงินและระบบประกอบ (Asia/Bangkok)

- คำขอ/ขอบเขต: ทำส่วนที่เหลือตามคำสั่งทำมาทีเดียว ผู้ใช้ยืนยันค่าเริ่มต้นกันห้อง 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วัน ให้ Admin ปรับได้ ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง และต้องมีบัญชี USER ก่อนทำสัญญา
- ทำแล้ว: เพิ่มทะเบียนผู้เช่า/ผู้พักร่วม สัญญาร่าง/แก้ร่าง/เริ่มใช้/จบ กันห้องหมดอายุ อัตรา/มิเตอร์ บิล Snapshot กันซ้ำ เงินสด/โอนพร้อมภาพหลักฐานส่วนตัว การตรวจรับเงิน ประกันแยกรับคืน แจ้งซ่อม รายจ่าย/รายงาน ข่าวสาร/การแจ้งเตือน และ Audit สำคัญ ใช้ข้อมูล Backend จริงและสอง Role เดิม
- ความถูกต้อง: Room/Lease/Invoice row lock และ Unique constraints กันห้องซ้อน บิลซ้ำและรับชำระซ้ำ; Decimal คำนวณเงิน ปัดครึ่งขึ้นสองตำแหน่ง; วันสิ้นเดือนอิงวันหลักเดิม; User อ่านข้อมูล/หลักฐานได้เฉพาะของตน; ต้องมี USER ทั้งตอนสร้างและเริ่มใช้สัญญา ล็อกทะเบียนระหว่างเปลี่ยนบัญชีและสร้างสัญญา
- ไฟล์สำคัญและรายการเต็ม: docs/DORM_OPERATIONS.md; Schema/Migrations สองชุด, routes operations/billing/community, lib domain/reservations, Controllers auth/booking/property, scripts create-admin/verify-db/run-db-tests, Fixture helper/operations.test.js; หน้าจอและ Shared components/types/navigation ใน Client พร้อม ui-smoke.mjs
- ฐานข้อมูล: migrate deploy เพิ่ม 17 Models และสองคอลัมน์ Booking จากนั้นขยาย InvoiceItem.unitPrice ให้รองรับช่วงค่าเช่าเดิม รวม 24 Models; เพิ่มนโยบายเริ่มต้นหนึ่งรุ่นเท่านั้น ตรวจ Hash ของข้อมูลเดิมเจ็ด Models ตรงกัน ไม่มี Reset/Seed/ลบ Volume/ฐาน Test หรือ Shadow และไม่เปลี่ยน .env/Secret
- ตรวจจริงล่าสุด: npm --prefix server test ผ่าน 40/40; npm --prefix client run test:ui Chrome ผ่าน 33 กลุ่ม รวมฟอร์มมิเตอร์/อัตรา บิล สัญญา สลิป รับเงิน ซ่อม ข่าว รายจ่าย นโยบายและรับ–คืนประกัน API/UI รันตามลำดับและหยุดเว็บใช้งานระหว่างทดสอบ Fixture cleanup ตรวจ Hash ข้อมูลเดิมทุก Model ผ่าน
- Frontend: npm --prefix client test ผ่าน 3/3; lint, format:check และ build รวม TypeScript strict ผ่าน Entry JS 303.28 KB/gzip 100.42 KB; node --check ของไฟล์ Backend ที่เปลี่ยน 17 ไฟล์ผ่าน; ตรวจลิงก์ Local ในเอกสารหลักแปดไฟล์ไม่พบลิงก์เสีย
- ปัญหาที่พบและแก้: Fixture checker ต้องใช้ invoiceId เป็น PK ของ InvoiceSettlement; Chrome ใน Sandbox คุย DevTools ไม่ได้จึงรันด้วยสิทธิ์เหมาะสม; ตรวจ Focus ใช้ Tab จริง; ตรวจภาพพบข้อความไทยเสียสามจุดจากการเขียนผ่าน Shell แก้ UTF-8 แล้ว เพิ่ม Browser assertions ของเมนู/สถานะและตรวจ Source ไม่พบข้อความเสีย; ทดสอบแจ้งเตือนเมื่อเครือข่ายล้มเหลวและลองใหม่ผ่าน
- ผลต่อข้อมูลหลัง cleanup: User 1/AuthSession 2/RentalPolicy 1 อีก 21 Models เป็น 0 คงบัญชี/Session เดิม ไม่มีห้องหรือรายการเงินทดสอบค้าง; Prisma migrate diff กับฐานจริงไม่พบความต่าง
- Environment/แพ็กเกจ: ไม่เพิ่ม Dependency หรือเปลี่ยน Stack เปิด npm start กลับบน 127.0.0.1 เท่านั้น ตรวจเว็บ 5173/API 5000/Properties API/phpMyAdmin 8080 HTTP 200 มี DeprecationWarning util._extend จากเครื่องมือรันเดิม ไม่ขัดการเริ่มเว็บ ไม่ได้ตรวจช่องโหว่ Dependency ใหม่ทั้ง Stack
- เอกสาร: อัปเดต BUSINESS_RULES, AGENTS, PROJECT_STATUS, README, SETUP_NEW_MACHINE, RTM และ DORM_OPERATIONS ให้แยกผลล่าสุดจาก Snapshot เก่าอย่างชัดเจน ไม่อ้างว่าครบทุกข้อ PDF เพียงเพราะมีเมนู
- งานค้าง/เริ่มต่อ: รูปและสิ่งอำนวยความสะดวกเต็มรูปแบบ การแก้มิเตอร์/เปลี่ยนมิเตอร์ย้อนหลัง วิธีคิดเมื่ออัตราเปลี่ยนกลางรอบ บิลปิดสัญญากลางเดือน/ใบลดหนี้ และออกบิลอัตโนมัติยังไม่พัฒนา ดูข้อจำกัดใน DORM_OPERATIONS.md ก่อนต่อยอด ต้องกรอกข้อมูลหอและอัตราจริงเอง ไม่สร้าง Admin/Mock ให้ใช้งานจริง งานทั้งหมดพร้อมงานค้างก่อนหน้ายังไม่ Commit/Push

### 2026-11-14 — จุดพักระหว่างพัฒนางานบริหารหอพัก (Asia/Bangkok)

- ขอบเขต: ทำงานที่เหลือตามคำสั่งทำมาทีเดียว ผู้ใช้ยืนยัน 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วัน Admin ปรับได้ ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง และต้องมีบัญชี USER ก่อนทำสัญญา
- ทำแล้ว: ร่าง Schema และ API operations/billing/community พร้อมหน้าเว็บที่ใช้ Backend จริง เพิ่มกติกาใน BUSINESS_RULES.md และ AGENTS.md
- ไฟล์หลัก: server/prisma/schema.prisma, server/src/routes/*Routes.js, server/src/lib/domain.js/reservations.js, client/src/pages/{Tenants,Leases,Meters,Invoices,Payments,Maintenance,Reports,News,Audit}.tsx และ OperationUI/PolicyPanel
- ตรวจจริง: npm --prefix client run typecheck, format, lint ผ่าน ยังไม่ทดสอบ API/UI ชุดใหม่หรือใช้ Migration ชุดนี้
- ข้อมูล/Environment: ยังไม่ Reset/Seed ไม่สร้างฐานเพิ่ม ไม่เปลี่ยน Secret; ยังไม่ Commit/Push
- ทำต่อ: ตรวจ SQL Migration แบบเพิ่มโครงสร้าง รักษาข้อมูลเดิม ติดตั้งแล้วตรวจสิทธิ์/ยอดเงิน/บิลซ้ำ/ข้อมูลส่วนตัวและ Fixture cleanup ก่อนถือว่าพร้อมใช้

### 2026-11-14 — พัฒนาจัดการหอและห้องพื้นฐานพร้อมปิด–เปิดใช้งาน (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้อนุมัติเริ่มแก้หอ แก้ห้อง ปิดใช้งานแบบเก็บประวัติ ตรวจคำขอ/สิทธิ์/เลขซ้ำและทดสอบจริง ไม่เพิ่มวงจรสัญญาหรือการเงิน
- Backend: เพิ่ม PUT /api/properties/:propertyId, PUT /api/properties/rooms/:roomId, PATCH /api/properties/rooms/:roomId/status ตรวจ ADMIN/Validation/Allowlist Fields; ป้องกันเลขซ้ำ แก้เจ้าของ/หอ/สถานะว่างข้าม Endpoint ไม่ได้
- กติกา: isActive แยกจาก isAvailable; ปิดไม่ได้เมื่อมี PENDING/CONFIRMED; เปลี่ยนเลข/ประเภท/ความจุไม่ได้เมื่อมี CONFIRMED ส่วน Base rent มีผลต่อคำขอใหม่ ไม่แก้ยอดเก่า เปิดกลับไม่ทำห้องที่ถูกจองให้ว่าง
- ความถูกต้องพร้อมกัน: เพิ่ม lib/room-lock.js ใช้ Parameterized FOR UPDATE ในการส่งคำขอ/อนุมัติ/แก้/ปิดห้อง ล็อก Room ก่อนอ่าน State เพื่อไม่ให้มีคำขอเกิดหลังปิดหรืออนุมัติทับสถานะปิด
- Frontend: ฟอร์มหอใช้ร่วมกันเพิ่ม/แก้, RoomForm เพิ่ม/แก้, ตารางแยกสถานะใช้งานกับการถูกจอง มี Dialog ปิดเปิดและ Error ไทย หน้า Public/ลิงก์ตรงไม่เปิดให้เช่าห้องปิด User ยังดูประวัติคำขอตนได้
- Migration: หยุด npm start ก่อน Generate เพิ่ม Room.isActive DEFAULT true ผ่าน 20261114000000_room_active ด้วย migrate deploy เก็บ Column/Row เดิมเจ็ดตารางเทียบ SHA-256 ก่อน–หลังตรงกัน ไม่มี Reset/Seed/ฐาน Test/Shadow/Volume ถูกลบ
- ผลตรวจจริง: Backend API 28/28 ผ่าน รวม concurrent request/deactivation และ approval guard; Chrome UI 22 กลุ่มผ่าน; Frontend unit 3/3; TypeScript strict/Build, Lint ไม่มี Warning และ Format check ผ่าน
- Error ที่แก้ในชุดทดสอบ: UI รอบแรก Timeout ที่หน้าห้องปิดเพราะ helper รอ h1 แต่ Empty State ใช้ h3 แก้ตัวรอให้รองรับ .empty-state h3 แล้ว UI ทั้งชุดผ่าน ไม่เปลี่ยน Business logic เพื่อข้าม Test
- ข้อมูลหลังทดสอบ: Fixture cleanup ตรวจแฮชข้อมูลเดิมตรงกัน ทุกครั้งลบเฉพาะ Namespace ของชุดทดสอบ API/UI รันตามลำดับ User 1/AuthSession 2/อีกห้า Models 0; Schema diff No difference detected
- เปิดระบบกลับ: npm start เปิดเว็บ 5173/API 5000; HTTP เว็บ/API/Properties/phpMyAdmin 8080 เป็น 200 Process ที่ค้างไว้ต้องตรวจใหม่เมื่อกลับมา
- ไฟล์สำคัญ: server/prisma/schema.prisma + Migration ใหม่, lib/room-lock.js, propertyController.js/bookingController.js/propertyRoutes.js, server/test/phase0.test.js; Client DormitoryForm.tsx/RoomForm.tsx/RoomTable.tsx/AddProperty.tsx/AdminRooms.tsx/Home.tsx/PropertyDetails.tsx/types/api.ts/utils/errors.ts/ui-smoke.mjs; README/SETUP_NEW_MACHINE/RTM/PROJECT_STATUS/รายงาน ROOM_MANAGEMENT.md
- ข้อมูล/Environment: ไม่เปลี่ยน Credentials/JWT/Dependencies/Role ไม่สร้างข้อมูลหอ/ห้องจริงให้เอง ไม่ Commit/Push รักษางานค้างจากรอบก่อน
- งานค้าง/เริ่มต่อ: รูป/สิ่งอำนวยความสะดวก/Audit ยังไม่ครบ ต่อไปทะเบียนผู้เช่าและสัญญาตามขอบเขต และวงจรยกเลิก/จบสัญญาก่อนปิดห้องที่มีผู้ถือสิทธิ์ ข้อ 3/6/9 ยังรอยืนยัน ไม่เปิดค่าที่เสนอ

### 2026-11-14 — แก้การเชื่อมต่อ MySQL ตาม .env ล่าสุดและยืนยัน Browser จริง (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้เลือกแก้การเชื่อมต่อ MySQL ตาม .env ล่าสุด ไม่พัฒนาฟีเจอร์อื่น
- ตรวจเริ่มต้น: Container/Backend ยังใช้รหัสชุดก่อนและ Root .env มีค่าต่างกันจริง เก็บไฟล์งานอื่นไว้ ไม่มีการขอให้ส่งรหัสผ่านในแชต
- ทำแล้ว: หยุด npm start ที่เปิดเอง ซิงก์ ALTER USER เฉพาะ dormify_app@%/root@%/root@localhost ตามค่าปัจจุบัน อัปเดต Server DATABASE_URL แบบ Encode รหัสและคง JWT Secret ไม่แก้ Root .env ที่ผู้ใช้กำหนด
- ข้อมูล: อ่านและ Hash แถวเรียง id ทั้งเจ็ดตารางก่อน–หลังตรงกัน ไม่ Reset/Seed/ลบ Volume/แก้ Schema หรือ Grants; Root .env คงที่ระหว่างคำสั่งซิงก์
- Docker: Compose up --wait mysql phpmyadmin โหลด Environment ใหม่โดยใช้ dormify_mysql_data เดิม ทั้งสอง Healthy
- Browser จริง: เปิด Chrome Headless Profile ใหม่ กรอกชื่อผู้ใช้และรหัสในฟอร์มแล้วคลิกปุ่ม Submit ผ่าน เข้าโครงสร้าง dormify และเห็น AuthSession/Booking/Complaint/Payment/Property/Room/User ครบ; Root .env Hash ไม่เปลี่ยนตลอดการตรวจ ไม่แสดงค่ารหัสหรือ Cookie
- ตรวจปิดงาน: Root .env และ Backend password ตรงกัน; db:check MySQL 8.4.13 ผ่าน User 1/AuthSession 2/อีกห้า Models 0; HTTP เว็บ 5173/API 5000/Properties API/phpMyAdmin 8080 เป็น 200
- เปิด npm start กลับและค้างไว้ ไม่รัน App API/UI suites ที่สร้าง Fixture เพิ่มเพราะเป็นงานแก้ Local Credentials ไม่ใช่ Runtime change
- ไฟล์: server/.env (Ignore), docs/PROJECT_STATUS.md/WORK_LOG.md; ไม่ Commit/Push รักษางานค้างเดิม
- เริ่มต่อ: ใช้ dormify_app และ MYSQL_PASSWORD ใน Root .env ปัจจุบัน เมื่อต้องเปลี่ยนรหัสอีกต้องเปลี่ยน MySQL จริง/Server URL/Container Environment ให้ตรงกัน

### 2026-11-14 — พบ .env เปลี่ยนหลังซิงก์ระหว่างตรวจ Chrome (Asia/Bangkok)

- คำขอ: ผู้ใช้แจ้งยังเข้าไม่ได้ ถามอาการล่าสุดแบบ Async และตรวจระบบต่อโดยไม่ขอรับรหัสผ่านผ่านแชต
- ตรวจต้นรอบ: db:check ผ่าน แต่ Root .env ต่างจาก Server URL อีกและ HTTP Login ด้วย Root .env ไม่ผ่าน
- ทำแล้วภายใต้คำอนุญาตเปลี่ยน app/root เดิม: หยุด npm start ที่เปิดเอง ซิงก์ค่าล่าสุดเข้าบัญชีเดิมและ Server URL ตรวจ Hash เจ็ดตารางตรงเดิมและ JWT ไม่เปลี่ยน Root .env คงที่ระหว่างคำสั่งซิงก์ จากนั้น Compose โหลด Environment ใหม่ทั้งสอง Service Healthy
- ทดสอบเพิ่ม: เปิด Chrome Headless Profile ชั่วคราวและกรอก Login จริงด้วยค่า .env ภายใน Process ไม่แสดงรหัสหรือถ่ายภาพช่องรหัส ผลไม่ผ่านที่ขั้น Browser login ไม่อ้างว่าแก้สำเร็จจาก db:check อย่างเดียว
- หลักฐานการเปลี่ยนระหว่างรอบ: ตรวจ Container app/root เทียบ Root .env ไม่ตรงทั้งคู่ แต่ Container กับ Server ตรงกัน; mtime Server 12:26:33.631 UTC และ Root .env 12:26:51.817 UTC ห่างประมาณ 18 วินาที ไม่บันทึกค่ารหัส
- งานต่อที่ต้องรอ: ขอให้ผู้ใช้หยุดแก้ .env และยืนยันใช้ค่าล่าสุดก่อนซิงก์และทดสอบใหม่ ไม่หมุนรหัสซ้ำหรือทับค่าผู้ใช้ระหว่างไฟล์ยังเปลี่ยน
- ข้อมูล/Environment: เจ็ดตารางคงเดิมหลังซิงก์ db:check ล่าสุด User 1/AuthSession 2/อีกห้า Models 0 เปิด npm start กลับแล้ว ไม่มี Reset/Seed/ลบ Volume หรือ Schema change
- ไฟล์: server/.env (Ignore) ซิงก์รอบนี้, docs/PROJECT_STATUS.md/WORK_LOG.md บันทึกข้อจำกัดและผลจริง; ไม่ Commit/Push

### 2026-11-14 — ซิงก์รหัส app/root ตามคำยืนยันและซ่อม DATABASE_URL (Asia/Bangkok)

- คำขอ/ขอบเขต: หลังถามวิธีปรับเองและได้รับคำอธิบายการเปลี่ยน app/root, Environment และ Restart ผู้ใช้สั่งทำให้ จึงอนุมัติการเปลี่ยน Credentials จริงชัดเจนแล้ว
- ตรวจเริ่มต้น: db:check ไม่ผ่าน ต่างจากรอบก่อน; ตรวจโครงสร้างพบ Server DATABASE_URL ขาด Host/Port ขณะที่ Root .env รหัส app/root ต่างจาก Container เดิม ทั้งสามบัญชีเดิมคือ dormify_app@%, root@%, root@localhost
- ความปลอดภัย: ไม่แสดงค่ารหัส/Hash รหัส/Token ในบันทึก การตรวจ URL ครั้งแรกเกิด Node Invalid URL ที่แสดง input ผ่านเครื่องมือ จึงปรับการตรวจต่อมาเป็น try/catch และไม่แสดง input หรือข้อความผิดพลาดที่อาจมี Credentials อีก ไม่คัดลอกค่าดังกล่าวลงเอกสารหรือคำตอบ
- ทำแล้ว: หยุด npm start ที่เปิดเอง ตรวจ Root เดิมเชื่อมได้ อ่าน Snapshot ตารางธุรกิจภายใน Process แล้วใช้ ALTER USER กับบัญชีเดิมทั้งสาม Record ตามรหัสใน Root .env ผ่าน stdin แบบไม่ส่งค่ารหัสใน Command arguments ไม่เปลี่ยน Grants หรือ Authentication plugin
- Environment: ซ่อมเฉพาะ DATABASE_URL ใน server/.env เป็น MySQL dormify_app/127.0.0.1/MYSQL_PORT/dormify โดย Encode รหัส ไม่แก้ JWT Secret หรือ Root .env ที่ผู้ใช้กำหนดไว้
- ผลข้อมูล: ใช้ Root อ่านและเทียบ SHA-256 ของแถวเรียง id ทั้ง User/AuthSession/Property/Room/Booking/Payment/Complaint ก่อน–หลังตรงกันทั้งหมด ไม่ Reset/Seed/ลบข้อมูลหรือฐาน
- Docker: Compose up --wait mysql phpmyadmin สร้างเฉพาะ MySQL Container ซ้ำโดยใช้ dormify_mysql_data เดิม ทั้งสอง Container Healthy พอร์ต loopback 3306/8080
- ผลทดสอบจริง: Root เชื่อมด้วยรหัสใหม่ผ่าน; db:check MySQL 8.4.13 ผ่าน User 1/AuthSession 2/อีกห้า Models 0; HTTP Login ด้วย dormify_app/รหัส .env ปัจจุบันผ่านใน Session/Cookie/CSRF ใหม่ และเห็นครบเจ็ดตาราง
- เปิด npm start กลับ เว็บ/API พร้อม ไม่รันชุด API/UI ที่สร้าง Fixture หรือ Build ซ้ำเพราะแก้ Local Credentials เท่านั้น
- ไฟล์: server/.env (Ignore), docs/PROJECT_STATUS.md, WORK_LOG.md, PHPMYADMIN.md; ไม่เปลี่ยน Runtime/Schema/Package ไม่มี Commit/Push
- งานต่อ: ผู้ใช้เข้าสู่ phpMyAdmin ใหม่ด้วย dormify_app และ MYSQL_PASSWORD ใน Root .env; Client อื่นที่จำรหัสเก่าต้องเปลี่ยนตาม ห้ามเปลี่ยนแค่ .env แล้วคาดว่ารหัสใน MySQL จะเปลี่ยนอัตโนมัติ

### 2026-11-14 — ตรวจ 1045 ซ้ำและรอยืนยันซิงก์รหัสจริง (Asia/Bangkok)

- คำขอ: ผู้ใช้ส่ง Access denied ของ dormify_app ซ้ำหลังนำ Root .env.example ออก
- ตรวจจริง: Root .env MYSQL_PASSWORD ไม่ตรง Server DATABASE_URL แล้ว ทั้ง app/root ใน Root .env ต่างจาก Container config เดิม; ไม่มีการแสดงค่าจริง db:check ฝั่ง Server ยังผ่าน User 1/AuthSession 2/อีกห้า Models 0
- HTTP Session ใหม่: Login ด้วย Root .env ปัจจุบันไม่ผ่าน ต่างจากการตรวจครั้งก่อน จึงระบุว่า Credentials ไม่ตรงกันจริง ไม่กล่าวโทษ Browser Cache
- ตรวจการกู้การเชื่อมต่อ: Root ใน Container ยัง Login ได้ด้วยค่า Environment เดิม ไม่ได้เปลี่ยนสิทธิ์หรือ Password ตอนตรวจ
- การดำเนินการ: หยุด npm start ที่เปิดเองชั่วคราวเพื่อเตรียมซิงก์ เตรียมคำสั่ง ALTER USER app/root และอัปเดต Server URL พร้อมตรวจ Hash ข้อมูล แต่ exec_command ถูก Auto-review ปฏิเสธก่อนสร้าง Process เพราะผู้ใช้ยังไม่ยืนยันการเปลี่ยนรหัสจริงอย่างชัดเจน จึงไม่มี SQL/ไฟล์จากคำสั่งนั้นถูกเปลี่ยน และไม่พยายามอ้อมการปฏิเสธ
- การสื่อสาร: อธิบายเหตุผลของ Auto-review และถามยืนยันให้ใช้รหัสใน .env ปัจจุบันสำหรับทั้งสองบัญชี พร้อมแจ้งผลกระทบต่อ Client ที่ใช้รหัสเก่า รอคำตอบก่อนทำต่อ
- งานที่ทำได้: เปิด npm start กลับด้วย Backend config เดิมที่เชื่อมได้; ไม่ Reset/Seed/ลบ Volume ไม่ Commit/Push
- ไฟล์: PROJECT_STATUS.md/WORK_LOG.md เพิ่มบันทึก ไม่มีการเปลี่ยน Runtime/Schema/รหัสผ่านในรอบที่ถูกปฏิเสธ

### 2026-11-14 — ลบ Root .env.example ตามคำขอ (Asia/Bangkok)

- คำขอ: ผู้ใช้สั่งลบไฟล์ตัวอย่างที่ทำให้สับสนกับ .env ตัวจริงในบริบทการดูรหัส MySQL
- ทำแล้ว: ลบเฉพาะ D:\Code\dormify\.env.example ไม่สร้างสำเนาเพิ่ม; เก็บ client/server .env.example ที่ใช้แยกส่วนไว้
- ตรวจสอบ: ตรวจพาธเป้าหมายตรงไฟล์ Root, Test-Path หลังลบเป็น False และ Hash .env ตัวจริงก่อน–หลังตรงกัน; setup-local.js สร้าง Root .env จากค่าภายในโค้ด ไม่อ่านไฟล์ตัวอย่างนี้
- ไฟล์: .env.example (ลบ), docs/SETUP_NEW_MACHINE.md, PHPMYADMIN.md, PROJECT_STATUS.md, WORK_LOG.md; ไม่แก้ Secrets/รหัสผ่าน/Schema/ข้อมูล ไม่รัน App tests เพราะไม่มีโค้ดเปลี่ยน ไม่ Commit/Push
- งานต่อ: ใช้ MYSQL_PASSWORD จาก Root .env เมื่อล็อกอิน phpMyAdmin เครื่องใหม่รัน npm run setup ตามเดิม

### 2026-11-14 — ตรวจ phpMyAdmin Access denied for dormify_app (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้ส่ง HY000/1045 จาก phpMyAdmin เมื่อ MySQL ปฏิเสธบัญชี dormify_app จากเครือข่าย Docker
- ตรวจจริง: npm --prefix server run db:check ผ่าน MySQL 8.4.13; เปรียบเทียบค่าภายใน Process พบ Root .env กับ Server DATABASE_URL ใช้รหัสเดียวกัน ไม่แสดงรหัส/Token/Cookie
- ผล HTTP: Login phpMyAdmin ด้วย dormify_app/รหัส MYSQL_PASSWORD ตัวจริงผ่าน พร้อม Cookie/CSRF และเปิดโครงสร้าง dormify พบเจ็ดตาราง จึงไม่แก้ MySQL Host grants หรือ Reset รหัสจากข้อผิดพลาดนี้
- ข้อค้นพบ: .env.example มีรหัสไม่ว่างและไม่ตรงกับค่าที่ใช้งานจริง เป็นงานแก้ไฟล์ของผู้ใช้ที่พบระหว่างตรวจ ไม่เปลี่ยนทับและไม่บันทึกค่า หากนำค่าจากไฟล์ตัวอย่างมาใช้ย่อมไม่ตรงกับบัญชีจริง
- แนวทางผู้ใช้: เปิด .env ที่ Root คัดลอกเฉพาะค่า MYSQL_PASSWORD ไม่รวม Quotes/ช่องว่าง และใช้ชื่อ dormify_app รหัสนี้แยกจาก Admin ของเว็บ; ไม่อ้างว่าหน้า Browser ผู้ใช้แก้แล้วจนลองใหม่
- ข้อมูล/Environment: ไม่เปลี่ยน Secrets/บัญชี/สิทธิ์/Schema/Volume ไม่มี Reset/Seed และไม่รัน App API/UI suites ซ้ำเพราะตรวจเฉพาะการเชื่อมต่อและอ่านข้อมูล
- ไฟล์เอกสาร: PROJECT_STATUS.md, WORK_LOG.md, PHPMYADMIN.md; ไม่มี Commit/Push รักษางานค้างเดิม

### 2026-11-14 — ลบไฟล์ Generated และโฟลเดอร์ว่างที่ไม่จำเป็น (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้สั่งลบไฟล์ไม่เกี่ยวข้องและไม่จำเป็นทั้งหมด ตรวจการใช้งานก่อนลบ รักษา Source และข้อมูลใช้งาน
- ตรวจจริง: ตรวจรายการไฟล์ทั้งโปรเจกต์โดยข้าม Dependencies/Git, Import graph ผ่าน TypeScript resolver จาก main.tsx และ Browser resource test พบไฟล์แอปที่ไม่อ้างถึง 0 ไฟล์; Components เก่าอย่าง Review/Mess/Gallery ยังถูก Import จึงไม่ลบฟังก์ชันเดิม
- ลบแล้ว: client/dist (Build 20 ไฟล์), client/.ui-artifacts (ภาพ/JSON ทดสอบ 12 ไฟล์ รวม Snapshot ตรวจ phpMyAdmin), .local และ client/src/data ที่ว่าง รวม 32 ไฟล์ 3,736,596 Bytes
- ความปลอดภัยของพาธ: Resolve Absolute path ให้อยู่ใน D:\Code\dormify ตรวจ ReparsePoint/ลิงก์และโฟลเดอร์ว่างก่อน Remove-Item -LiteralPath ไม่สร้าง ZIP/Backup ใหม่ตามความชอบผู้ใช้
- คงไว้: .env และสำเนาเดิม, SQLite archive/Backups, MySQL Volume, node_modules และ Cache Vite ที่ Server กำลังใช้, PDF/เอกสารย้อนหลัง/แผนงาน, Tests และโค้ดที่ถูกอ้างถึง
- ตรวจสอบ: npm --prefix client run typecheck ผ่าน; ตรวจเป้าหมายลบไม่มีแล้ว ไม่ Build ซ้ำเพื่อสร้าง Generated files คืน ไม่รัน API/UI suites ระหว่างมีข้อมูลใช้งานจริง
- ไฟล์เอกสาร: PROJECT_STATUS.md/WORK_LOG.md บันทึกการลบ และ UI_REDESIGN.md ปรับลิงก์ภาพเก่าเป็นชื่อไฟล์พร้อมระบุว่าไม่อยู่แล้ว; ผลทดสอบเก่าในรายงานยังเป็นประวัติ ไม่อ้างว่ารันใหม่
- ข้อมูล/Environment: ไม่เปลี่ยน Schema/Secrets/บัญชี/ข้อมูลใน MySQL หรือ Docker; ไม่มี Source/Dependency ถูกลบ ไม่ Commit/Push
- งานต่อ: เปิดเว็บ/ดูฐานได้ตามเดิม; เมื่อต้อง Build หรือเก็บภาพหลักฐานใหม่ใช้คำสั่งเดิมตามคู่มือ การล้างไฟล์ไม่ได้เพิ่มฟีเจอร์ที่ยังค้าง

### 2026-11-14 — เพิ่ม phpMyAdmin เชื่อม MySQL เดิม (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้ตกลงเพิ่ม phpMyAdmin เพื่อเปิดดู MySQL ผ่านเว็บ โดยคง Prisma ใน Backend
- ทำแล้ว: เพิ่ม Compose Service phpmyadmin Profile tools, phpmyadmin:5.2.3-apache ตรึง digest e4b3eb5305cd42d21512bb55def2bab52625d56df927ad4ee1864a9354c84d40, PMA_HOST=mysql/PMA_PORT=3306/PMA_LANG=th พอร์ต 127.0.0.1:8080 ปรับผ่าน PHPMYADMIN_PORT ได้ ไม่ใส่ PMA_USER/PMA_PASSWORD จึงใช้ Login ปกติ
- คำสั่ง: เพิ่ม db:admin/db:admin:stop, db:status แสดง MySQL/phpMyAdmin, db:stop หยุดทั้งคู่ ไม่ลบ Volume; db:up ยังคงเปิดเฉพาะ MySQL
- ตรวจจริง: Compose config --quiet ผ่าน เปิดหน้า HTTP 200 มี Login ทดสอบ Session/Cookie/CSRF และ Login ด้วย dormify_app โดยอ่านรหัสใน Process ไม่แสดง Secrets เปิดโครงสร้างฐาน dormify เห็น 7 ตารางธุรกิจ
- ปัญหาและแก้: Healthcheck ด้วย PHP file_get_contents ไม่ผ่านแม้ HTTP Login/อ่านตารางสำเร็จ เปลี่ยนเป็น curl ที่มีใน Image แล้ว db:admin ซ้ำผ่าน ทั้งสอง Service Healthy และพอร์ต loopback ตามต้องการ; Process เปิดครั้งแรกจบ unhealthy เป็นผลก่อนแก้ ไม่ใช่สถานะล่าสุด
- ข้อมูล/Environment: เชื่อม MySQL/Volume เดิม ไม่สร้างฐาน/Schema/User ใหม่ ไม่แก้ .env หรือรหัสผ่าน ไม่ Reset/Seed; ข้อมูลที่ตรวจล่าสุด User 1/AuthSession 2 ส่วน Property/Room/Booking/Payment/Complaint เป็น 0
- ตรวจข้อมูล: บันทึก Snapshot Hash ก่อน–หลังใน client/.ui-artifacts ที่ Ignore; User/Property/Room/Booking/Payment/Complaint (6 Models) ตรงเดิม AuthSession เปลี่ยนระหว่างเว็บเปิดใช้งาน จึงไม่ยืนยันว่า Snapshot ทั้งฐานเท่ากันและไม่ลบ/ย้อน Session เพื่อทำให้ตรวจผ่าน ไม่มีการรัน App API/UI suites เพิ่มระหว่างใช้งานจริง
- ไฟล์: compose.yaml, package.json (เฉพาะ scripts ไม่เปลี่ยน dependencies), .env.example, README.md, docs/PHPMYADMIN.md, SETUP_NEW_MACHINE.md, PRISMA_START.md, PROJECT_STATUS.md และ WORK_LOG.md; ตรวจเอกสาร/Whitespace ก่อนส่ง
- งานต่อ: ผู้ใช้เปิด phpMyAdmin ด้วย dormify_app/รหัส MYSQL_PASSWORD ของเครื่องตน ไม่ใช้รหัส Admin ของเว็บ; Backend/Schema ยังใช้ Prisma และฟีเจอร์ที่ค้างตามขอบเขตเดิม ไม่มี Commit/Push

### 2026-11-14 — เตรียม Local Environment และทดสอบ MySQL บนเครื่องเดิม (Asia/Bangkok)

- คำขอ/ขอบเขต: ผู้ใช้สั่งเริ่มตามข้อเสนอเตรียมเครื่องให้รันโค้ด GitHub ล่าสุดก่อนพัฒนาฟีเจอร์ ไม่เพิ่มฟีเจอร์ DORMIFY
- ตรวจเริ่มต้น: Node 24.18.0/npm 11.16.0; Dependencies Frontend ขาด ESLint TypeScript/Prettier; Docker มีจริงแบบรายผู้ใช้แต่ PATH ของ Process เก่ายังไม่เห็น และ Engine ยังไม่เปิด
- ทำแล้ว: npm ci --no-audit --no-fund ตาม Lockfile ทั้งสามส่วน เปิด Docker Desktop ที่ LOCALAPPDATA/Programs/DockerDesktop และเพิ่ม resources/bin เฉพาะ PATH ของคำสั่งที่ใช้ ไม่แก้ PATH ระบบ (User PATH มีอยู่แล้ว)
- ตรวจข้อมูลก่อนย้าย: SQLite ทั้งเจ็ดตาราง 0 แถว Integrity ok และ FK errors 0; ย้ายไฟล์เดิมแบบไม่เขียนทับไป server/prisma/backups/before-mysql-20261114.db ตรวจพาธอยู่ใน Workspace และ SHA-256 คงเดิม 7767ceab10663a5d44b30f8fd8848565ae8ff01f919a78ad7dc7b7f85350da69 ไม่มีข้อมูลจริงให้ Import
- Environment: เก็บ server/.env เดิมที่ server/.env.before-mysql-20261114 เปลี่ยน DATABASE_URL เป็น local MySQL รักษา JWT_SECRET; สร้าง Root .env พร้อมรหัส DB สุ่มและไม่แสดงค่า ตรวจ git check-ignore ครบ รวม Backup; npm run setup ซ้ำยืนยัน Hash .env ทั้งสามไฟล์ไม่เปลี่ยน
- MySQL: npm run db:up เปิด Image ที่ Compose ตรึงไว้ MySQL 8.4.13, Engine 29.9.3, dormify-mysql-1 Healthy พอร์ต 127.0.0.1:3306 สร้างเฉพาะ dormify_mysql_data/dormify_default ของงานนี้ ไม่พบ Container/Volume เดิมก่อนเริ่ม
- Migration: npm run db:setup Generate Prisma 5.22.0 และ Apply 20261113000000_init_mysql ผ่าน ไม่ Reset/Seed/db push หรือสร้างฐาน Test/Shadow
- ผลตรวจจริง: Backend API 23/23, Chrome UI 17 กลุ่ม (สมัคร/Login/Logout/Privacy/เพิ่มห้อง/ขอเช่า/อนุมัติ/Responsive), Frontend unit 3/3, TypeScript/Build และ Lint ผ่าน รัน API/UI ตามลำดับและ Cleanup ยืนยันข้อมูลเดิมไม่เปลี่ยน
- ปัญหาที่แก้: Format check แจ้ง 45 ไฟล์เพราะ CRLF หลัง Checkout บน Windows; รัน npm --prefix client run format แล้ว format:check ผ่าน ตรวจเทียบเนื้อหา HEAD แบบ Normalize line endings ไม่มีไฟล์เนื้อหาเปลี่ยน เพิ่ม .gitattributes กำหนด LF สำหรับไฟล์ Frontend ที่ Prettier ตรวจ เพื่อไม่ให้เกิดซ้ำเมื่อ Checkout ข้ามเครื่อง
- คำสั่ง Environment ครั้งแรกผ่าน node -e ถูก PowerShell แปลง Quotes จึงหยุดก่อนเขียน Environment; แก้เป็น Here-string ส่ง stdin เข้า Node แล้วสำเร็จ ไม่มีค่า Secret ถูกแสดง
- หลังทดสอบ: db:check เชื่อมได้ ทั้งเจ็ด Models 0 แถว ไม่มี Fixture/Admin Default/ห้องจำลองค้าง; SQLite archive Hash เดิม
- เปิด npm start ค้างไว้ ตรวจเว็บ 5173/API 5000/Properties/Available rooms ได้ 200 และ /auth/me ไม่ส่ง Token ได้ 401; ยังคง loopback ไม่มี Public tunnel
- ไฟล์สำคัญที่เปลี่ยนใน Git: .gitattributes, docs/PROJECT_STATUS.md, WORK_LOG.md, SETUP_NEW_MACHINE.md, README.md; ไม่แก้ Runtime/Schema/Package/Lockfile ไม่ Commit/Push
- ข้อจำกัด: npm มีคำเตือน Deprecated/Install scripts และ Root start มี DEP0060; Generate/Build/Tests ผ่านจริง ไม่อ้างว่า Audit ช่องโหว่ผ่านเพราะรอบนี้ไม่ได้รัน Audit
- งานค้าง/เริ่มต่อ: ให้ผู้ใช้สร้าง Admin ผ่าน Terminal และกรอกรหัสเอง แล้วเพิ่มหอ/ห้องจริง ระบบยังต้องพัฒนาจัดการหอ/ห้องให้ครบ → ผู้เช่า/สัญญา → มิเตอร์/บิล → การเงิน/ระบบประกอบ โดยข้อ 3/6/9 ยังรอยืนยัน

### 2026-11-14 — อ่านเอกสาร docs ทั้งหมด (Asia/Bangkok)

- คำขอ/ขอบเขต: อ่านเอกสารทุกไฟล์ ไม่ได้สั่งพัฒนาฟีเจอร์หรือเตรียมฐานข้อมูล
- อ่านแล้ว: Markdown 20 ไฟล์ทั้งระดับ docs และ analysis รวมสถานะ/ประวัติ/กติกา/ติดตั้ง/GitHub/Prisma/ผลทดสอบ/UI/แผนข้อมูล/Roadmap/RTM; PDF 1 ไฟล์อ่านจากข้อความถอดห้าหน้า ตรวจ Hash ตรง 3a86bc087da45df777f57bc34bb5215cfa191f09c0d6d3f850bcbfeac066ddd5 ไม่ได้ตรวจภาพตารางเวลาหรือรับรอง glyph ที่ไม่มี Unicode
- ข้อสรุป: Admin 13 + User 12 ข้อยังคงครบ กติกา 3/6/9 ยังรอยืนยัน รายงานรุ่นก่อนและ RTM มีสถานะเก่า ต้องเทียบโค้ดจริง; โค้ดรับจาก GitHub ใช้ MySQL แต่ Environment เครื่องนี้ยังต้องเตรียมแยก
- ไฟล์สำคัญ: docs/PROJECT_STATUS.md และ docs/WORK_LOG.md เพิ่มบันทึกเท่านั้น ไม่แก้ผลทดสอบเก่า
- ตรวจสอบจริง: อ่านไฟล์ UTF-8, รายการไฟล์, Git status และ SHA-256 ของ PDF; ไม่รัน API/UI/Build เพราะอ่านเอกสาร ไม่มีโค้ดเปลี่ยน
- ผลต่อข้อมูล/Environment: ไม่แก้ Secrets, Schema, ฐานข้อมูล, Dependencies หรือ Container ไม่ Commit/Push; รักษางานเอกสารค้างเดิม
- งานค้าง/เริ่มต่อ: ยึด BUSINESS_RULES.md และ SETUP_NEW_MACHINE.md พร้อมตรวจเครื่องจริง หากปรับ RTM ให้ใช้หลักฐานใหม่ ไม่อ้างผลจากเครื่องอื่นเป็นผลที่เพิ่งทดสอบ

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

## 13 พฤศจิกายน 2026 — รับโค้ดล่าสุดจาก GitHub บนสำเนาเครื่องเดิม

- คำขอ: ดึงโค้ดล่าสุด ไม่ได้สั่งติดตั้งหรือย้ายฐานข้อมูลในเครื่องนี้
- ตรวจพบ Working Tree สะอาดที่ 59e5bae; Fetch พบ Remote เริ่มประวัติใหม่และ main ล่าสุดคือ 75ad050
- git pull --ff-only ปฏิเสธเพราะประวัติแยกกัน จึงเก็บประวัติเก่าที่ archive/local-before-github-sync-20261113 และใช้ git switch -C main origin/main โดยไม่ Merge/Rebase ประวัติเก่า
- ตรวจ git rev-parse HEAD origin/main ตรงกันที่ 75ad050ab057cabc4a98904772485d6cdd88e3bd และ Working Tree สะอาดก่อนเพิ่มบันทึกนี้
- server/.env, client/.env และ SQLite เดิมยังอยู่ ไม่เปิดเผยค่า Secret; Environment เครื่องนี้ยังชี้ SQLite ขณะที่โค้ดล่าสุดใช้ MySQL
- ไม่ติดตั้ง Dependencies ไม่เปิด Docker ไม่รัน Migration ไม่ทดสอบแอป และไม่ได้ Push
- อัปเดต docs/PROJECT_STATUS.md และ docs/WORK_LOG.md; สองไฟล์นี้ยังไม่ Commit
- งานต่อ: ตรวจคู่มือ SETUP_NEW_MACHINE.md และ Environment เดิมก่อนเตรียม MySQL ตามขอบเขตที่ผู้ใช้สั่ง ห้ามลบหรือ Reset ฐานเดิม
