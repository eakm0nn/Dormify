# Phase 1 — Authentication: Admin และ User

วันที่ทำและทดสอบ: 13 พฤศจิกายน 2569 (Asia/Bangkok)

## ขอบเขตที่ทำในรอบนี้

ปรับ Authentication/Authorization เป็นสองบทบาท `ADMIN` และ `USER` โดยใช้หน้าตาเดิม JavaScript และ SQLite
ยังไม่ได้ย้าย MySQL/TypeScript หรือปรับหน้า Marketplace ให้เป็นหอพักแห่งเดียวตามงานที่ผู้ใช้ยกเลิกก่อนหน้านี้
นี่เป็นงาน Authentication รอบแรก ไม่ใช่ Phase 1 ทั้งหมดของ Roadmap เดิม

- Public Register สร้าง USER เท่านั้น ไม่รับ ADMIN/OWNER/TENANT แม้ส่ง Role ผ่าน API
- ตัดตัวเลือกสมัคร Owner ออกจาก Register
- Login ตรวจรหัสผ่านและ Role ที่รองรับ แล้วสร้าง Session อายุ 1 วันใน SQLite
- GET `/api/auth/me` ตรวจ Token/Session และคืนชื่อ Email/Role ปัจจุบันจาก DB ไม่มี Password/Hash
- POST `/api/auth/logout` ยกเลิกเฉพาะ Session ของ Token นั้น นำ Token เดิมกลับมาใช้ไม่ได้แม้ Server Restart
- Admin จัดการที่พัก/ห้อง/รายการจองได้ User ไม่สามารถใช้ API เหล่านี้ได้
- User เรียกการจองและอ่านรายการของตนเอง Admin ไม่ใช้หน้า/API ของ User แทนผู้เช่า
- เมนูและ ProtectedRoute ตรวจ ADMIN/USER ตามข้อมูล Session; เมื่อ Reload อ่าน `/me` ไม่เชื่อ Role จาก localStorage
- รวม Axios instance เพื่อส่ง Token เฉพาะ Backend ที่ตั้งไว้ และจัดการ HTTP 401 โดยล้าง Session ในหน้าเว็บ
- หาก Logout ติดต่อ Server ไม่สำเร็จ จะรายงานข้อผิดพลาดและให้ลองใหม่ ไม่แสดงว่า Token ถูกยกเลิกแล้วทั้งที่ Server ยังไม่ได้รับคำขอ

## สร้าง Admin บนเครื่อง Local

จาก Root ของโปรเจกต์:

```powershell
npm.cmd --prefix server run admin:create
```

กรอก Email ชื่อ รหัสผ่าน และยืนยันรหัสผ่านใน Terminal รหัสผ่านไม่แสดงระหว่างพิมพ์
รหัสผ่าน Admin ต้องมีอย่างน้อย 12 ตัวอักษร และไม่เกิน 72 UTF-8 bytes ตามขีดจำกัด bcrypt
Script Normalize Email และ Hash รหัสผ่านก่อนบันทึก ไม่พิมพ์รหัสผ่านหรือ Hash ในผลลัพธ์
ไม่ใส่รหัสผ่านใน Command arguments, Source, `.env.example` หรือบัญชี Default

Script ยอมรับเฉพาะ DATABASE_URL ของ SQLite Local และต้องมีฐานที่เตรียมแล้ว
ถ้า Email มีอยู่จะหยุด ไม่เปลี่ยน Role ของ User ให้เป็น Admin และไม่เปลี่ยนรหัสผ่านบัญชีเดิม
ไม่มี Public Endpoint สำหรับสร้าง Admin; การรัน CLI ต้องเข้าถึงเครื่อง/Repository/Environment ได้
สำหรับ Automation/Tests ใช้ JSON ผ่าน stdin เท่านั้น ห้ามส่ง Password ใน arguments หรือเก็บในไฟล์ Commit

ในการทำงานรอบนี้ **ไม่ได้สร้าง Admin ลงฐาน Local ให้เอง** เพื่อให้ผู้ใช้เลือกรหัสผ่านด้วยตนเอง
บัญชี Admin ที่สร้างระหว่าง Tests อยู่เฉพาะ SQLite ชั่วคราว ไม่ใช่ฐาน `dev.db`

## รันและตรวจระบบ

```powershell
npm.cmd start
```

Frontend: http://127.0.0.1:5173 และ Backend: http://127.0.0.1:5000
ใช้ SQLite ต่อ ไม่ต้องติดตั้ง Dependencies ใหม่ในงานรอบนี้
สำหรับสำเนาเครื่องอื่นที่ยังไม่มีตาราง Session ให้หยุด Backend ก่อน แล้วเรียก `npm.cmd --prefix server run db:setup`
สคริปต์ Setup ไม่รัน Seed/Reset และห้ามเพิ่ม `--accept-data-loss` เพื่อข้ามคำเตือน

## สิทธิ์ API ที่เปลี่ยน

| Endpoint | สิทธิ์ |
|---|---|
| POST /api/auth/register | Public; สร้าง USER ที่ Server เท่านั้น |
| POST /api/auth/login | Public; Role อื่นนอกจาก ADMIN/USER ถูกปฏิเสธ |
| GET /api/auth/me | Session ที่ใช้งานได้ |
| POST /api/auth/logout | Session ที่ใช้งานได้ ยกเลิกตัวเองเท่านั้น |
| POST /api/properties | ADMIN |
| POST /api/properties/rooms | ADMIN |
| GET /api/properties และ /available-rooms | Public เหมือนเดิม |
| POST /api/bookings | USER |
| GET /api/bookings/my-bookings | USER เฉพาะ userId จาก Session |
| GET /api/bookings/admin | ADMIN |
| GET /api/bookings/owner | URL เก่าที่คงไว้เพื่อ Compatibility แต่ ADMIN เท่านั้น ไม่มี OWNER Role |
| PUT /api/bookings/:bookingId/status | ADMIN |

Middleware ตรวจ Bearer format, Signature HS256, JWT expiry, Session ID/Token hash/revokedAt/expiresAt
และตรวจ Role ของ Account ปัจจุบันเทียบกับ Token ทุกครั้ง ถ้าสิทธิ์เปลี่ยนจะต้อง Login ใหม่
ไม่ใช้ Role จาก Body/Browser เป็นหลักฐานในการอนุญาต
HTTP 401 คือ Session ใช้ไม่ได้/ต้อง Login ใหม่; HTTP 403 คือมี Session แต่ไม่มีสิทธิ์
หาก DB ตรวจ Session ไม่ได้ตอบ 503 โดยไม่ปล่อยผ่าน

## ข้อมูลและการเปลี่ยน Schema

ตรวจฐานจริงก่อนทำแล้วพบ User 0 แถว ไม่มี OWNER/TENANT เดิม จึงไม่มีการยกสิทธิ์/เปลี่ยน Role ของข้อมูลเดิม
สำรอง SQLite ก่อนเพิ่มตารางไว้ที่:

`server/prisma/backups/before-auth-phase1-20261113-010852.db`

Backup และ SQLite ถูก Ignore ไม่ Commit ข้อมูลส่วนตัว
เพิ่ม `AuthSession` มี id, tokenHash, userId FK, expiresAt, createdAt, revokedAt และ Index ที่ใช้ค้น
เก็บ SHA-256 ของ Token แทน Token ดิบในตาราง Session; รหัสผ่านยังเป็น bcrypt
User.role มี Default USER และ Application Allowlist ADMIN/USER แต่ SQLite String ยังไม่ได้บังคับ Enum ที่ DB
หากใช้ SQL/Seed เก่าใส่ OWNER/TENANT โดยตรง ระบบจะไม่ให้บัญชีนั้น Login ต้องตรวจ Mapping ก่อน ไม่เปลี่ยนเป็น Admin อัตโนมัติ
Token จากเวอร์ชันก่อนที่ไม่มี Session record จะใช้ไม่ได้ ผู้ใช้ต้อง Login ใหม่

ใช้ Prisma CLI/Client 5.22.0 เดิม Generate/Validate/db push ผ่านโดยไม่ Reset และไม่รัน Seed
ก่อน Generate พบ EPERM เพราะ Backend ที่เปิดก่อนหน้านี้ล็อก Engine บน Windows; หยุด Process ของงานเดิมแล้ว Generate สำเร็จ
หลังปรับ SQLite ตรวจ Integrity = ok, Foreign key violations = [] และทุกตารางรวม AuthSession ยัง 0 แถว

**อัปเดตหลังเก็บกวาดโปรเจกต์:** ลบ `seed.js` และ `test_seed.js` เก่าพร้อมคำสั่ง Seed แล้ว เพราะลบข้อมูลและสร้าง Role แบบระบบรุ่นก่อน
ถ้ามีข้อมูลจริงในเครื่องอื่นให้สำรองและตรวจ Role ก่อน Upgrade ไม่ถือว่าการทดสอบฐานว่างรับรองข้อมูลของทุกเครื่อง

## ผลทดสอบจริง

คำสั่ง:

```powershell
npm.cmd --prefix server test
npm.cmd --prefix client run build
```

ชุดทดสอบใน `server/test/phase0.test.js` ถูกปรับให้ตรงระบบสอง Role แล้ว (ชื่อไฟล์คงเดิม)
ผลล่าสุด **15 Tests ผ่านทั้งหมด** นับ Parent 1 + Subtests 14 บน SQLite ชั่วคราวแยกจากฐาน Local

ครอบคลุม Secret ไม่ปลอดภัย, สมัคร USER/ปฏิเสธ Role อื่น, Normalize/Email ซ้ำ, Password type/ความยาว/UTF-8 limit,
Admin CLI และการไม่ Promote/Overwrite, Login/Password hash, `/me` ข้อมูลปัจจุบัน, Token ปลอม/หมดอายุ/Token เก่า,
Admin-only APIs, User อ่าน Booking ของผู้อื่นไม่ได้, Logout/Replay/ไม่ยกเลิก Session ผู้อื่น,
Expiry ใน DB, Role ถูกเปลี่ยน/บัญชีถูกลบ, CORS และ Revocation หลัง Restart พร้อม Session อื่นยังใช้งานได้

Frontend Build ผ่าน (Vite 5.4.21, 1,793 modules)
ตรวจ Root `npm.cmd start` และ HTTP จริงแล้ว: Frontend `/` และ AuthContext module ตอบ 200,
Backend `/` ตอบ 200 และ `/api/auth/me` เมื่อไม่ส่ง Token ตอบ 401 ตามที่คาด
หยุด Process ที่เปิดเพื่อทดสอบแล้ว เปิดใช้งานอีกครั้งด้วย `npm.cmd start`
Git whitespace check ผ่านโดยให้รองรับ CRLF ของไฟล์เดิม
ยังไม่ได้ทดสอบการกด Register/Login/Logout/เมนูใน Browser แบบ E2E หรือทดสอบการพิมพ์ Password แบบ Interactive TTY
การยืนยัน Admin CLI อัตโนมัติใช้ stdin และตรวจว่าผลลัพธ์ไม่มีรหัสผ่าน
ไม่มีการอ้างว่า API Tests แทน Browser/Responsive/Styling Tests ทั้งหมด

## ข้อจำกัดที่ยังอยู่

- Token ยังอยู่ใน localStorage จึงต้องป้องกัน XSS; การใช้ Session hash ไม่ป้องกัน Token ที่ถูกขโมยจาก Browser
- ยังไม่มี Rate Limit, Password reset, Account lockout หรือหน้าเปลี่ยน Role; ไม่ถือว่าพร้อม Public Production
- หากพัฒนาเมนูเปลี่ยน Role/รหัสผ่านภายหลังต้องกำหนดการ Revoke Sessions ที่เกี่ยวข้องด้วย
- ยังไม่ได้ทำ Migration history/MySQL/TypeScript และไม่ได้เปลี่ยน Business Logic กันห้อง/สัญญา/บิล
- Home/PropertyDetails ยังใช้ Mock; ปุ่มจองบนหน้าเดิมยังไม่บันทึกจริง ไม่ใช่งานที่แก้ในรอบ Authentication นี้
- Dependencies มีข้อจำกัดจากผล Audit Phase 0 เดิม ยังไม่ได้ Audit ใหม่ในงานนี้

## ไฟล์ที่เปลี่ยนเฉพาะงาน Authentication รอบนี้

- Backend: `server/prisma/schema.prisma`, `server/package.json`
- Auth: `server/src/controllers/authController.js`, `server/src/routes/authRoutes.js`, `server/src/middleware/authMiddleware.js`
- ใหม่: `server/src/middleware/authorize.js`, `server/src/lib/prisma.js`, `server/src/lib/session.js`, `server/scripts/create-admin.js`
- สิทธิ์งานเดิม: Controllers `propertyController.js`/`bookingController.js` และ Routes `propertyRoutes.js`/`bookingRoutes.js`
- Frontend: `client/src/context/AuthContext.jsx`, `client/src/services/api.js` (ใหม่), `client/src/App.jsx`, `client/src/components/Layout.jsx`
- Pages: `Register.jsx`, `Home.jsx`, `PropertyDetails.jsx`, `AddProperty.jsx`, `MyBookings.jsx`, `ManageBookings.jsx`
- Tests: `server/test/phase0.test.js`
- เอกสาร: `README.md`, `docs/PHASE1_AUTH.md`

Changes อื่นที่เห็นใน git status เช่น Lockfiles/Local config เป็นงาน Phase 0 ก่อนหน้า ไม่ได้ติดตั้ง/อัปเดตแพ็กเกจในรอบนี้
