# Roadmap DORMIFY — Phase 0–9

เป็นแผนเสนอเพื่ออนุมัติ ไม่ได้เริ่ม Implementation; สถานะปัจจุบันอยู่ที่ Phase 0 ของระบบรุ่นก่อนตามหลักฐานเดิม
ทุก Phase ต้องมีข้อมูลจริงผ่าน API/DB ไม่ปิดงานด้วย Mock หรือ Screenshot ของ UI อย่างเดียว
ไฟล์/API/Models ใหม่ในเอกสารนี้เป็นชื่อเสนอ ปรับชื่อได้เมื่อออกแบบ แต่ต้องไม่ตัด Requirement

## ลำดับ Dependencies และแผนเวลาเสนอ

PDF หน้า 4 มีหัวเดือน พ.ย. 2569–มี.ค. 2570 และสัปดาห์ 1–18 แต่แถบงานยังไม่ได้อ่านเป็นภาพ
ตารางนี้ไม่ใช่การถอดช่วงงานจาก PDF และไม่ใช่วันส่งที่ได้รับยืนยัน

| ระยะ | ช่วงสัปดาห์เสนอ | Depends on | ผลลัพธ์ |
|---|---|---|---|
| ยืนยันเอกสาร/ข้อสงสัย | 1–2 | PDF ฉบับจริง | D01–D12/RTM ได้รับยืนยัน |
| Phase 0 | 1–2 | Source เดิม | Local baseline และผล Setup เดิม |
| Phase 1 | 3–4 | ยืนยัน + P0 | MySQL/สิทธิ์/Type contracts/Audit foundation |
| Phase 2 | 5 | P1 | พื้นฐาน Admin/User และ Single dorm |
| Phase 3 | 6 | P2 | ห้องจริงและการแสดงสถานะ |
| Phase 4 | 7–8 | P1/P3 | เช่าเบื้องต้นและกันซ้ำ |
| Phase 5 | 9–10 | P4 | ผู้เช่าและสัญญา/เข้าพัก |
| Phase 6 | 11–12 | P5 | มิเตอร์/บิล |
| Phase 7 | 13–14 | P6; ซ่อมใช้ P5 | Payment/Proof/ซ่อม |
| Phase 8 | 15–16 | P3–7 และ Audit จาก P1 | Report/Dashboard/Notifications/Audit viewer |
| Phase 9 | 17–18 | ทุก Phase | Regression/UAT/ประเมินคุณภาพ/เล่ม |

ห้ามรอ Phase 9 จึงเริ่ม Test; เขียน/รันทดสอบที่มีคุณค่าพร้อม Phase ที่เปลี่ยน Business Logic
Audit writer เริ่ม P1 และ Event notifications hooks เริ่ม Phase ของเหตุการณ์ ส่วนหน้าอ่าน/ตัวกรองรวมไว้ P8

## Phase 0 — Initial Project Setup

- **เป้าหมาย:** เก็บฐานที่รัน Local ได้ก่อนเปลี่ยน Stack
- **งาน:** อ้างผล Setup เดิม ตรวจ Environment/Ignore/Lockfile/Prisma ตามที่มี รักษา Secret และไม่รัน Seed ลบข้อมูล
- **ไฟล์คาดว่าเกี่ยวข้อง:** package*.json ทั้งสามส่วน, .gitignore, client/vite.config.js, server/src/config.js, server/scripts/setup-db.js, docs/PHASE0_*.md
- **Models:** 6 Models เดิมใน SQLite ไม่เพิ่ม Schema DORMIFY
- **API:** ตรวจ /, auth, properties, bookings เดิม ไม่เพิ่ม Endpoint
- **ทดสอบ:** Phase 0 เคยรัน API 9/9, Build และ HTTP จริง; ในงานวิเคราะห์นี้อ่านหลักฐานและ SQLite read-only เท่านั้น
- **เกณฑ์รับ:** Local URL/Build/Secret/Ignore ใช้ได้ มีรายงานข้อจำกัด; ไม่ถือว่าปิด 25 Requirements หรือพร้อม Production

## Phase 1 — Authentication & Database Preparation

- **เป้าหมาย:** ฐาน MySQL พร้อมประวัติ Migration และสิทธิ์ ADMIN/USER สำหรับทุก Phase
- **งาน:** ยืนยันนโยบาย Role/Session; สำรอง SQLite; ตรวจ/เตรียม MySQL ตามแผน Migration; ตรวจ OWNER เดิมก่อน Mapping; ปิด Public elevated registration; สร้าง Admin ครั้งแรกแบบ Local ที่ไม่ฝังรหัส; ตรวจบัญชีปัจจุบัน/Token expiry; Validation/Rate limit/Error format; วาง Audit writer และ Typed DTO
- **ไฟล์:** server/prisma/schema.prisma + migrations ใหม่หลังอนุมัติ, server/src/config.js, middleware/authMiddleware.js, middleware/authorize.js (ใหม่), controllers/authController.js, routes/authRoutes.js, lib/prisma.js (ใหม่), services/auditService.js (ใหม่), server/package*.json, server/.env.example; client/tsconfig*.json, src/types/*.ts, src/services/api.ts (ใหม่)
- **Models:** User, AuditLog; Initial MySQL structure ที่ผ่าน Review และแผน Role Mapping ไม่มี STAFF/OWNER Role เป้าหมาย
- **API เสนอ:** POST /api/auth/register, POST /api/auth/login, GET /api/auth/me; POST /api/auth/logout ตาม Session strategy ที่อนุมัติ
- **ทดสอบ:** Public ส่ง ADMIN/OWNER ถูกปฏิเสธ, User แตะ Admin API ได้ 403, Token หมดอายุ/บัญชีปิด/Logout ตามนโยบาย, SQL Migration บน test DB, Login เดิมหลังย้าย, Row reconciliation/Restore; ไม่ Log Secret
- **เกณฑ์รับ:** มีเพียงสอง Roles; Schema/Client/CLI ตรงกัน; Migration/Backup/Rollback ทำซ้ำบนฐานทดสอบได้; Typecheck contracts ผ่าน; 1.1/2.1 และฐาน 1.13 มี Evidence

## Phase 2 — Admin & User Foundation

- **เป้าหมาย:** Shell สองกลุ่ม ข้อมูลผู้ใช้และหอเดียวจากฐานจริง
- **งาน:** ย้าย App/Auth/Components แกนกลางเป็น TSX, Admin/User Routes, แสดงข้อผิดพลาด, GET /me ไม่เชื่อ localStorage, Single dorm/Amenities; ภาษาไทย/บาท; คง UI เดิมเท่าที่ใช้ได้
- **ไฟล์:** client/src/App.tsx, main.tsx, context/AuthContext.tsx, components/Layout.tsx, pages/Login.tsx/Register.tsx/Profile.tsx (ใหม่/ย้าย), server/controllers/profileController.js/dormitoryController.js และ routes ที่เกี่ยวข้อง (ชื่อเสนอ)
- **Models:** User, Dormitory, Amenity/DormitoryAmenity, AuditLog
- **API เสนอ:** GET /api/me, GET /api/dormitory, GET/PUT /api/admin/dormitory; แก้โปรไฟล์เพิ่มเฉพาะสิทธิ์ที่อนุมัติ
- **ทดสอบ:** URL Guard ทั้งสอง Role/กรณี Reload; เปลี่ยน localStorage ไม่เพิ่มสิทธิ์; Profile มาจาก DB; ข้อมูลหอว่าง/ไม่มีรูป/โหลดล้มเหลว; Typecheck/Build
- **เกณฑ์รับ:** User เห็นข้อมูลตนจาก DB, Public เห็นหอเดียว, ไม่มีเมนู Owner สมัครเอง; ปิด 2.2 และส่วน Profile 2.6 ได้พร้อม Evidence

## Phase 3 — Room Management

- **เป้าหมาย:** Admin จัดการห้องและ User ดูห้องจริง
- **งาน:** เพิ่ม/แก้/ปิดใช้งานห้อง ตรวจเลขซ้ำ/ราคา/ประเภท รูปห้องและ Amenities ตามขอบเขตที่อนุมัติ; เปลี่ยน Home/Details เลิก Mock; ล็อก API DTO ให้ตรง UI; เก็บประวัติห้องที่เคยเช่า
- **ไฟล์:** server/controllers/propertyController.js ปรับหรือ roomController.js ใหม่, routes/propertyRoutes.js หรือ roomRoutes.js, Validators; client/pages/Home.tsx/RoomDetails.tsx/AdminRooms.tsx, components/PropertyCard.tsx/FilterSidebar.tsx; Schema/Migrations/Tests
- **Models:** Room, RoomImage, Dormitory, AuditLog; เตรียมสถานะรองรับ ActiveRoomAllocation ไม่ใช้ isAvailable เป็นความจริงอิสระหลายแหล่ง
- **API เสนอ:** GET /api/rooms, GET /api/rooms/:id; GET/POST /api/admin/rooms, PATCH /api/admin/rooms/:id; ปิดใช้งานด้วย PATCH แทนลบประวัติ
- **ทดสอบ:** CRUD/Validation/Unique/403, ห้องปิดไม่ปรากฏให้จอง, Reload ยังเห็นข้อมูล, ไม่มี Mock ID, ไทย/บาท, รูปหายยังใช้งานได้
- **เกณฑ์รับ:** ปิด 1.2/2.3; หน้า UI ที่ Admin เพิ่มตรงกับ API/DB ที่ User อ่าน; ห้ามแก้สถานะห้องข้าม Lease

## Phase 4 — Online Room Rental

- **เป้าหมาย:** User ส่งคำขอจริง Admin ยืนยัน/ยกเลิกและกันซ้ำ
- **งาน:** ตรึง FSM/จุดกันห้อง D05–D07; เชื่อม Form; Atomic room lock/Allocation; Idempotency; UI Conflict/Error; แสดงสถานะล่าสุด; Audit เหตุการณ์; วันนัด/หมดอายุทำเฉพาะที่อนุมัติ
- **ไฟล์:** bookingController.js/bookingRoutes.js ปรับ, services/bookingService.js (ใหม่), Schema/Migrations/Booking tests; client/pages/RoomDetails.tsx/MyBookings.tsx/AdminBookings.tsx
- **Models:** Booking, Room, ActiveRoomAllocation, User, AuditLog; Event hooks สำหรับ Notifications
- **API เสนอ:** POST /api/bookings, GET /api/me/bookings, GET /api/admin/bookings, PATCH /api/admin/bookings/:id/status; User cancel เฉพาะหากนโยบายอนุมัติ
- **ทดสอบ:** User A/B ส่งพร้อมกัน, Admin ยืนยันหลายรายการทั้งต่อเนื่อง/พร้อมกัน, Retry, Cancel เก่า, Unauthorized, End<=Start, Reload/Restart, 409 และ Success หลัง Commit
- **เกณฑ์รับ:** ปิดส่วนจอง 1.5/2.4/2.5; ผู้ถือสิทธิ์ต่อห้องไม่ซ้ำตามรูปแบบที่อนุมัติ; ไม่มี Success ปลอมจาก setTimeout; ทดสอบบน MySQL จริง

## Phase 5 — Tenant & Contract Management

- **เป้าหมาย:** แยกผู้จองจากผู้เช่าจริงและมีข้อมูลสัญญาที่ Admin บันทึกภายหลัง
- **งาน:** ทะเบียนผู้เช่า/ค้นหา/แก้/รายละเอียด; ผูก Account; สร้าง/แก้ Draft Lease, Activate/End ตามนโยบาย, Snapshot ค่าเช่า/ประกัน; ย้าย Allocation แบบ Atomic; User ดูสัญญา/ห้องตน; ไม่สร้าง E-signature
- **ไฟล์:** server/controllers/tenantController.js/leaseController.js, services/leaseService.js, routes/tenantRoutes.js/leaseRoutes.js (ใหม่), Schema/Migrations; client/pages/admin/Tenants.tsx/LeaseEditor.tsx และ pages/user/MyLease.tsx (ชื่อเสนอ)
- **Models:** TenantProfile, User, Lease, Booking, Room, ActiveRoomAllocation, AuditLog
- **API เสนอ:** GET/POST/PATCH /api/admin/tenants[/:id], GET/POST/PATCH /api/admin/leases[/:id], POST /api/admin/leases/:id/activate หรือ /end; GET /api/me/lease และ /api/me/leases/:id
- **ทดสอบ:** Activate ซ้ำ/ห้องถูกคนอื่นถือ/สัญญาทับ, User เห็นเฉพาะตน, Tenant ไม่มี Account ตามนโยบาย, Draft แก้ได้/Active แก้มีประวัติ, End ไม่ปลดห้องผิด
- **เกณฑ์รับ:** ปิด 1.3/1.4/1.6/2.6/2.7 และวงจรเช่าของ 1.5/2.5; Booking Approved ไม่ถูกนับเป็น Lease Active ก่อนทำสัญญา

## Phase 6 — Water/Electric Meter & Billing

- **เป้าหมาย:** บันทึกหน่วยจริงและออกใบแจ้งหนี้รายเดือนตรวจสอบย้อนหลังได้
- **งาน:** ยืนยันสูตร D08; ค่าก่อน/หลัง/การเปลี่ยนมิเตอร์; อัตรามีวันใช้; Invoice/Items/เดือน/วันครบชำระ; Unique/Idempotency; User อ่านบิล; Audit และ Event hooks
- **ไฟล์:** Schema/Migrations, controllers/meterController.js/invoiceController.js, services/billingService.js, routes ที่เกี่ยวข้อง (ใหม่); client/pages/admin/Meters.tsx/Invoices.tsx และ pages/user/MyInvoices.tsx/InvoiceDetails.tsx
- **Models:** RateSetting, MeterReading, Lease, Invoice, InvoiceItem, Room, AuditLog
- **API เสนอ:** GET/POST/PATCH /api/admin/meter-readings[/:id], GET/PUT /api/admin/rates, POST /api/admin/invoices/generate, GET /api/admin/invoices; GET /api/me/invoices และ /api/me/invoices/:id
- **ทดสอบ:** ตัวอย่างคำนวณจากเจ้าของหอ, ค่าลดลง/รอบซ้ำ/มิเตอร์หาย/ย้ายกลางเดือนตามนโยบาย; รันออกบิลซ้ำไม่สร้างหนี้ซ้ำ; ราคาปัจจุบันเปลี่ยนไม่กระทบบิลเก่า; User A/B IDOR; Decimal rounding
- **เกณฑ์รับ:** ปิด 1.7/1.8/2.8; ยอด Line/Total/หน่วยตรงสูตรที่อนุมัติถึงสตางค์; ไม่มี Silent correction ของตัวเลขผิด

## Phase 7 — Payment & Maintenance

- **เป้าหมาย:** ส่งหลักฐาน/ตรวจรับ/ประวัติจริง และแจ้งซ่อมติดตามครบ
- **งาน Payment:** Private Upload/Validation/Metadata, แจ้งโอน, Admin Verify/Reject, ยอดคงเหลือ/ประวัติ, กัน Verify ซ้ำ; ไม่ทำ Gateway
- **งาน Maintenance:** ผู้พักส่งเรื่อง/ดูของตน Admin จัดการสถานะและเวลา; Notification hooks/Audit; การแนบรูปซ่อมต้องยืนยันเพิ่มก่อนทำ
- **ไฟล์:** controllers/paymentController.js/maintenanceController.js, services/paymentService.js, middleware/uploadValidation.js, routes ใหม่, Storage policy, Schema/Migrations/Tests; client/pages/admin/Payments.tsx/Maintenance.tsx, pages/user/PaymentSubmit.tsx/PaymentHistory.tsx/MyMaintenance.tsx
- **Models:** Payment, PaymentProof, Invoice, MaintenanceRequest, User, Room, Lease, AuditLog
- **API เสนอ:** POST /api/me/payments (Multipart ตาม API Contract), GET /api/me/payments, GET /api/payments/:id/proof (มีสิทธิ์); GET /api/admin/payments, PATCH /api/admin/payments/:id/verification; POST/GET /api/me/maintenance, GET/PATCH /api/admin/maintenance[/:id]
- **ทดสอบ:** File fake type/oversize/traversal, Proof ของคนอื่น, Payment ซ้ำ/ยอดผิด/Reject/Verify retry, Transaction rollback; ซ่อม IDOR/Status invalid/ดูหลังย้ายออกตามนโยบาย
- **เกณฑ์รับ:** ปิด 1.9/1.10/2.9/2.10/2.11; อัปโหลดไม่ทำให้ Paid อัตโนมัติ; รายการเงิน/สถานะบิล/Audit สอดคล้อง; หลักฐานไม่เปิด URL สาธารณะ

## Phase 8 — Dashboard, Reports, Notifications & Audit Logs

- **เป้าหมาย:** ปิด 1.11–1.13/2.12 ด้วยข้อมูลจากงานจริง ไม่ใช่ตัวเลขตกแต่ง
- **งาน:** ยืนยัน D09/D10; Expense input ที่จำเป็นต่อรายงาน; รายรับเฉพาะ Verified และรายจ่ายจริง; Filter ช่วงวัน; สถิติห้อง/ยอดค้าง; ประกาศและ Notifications/Read state; Audit viewer/Filter โดยใช้ Log ที่เริ่มเก็บแล้ว
- **ไฟล์:** controllers/reportController.js/expenseController.js/dashboardController.js/notificationController.js/auditController.js, routes/services ใหม่, Schema/Migrations; client/pages/admin/Dashboard.tsx/Reports.tsx/Expenses.tsx/AuditLogs.tsx/Announcements.tsx และ pages/user/Notifications.tsx
- **Models:** Expense, Announcement, Notification, AuditLog; อ่าน Room/Allocation/Lease/Invoice/Payment/MaintenanceRequest
- **API เสนอ:** GET /api/admin/reports/cashflow, GET/POST/PATCH /api/admin/expenses[/:id], GET /api/admin/dashboard, GET /api/admin/audit-logs; GET/POST/PATCH /api/admin/announcements[/:id]; GET /api/announcements, GET /api/me/notifications, PATCH /api/me/notifications/:id/read
- **ทดสอบ:** ยอดรวมตรง Payment/Expense, Pending ไม่เป็นรายรับ, Filter ขอบวัน Bangkok/UTC, ห้องปิดไม่ปนห้องว่าง; Notifications ไม่ซ้ำและไม่อ่านของผู้อื่น; Audit แสดงผู้ทำ/เวลา/เป้าหมายแต่ไม่มี Secret
- **เกณฑ์รับ:** ทุกยอด Reconcile ได้; ข่าวสารและรายการสำคัญไม่ถูกลดเป็นแค่ Badge; Audit สืบกลับการเปลี่ยนจริงได้; Admin-only APIs ปฏิเสธ User

## Phase 9 — Testing & Project Submission

- **เป้าหมาย:** ยืนยันครบ PDF และจัดหลักฐานคุณภาพ/ความพึงพอใจจริง
- **งาน:** Regression ทั้ง 25 Requirements, Browser E2E สอง Role, MySQL concurrency, Security/Upload/Validation, Backup+Restore, ทดสอบ Local ไม่มีอินเทอร์เน็ตตามความจำเป็น; ตรวจ Dependencies อีกครั้ง; คู่มือ ER/API/เล่ม/สาธิต; ประเมินระบบและความพึงพอใจกับผู้เข้าร่วมที่ได้รับอนุญาต
- **ไฟล์:** server/test/*, client/e2e/* และ test config ที่เลือกหลังอนุมัติ, docs/testing/*, docs/user-manual/*, docs/requirements/* เฉพาะฉบับอนุมัติ, docs/analysis/RTM ที่อัปเดตหลักฐาน; ห้ามแก้ PDF ต้นฉบับเงียบ ๆ
- **Models:** ใช้ทุก Model ที่อนุมัติ ไม่เพิ่มฟีเจอร์เพื่อทำให้สาธิตดูมากขึ้น
- **API:** ครอบคลุม Endpoints จาก P1–8 ไม่มี Production/Test bypass ที่ให้สิทธิ์พิเศษ
- **ทดสอบ:** กำหนด Expected/Actual/วันที่/Environment/หลักฐานต่อ Requirement; รวม Negative cases และผู้ใช้จริง; ไม่ใช้ข้อมูลส่วนตัวใน Screenshots/Logs โดยไม่จำเป็น
- **เกณฑ์รับ:** ทั้ง 25 แถวมี Evidence และไม่มี Critical/High ที่กระทบวงจรหลักค้างโดยไม่รับทราบ; Restore สำเร็จ; Setup จากสำเนา Repository ทำซ้ำได้; ผลประเมินมาจากข้อมูลจริง

## Gates ที่ต้องอนุมัติก่อนลงมือ

G1: ยืนยัน PDF/Role/Scope และ D01–D12 โดยเฉพาะการกันห้อง/สูตรเงิน
G2: Review ER/Constraints/Permission matrix/API DTO/Migration-Rollback ก่อนสร้าง Schema เป้าหมาย
G3: ประเมินผล Phase 1 บนฐานทดสอบและอนุมัติ Cutover ก่อนชี้ App ไป MySQL
G4: ทบทวน RTM/Test evidence ทุก Phase; ไม่ข้าม Report/Notifications/Audit เพื่อเร่งเฉพาะ UI เช่าห้อง

เอกสารนี้ไม่ใช่การขออนุญาตรันคำสั่งทั้งหมดล่วงหน้า ผู้ใช้ยังต้องสั่ง Implementation ถัดไปตามขอบเขตงานปัจจุบัน
