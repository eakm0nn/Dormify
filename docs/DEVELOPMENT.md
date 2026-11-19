# โครงสร้างและแนวทางพัฒนา DORMIFY

สรุปสถานะโค้ด 18 พฤศจิกายน 2026 ไม่ใช่แผนให้เพิ่มทุกฟีเจอร์ เริ่มจาก [สถานะ](PROJECT_STATUS.md) และ [กติกาล่าสุด](BUSINESS_RULES.md)

## Stack และตำแหน่งโค้ด

| ส่วน | เทคโนโลยี/ตำแหน่ง |
|---|---|
| Frontend | React 18 + Vite 6.4.6 + TypeScript strict + Tailwind 3; client/src |
| Backend | Node.js + Express 5, CommonJS JavaScript; server/src |
| ORM/Database | Prisma 5.22.0 + MySQL 8.4 Docker ฐาน dormify เดียว |
| เริ่มโปรแกรม | client/src/main.tsx, client/src/App.tsx, server/src/index.js |
| Routes/Controllers | server/src/routes และ server/src/controllers |
| Prisma Client กลาง | server/src/lib/prisma.js |
| Model/Migration | server/prisma/schema.prisma, server/prisma/migrations |
| การเรียก API/Session/หอ | client/src/services/api.ts, context และ hooks |
| Navigation/Theme | client/src/config/navigation.ts, client/src/index.css |

PDF ระบุ TypeScript สำหรับ Frontend และ Node/Express สำหรับ Backend ไม่จำเป็นต้องย้าย Server เป็น TypeScript เอง Prisma เป็น ORM ไม่ใช่ที่เก็บข้อมูลหรือระบบยืนยันสิทธิ์แทน Express

## โครงสร้างข้อมูลปัจจุบัน

30 Models รวม Migration 7 ชุด อ่านรายละเอียดฟิลด์จริงจาก Schema ไม่คัดลอก Model เสนอรุ่นเก่ามาทับ

| กลุ่ม | Models หลักและความสัมพันธ์ |
|---|---|
| บัญชี | User → AuthSession, TenantProfile, Notification |
| หอ/ห้อง | DormitoryInstallation → Property → Room → RoomPhoto |
| ขอเช่า/สัญญา | User + Room → Booking; TenantProfile + Room → Lease → LeaseOccupant/LeaseRevision; ฉบับถัดไปอ้าง previousLeaseId |
| น้ำไฟ | UtilityRate, Room → MeterReading/MeterChange |
| ใบแจ้งหนี้/เงิน | Lease → Invoice → InvoiceItem/InvoiceAdjustment/InvoicePayment; PaymentProof และ InvoiceSettlement ยืนยันยอดรับ |
| ปิดสัญญา/ประกัน | Lease → LeaseCloseout/DepositEntry |
| งานประกอบ | MaintenanceRequest, Expense, Announcement, Notification, AuditLog, RentalPolicy |
| ของเดิมเก็บไว้ | Payment/Complaint และ Property.ownerId ยังมีเพื่อรักษาข้อมูล/ความสัมพันธ์ ไม่ใช่ระบบรับเงิน/ซ่อมรุ่นใหม่ |

ทะเบียนหอใช้ Unique constraint และเลือกหอใน Backend ไม่ใช่เพียง UI เลือก Property แรก Legacy URL /api/bookings/owner ยังรับได้เฉพาะ ADMIN บทบาทปัจจุบันมี ADMIN/USER เท่านั้น

## Workflow และความถูกต้อง

- ส่งคำขอ → Admin อนุมัติ/กันห้อง → ลงนามจริง → เริ่ม Lease → ออกบิล → ตรวจรับเงิน → ปิดยอด/จบสัญญา → รับ/คืนเงินจริงและเงินประกันแยก
- Row lock/Transaction ป้องกันอนุมัติหรือยืนยันเงินพร้อมกัน Unique activeRoomId และ InvoiceSettlement ช่วยกันซ้ำ
- วันสิ้นเดือนคำนวณจากวันเริ่มจริง เงิน/หน่วยใช้ Decimal เก็บอัตราและชื่อ/ห้องเป็น Snapshot
- /leases/:id/end รุ่นเดิมเรียก Finalize closeout เดียวกัน ไม่มีทางจบการครอบครองข้ามการเงิน
- ยอดปรับค่าเช่าเฉลี่ยตามวันอยู่จริง น้ำไฟที่คร่อมวันออกให้ Admin ระบุตามหลักฐาน ไม่เดาสัดส่วนตามวัน ก่อนยืนยันต้องตรวจ expectedBalance
- Audit เก็บเหตุการณ์สำคัญ ไม่สร้างประวัติย้อนหลัง ไม่ใส่ Secret หรือภาพสลิปใน Log
- ตรวจสิทธิ์ใน Backend ทุกครั้ง Frontend route/menu guard ไม่ใช่กลไกสิทธิ์เพียงอย่างเดียว

## เริ่มใช้ Prisma

React เรียก Express API แล้ว Server ใช้ Prisma Client อ่าน/เขียน MySQL ห้าม Import Prisma หรือใส่ DATABASE_URL/JWT_SECRET ใน Frontend

| คำสั่ง | ความหมาย |
|---|---|
| findMany / findUnique | อ่านหลายรายการ / อ่านตามคีย์ไม่ซ้ำ |
| create / update / delete | เปลี่ยนข้อมูลจริง ต้องตรวจสิทธิ์และเงื่อนไขก่อน |
| prisma generate | สร้างโค้ด Client ไม่ได้สร้างคอลัมน์ในฐาน |
| npm.cmd run db:setup | Generate และ migrate deploy จาก SQL Migration ที่มีแล้ว |
| npm.cmd run db:studio | เปิดหน้าดู/แก้ฐานที่พอร์ต 5555 ไม่ได้ย้ายข้อมูลออกจาก MySQL |

Schema Room เช่น price Decimal และ isAvailable Boolean เป็นนิยามข้อมูล ไม่ใช่บัญชีหรือข้อมูลห้องอัตโนมัติ ตัวอย่าง Query ที่ถูกใช้จริงดู propertyController.js และ installation.js เพื่อไม่ข้ามขอบเขตหอ/สิทธิ์

หากเปลี่ยนโครงสร้าง: ตรวจข้อมูลเดิม → แก้ Schema → เตรียม/ตรวจ SQL Migration ใหม่และผลกระทบ → หยุด Backend → db:setup → ทดสอบ API/UI ตามลำดับ คำสั่ง db:setup ไม่สร้าง Migration ให้เอง ห้ามแก้ Migration ที่ใช้แล้วเพื่อให้ดูเหมือนยังไม่เคยเปลี่ยน

ใช้ dormify เดียว ไม่ใช้ migrate dev ที่อาจสร้าง Shadow database ไม่ Reset/Seed/db push หรือแก้ตารางผ่าน phpMyAdmin แล้วปล่อย Schema/Migration ไม่ตรงกัน Windows อาจล็อก Prisma Engine ถ้าไม่หยุด Backend ก่อน Generate

## Authentication และไฟล์

- สมัครทั่วไป USER เท่านั้น Admin สร้างผ่าน Local CLI ไม่ยกสิทธิ์อีเมลที่มีแล้ว รหัสผ่านเก็บ bcrypt hash
- JWT Secret ต้องตั้งอย่างปลอดภัย ไม่มี fallback ที่ใช้ได้ ร่วมกับ Session ในฐานและ Token hash; Logout เพิกถอนฝั่ง Server
- รูปห้อง: Admin อัปโหลดภาพนิ่ง PNG/JPEG/WebP ผ่าน Sharp ถอดรหัส หมุน/ย่อ/แปลง WebP และตัด Metadata สูงสุด 8 รูปต่อห้อง ไฟล์เข้าไม่เกิน 5 MB
- สลิป: PNG/JPEG ไม่เกิน 2 MB ไม่เปิด Public URL ตรวจเจ้าของทั้งอ่าน/เขียน ห้ามเปลี่ยนหลังยืนยัน
- รูปห้องและหลักฐานเก็บใน MySQL การย้ายเครื่องต้องย้ายฐานอย่างปลอดภัยแยกจาก Git

## UI และการโหลดข้อมูล

ธีมขาว–ฟ้า Primary #0769F4, Secondary #12BDF4 ฟอนต์ Noto Sans Thai เก็บ Local โลโก้และ GIF เดิม Responsive และ Reduced motion ไม่มี Dark theme วันที่ใช้ Asia/Bangkok จำนวนเงินเป็นบาท

TypeScript strict/noUnusedLocals/noUnusedParameters, ESLint/Prettier, Lazy route และ Resource hook ยกเลิกคำขอเก่าเพื่อกันผลกลับสลับลำดับ ไฟล์ .d.ts ใช้โดย Compiler แม้ไม่มี Runtime import

รีวิว/ดาว เมนูอาหาร ตัวเลือกบริการอาหาร และประเภทที่พักหลายแบบถูกถอดออกจาก Frontend ตามคำสั่ง เก็บข้อกำหนดการอยู่อาศัยไว้ ไม่ลบค่า hasMess/ประเภทเก่าในฐานเมื่อแก้ข้อมูลทั่วไป

## ข้อจำกัดและงานที่ไม่ได้เพิ่ม

- ข้อมูลนำเข้า InvoiceAdjustment ที่ itemType/refundEligible เป็น NULL ต้องตรวจหลักฐานก่อนปิดยอดหรือคืนเงิน ไม่ Backfill true โดยเดา
- Export ประวัติ Audit/ข่าว/แจ้งเตือน/แก้มิเตอร์โหลดทุกหน้าตามตัวกรอง Snapshot ตรึง ID สูงสุดกันแถวใหม่เลื่อนหน้า ไม่ใช่สำเนาทุกค่า ณ เวลาเดียว
- บางตารางอื่นแบ่งหน้าจากข้อมูลที่โหลด ไม่อ้างว่าทุก Endpoint มี Server pagination
- ออกบิลอัตโนมัติเริ่มต้นปิด ต้องมี Backend ทำงาน นโยบายเปิด และมิเตอร์ครบ ไม่ประมาณหน่วยที่ขาด
- ค่ากันห้องมีผลหลังอนุมัติ ไม่ใช่ส่งคำขอแล้วถือว่าได้ห้อง และไม่ใช่ระบบจองแยกเตียง/หลายหอ
- Profile ใช้ดูข้อมูล ยังไม่เพิ่มแก้โปรไฟล์/เปลี่ยนรหัสผ่านด้วยตนเอง การพิมพ์ PDF/XLSX, Email/SMS/LINE, Staff, รีวิว และแนบไฟล์สัญญาไม่ใช่ฟีเจอร์ที่อนุมัติเพิ่มเอง
- ผลทดสอบไม่แทนการตรวจรับครู/เจ้าของหอ เครื่องอื่นจริง หรือรับรองอัตราน้ำไฟตามกฎหมาย

ผลตรวจและสิ่งที่เคยแก้จาก Deep review อ่าน [TEST_RESULTS.md](TEST_RESULTS.md) ประวัติการตัดสินใจเดิม/ชื่อไฟล์ที่รวมอ่าน [WORK_LOG.md](WORK_LOG.md)
