# DORMIFY — ผลปรับธีมและ UX/UI ภาษาไทย

วันที่: 13 พฤศจิกายน 2569 (Asia/Bangkok)

## ขอบเขตที่ทำ

ปรับ Frontend เดิมเป็น White & Sky Blue ตามโลโก้ มี Public Website สำหรับหอพักเดียว
และพื้นที่ Admin/User แยก Layout โดยคง React/Vite/JavaScript/Tailwind เดิม
ไม่เปลี่ยน API Contract, Database Schema, ฐาน SQLite, Environment ของ Server หรือ Authentication
ไม่มีการติดตั้ง/อัปเดต npm dependencies ในรอบนี้

## 1. ผลตรวจ UI เดิม

- สีมืด/ม่วงกำหนดซ้ำใน Pages/Components ราว 178 จุด ไม่มี Theme tokens กลาง
- Home/PropertyDetails อ่าน Mock หลายหอพัก และปุ่มจองเดิมเพียง setTimeout/console.log
- ข้อความภาษาอังกฤษ สกุลรูปี และวันที่ en-IN ไม่เหมาะกับผู้ใช้ไทย
- เมนูส่วนตัวถูกซ่อนในมือถือ ไม่มี Sidebar สำหรับขอบเขตงานทั้งหมด
- บางหน้า API ล้มเหลวแล้วแสดงเหมือนรายการว่าง ไม่อธิบายข้อผิดพลาด
- รีวิวเดิมแสดงสำเร็จชั่วคราวโดยไม่บันทึกจริง

แก้ UI ตามลำดับ Tokens → Components → Layout → Public → Admin → User → ภาษา/Responsive → Build/Browser Tests
Build ระหว่างการปรับพื้นฐานและหลังประกอบ Pages ผ่าน โดยแก้ข้อผิดพลาดในสคริปต์ Browser Test ก่อนรันซ้ำจนผ่าน

## 2. Design system และ Assets

กำหนดตัวแปรใน `client/src/index.css` และสีใน Tailwind:

| Token | สี |
|---|---|
| Primary | #0769F4 |
| Secondary | #12BDF4 |
| Background | #FFFFFF |
| Soft | #F3FAFF |
| Navy | #071B4F |
| Border | #DCECF7 |
| Text | #122747 |
| Muted | #64748B |
| Success / Warning / Error | #16A34A / #F59E0B / #DC2626 |

ใช้ข้อความสถานะโทนเข้มบนพื้นอ่อนเพื่อให้อ่านได้ชัด ไม่มี Dark Theme
มุมโค้ง 12–16px, Shadows บาง, ปุ่มหลักสูงอย่างน้อย 44px และ Form controls 48px
มี Focus-visible, Label/Input ID, aria-label ของปุ่มไอคอน, Status/Error announcements, Skip link และ Reduced Motion

โลโก้ที่ผู้ใช้เพิ่มพบจริงที่ `client/src/assets/fonts/Dormify Dolphin Splash Logo.png`
คัดลอกเป็น `client/src/assets/dormify-logo.png` โดยตรวจ Bytes ตรงกัน ไม่ Crop/วาด/เปลี่ยนภาพ
ต้นฉบับขนาด 1536×1024 มี Alpha ที่มุมเป็น 0; แสดงแบบ object-contain รักษาสัดส่วนและความโปร่งใส

ใช้ Noto Sans Thai Variable Font แบบ Local ใน `client/src/assets/fonts/`
พร้อม SIL Open Font License (`OFL.txt`) จาก [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/notosansthai)
เลิกโหลด Inter/Google Fonts ผ่าน CDN ใน HTML จึงไม่ต้องออนไลน์เพื่อโหลดฟอนต์

## 3. ภาษาไทยและการแสดงข้อมูล

- Navigation, Heading, Button, Label, Placeholder, Empty/Loading/Error state, Status, Confirmation dialog เป็นภาษาไทย
- Backend error เดิมยังคง Contract เดิม แปลข้อความใน UI ผ่าน `utils/errors.js` โดยไม่แก้ Backend
- ชื่อ Role แสดงเป็นผู้ดูแลระบบ/ผู้ใช้งาน ไม่เปิด Owner/Staff
- เงินใช้ THB และวันที่ th-TH เขตเวลา Asia/Bangkok แสดงปี พ.ศ.
- ข้อมูลที่ผู้ใช้/Backend กรอกเอง เช่น ชื่อ อีเมล กฎหอพัก ไม่ถูกแก้หรือแปลทับอัตโนมัติ
- ชื่อแบรนด์ DORMIFY, Email, URL และรหัสรายการยังแสดงตามข้อมูลจริง ไม่ถือเป็นข้อความระบบภาษาอังกฤษที่ต้องแปล

## 4. Public Website — หอพักเดียว

มี Navbar/โลโก้, Hero, รายการห้อง/ค้นหา/กรอง, รายละเอียดห้อง, สิ่งอำนวยความสะดวกจากข้อมูลที่มี,
กฎหอพัก, ข้อมูลติดต่อ และ Footer
อ่าน `GET /api/properties` ผ่าน DormitoryContext แทน Mock:

- 0 หอพัก: แสดง Empty state จริง ไม่สร้างห้อง/ราคา/เบอร์โทรจำลอง
- 1 หอพัก: แสดงหอพักนั้นและห้องจาก Backend
- หลายหอพัก: ไม่สุ่มเลือก/แสดง Marketplace ให้กำหนด `VITE_DORMITORY_ID` ใน `client/.env` เพื่อเลือกหอที่ใช้

```dotenv
# ใช้เฉพาะกรณีมีหลาย Property ในข้อมูลเดิม
VITE_DORMITORY_ID="เลข ID หอพักที่ต้องการ"
```

หลังเปลี่ยน Environment ให้ Restart Vite
การเลือกหอเดียวเป็นชั้นการนำเสนอ Frontend ไม่ใช่การแก้ Schema หรือจำกัดจำนวน Property ใน Backend
API เดิมยังคงโครงสร้างเดิมตามข้อจำกัดของงานนี้ ไม่มีการลบหอพักอื่น

Room Cards แสดงราคาและสถานะจาก DB; หากไม่มีรูป แสดงว่าไม่มีรูป ไม่ใช้รูปห้องสมมติแทน
สิ่งอำนวยความสะดวกแสดงเฉพาะที่อนุมานจาก Fields จริง เช่น AC/NON-AC/hasMess ไม่เพิ่มคำอ้าง Wi-Fi/กล้อง/ที่จอดรถที่ไม่มีข้อมูล
ช่องทางติดต่อใช้ข้อมูลที่ Backend มี ไม่สร้างเบอร์โทร/ที่อยู่ใหม่

หน้าเดิม `properties/:id` ยังรองรับหอที่เลือกและแสดงห้องแรกเพื่อ Compatibility
เส้นทางห้องใหม่ `/rooms/:roomId` แสดงห้องเดียวและส่งคำขอผ่าน POST `/api/bookings` เดิม
แสดงสำเร็จหลัง API ตอบจริง ไม่ใช้ Mock success; ไม่เพิ่มกติกา Hold 72 ชั่วโมงหรือสัญญาในงาน UI

## 5. Admin และ User

Admin มี Sidebar/Topbar พร้อมเมนูตามขอบเขต PDF ครบ
หน้าที่มีข้อมูลจริง: ภาพรวมจาก Rooms/Bookings, ดู/เพิ่มห้อง, ตรวจและอนุมัติ/ปฏิเสธคำขอ, บันทึกข้อมูลหอพักครั้งแรก
การอนุมัติมี Dialog ยืนยัน และ Refresh ข้อมูลห้องที่เกี่ยวข้องหลังบันทึก
ข้อมูลหอพักที่มีแล้วแสดงอ่านอย่างเดียว เพราะ API แก้ไขยังไม่มี ไม่สร้างปุ่มบันทึกปลอม
คงประเภท HOSTEL/PG/FLAT และ hasMess ในแบบฟอร์มเดิม โดยแปล Label ไทย

User มีเมนูตามขอบเขต PDF; Profile อ่านจาก Auth Context ซึ่งยืนยันกับ `/me` เดิม
รายการเช่าและห้องในคำขออ่าน API ของตนเอง ไม่ใช้ข้อมูล Admin หรือ Role จาก localStorage
ยังไม่ได้อ้างว่ารายการ Booking คือสัญญา/การเข้าพักจริง

สัญญา มิเตอร์ ใบแจ้งหนี้ การเงิน แจ้งซ่อม รายงาน Audit และ Notifications ที่ยังไม่มีระบบจริง
แสดง “ยังไม่พัฒนา” ทั้ง Sidebar และหน้าปลายทาง ไม่มีตัวเลขการเงิน/ตาราง/ปุ่มบันทึกหลอก
ไม่มีการเพิ่ม Staff Role หรือเปิดสิทธิ์ User เข้าหน้า Admin

รักษาเส้นทางเดิม `/add-property`, `/manage-bookings`, `/my-bookings` โดย Redirect ภายใต้ Role guard เดิม
Review/Gallery/อาหารยังมี Components ภาษาไทย; การส่งรีวิวที่ไม่มี API ไม่แสดงสำเร็จปลอมและระบุว่ายังไม่พัฒนา
ข้อมูล Mock รุ่นก่อนไม่ได้ถูก Import ไปแสดงในหน้า Public ใหม่นี้ และถูกนำออกภายหลังในรอบเก็บกวาดโปรเจกต์

## 6. Responsive และ Accessibility ที่ตรวจ

- Desktop 1440×1000: Navbar เต็ม Sidebar คงที่ และ Cards/Grid
- Tablet 768×1024: Sidebar พับและตาราง Scroll ใน Container
- Mobile 390×844: Navigation เปิด/ปิด, Sidebar พับ, Form/Card ไม่ล้นแนวนอน
- Escape ปิด Sidebar, Focus-visible มี Outline และ Reduced Motion ปิด Animation
- ใช้ Semantic heading/label/table caption/th scope และ Native dialog สำหรับยืนยัน

นี่เป็นการทดสอบขนาดตัวแทน ไม่ใช่การรับรองอุปกรณ์/Browser ทุกตัวหรือ Accessibility Audit เต็มมาตรฐาน

## 7. ผลทดสอบจริง

### Build

`npm.cmd --prefix client run build` ผ่านล่าสุด: Vite 5.4.21, 1,805 modules
CSS ประมาณ 29.89KB; JS ประมาณ 340.46KB; Font ประมาณ 218.65KB; Logo เดิมประมาณ 1.58MB
ไม่ได้ลด/ดัดแปลงไฟล์โลโก้ตามข้อกำหนดรักษาภาพต้นฉบับ

### Browser UI — Chrome headless จริง

คำสั่งจาก Root:

```powershell
node client/scripts/ui-smoke.mjs
```

ใช้ Chrome ที่ติดตั้งในเครื่อง, Node WebSocket/CDP และ Backend เดิม ไม่ติดตั้ง Playwright/npm packages เพิ่ม
ทดสอบผ่านครบ **15 กลุ่ม**:

1. Public อ่านห้องจาก Backend จริง ไม่แสดงรายชื่อหลายหอจาก Mock
2. Font Local/ภาษา th/พื้นสีขาว/โลโก้โหลดได้ โดย Block Google Font/Picsum URLs ระหว่างทดสอบ
3. ค้นหาเลขห้องและกรองห้องว่าง
4. เมนู Public Mobile และไม่ล้นแนวนอน
5. สมัครสมาชิกผ่าน Form แล้วเกิด USER จริง
6. Login รหัสผิดแสดง Error ไทย
7. User Sidebar และหน้าใบแจ้งหนี้ที่ยังไม่พัฒนาระบุสถานะชัด
8. เปลี่ยน Role ใน localStorage ไม่ทำให้ User เข้าหน้า Admin
9. ส่งคำขอเช่าผ่าน Form เกิด Booking PENDING จริง และแสดงวันที่ พ.ศ.
10. Logout ล้างหน้า/Token และ Backend ปฏิเสธ Token เก่า
11. Admin Dashboard/เมนูแสดงข้อมูลจาก API
12. เพิ่มห้องผ่านแบบฟอร์ม Admin แล้วเกิด Room จริง
13. ยืนยันอนุมัติใน Dialog แล้ว Booking เป็น CONFIRMED จริง
14. Tablet/Mobile Admin ไม่ล้นและ Escape ปิดเมนู
15. Reduced Motion ไม่มี Animation และ Keyboard Focus มี Outline

ใช้ SQLite ชั่วคราวแยกจาก `dev.db` พร้อม Fixtures เฉพาะทดสอบ ไม่มี Mock API responses
ข้อมูลในภาพหน้าจอเป็นข้อมูลจากฐานทดสอบ **ไม่ใช่ข้อมูลจริงของหอพัก** และไม่ถูกเพิ่มลงฐาน Local
แก้ Race ในสคริปต์ทดสอบให้รอ Document/ข้อมูลโหลดเสร็จก่อนกดปุ่ม ไม่แก้ Business Logic เพื่อให้ Test ผ่าน
Artifacts อยู่ใน `client/.ui-artifacts/` ซึ่งถูก Ignore:

- [หน้า Public Desktop](../client/.ui-artifacts/public-desktop.png)
- [หน้า Public Mobile](../client/.ui-artifacts/public-mobile.png)
- [หน้า Admin Desktop](../client/.ui-artifacts/admin-desktop.png)
- [หน้า Admin Tablet](../client/.ui-artifacts/admin-tablet.png)
- [เมนู Admin Mobile](../client/.ui-artifacts/admin-mobile-menu.png)
- [หน้า User Mobile](../client/.ui-artifacts/user-mobile.png)
- [หน้า Login Mobile](../client/.ui-artifacts/login-mobile.png)
- ผลรายกลุ่ม: `client/.ui-artifacts/results.json`

Chrome/Vite/Backend ที่เปิดสำหรับทดสอบหยุดเมื่อจบสคริปต์
เครื่องที่ไม่มี Chrome ให้ตั้ง `CHROME_PATH` ไปยัง Browser ที่รองรับ CDP และติดตั้งไว้แล้ว

### Regression Backend

`npm.cmd --prefix server test` ผ่าน 15/15 Tests รวม Auth/Role/Session/สิทธิ์และ API เดิม
ตรวจ Hash รวมไฟล์ Backend/Schema/SQLite/Environment ที่ไม่ใช่ node_modules จำนวน 29 ไฟล์ ก่อน–หลังตรงกัน
AuthContext ของ Frontend ยังมี Hash เดิม การปรับภาษาเกิดที่ Presentation/Errors layer
Logo ที่คัดลอกตรงกับต้นฉบับทุก Byte และ Git whitespace check ผ่าน (รองรับ CRLF ของไฟล์เดิม)

## 8. ไฟล์ที่เปลี่ยนเฉพาะงานธีมรอบนี้

| กลุ่ม | ไฟล์ |
|---|---|
| Theme/Entry | `client/src/index.css`, `client/tailwind.config.js`, `client/index.html`, `client/src/main.jsx`, `client/src/App.jsx` |
| Components เดิม | `Button.jsx`, `Input.jsx`, `Layout.jsx`, `FilterSidebar.jsx`, `PropertyCard.jsx`, `PropertyGallery.jsx`, `MessMenuDisplay.jsx`, `ReviewSection.jsx` |
| Components ใหม่ | `Brand.jsx`, `AuthFrame.jsx`, `Feedback.jsx`, `PropertyTypeSelect.jsx` |
| Pages เดิม | `Home.jsx`, `PropertyDetails.jsx`, `Login.jsx`, `Register.jsx`, `AddProperty.jsx`, `MyBookings.jsx`, `ManageBookings.jsx` |
| Pages ใหม่ | `AdminOverview.jsx`, `AdminRooms.jsx`, `Profile.jsx`, `Unavailable.jsx` |
| Data presentation | `client/src/context/DormitoryContext.jsx`, `client/src/utils/format.js`, `client/src/utils/errors.js`, `client/.env.example` |
| Assets | `client/src/assets/dormify-logo.png`, `client/src/assets/fonts/NotoSansThai-Variable.ttf`, `client/src/assets/fonts/OFL.txt` |
| QA/Docs | `client/scripts/ui-smoke.mjs`, `.gitignore` เฉพาะ UI artifacts, `docs/UI_REDESIGN.md`, ลิงก์ใน README |

Paths ของ Components/Pages ในตารางอยู่ภายใต้ `client/src/components/` / `client/src/pages/`
Git status ยังมีงาน Phase 0/Auth ที่ไม่ได้ Commit อยู่ก่อนแล้ว ไม่ได้ Revert/Commit หรือนำมานับเป็นการแก้ธีมทั้งหมด

## 9. ปัญหาที่ยังเหลือ

- ฐาน Local เดิมยังว่าง จึงแสดง Empty state จน Admin บันทึกข้อมูลหอ/ห้องจริง ไม่แสดง Fixtures ของการทดสอบให้ผู้ใช้จริง
- API เดิมไม่มีรูปห้อง/ที่อยู่พิกัด/เบอร์ติดต่อ/สิ่งอำนวยความสะดวกครบ จึงไม่สามารถเติมข้อมูลเหล่านี้จริงโดยไม่ขยาย Backend
- ไม่มี API แก้หอ/แก้ห้อง/สัญญา/บิล/เงิน/ซ่อม/Notifications ตามที่เคยวิเคราะห์ เมนูเหล่านี้ยังไม่ถือว่าเสร็จเพียงเพราะมี Sidebar
- กติกาจองซ้ำ/กันห้องหมดอายุยังเป็น Logic เดิม งาน UI ไม่ได้แก้ให้รองรับ Business Rules ทั้งหมด
- การเลือกหอเดียวด้วย VITE_DORMITORY_ID ไม่ใช่ Backend isolation และยังไม่ใช่การย้าย Schema เป้าหมาย
- การตั้งค่าประเภท/อัตรา/ข้อมูลจริงยังเป็นหน้าที่ Admin ไม่สร้างเบอร์โทร รีวิว ห้อง หรือราคาใหม่อัตโนมัติ

## เปิดดูงานบน Local

```powershell
npm.cmd start
```

เปิด http://127.0.0.1:5173; สร้าง Admin ตาม [คู่มือ Authentication](PHASE1_AUTH.md) หากยังไม่มีบัญชี
Backend ใช้ SQLite และ API เดิม ไม่มีการ Publish สู่ Public Internet
