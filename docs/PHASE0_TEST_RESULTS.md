# Phase 0 — ผลการทดสอบจริง

วันที่: 12 พฤศจิกายน 2026 (Asia/Bangkok)

## ผลที่ยืนยันแล้ว

| รายการ | ผล |
|---|---|
| Node/npm/Git | พบครบ: 24.18.0 / 11.16.0 / 2.54.0.windows.1 |
| ติดตั้ง Root/Frontend/Backend | ผ่าน หลังขอสิทธิ์ Network/Cache ที่ sandbox จำกัด |
| npm ls --depth=0 ทั้งสามส่วน | ผ่าน ไม่พบ Missing/Invalid dependency ที่ npm รายงาน |
| Prisma Generate | ผ่าน 5.22.0 |
| Prisma Validate | Schema เดิมผ่าน |
| SQLite Setup | ผ่าน หลังสร้างไฟล์เปล่าแบบไม่เขียนทับก่อน db push |
| Setup ซ้ำกับฐานที่มีอยู่ | ผ่าน: database already in sync |
| ฐาน Local | User/Property/Room/Booking/Payment/Complaint มี 0 แถวทั้งหมด |
| Root npm.cmd start | เปิด Backend และ Vite พร้อมกันได้ |
| Backend GET / | HTTP 200 |
| Frontend GET / | HTTP 200 และมี React root |
| Vite /src/main.jsx | HTTP 200 และแปลง JSX ได้ |
| Frontend API Environment | Vite ส่งค่า http://127.0.0.1:5000 ตาม .env |
| GET /api/properties | HTTP 200, [] จากฐาน Local ที่ว่าง |
| GET /api/properties/available-rooms | HTTP 200, [] จากฐาน Local ที่ว่าง |
| CORS ฝั่ง Local ที่รันจริง | ตอบ Allow-Origin ตรง http://127.0.0.1:5173 |
| Frontend production build หลังอัปเดต Dependencies | ผ่าน 1792 modules |
| Automated API tests หลังแก้ไข | ผ่าน 9/9 ไม่มี Fail |
| Git ignore | .env ทั้งสองส่วน, dev.db, WAL/SHM และ dist ถูก Ignore |
| Tracked secrets/database | ไม่พบไฟล์ .env จริงหรือ SQLite ในรายการ Git tracked |
| Git whitespace check | ผ่าน โดยให้ Git ยอมรับ CRLF ของไฟล์เดิมด้วย core.whitespace=cr-at-eol |

## ชุดทดสอบ API

`npm.cmd --prefix server test` ทดสอบบน SQLite ชั่วคราวแยกจากฐาน Local โดยครอบคลุม:

1. Server ปฏิเสธ Secret ว่าง สั้น และ Placeholder เดิม
2. เชื่อม SQLite และอ่าน API เริ่มต้นที่ว่าง
3. สมัคร Admin ไม่ได้, ไม่ส่ง Role เป็น Tenant, รหัสผ่าน Hash จริง, Email ซ้ำถูกปฏิเสธ
4. Login ถูก/ผิด, ไม่ส่ง Token, Token ปลอม และ Tenant อ่าน API เจ้าของไม่ได้
5. Owner สร้างที่พักและห้องได้, Tenant สร้างที่พักไม่ได้, Owner คนอื่นเพิ่มห้องให้ไม่ได้
6. Tenant จองได้และอ่านรายการตนเองได้, Owner อ่านของตนเองได้, Owner อื่นอ่านไม่พบ
7. Tenant/Owner อื่นแก้สถานะไม่ได้, สถานะผิดถูกปฏิเสธ, อนุมัติแล้วห้องไม่ว่างและจองเพิ่มไม่ได้
8. Admin Fixture อ่านการจองของ Owner ได้ และปฏิเสธรายการแล้วห้องกลับมาว่าง
9. Origin ภายนอกไม่ได้รับ CORS Allow-Origin ที่ตรงกับตนเอง

Node test runner นับเป็น Parent 1 + Subtests 8 = 9 Tests; รายการข้างบนแยกพฤติกรรมที่ตรวจ
ไม่ได้หมายความว่าได้ทดสอบทุกกรณีธุรกิจหรือทุก Endpoint แล้ว

## Dependencies และข้อจำกัดความปลอดภัย

รัน `npm audit fix` ภายในช่วงเวอร์ชันเดิม ไม่ใช้ `--force` ไม่เปลี่ยน Major ของ Stack

| ส่วน | ผล Audit ล่าสุดที่รัน |
|---|---|
| Root | 0 vulnerabilities |
| Frontend | 4: moderate 3, high 1; ลดจากก่อนแก้ 22: low 1, moderate 8, high 13 |
| Backend รวม Dev dependencies | 2 moderate จาก minimatch/nodemon |

Frontend เหลือ Vite/esbuild และ react-router/react-router-dom; npm เสนอให้เปลี่ยน Major
เป็น Vite 8 และ React Router 7 จึงยังไม่ทำใน Phase 0 ต้องวางแผนอัปเกรดและทดสอบแยกก่อนใช้งานจริง
อ้างอิงรายงาน npm: [esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99),
[React Router redirect](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6),
[React Router SSR](https://github.com/advisories/GHSA-337j-9hxr-rhxg)

Backend เหลือ minimatch ใน nodemon ที่ใช้เฉพาะ Development; เรียก audit fix ซ้ำแล้วไม่แก้ภายใต้
ช่วงที่ Nodemon ใช้อยู่ จึงบันทึกไว้ ไม่บังคับ Override ข้าม Major ของ Transitive dependency
อ้างอิง: [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)

Loopback และ CORS ลดการเปิดเผยระบบ แต่ไม่ใช่หลักฐานว่าไม่มีช่องโหว่หรือพร้อม Production
JWT ยังเก็บใน localStorage, Logout ยังไม่ Revoke Token และยังไม่มี Rate Limit
คำสั่ง Root ที่ใช้ concurrently 8 มีคำเตือน Node DEP0060 แต่ยังเปิดสอง Server ได้
ESLint 8 และ Dependency บางตัวมีคำเตือน Deprecated

## สิ่งที่ยังไม่ยืนยันหรือยังใช้งานไม่ครบ

- ไม่ได้เปิด Browser เพื่อกด UI Register/Login หรือทดสอบ Rendering, Responsive และ Interaction
  ผลที่ยืนยันคือ HTTP/JSX/Build และ API Integration ไม่ใช่ Browser E2E
- Home และ PropertyDetails ยังอ่าน mockData ไม่ได้อ่านข้อมูลที่เพิ่มผ่าน API
- ปุ่มจองบน PropertyDetails ยังจำลอง API; API จองผ่านชุดทดสอบได้ แต่การกดจองผ่าน UI ยังไม่บันทึกจริง
- รีวิว/รายการโปรดยังเป็นสถานะในหน้าเว็บ
- PENDING ยังไม่กันห้อง ไม่มีหมดอายุ และยังไม่ป้องกันหลายรายการถูกยืนยันให้ห้องเดียวกัน
- ยังไม่ได้แก้การตรวจวันที่/เลขห้องซ้ำ/ราคาติดลบให้ครอบคลุมทั้งหมด
- ไม่ได้ทดสอบ Payment/Complaint เพราะยังไม่มี API; ไม่เพิ่มฟีเจอร์ใหม่ใน Phase 0
- ไม่ได้รัน lint: ระบบรุ่นก่อนมีคำสั่งแต่ไม่มี ESLint Config
- ยังไม่ทดสอบ MySQL หรือ TypeScript ตามขอบเขตระยะนี้
- Schema เดิมไม่มี Migration history; ระยะนี้ใช้ db push กับฐานพัฒนาตามระบบรุ่นก่อน

## ไฟล์ที่เปลี่ยนในการเตรียม Phase 0

- `.gitignore`: ป้องกันไฟล์ส่วนตัว/SQLite และยกเว้น .env.example
- `package.json`, `package-lock.json`: เอา Prisma 7 ที่ Root ไม่ได้ใช้งานออก และแพตช์ Dependencies
- `client/package-lock.json`: แพตช์ Dependencies ภายในช่วงเดิม
- `client/.env.example`: API ที่ 127.0.0.1
- `client/vite.config.js`: React plugin, loopback และ strictPort
- `server/package.json`, `server/package-lock.json`: Prisma 5.22.0, คำสั่ง Setup/Test และแพตช์ Dependencies
- `server/.env.example`: ไม่มี Secret เริ่มต้นและกำหนด Local Origin
- `server/src/config.js`: โหลด Environment และตรวจ Secret ก่อนเริ่ม
- `server/src/index.js`: loopback และจำกัด CORS
- `server/src/middleware/authMiddleware.js`: เลิก fallback Secret และจำกัด JWT algorithm เป็น HS256
- `server/src/controllers/authController.js`, `server/src/routes/authRoutes.js`: ปิด Public Admin registration
- `server/src/controllers/bookingController.js`: ตรวจ Role/Status และให้ Admin อ่านรายการทั้งหมด
- `server/scripts/setup-db.js`: เตรียม SQLite แบบไม่ Reset/Seed
- `server/test/phase0.test.js`: ทดสอบ HTTP API/DB/Security โดยใช้ฐานชั่วคราว
- `README.md`: ลิงก์คู่มือ Phase 0 และคำเตือน Seed
- `docs/PHASE0_SETUP.md`, `docs/PHASE0_TEST_RESULTS.md`: คู่มือและผลจริง

ไฟล์ Local ที่สร้างและถูก Ignore: `server/.env`, `client/.env`, `server/prisma/dev.db`,
node_modules ของทั้งสามส่วน และ `client/dist` ไม่ควร Commit ไฟล์เหล่านี้
ไม่ได้แก้ Schema, Seed เดิม, หน้าจอเดิม, render.yaml หรือเอกสารอื่นที่ผู้ใช้เพิ่มระหว่างงาน
