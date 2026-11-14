# Requirements Traceability Matrix — 25 ข้อ

## สถานะล่าสุด 14 พฤศจิกายน 2026 หลังพัฒนาระบบบริหารหอพัก

หลักฐาน: [DORM_OPERATIONS.md](../DORM_OPERATIONS.md), API 40/40 และ Chrome 33 กลุ่มบน MySQL dormify เดียว สถานะด้านล่างหมายถึง Flow พื้นฐานที่ระบุ ไม่ใช่การรับรองทุกกรณีหรือทุกข้อใน PDF ตารางวิเคราะห์รุ่นเดิมหลังหัวข้อประวัติไม่ใช่สถานะปัจจุบัน

| ข้อ | สถานะล่าสุด | โค้ด/API และข้อจำกัด |
|---|---|---|
| 1.1 | Implemented & Tested | Login/Logout และ DB session revocation ใน authController |
| 1.2 | Partial | เพิ่ม/แก้/ปิดเปิด Room จริง มี Audit; ยังไม่มีอัปโหลดรูปและจัดการสิ่งอำนวยความสะดวกครบ |
| 1.3 | Implemented & Tested | Tenants.tsx; GET/POST/PUT /api/operations/tenants; ต้องผูก USER |
| 1.4 | Implemented & Tested | ทะเบียนผู้เช่า/สัญญาแยกจากผู้ส่งคำขอ; TenantProfile และ Lease |
| 1.5 | Partial | อนุมัติ/ปฏิเสธ/ยกเลิก/หมดอายุ/เปลี่ยนเป็นสัญญา มี Room lock; ปุ่มยกเลิกใหม่มีโค้ดและ API ตรวจแล้ว แต่ Chrome ไม่ได้กดปุ่มนี้เฉพาะ |
| 1.6 | Partial | ร่าง/แก้ร่าง/เริ่มใช้/จบสัญญาผ่าน API/UI; ยังไม่มีแก้สัญญาที่ลงนาม/ต่ออายุ/ย้ายห้อง |
| 1.7 | Partial | มิเตอร์ต้น–ปลายจริงและอัตรามีผลตามวัน ผ่าน API/UI; ยังไม่มีแก้เลขย้อนหลัง/เปลี่ยนมิเตอร์ |
| 1.8 | Partial | บิลค่าเช่าล่วงหน้า+น้ำไฟย้อนหลัง Snapshot ป้องกันซ้ำ/สิ้นเดือน ผ่าน API/UI; ไม่ออกอัตโนมัติหรือบิลปิดสัญญากลางเดือน |
| 1.9 | Implemented & Tested | เงินสด/โอน Private proof และ Admin review; Unique InvoiceSettlement กันรับซ้ำ |
| 1.10 | Implemented & Tested | MaintenanceRequest; Admin IN_PROGRESS/RESOLVED พร้อมผลซ่อมและแจ้งผู้เช่า |
| 1.11 | Implemented & Tested | Expense และ Reports; ยอดรับเฉพาะยืนยันแล้ว แยกประกัน กรองช่วงวันที่ |
| 1.12 | Implemented & Tested | AdminOverview/Reports อ่านยอดห้อง สัญญา ซ่อม เงิน และยอดค้างจริง |
| 1.13 | Implemented & Tested | Audit สำคัญตั้งแต่ใช้งานโค้ดนี้ มีค้นหา/ช่วงวัน ไม่สร้างย้อนหลังและไม่เก็บ Secret |
| 2.1 | Implemented & Tested | Register สร้างเฉพาะ USER, Login/Logout และ /me จาก DB |
| 2.2 | Partial | Public ใช้ Property/Room จริง; รูปและสิ่งอำนวยความสะดวกจัดการเต็มรูปแบบยังขาด ไม่มี Mock แทน |
| 2.3 | Implemented & Tested | ห้อง/ราคา/สถานะอ่าน API จริง ซ่อนห้องปิด และตรวจสัญญา/การกันห้อง |
| 2.4 | Implemented & Tested | ส่งคำขอจริง รอ Admin อนุมัติ ไม่แสดงสำเร็จลอย ๆ |
| 2.5 | Implemented & Tested | MyBookings แยกสถานะคำขอ/หมดอายุ/ทำสัญญาแล้ว และหน้า Lease ของตน |
| 2.6 | Implemented & Tested | Profile จาก /me, /user/room จาก Lease ที่ตรวจเจ้าของ |
| 2.7 | Implemented & Tested | Leases.tsx กับ GET /api/operations/leases จำกัด tenant.userId |
| 2.8 | Implemented & Tested | Invoices.tsx และรายการค่าเช่า/หน่วย/อัตรา/ยอดบิลส่วนตัว |
| 2.9 | Implemented & Tested | Payments.tsx; แจ้งโอนเต็มยอด PNG/JPEG ส่วนตัวไม่เกิน 2 MB ตรวจเจ้าของทั้งอ่านและเขียน |
| 2.10 | Implemented & Tested | /user/history เฉพาะรายการยืนยันแล้วของตน ไม่มี Token/Blob ใน List |
| 2.11 | Implemented & Tested | แจ้งซ่อมสัญญา ACTIVE ของตนและติดตามผล ผ่านฟอร์มจริง |
| 2.12 | Implemented & Tested | Announcement ส่วนกลาง + Notification เฉพาะผู้รับ ทำเครื่องหมายอ่านแล้ว |

## ประวัติการวิเคราะห์ก่อนพัฒนาชุดนี้

> อัปเดต 14 พฤศจิกายน 2026: เพิ่มหลักฐานจัดการห้องใน [ROOM_MANAGEMENT.md](../ROOM_MANAGEMENT.md) และปรับแถว 1.2/2.3 ส่วนอื่นยังเป็น Snapshot จากการวิเคราะห์เดิม ไม่ใช้ข้อความ Mock/JSX/สิทธิ์เก่าเป็นสถานะโค้ดล่าสุด ดู PROJECT_STATUS.md ประกอบ

อ้างข้อความ Admin หน้า 2 และ User หน้า 2–3 ของ PDF ที่มีจริง ดูข้อจำกัดฉบับ/Unicode ใน [รายงาน](REPOSITORY_REVIEW.md)
รายละเอียดภาษาไทยเรียบเรียงจากข้อความในเอกสารและเทียบคำขอ ไม่ใช่การอ้างถอดวรรณยุกต์ได้ทุกตัว

สถานะอนุญาต: Implemented & Tested / Implemented but Untested / Partial / Mock Only / Missing / Blocked
Partial คือมีบางส่วนจริงแต่ยังไม่ครบ Requirement ทั้งข้อ; Model อย่างเดียวไม่ถือว่าใช้งานได้
Implemented but Untested หมายถึงมีโค้ด Flow แต่ยังไม่ทดสอบทั้งข้อแบบ End-to-End; ผล API Phase 0 ไม่ได้พิสูจน์ UI
งานนี้ไม่รัน Tests ที่สร้างข้อมูล จึงไม่มีข้อใดใช้ Implemented & Tested
P0 = ฐาน/สิทธิ์ที่ต้องมาก่อน, P1 = ข้อกำหนดต้องส่งครบ, ไม่ได้หมายความว่า P1 ตัดทิ้งได้
ความยาก ต่ำ/กลาง/สูง เทียบงานโครงงานนี้ ไม่ใช่ประมาณวันผูกมัด

FE ย่อจาก `client/src/`; BE จาก `server/src/`; Models ที่ใส่วงเล็บว่าเสนอ ยังไม่มีใน Schema
เส้นทาง API ในตารางคือของที่มีจริงเท่านั้น; `—` คือยังไม่มี API รองรับข้อนั้น

| Requirement ID | รายละเอียดข้อกำหนดจาก PDF | สถานะใน Repository | Frontend Files ที่เกี่ยวข้อง | Backend API ที่เกี่ยวข้อง | Database Models ที่เกี่ยวข้อง | สิ่งที่ต้องแก้ไขหรือเพิ่มเติม | ระดับความยาก | ลำดับความสำคัญ |
|---|---|---|---|---|---|---|---|---|
| 1.1 | Admin เข้าสู่ระบบและออกจากระบบ | Implemented but Untested | FE pages/Login.jsx; context/AuthContext.jsx; App.jsx; components/Layout.jsx | POST /api/auth/login; Logout ฝั่ง Client เท่านั้น | User | ทดสอบ Login/Logout ผ่าน Browser ด้วย Admin จริง; เลือก Revocation และสอง Role; Phase 1 | กลาง | P0 |
| 1.2 | เพิ่ม แก้ไข และจัดการข้อมูลห้องพัก | Partial | FE pages/AdminRooms.tsx; components/RoomForm.tsx/RoomTable.tsx; pages/AddProperty.tsx | POST /api/properties/rooms; PUT /api/properties/rooms/:roomId; PATCH /api/properties/rooms/:roomId/status | Room.isActive, Property, Booking | เพิ่ม/แก้/ปิดเปิดและเลขซ้ำ/สิทธิ์/Concurrency ผ่าน API 28 และ Chrome 22 กลุ่มแล้ว; รูป/สิ่งอำนวยความสะดวก/Audit ยังไม่ครบ ดู ROOM_MANAGEMENT.md | กลาง | P1 |
| 1.3 | เพิ่ม แก้ไข และจัดการข้อมูลผู้เช่า | Missing | —; Register.jsx เป็นสมัครเองไม่ใช่ Admin CRUD | —; /api/auth/register ไม่ใช่จัดการผู้เช่าโดย Admin | User; TenantProfile/Lease (เสนอ) | รายการ/เพิ่ม/แก้ผู้เช่า/ผูกบัญชี/สถานะ ไม่ใช้ Booking แทนทะเบียน; Phase 5 | กลาง | P1 |
| 1.4 | ตรวจสอบรายละเอียดผู้เช่าห้องพักผ่านเว็บไซต์ | Partial | FE pages/ManageBookings.jsx เห็นชื่อ/email ของผู้จอง | GET /api/bookings/owner | User, Booking, Room | แยกผู้จองกับผู้เช่าจริง แสดง Profile/Lease/Room และ Ownership; Phase 5 | กลาง | P1 |
| 1.5 | อนุมัติ ยืนยัน และยกเลิกการเช่าห้องพัก | Partial | FE pages/ManageBookings.jsx มีอนุมัติ/ปฏิเสธ | PUT /api/bookings/:bookingId/status; GET /api/bookings/owner | Booking, Room | ยกเลิกใน UI, FSM/Lock/Conflict และผูก Lease; Phase 4–5 | สูง | P0 |
| 1.6 | เพิ่ม แก้ไข และจัดการข้อมูลสัญญาเช่า | Missing | — | — | Lease (เสนอ) | เลขสัญญา ระยะเวลา Rent/Deposit snapshot ประวัติและจบสัญญา; Phase 5 | สูง | P1 |
| 1.7 | บันทึกและจัดการข้อมูลมิเตอร์น้ำและไฟฟ้า | Missing | — | — | MeterReading/RateSetting (เสนอ) | ก่อน/หลัง หน่วย รอบเดือน เปลี่ยนมิเตอร์/แก้ย้อนหลังตามกติกา; Phase 6 | สูง | P1 |
| 1.8 | จัดการใบแจ้งหนี้และค่าเช่ารายเดือน | Missing | — | — | Invoice/InvoiceItem/Lease (เสนอ) | ออกบิล/รอบ/กำหนดชำระ/รายการค่าใช้จ่าย/ป้องกันซ้ำ; Phase 6 | สูง | P1 |
| 1.9 | ตรวจสอบและยืนยันการชำระเงิน | Missing | — | — | Payment มี Model เท่านั้น; PaymentProof/Invoice (เสนอ) | Pending/Verify/Reject หลักฐานและยอดคงเหลือ Idempotency; Phase 7 | สูง | P1 |
| 1.10 | ตรวจสอบและจัดการรายการแจ้งซ่อม | Missing | — | — | Complaint มี Model เท่านั้น; MaintenanceRequest (เสนอ) | รายการ/รายละเอียด/เปลี่ยนสถานะ/บันทึกเวลา/ผู้ดำเนินการ; Phase 7 | กลาง | P1 |
| 1.11 | ตรวจสอบรายงานรายรับและรายจ่าย | Missing | — | — | Payment มี Model; Expense (เสนอ) | นิยามฐานเงินสด/รอบ รายจ่ายจริง กรองวัน/รวมยอดที่ยืนยัน; Phase 8 | สูง | P1 |
| 1.12 | ตรวจสอบข้อมูลสถิติและภาพรวมของหอพัก | Missing | —; Home.jsx เป็น Listings ไม่ใช่ Dashboard | — | Room/Booking; Lease/Invoice/Payment (เสนอ/ปรับ) | Dashboard จากข้อมูลจริง ห้องว่าง/พัก/ยอดค้าง/รับชำระ นิยามตัวชี้วัด; Phase 8 | กลาง | P1 |
| 1.13 | ตรวจสอบประวัติการใช้งานภายในระบบ | Missing | — | — | AuditLog (เสนอ) | เก็บตั้งแต่ Mutation แรก; Admin Search/Filter; ไม่เก็บ Token/Password; Phase 1–8 | สูง | P1 |
| 2.1 | สมัครสมาชิก เข้าสู่ระบบและออกจากระบบ | Partial | FE pages/Register.jsx; pages/Login.jsx; context/AuthContext.jsx; components/Layout.jsx | POST /api/auth/register; POST /api/auth/login | User | เปลี่ยน TENANT/OWNER เป็น USER ที่ Server กำหนด ทดสอบ UI/Expiry/Logout; Phase 1–2 | กลาง | P0 |
| 2.2 | ดูข้อมูลหอพักและสิ่งอำนวยความสะดวก | Mock Only | FE pages/Home.jsx; pages/PropertyDetails.jsx; data/mockData.js | GET /api/properties มีข้อมูลบางส่วน แต่ UI ไม่เรียกและไม่มี Amenities DB | Property; Dormitory/Amenity (เสนอ) | Single dorm DTO/สิ่งอำนวยความสะดวก/ข้อมูลจริง; Phase 2–3 | กลาง | P1 |
| 2.3 | ดูรายละเอียดห้องพัก ราคา และสถานะห้องว่าง | Partial | FE pages/Home.tsx; pages/PropertyDetails.tsx; components/PropertyCard.tsx | GET /api/properties; GET /api/properties/available-rooms | Room, Property | อ่าน API จริง ซ่อนห้องปิดและป้องกันขอเช่า/อนุมัติห้องปิดผ่าน Tests แล้ว; Allocation/Lease ตามนโยบายใหม่ยังไม่พัฒนา | กลาง | P1 |
| 2.4 | เลือกห้องพักและยืนยันการเช่าผ่านเว็บไซต์ | Partial | FE pages/PropertyDetails.jsx: handleBook Mock | POST /api/bookings | Booking, Room, User | เชื่อม Form/API และแสดง Success หลัง Commit; Validate/Conflict ตามจุดกันห้องที่ยืนยัน; Phase 4 | สูง | P0 |
| 2.5 | ตรวจสอบสถานะการเช่าห้องพัก | Partial | FE pages/MyBookings.jsx | GET /api/bookings/my-bookings | Booking; Lease (เสนอ) | แยกคำขอ/กันห้อง/เข้าพัก; Refresh และข้อมูล Lease ของตน; Phase 4–5 | กลาง | P1 |
| 2.6 | ดูข้อมูลส่วนตัวและข้อมูลห้องพักของตนเอง | Partial | FE components/Layout.jsx ชื่อจาก localStorage; pages/MyBookings.jsx ห้องจาก Booking | GET /api/bookings/my-bookings; ไม่มี /me profile | User, Booking, Room; Lease/TenantProfile (เสนอ) | GET /me และ Current lease/room ที่เชื่อ DB จริง; Phase 2/5 | กลาง | P1 |
| 2.7 | ตรวจสอบข้อมูลสัญญาเช่า | Missing | — | — | Lease (เสนอ) | หน้า My contract และ API เฉพาะเจ้าของสัญญา; Phase 5 | กลาง | P1 |
| 2.8 | ตรวจสอบใบแจ้งหนี้และค่าใช้จ่ายรายเดือน | Missing | — | — | Invoice/InvoiceItem (เสนอ) | My invoices/รายละเอียดหน่วยและค่าใช้จ่าย/ยอดค้าง; Phase 6 | กลาง | P1 |
| 2.9 | แจ้งชำระเงินและอัปโหลดหลักฐานการชำระเงิน | Missing | — | — | Payment เดิม; PaymentProof/Invoice (เสนอ) | Multipart Upload แบบ Private ตรวจชนิด/ขนาด/สิทธิ์ ยอด/วันโอน; Phase 7 | สูง | P1 |
| 2.10 | ตรวจสอบประวัติการชำระเงิน | Missing | — | — | Payment มี Model เท่านั้น; Invoice (เสนอ) | My history ยอด/สถานะ/ใบแจ้งหนี้/วันที่ และป้องกันเห็นของผู้อื่น; Phase 7 | กลาง | P1 |
| 2.11 | แจ้งซ่อมและติดตามสถานะการซ่อม | Missing | — | — | Complaint มี Model เท่านั้น; MaintenanceRequest (เสนอ) | สร้างเรื่องของห้องตน ติดตาม Open/In progress/Resolved ตามกติกา; Phase 7 | กลาง | P1 |
| 2.12 | ดูการแจ้งเตือนข่าวสารและรายการสำคัญ | Missing | — | — | Announcement/Notification (เสนอ) | หน้า/รายการข่าวสาร เหตุการณ์สำคัญ เฉพาะผู้รับและ Read state; Phase 8 | กลาง | P1 |

## การยืนยันความครบถ้วน

ครบ Admin 13 + User 12 = 25 แถว ไม่มี Staff ไม่มีการตัด 1.11–1.13 หรือ 2.12 ออก
1.3/1.9/1.10/2.10/2.11 ใช้ Missing เพราะ Model/Registration อย่างเดียวไม่ใช่ระบบที่ Requirement ต้องการ
2.4 ใช้ Partial แทน Mock Only เพราะมี API จริง แต่ UI ยังจำลอง จึงไม่ถือว่าเช่าผ่านเว็บไซต์ได้แล้ว
การยืนยันครบในอนาคตต้องมี Test Evidence ของ Requirement ทั้งข้อ รวม UI/API/DB/สิทธิ์ ไม่ใช่แค่ HTTP 200
