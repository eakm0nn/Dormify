# ผลตรวจ Repository เทียบเอกสาร DORMIFY

## 1. เอกสารอ้างอิงและสิ่งที่อ่านได้จริง

ใช้ไฟล์ที่มีจริง [แบบเสนอโครงงานเอกอมร.pdf](../requirements/แบบเสนอโครงงานเอกอมร.pdf) ขนาด 302,430 Bytes จำนวน 5 หน้า
SHA-256 `3a86bc087da45df777f57bc34bb5215cfa191f09c0d6d3f850bcbfeac066ddd5`
ไม่พบชื่อ `(1).pdf` ตามคำขอ จึงยังต้องยืนยันฉบับ ห้ามถือว่าชื่อต่างกันแต่เนื้อหาเหมือนกันโดยไม่มีหลักฐาน

ไม่มี pypdf/PyMuPDF/pdfplumber หรือ pdftotext ในเครื่อง จึงใช้ Python standard library ถอด PDF Streams และ ToUnicode โดยไม่ติดตั้งแพ็กเกจ
ตรวจ Fonts ต่อ Resources ของแต่ละหน้า รวมตำแหน่ง Tm/TD และ cm จนไม่มี Text Block ตกหล่น
ข้อความที่ไม่มี Unicode คงเป็น `[Gxxxx]` ใน [หลักฐานถอดข้อความ](PDF_TEXT_EXTRACTION.md)
สรุปด้านล่างเรียบเรียงภาษาไทยเพื่อให้อ่านเข้าใจ ไม่ใช่การคัดคำทุกตัวแบบรับรองความถูกต้อง
ยังไม่ได้ตรวจภาพตาราง/ตราสัญลักษณ์หรือยืนยันวรรณยุกต์ที่ไม่มี Mapping

| หน้า | เนื้อหาที่ตรวจ | ผลและข้อจำกัด |
|---|---|---|
| 1 | ชื่อ ผู้จัดทำ หลักการและเหตุผล | ชื่อสั้นระบบการเช่าหอพัก DORMIFY ออนไลน์; ในเหตุผลใช้ชื่อระบบการเช่าและบริหารจัดการหอพักผ่านเว็บไซต์ |
| 2 | เหตุผลต่อ วัตถุประสงค์ Stack Admin ทั้ง 13 ข้อ และ User 2.1–2.4 | React/Vite/TypeScript, Node/Express, MySQL; ข้อความบอก 3 ส่วนแต่แจกแจงเริ่ม Admin/User |
| 3 | User 2.5–2.12 อ้างอิงและงบประมาณ | มีอัปโหลดหลักฐานและ Notifications จริงในขอบเขต; งบกระดาษ/รูปเล่มรวม 410 บาท |
| 4 | วิธีดำเนินงานและตารางเวลา | หัวตาราง พ.ย. 2569–มี.ค. 2570 สัปดาห์ 1–18; ไม่ยืนยันแถบสัปดาห์ของแต่ละงานจากข้อความล้วน |
| 5 | ประโยชน์ 6 ข้อ | รวมงานหอพัก จองเบื้องต้น มิเตอร์/บิล หลักฐานโอน ซ่อม สิทธิ์/Audit และทักษะผู้จัดทำ |

## 2. ความเข้าใจโครงงาน

สร้างต้นแบบเว็บไซต์ให้ผู้สนใจดูห้องว่างและขอเช่าได้สะดวก ลดการสอบถามและข้อมูลซ้ำ
บริบทคือหอพักที่บิดาของผู้จัดทำดูแล รวมข้อมูลห้อง ผู้เช่า สัญญา มิเตอร์ ค่าใช้จ่าย การชำระเงิน และซ่อมไว้ในระบบเดียว
ใช้สองบทบาท Admin และ User ตามคำสั่งล่าสุด ไม่มี Staff Role เพิ่ม

วัตถุประสงค์ในหน้า 2 มีสามด้าน: พัฒนาระบบ ศึกษาคุณภาพของระบบ และศึกษาความพึงพอใจของผู้ใช้
ดังนั้นการส่งโครงงานต้องมีผลประเมินคุณภาพ/ความพึงพอใจจากผู้ประเมินจริงเพิ่มเติมจากผล Software Tests
ห้ามสร้างผลแบบสอบถาม จำนวนผู้ตอบ หรือคะแนนสมมติแทนข้อมูลจริง

ประโยชน์ที่คาดหวังหน้า 5 คือข้อมูลรวมศูนย์ ดูและยืนยันการเช่าเบื้องต้นได้สะดวก เจ้าของบริหารมิเตอร์/บิล/ยอดชำระ
ผู้เช่าดูห้อง/บิล ส่งหลักฐานและแจ้งซ่อม มีการจำกัดสิทธิ์และประวัติงานสำคัญ และผู้จัดทำฝึกวิเคราะห์/พัฒนา/ทดสอบ

## 3. ความขัดแย้งและประเด็นรอยืนยัน

ตารางนี้เป็นรายการตัดสินใจ ไม่ได้แก้ PDF หรืออนุมัตินโยบายแทนผู้ใช้

| ID | ประเด็น/หลักฐาน | ข้อเสนอและผลต่อการพัฒนา |
|---|---|---|
| D01 | ชื่อ PDF ที่ขอมี `(1)` แต่ไฟล์จริงไม่มี | ยืนยันฉบับ/Hash ก่อนตรึง Requirements; รายงานนี้วิเคราะห์ไฟล์ที่พบเท่านั้น |
| D02 | หน้า 2 บอกแบ่ง 3 ส่วน แต่พบรายละเอียดเพียง Admin/User | รายงานเป็นความไม่สอดคล้อง; คำสั่งล่าสุดให้ 2 Roles จึงไม่เสนอ Staff Role |
| D03 | หน้า 1/5 กล่าวถึงพนักงาน แต่ไม่มีขอบเขต Staff | ให้ผู้มีหน้าที่ใช้สิทธิ์ตามนโยบายสองบทบาทที่อนุมัติ ห้ามตีความให้ต้องสร้าง Role เพิ่ม |
| D04 | ชื่อสั้นหน้าแรกกับชื่อเต็มในเหตุผลต่างกัน | ยืนยันชื่อแสดงบนเว็บ/ปก/รายงาน ไม่เปลี่ยนเอง |
| D05 | PDF ใช้คำยืนยันการเช่า; ขั้น Admin ยืนยันแล้วกันห้อง/นัดสัญญามาจากคำขอเพิ่ม | เสนอแยก Booking และ Lease; ต้องยืนยันจุดเริ่มกันห้องก่อนออกแบบสถานะ |
| D06 | ไม่กำหนดอายุการกันห้อง จำนวนคำขอต่อ User และกรณีไม่มาตามนัด | กำหนดกติกาและผู้มีสิทธิ์ปลดห้องก่อนทำ Phase 4; ไม่ใส่ 24/48 ชั่วโมงเอง |
| D07 | ไม่ชัดว่าเช่าทั้งห้องหรือแยกเตียง; ระบบรุ่นก่อนมี capacity/Sharing | เสนอเช่าทั้งห้องสำหรับความเรียบง่าย แต่รอยืนยันก่อนกำหนด Unique active room |
| D08 | ค่าเช่า เงินประกัน หน่วยน้ำไฟ วันตัดรอบ ภาษี ค่าปรับ/ย้ายกลางเดือนยังไม่กำหนด | ขอสูตรและตัวอย่างจากเจ้าของหอ ไม่ตั้งค่าเรียกเก็บโดยเดา |
| D09 | ข้อ 1.11 ต้องมีรายจ่าย แต่ไม่มีรายละเอียดว่าใครบันทึก/แก้/หมวดใด | เสนอ Admin บันทึก Expense เพื่อให้รายงานมีข้อมูลจริง; ต้องอนุมัติขอบเขตย่อยนี้ |
| D10 | ข้อ 2.12 กล่าวทั้งข่าวสารและรายการสำคัญ ไม่ระบุช่องทาง/เหตุการณ์ | เสนอประกาศและ Notifications ในเว็บ ไม่เพิ่ม Email/SMS/LINE โดยพลการ |
| D11 | PDF ไม่ระบุ TypeScript ฝั่ง Server; Tailwind/Prisma ปรากฏในอ้างอิง ส่วนคำขอล่าสุดระบุใช้ | Frontend TS ตาม PDF; คง Server JS ได้เป็นข้อเสนอ ไม่ย้าย Backend TS เอง; คง Tailwind/Prisma ตามคำขอ |
| D12 | ตารางหน้า 4 มี 18 สัปดาห์ แต่ยังไม่อ่านแถบงานเป็นภาพ; ไม่ระบุแผนทดสอบผู้ใช้/Retention | แผนสัปดาห์ใน Roadmap เป็นข้อเสนอเท่านั้น; ยืนยันกรอบเวลา ผู้ประเมิน และอายุเก็บเอกสาร |

PDF ไม่ได้ระบุ Payment Gateway หรือลายเซ็นออนไลน์ และคำขอยืนยันว่าไม่ต้องทำทั้งสองอย่าง
หอพักแห่งเดียว/Local เป็นข้อจำกัดจากคำสั่งผู้ใช้ ไม่ได้อ้างว่า PDF มีถ้อยคำนี้ทุกข้อ

## 4. Snapshot และวิธีตรวจ Repository

HEAD ที่ตรวจ `c161ce3` พร้อม Working Tree ที่มีงาน Phase 0 ยังไม่ Commit ต้องแยกจาก ประวัติ Git ก่อนปรับ
อ่าน Current Working Tree เป็นหลัก; ใช้ Git HEAD/ผลตรวจรอบก่อนเป็นหลักฐานส่วนที่เรียกว่าระบบก่อนปรับ
ไม่ตรวจ Remote เพิ่มและไม่อ้างว่า GitHub Remote ล่าสุดตรงกับ HEAD นี้

งานนี้อ่าน Source/Config/Lockfiles/เอกสารและ SQLite แบบ Read-only ไม่เริ่ม Server ใหม่ ไม่ติดตั้ง ไม่ Build หรือรัน Test ที่สร้างฐานใหม่
ฐานที่ตรวจ `dev.db` มี User/Property/Room/Booking/Payment/Complaint อย่างละ 0 แถว
`.env` ทั้งสองส่วนมีจริง ตรวจเฉพาะชื่อ Keys และไม่บันทึก Secret ในรายงาน
พบ .gitignore ป้องกัน .env, db/journal/wal/shm, node_modules และ dist; Template ยกเว้นให้ Track ได้

ผล API 9/9 และ Build ผ่านเป็นการรันจริงใน Phase 0 ก่อนหน้า ดู [ผลเดิม](../PHASE0_TEST_RESULTS.md)
ไม่เท่ากับผ่าน 25 Requirements และไม่ได้พิสูจน์ Browser E2E หรือ MySQL
ไม่มี Requirement ใดถูกยกระดับเป็น Implemented & Tested จากการอ่านโค้ดอย่างเดียว

## 5. Frontend

React 18.3.1 / Vite 5.4.21 / React Router DOM 6.30.6 / Tailwind 3.4.19 จาก Lockfile
ทั้งหมดเป็น JSX/JavaScript ไม่มี TypeScript Compiler/tsconfig เป้าหมายยังไม่ครบ

| Route | ไฟล์ปัจจุบันใต้ client/src | ข้อมูล/สิทธิ์ |
|---|---|---|
| /login, /register | pages/Login.jsx, pages/Register.jsx | AuthContext เรียก API จริง; สมัครเลือก TENANT/OWNER |
| / | pages/Home.jsx | อ่าน ALL_PROPERTIES และกรอง Mock หลายหอ/เมือง |
| /properties/:id | pages/PropertyDetails.jsx | อ่าน Mock; handleBook รอ setTimeout/console.log ไม่ส่ง POST |
| /add-property | pages/AddProperty.jsx | POST จริง แต่กลับ Home ที่ยัง Mock; OWNER/ADMIN |
| /my-bookings | pages/MyBookings.jsx | GET จริง TENANT; เป็น Booking ไม่ใช่ Lease |
| /manage-bookings | pages/ManageBookings.jsx | GET/PUT จริง OWNER/ADMIN; UI มีอนุมัติ/ปฏิเสธ ไม่ครบยกเลิก |

`App.jsx` มี ProtectedRoute; `Layout.jsx` แสดงเมนูตาม Role แต่ยังไม่มี Admin Dashboard/User Portal ตาม PDF
AuthContext อ่าน user/role จาก localStorage จึงแก้เมนู/Route Guard ได้ใน Browser; Backend ต้องไม่เชื่อข้อมูลชุดนี้
Token จริงยังตรวจ Signature ฝั่ง Server จึงไม่ควรสรุปว่าแก้ localStorage แล้วเป็น Admin ใน Backend ได้ทันที

Form Validation ฝั่ง UI มี required/type=email และตรวจวันที่ไม่ว่าง แต่ไม่ตรวจลำดับวันครบ
RoomCard เรียก handleBook แล้ว setDone แม้ handleBook return เพราะ Role ไม่ตรง จึงอาจแสดงผลสำเร็จหลอกผู้ใช้
MyBookings/ManageBookings ใช้ console.error เป็นหลัก เมื่อ API ล้มเหลวผู้ใช้อาจเห็นรายการว่างแทน Error ที่ชัดเจน
ไม่มี Pagination/การรีเฟรชความว่างหลังมีผู้ใช้คนอื่นเปลี่ยนสถานะ

`mockData.js` มี amenities, images, reviews, gender, staff, location และเมนูอาหารที่ Schema จริงไม่มี
ประเภท APARTMENT ใน Mock ต่างจาก FLAT ใน API; ประเภทห้อง Sharing ต่างจาก AC/NON-AC ใน Schema
จึงไม่สามารถเปลี่ยน Axios แล้วรับโครงสร้างเดิมโดยไม่ทำ DTO/Mapping
สกุลเงินรูปี ภาษาอังกฤษ วันที่ en-IN และข้อมูลเมืองต่างประเทศต้องปรับเป็นไทย/บาทตามบริบทโครงงาน
รูป Picsum, Google Fonts และแผนที่ภายนอกยังต้องใช้อินเทอร์เน็ต แม้ตัวเว็บรัน Local

## 6. Backend และ API ที่มีอยู่จริง

Express 5.2.1, CommonJS แยก Controllers/Routes/Middleware; `config.js` โหลด .env และตรวจ Secret ก่อน Import Controllers
`index.js` bind 127.0.0.1 และ CORS เฉพาะ CLIENT_ORIGIN มี JSON parser

| Method / Route | Handler | สิทธิ์/ข้อจำกัด |
|---|---|---|
| POST /api/auth/register | register | Public; OWNER/TENANT เท่านั้น Default TENANT; ยังไม่ตรงสองบทบาท |
| POST /api/auth/login | login | Public; bcrypt เทียบรหัส JWT HS256 อายุ 1 วัน |
| GET /api/properties | getProperties | Public; คืน rooms และชื่อ/email owner ไม่มี filter จริงตาม Comment |
| GET /api/properties/available-rooms | getAvailableRooms | Public; isAvailable=true ไม่คิด Lease/ช่วงเวลา |
| POST /api/properties | createProperty | OWNER/ADMIN; หลายหอพัก |
| POST /api/properties/rooms | addRoom | ownerId ตรงหรือ ADMIN; ไม่มีแก้ไข/ลบ/ปิดใช้งาน |
| POST /api/bookings | createBooking | TENANT; ตรวจ isAvailable ก่อนสร้าง PENDING |
| GET /api/bookings/owner | getOwnerBookings | OWNER เฉพาะของตน ADMIN ทั้งหมด TENANT ถูกปฏิเสธ |
| PUT /api/bookings/:bookingId/status | updateBookingStatus | OWNER ของห้อง/ADMIN; Allowlist 3 สถานะ แต่ไม่ตรวจ State Transition |
| GET /api/bookings/my-bookings | getMyBookings | Token; กรอง userId ของตนเอง ไม่ใช่ข้อมูลผู้เช่าหรือสัญญาครบ |

ไม่พบ API ผู้เช่า สัญญา มิเตอร์ Invoice Payment Complaint Upload Report Notification หรือ Audit
ไม่มี multer/Upload storage หรือ Endpoint ดาวน์โหลดเอกสารแบบตรวจสิทธิ์
Error ตอบข้อความทั่วไปเป็นส่วนใหญ่ ไม่พบ Error Middleware กลาง/รูปแบบ Response/Request ID
parseInt ยอมรับบางค่าเช่น `1abc` และ Invalid ID อาจกลายเป็น 500; isInt ไม่ได้ toInt สำหรับ capacity
Email ไม่ Normalize, Name ไม่ Trim/กำหนดความยาว, Password ขั้นต่ำ 6 และไม่มี Rate Limit
ยังไม่ตรวจ End > Start, ราคาติดลบ, Room Number ซ้ำ และ Business Validation ของสถานะครบ
สร้าง PrismaClient แยกในแต่ละ Controller ควรรวม Resource Lifecycle ในอนาคต

## 7. ฐานข้อมูลปัจจุบันและปัญหาการจองซ้ำ

SQLite; Models 6 ตัว: User → Property → Room → Booking → Payment และ User/Property → Complaint
User มี email unique แต่ Role เป็น String; Room ไม่มี Unique เลขห้อง; Booking/Payment/Complaint สถานะเป็น String
ไม่มี Lease/Meter/Invoice/Expense/Audit หรือข้อบังคับ Active occupancy
ราคาเป็น Decimal ไม่ได้ระบุ Precision สำหรับ MySQL; วันที่ไม่มีนโยบาย Billing Month/Timezone
ไม่พบ migrations จึงยังไม่มีประวัติ Schema ที่ตรวจสอบและ Deploy ซ้ำได้

ลำดับที่ทำให้ผิดได้แม้ไม่ส่งพร้อมกัน: A และ B สร้าง PENDING ห้องเดียวกัน → Admin ยืนยัน A → Admin ยืนยัน B
updateBookingStatus ไม่ตรวจว่าห้องถูกจอง/มี Confirmed อื่นแล้ว จึงสำเร็จทั้งคู่
ถ้ายกเลิก A จะ set isAvailable=true โดยไม่ตรวจ B ทำให้ห้องเปิดว่างผิดอีกครั้ง
Race Condition ทำให้ความเสี่ยงเพิ่ม แต่ไม่จำเป็นต้องมี Race ก็เกิดปัญหานี้ได้จากโค้ด
นี่เป็นข้อค้นพบจากการอ่าน Logic ไม่ใช่ผลรันโจมตีในงานนี้
แผนแก้แบบ Transaction/Lock/Constraints อยู่ใน [แผนข้อมูล](MIGRATION_AND_DATA_MODEL.md)

## 8. เปรียบเทียบ GitHub เดิม / Working Tree / DORMIFY

| ด้าน | ระบบก่อนปรับ | Working Tree หลัง Phase 0 | เป้าหมาย DORMIFY |
|---|---|---|---|
| Role | ADMIN/OWNER/TENANT สมัคร ADMIN ผ่าน API ได้ | ปิดสมัคร ADMIN แต่ยังมี OWNER | ADMIN/USER เท่านั้น ไม่มี Staff |
| สถานที่ | Marketplace หลายที่พัก | ยังเหมือนเดิม | หอพักแห่งเดียว |
| Frontend | JS/JSX + Mock | ยัง JS/JSX + Mock | React/Vite/TypeScript ต่อ DB จริง |
| Backend | Express/JWT มี Secret fallback | ตรวจ Secret และ bind Local | ตรวจ Role/Ownership/Session ครบ |
| Database | SQLite, Prisma v5 Server/v7 Root ขัดกัน | Root ไม่มี Prisma, Server CLI/Client 5.22.0 | MySQL พร้อม Migration/Backup |
| จอง | Request/approve Boolean ห้องว่าง | ตรวจ Role/Status เพิ่ม แต่ยังจองซ้ำได้ | Request → Admin ยืนยัน → กันห้อง → สัญญา/เข้าพัก ตามกติกาที่ยืนยัน |
| สัญญา/มิเตอร์/บิล | ไม่มี | ไม่มี | Admin จัดการ User ดูของตนเอง |
| Payment/ซ่อม | มี Models เท่านั้น | ยังไม่มี API/UI | อัปโหลดหลักฐาน/ตรวจรับ/ประวัติ และงานซ่อมครบ |
| รายงาน/สถิติ/Audit/ข่าวสาร | ไม่มี | ไม่มี | ครบ 1.11–1.13/2.12 |
| ทดสอบ | ไม่มี Suite จริง | Node test API ผ่าน 9/9 ใน Phase 0 | Traceability ทั้ง 25 รวม MySQL/Browser/Concurrency/UAT |

## 9. ใช้ต่อ แก้ไข และสร้างใหม่

**ใช้ต่อเป็นโครง:** `components/Button.jsx`, `Input.jsx`, `PropertyGallery.jsx`, `Layout.jsx`, `utils/cn.js`, Tailwind/PostCSS และ CSS เดิม
ใช้ Login/Register/AuthContext/ProtectedRoute เป็นฐานแต่ต้องแก้ Role, Token Lifecycle, Error/Validation และ TypeScript
ใช้โครง Routes/Controllers, bcrypt, JWT Middleware และ Prisma Relations เป็นฐาน ไม่รับรอง Logic ปัจจุบันว่าตรง PDF
ใช้ `server/test/phase0.test.js` เป็นรูปแบบ API Integration หลังปรับ Provider/Fixture ที่ได้รับอนุญาต

**ต้องแก้:** App/Layout/Register (สอง Role), Home/PropertyDetails/FilterSidebar (หอเดียว/ข้อมูลจริง), MyBookings/ManageBookings (State Machine), AuthContext/API Client (Types/401 handling), Controllers/Validators, Schema/Constraints, Scripts/Environment/Lockfiles และ Tests

**ต้องสร้างใหม่ตาม PDF:** ผู้เช่า/โปรไฟล์, Lease, มิเตอร์, ใบแจ้งหนี้/รายการบิล, Proof Upload/ตรวจชำระ/ประวัติ, ซ่อม/ติดตาม, รายรับ-รายจ่าย, Dashboard, ข่าวสาร/Notifications และ Audit
รายละเอียด Models/Endpoints ในเอกสารอื่นเป็นข้อเสนอ ไม่ใช่สิ่งที่ Repository มีอยู่แล้ว

**ไม่จำเป็นต่อขอบเขตปัจจุบัน:** หลายเมือง/หลาย Property/Owner สมัครเอง, เมนูอาหาร, รีวิว/ดาว/รายการโปรด/Share และ Staff Contacts จำลอง
ยังไม่ลบไฟล์ใด เก็บเป็นแหล่งอ้างอิงจนผู้ใช้อนุมัติการปรับขอบเขต
`render.yaml` เป็น Hosting เดิม ไม่จำเป็นกับ Local และไม่มีคำสั่ง Deploy ในแผนนี้
เก็บข้อความลิขสิทธิ์และเงื่อนไข MIT ตามไฟล์ LICENSE พร้อมใบอนุญาตของฟอนต์และไลบรารีที่ใช้งาน

## 10. ความเสี่ยงและการตรวจความปลอดภัย

| ระดับ | ข้อค้นพบ/ความเสี่ยง | แนวทางและหลักฐานรับงานในอนาคต |
|---|---|---|
| สูง | OWNER ยังสมัคร Public ได้ และ Backend Role จาก JWT ค้างได้ 1 วัน | เปลี่ยน Public เป็น USER เท่านั้น; ตรวจบัญชี/สิทธิ์ปัจจุบัน; ทดสอบทุก Endpoint กับ 2 Roles |
| สูง | Confirm หลาย Booking/ปลดห้องผิด | Lock ห้องและตรวจ State/Occupancy ใน Transaction; Test สองคำขอพร้อมกัน/Retry/Cancel |
| สูง | Token ใน localStorage, Logout ไม่ Revoke | เลือก Session/Token Lifecycle หลังยืนยัน; หาก Cookie ต้องมี HttpOnly/SameSite และ CSRF ตามบริบท |
| สูง | ไม่มี Upload สำหรับหลักฐาน | ไม่กล่าวว่าปลอดภัยแล้ว; ต้องออกแบบ Ownership/Signature/Size/Private Download ก่อนสร้าง |
| สูง | Seed เดิมลบทุกตาราง | ไม่รัน; แยก Non-destructive Fixtures สำหรับอนาคตและ Backup/Restore Drill |
| กลาง | ข้อมูลสำคัญยัง Mock/ผลสำเร็จหลอก | UI แสดงสำเร็จหลัง DB commit จริง; Error state และ Reload ยืนยันข้อมูล |
| กลาง | Validation ไม่ครบ/ไม่มี Rate Limit | จำกัด Input/Role/Body/ID/วันที่/ราคา; ทดสอบ Invalid Types, oversize และ Abuse |
| กลาง | CORS ไม่ใช่ Authorization; Local ไม่ใช่ไม่มีความเสี่ยง | ทุก API ตรวจ Role/Ownership ฝั่ง Server; ห้ามพึ่งปุ่มซ่อน/Origin อย่างเดียว |
| กลาง | Dependencies มีช่องโหว่ตาม Audit รอบก่อน | แยกแผนอัปเดต Vite/Router และ regression; ไม่ audit fix --force โดยไม่ประเมิน |
| กลาง | ข้อมูล Email เจ้าของออก Public | Public DTO เลือก Fields เท่าที่จำเป็น ไม่ include ข้อมูลส่วนตัว |
| กลาง | ไม่มี Audit/Transaction ของงานการเงิน | Payment Verification + ยอด Invoice + Audit ต้องสอดคล้องแบบ Atomic/Idempotent |
| กลาง | ไม่มีแผนสำรอง DB+ไฟล์หลักฐาน | สำรองคู่กัน ตรวจ Hash/Counts และกู้คืนจริงก่อนส่งงาน |

SQL Injection: ใช้ Prisma Query ปกติ ไม่พบ raw SQL 拼字符串ใน Source ที่ตรวจ จึงมีฐานป้องกันที่ดี แต่ยังไม่ได้ทำ Penetration Test
หากเพิ่ม Lock ด้วย SQL ให้ใช้ Parameterized Query ไม่ต่อ User Input เข้า SQL
XSS: JSX Escape ค่าโดยปริยาย และไม่พบ dangerouslySetInnerHTML ใน Source ที่ตรวจ แต่ไม่ได้พิสูจน์ว่าไม่มี XSS ทุกช่องทาง
ตรวจ URL/ไฟล์/Response Content Type และอย่าเพิ่ม HTML rendering จากข้อความผู้ใช้โดยไม่ Sanitize
รหัสผ่าน Hash ด้วย bcrypt cost 10 ไม่คืน Hash ใน Login response แต่ Seed เดิมใช้รหัสผ่านสาธารณะและ Log User object ต้องไม่ใช้กับข้อมูลจริง

Lockfiles ตรงกับ Package ในส่วน Prisma แล้ว มี Lock แยกสามส่วน ไม่มีการติดตั้งเพิ่มในรอบนี้
`tailwind-merge` 3 กับ Tailwind 3 เป็น Compatibility ที่ควรตรวจจาก Release Docs ก่อนปรับคลาส ไม่ใช้ npm ls ผ่านเป็นหลักฐานว่า Styling ถูกต้องทุกกรณี
PowerShell ต้องใช้ npm.cmd ตาม Phase 0; Prisma5/Node24 Generate/Query เคยผ่านจริง แต่ไม่ใช่การรับรอง Support Matrix ระยะยาว

## 11. สิ่งที่ควรทำก่อนลงมือเขียนโค้ด

ยืนยัน D01–D12 โดยเฉพาะไฟล์ฉบับจริง สอง Roles จุดกันห้อง รูปแบบทั้งห้อง/เตียง และสูตรค่าใช้จ่าย
จากนั้นอนุมัติแผน Phase 1 พร้อม Model/Permission Matrix และ API Contract ก่อนเปลี่ยน Source
ไม่จำเป็นต้องสร้างฟีเจอร์นอก PDF เพื่อแก้ช่องว่าง: รายจ่าย ข่าวสาร และ Audit เป็นข้อกำหนดที่ต้องทำ ไม่ใช่งานเสริมท้ายโครงการ
