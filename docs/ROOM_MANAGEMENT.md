# แก้ไขข้อมูลหอพัก ห้องพัก และปิด–เปิดใช้งานห้อง

ทำและทดสอบวันที่ 14 พฤศจิกายน 2026 (Asia/Bangkok)

## ใช้งาน

เข้าสู่เว็บไซต์ด้วย Admin แล้วเปิดเมนู:

- **ข้อมูลหอพัก** → แก้ไขข้อมูลหอพัก → บันทึก ชื่อ/ที่อยู่/จังหวัด/ประเภท/กฎ/บริการอาหารใช้ Fields เดิม
- **จัดการห้องพัก** → เพิ่มหรือแก้ไขห้อง → บันทึก เลขห้อง/ประเภท/ความจุ/ค่าเช่า
- **จัดการห้องพัก** → ปิดใช้งานหรือเปิดใช้งาน → ตรวจ Dialog → ยืนยัน

ยกเลิกฟอร์มแล้วไม่บันทึก เมื่อบันทึกสำเร็จหน้าเว็บอ่านข้อมูลล่าสุดจาก API
ไม่มีการเพิ่มหอ/ห้องสมมติให้ผู้ใช้จริง หากยังไม่มีข้อมูลหอ ให้บันทึกครั้งแรกตามเดิม

## กติกาที่ทำในรอบนี้

- เพิ่ม `Room.isActive` แยกจาก `isAvailable` โดยไม่ลบห้องหรือคำขอเช่า
- `isActive` คือเปิดรับใช้งาน; `isAvailable` คือสถานะว่างตามการอนุมัติคำขอเดิม
- ปิดห้องไม่ได้เมื่อมี Booking `PENDING` หรือ `CONFIRMED` ต้องจัดการรายการเหล่านั้นก่อน ไม่ปฏิเสธคำขอให้อัตโนมัติ
- เปิดห้องกลับไม่ทำให้ห้องที่ถูกจองอยู่กลายเป็นว่าง และเปิด/ปิดซ้ำไม่สร้าง Record ใหม่
- ห้องปิดไม่แสดงในรายการ Public และหน้ารายละเอียดจากลิงก์ตรงแสดงไม่พบห้อง; API ส่งคำขอ/อนุมัติตรวจ `isActive` ที่ Server เสมอ
- `GET /api/properties` และรายละเอียดหอยังคงคืนห้องพร้อมสถานะเพื่อให้หน้า Admin แสดงห้องปิดได้ ส่วน `/available-rooms` ตัดห้องปิดออก ไม่ถือว่า `isActive` เป็นข้อมูลลับหรือพึ่งการซ่อน UI เพื่อกันการขอเช่า
- หากมีคำขออนุมัติแล้ว ห้ามเปลี่ยนเลขห้อง/ประเภท/ความจุ ส่วนราคา Base ปรับสำหรับคำขอใหม่ได้ ยอด `Booking.totalAmount` เดิมไม่เปลี่ยน
- การแก้ห้อง/เปิดปิด/ส่งคำขอ/อนุมัติใช้ Room row lock เดียวกันใน Transaction ป้องกันการปิดห้องพร้อมกับสร้างคำขอจนสถานะขัดกัน
- เลขห้องไม่ซ้ำภายในหอเดิม ราคาไม่ติดลบ ไม่เกินสองตำแหน่งตาม Decimal(12,2); ไม่รับ Fields ที่ใช้เปลี่ยนหอ/เจ้าของ/สถานะว่างผ่านฟอร์มแก้ไข
- ทุก API เขียนใหม่ต้องมี Session `ADMIN`; User/Public ถูกปฏิเสธ

## API เพิ่ม

| Method / Endpoint | ข้อมูล |
|---|---|
| PUT /api/properties/:propertyId | name, address, city, type; rules/hasMess ตาม Fields เดิม |
| PUT /api/properties/rooms/:roomId | roomNumber, capacity, price, type |
| PATCH /api/properties/rooms/:roomId/status | isActive แบบ Boolean เท่านั้น |

Status หลัก: 400 ข้อมูลผิด, 401 ไม่มี Session, 403 ไม่ใช่ Admin, 404 ไม่พบรายการ, 409 ข้อมูลขัดแย้ง/เลขห้องซ้ำ/คำขอค้าง
Endpoints เก่ายังใช้ได้ ไม่มี DELETE และไม่แก้ Role/Auth contract

## Migration และข้อมูลเดิม

เพิ่ม `20261114000000_room_active/migration.sql`:

```sql
ALTER TABLE `Room` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
```

หยุด Backend ก่อน แล้วรัน `npm.cmd run db:setup` เพื่อ Generate Prisma 5.22.0 และ migrate deploy
ไม่มี Reset/Seed/Test database/Shadow database เก็บ MySQL dormify/Volume เดิม
ตรวจ Hash ของเจ็ดตารางด้วยคอลัมน์เดิมก่อน–หลังตรงกัน และห้องเดิมเปิดใช้งานตาม Default
`prisma migrate diff` จากฐานจริงเทียบ Schema หลังทดสอบรายงาน No difference detected

## ผลทดสอบจริง

| คำสั่ง | ผล |
|---|---|
| npm.cmd --prefix server test | 28/28 ผ่าน บน MySQL จริง |
| npm.cmd --prefix client run test:ui | Chrome 22 กลุ่มผ่าน |
| npm.cmd --prefix client test | 3/3 ผ่าน |
| npm.cmd --prefix client run build | TypeScript strict และ Vite Build ผ่าน |
| npm.cmd --prefix client run lint | ผ่าน ไม่มี Warning |
| npm.cmd --prefix client run format:check | ผ่าน |

API เพิ่มกรณีสิทธิ์/Validation/แก้ Fields สำคัญ/ราคาเดิม/เลขห้องซ้ำ/การปิดห้องและประวัติ/Booking พร้อมปิดห้อง/ห้อง Legacy ที่ปิดแล้วอนุมัติไม่ได้
Chrome เพิ่มแก้หอและดูผล Public, แก้ห้อง/เลขซ้ำ/ราคา, ปิดห้อง–ลิงก์ตรง–เปิดกลับ, ปฏิเสธปิดห้องอนุมัติแล้ว และฟอร์ม/ตาราง/Dialog บนมือถือ
รอบแรก UI Test หยุดเพราะตัวรอคาดว่าหน้า Empty State มี h1 แก้ตัวรอให้รองรับ .empty-state h3 แล้วรันซ้ำครบ ไม่แก้ Production logic เพื่อข้ามผล
API/UI รันตามลำดับด้วย Fixture namespace ใน dormify เดียว Cleanup ยืนยันข้อมูลเดิมไม่เปลี่ยน
หลังทดสอบ User 1/AuthSession 2/Property 0/Room 0/Booking 0/Payment 0/Complaint 0 ไม่มี Fixture ค้าง
ผลภาพ/JSON รอบใหม่อยู่ client/.ui-artifacts ซึ่งไม่ตาม Git

## ไฟล์ที่เปลี่ยนในงานนี้

- Server: schema.prisma, Migration ใหม่, lib/room-lock.js, controllers/propertyController.js และ bookingController.js, routes/propertyRoutes.js, test/phase0.test.js
- Client: components/DormitoryForm.tsx ใหม่, RoomForm.tsx, RoomTable.tsx; pages/AddProperty.tsx, AdminRooms.tsx, Home.tsx, PropertyDetails.tsx; types/api.ts, utils/errors.ts และ scripts/ui-smoke.mjs
- เอกสาร: README.md, PROJECT_STATUS.md, WORK_LOG.md, SETUP_NEW_MACHINE.md, analysis/REQUIREMENTS_TRACEABILITY_MATRIX.md และรายงานนี้

งานค้างเดิมใน Git เช่น phpMyAdmin/Environment example/รูปแบบบรรทัดเป็นงานก่อนหน้า ไม่ได้นับเป็นการแก้ฟีเจอร์รอบนี้
ยังไม่ได้ Commit/Push

## ข้อจำกัดและงานต่อ

รูปห้อง/สิ่งอำนวยความสะดวกแบบจัดการข้อมูลครบยังไม่อยู่ในงานนี้; ยังไม่บังคับ Singleton หอที่ฐานข้อมูล และไม่มีระบบ Version history ของทุกการแก้ไข/Audit log
การเก็บประวัติในรอบนี้หมายถึงไม่ลบ Room/Booking และไม่แก้ยอดในคำขอเดิม ไม่ใช่มีสัญญาหรือ Snapshot ของชื่อห้องย้อนหลังครบแล้ว
ห้องที่มี CONFIRMED ยังต้องจัดการวงจรเช่าให้ถูกต้องก่อนปิด; หน้า Admin ยกเลิก Booking ยังเป็นงานค้างเดิม ไม่เพิ่มสิทธิ์ User ยกเลิกเอง
ยังไม่มี Lease/ผู้เช่า/เงินประกัน/มิเตอร์/Invoice/การเงิน/แจ้งซ่อมครบ ข้อเสนอ 72 ชั่วโมง/ประกันหนึ่งเดือน/Due ห้าวันยังไม่เปิดใช้
