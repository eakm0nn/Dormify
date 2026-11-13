<div align="center">
  <img src="client/src/assets/dormify-logo.png" alt="โลโก้ DORMIFY" width="220" />
  <h1>DORMIFY</h1>
  <p><strong>ระบบการเช่าและบริหารจัดการหอพักผ่านเว็บไซต์</strong></p>
  <p>โครงงานระดับประกาศนียบัตรวิชาชีพ ชั้นปีที่ 3</p>
</div>

เริ่มทำงานต่อหรือย้ายเครื่อง: [สถานะล่าสุด](docs/PROJECT_STATUS.md) · [บันทึกการทำงาน](docs/WORK_LOG.md) · [คู่มือเครื่องใหม่](docs/SETUP_NEW_MACHINE.md)

ส่งงานระหว่างเครื่องผ่าน [GitHub](docs/GITHUB_WORKFLOW.md)

หากใช้สำเนาที่มีประวัติก่อนการเริ่ม main ใหม่วันที่ 13 พฤศจิกายน 2026 ให้ Clone ใหม่ตามคู่มือ GitHub

## เกี่ยวกับโครงงาน

DORMIFY เป็นเว็บไซต์สำหรับหอพักแห่งเดียว ช่วยให้ผู้สนใจดูห้องพัก ราคา และสถานะห้องว่าง
ส่งคำขอเช่าผ่านเว็บไซต์ และติดตามผลการพิจารณาจากผู้ดูแล
ระบบประกอบด้วยส่วนสมาชิก การจัดการห้องพัก และการส่งคำขอเช่าตามขอบเขตโครงงาน

เว็บไซต์ใช้ภาษาไทยและธีมขาว–ฟ้าตามโลโก้ DORMIFY รองรับการใช้งานบนคอมพิวเตอร์ แท็บเล็ต และมือถือ
ปัจจุบันเน้นติดตั้งและใช้งานบน Local Server

## ฟังก์ชันปัจจุบัน

### ผู้ใช้งาน (User)

- สมัครสมาชิก เข้าสู่ระบบ และออกจากระบบ
- ดูข้อมูลหอพัก รายการห้อง ราคา และสถานะห้อง
- ค้นหาและกรองห้องตามประเภท งบประมาณ และสถานะ
- ส่งคำขอเช่าห้องพักและติดตามสถานะของตนเอง
- ดูข้อมูลบัญชีและรายละเอียดห้องในรายการเช่าของตนเอง

### ผู้ดูแลระบบ (Admin)

- เข้าสู่ระบบด้วยบัญชีผู้ดูแลที่สร้างผ่านเครื่อง Local
- บันทึกข้อมูลหอพักครั้งแรก ดูรายการห้อง และเพิ่มห้องพัก
- ตรวจสอบ อนุมัติ หรือไม่อนุมัติคำขอเช่า
- ดูภาพรวมจำนวนห้อง ห้องว่าง และคำขอรอดำเนินการ

ระบบรองรับเฉพาะบทบาท `ADMIN` และ `USER` การสมัครผ่านเว็บไซต์สร้างได้เฉพาะ User
การออกจากระบบยกเลิก Session ฝั่ง Server และ Backend ตรวจสิทธิ์ก่อนเข้าถึงข้อมูลที่ต้องยืนยันตัวตน

## ส่วนที่อยู่ระหว่างพัฒนา

สัญญาเช่า ผู้เช่า มิเตอร์น้ำ–ไฟ ใบแจ้งหนี้ การชำระเงินและหลักฐานการโอน เงินประกัน
แจ้งซ่อม รายงาน ประวัติการใช้งาน และการแจ้งเตือน ยังพัฒนาไม่ครบตามขอบเขตโครงงาน
เมนูที่ยังไม่เปิดใช้งานระบุว่า **ยังไม่พัฒนา** และไม่แสดงผลลัพธ์จำลองว่าใช้งานได้แล้ว

กติกาการกันห้องหมดอายุและการป้องกันคำขอซ้ำยังต้องพัฒนาต่อ
การอนุมัติคำขอในระบบปัจจุบันยังไม่ใช่การจัดทำสัญญาหรือยืนยันการเข้าพักครบกระบวนการ

## เทคโนโลยี

| ส่วน | เทคโนโลยีที่ใช้อยู่ |
|---|---|
| Frontend | React 18, Vite, TypeScript 5.9 (strict) |
| รูปแบบหน้าจอ | Tailwind CSS, Noto Sans Thai แบบ Local, Lucide React |
| Routing / API Client | React Router, Axios |
| Backend | Node.js, Express.js, JavaScript |
| ฐานข้อมูล | SQLite |
| ORM | Prisma 5.22.0 |
| Authentication | JWT, bcrypt และ Session ในฐานข้อมูล |

Frontend ย้ายเป็น TypeScript แล้ว ส่วน Backend ยังใช้ JavaScript และฐานข้อมูลยังเป็น SQLite
การย้าย MySQL พักไว้ตามแผนให้ทำฝั่งเว็บก่อน ดู [ผลการย้าย Frontend](docs/FRONTEND_TYPESCRIPT.md)

## ติดตั้งและรันบน Local

### 1. เตรียมเครื่องมือและติดตั้ง Dependencies

ต้องมี Git, Node.js และ npm โดยสภาพแวดล้อมที่เคยทดสอบคือ Windows, Node.js 24.18.0 และ npm 11.16.0
คำสั่งด้านล่างใช้ PowerShell และ `npm.cmd` เพื่อหลีกเลี่ยงปัญหา Execution Policy ของ `npm.ps1`

```powershell
git clone https://github.com/eakm0nn/Dormify.git
cd Dormify
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd --prefix client ci
```

### 2. ตั้งค่า Environment

คัดลอกไฟล์ตัวอย่างเฉพาะกรณีที่ยังไม่มี `.env`:

```powershell
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
if (!(Test-Path client/.env)) { Copy-Item client/.env.example client/.env }
```

สร้าง Secret แบบสุ่ม แล้วนำผลลัพธ์ไปใส่ `JWT_SECRET` ใน `server/.env`:

```powershell
node -p "require('node:crypto').randomBytes(48).toString('hex')"
```

ค่าที่ต้องตั้งใน `server/.env`:

```dotenv
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="ใส่ค่าสุ่มที่สร้างเอง"
CLIENT_ORIGIN="http://127.0.0.1:5173"
```

ค่าที่ต้องตั้งใน `client/.env`:

```dotenv
VITE_API_URL="http://127.0.0.1:5000"
```

ห้าม Commit Secret หรือไฟล์ `.env` จริง ใช้ `.env.example` สำหรับแชร์รูปแบบการตั้งค่าเท่านั้น

### 3. เตรียมฐานข้อมูลและสร้าง Admin

```powershell
npm.cmd --prefix server run db:setup
npm.cmd --prefix server run admin:create
```

กรอกอีเมล ชื่อ และรหัสผ่าน Admin ใน Terminal รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร
ระบบไม่มีบัญชีหรือรหัสผ่าน Admin เริ่มต้น และจะไม่เปลี่ยนสิทธิ์บัญชีเดิมที่ใช้อีเมลซ้ำ

สคริปต์ Setup ใช้ Schema ปัจจุบันโดยไม่รัน Seed หรือ Reset ฐานข้อมูล
หากมีข้อมูลเดิม ให้สำรองก่อนปรับ Schema และหยุดตรวจสอบหาก Prisma เตือนว่าข้อมูลอาจสูญหาย
Seed รุ่นก่อนและคำสั่งที่เกี่ยวข้องถูกนำออกแล้ว เพราะลบข้อมูลและสร้างบทบาทแบบเก่าที่เลิกใช้

### 4. เปิดเว็บไซต์

จากโฟลเดอร์หลักของโปรเจกต์:

```powershell
npm.cmd start
```

- เว็บไซต์: http://127.0.0.1:5173
- Backend API: http://127.0.0.1:5000
- หยุดการทำงานด้วย `Ctrl+C`

ฐานข้อมูลใหม่เริ่มว่าง ให้เข้าสู่ระบบเป็น Admin แล้วบันทึกข้อมูลหอพักและเพิ่มห้องจริง
หน้า Public ไม่สร้างห้อง ราคา หรือข้อมูลติดต่อจำลองแทนข้อมูลที่ยังไม่มี

ถ้ามีหลายหอพักจากข้อมูลรุ่นก่อน ให้กำหนด `VITE_DORMITORY_ID` ใน `client/.env` เพื่อเลือกหอพักที่แสดง
รายละเอียดเพิ่มเติมอยู่ในคู่มือ UI ด้านล่าง

## ตรวจสอบและทดสอบ

```powershell
npm.cmd --prefix server test
npm.cmd --prefix client test
npm.cmd --prefix client run lint
npm.cmd --prefix client run format:check
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

การทดสอบหน้าจอด้วย Chrome ที่ติดตั้งในเครื่อง:

```powershell
node client/scripts/ui-smoke.mjs
```

ชุดทดสอบใช้ SQLite ชั่วคราวแยกจากฐาน Local ไม่ต้องรัน Seed รุ่นก่อน
ผลการทดสอบที่บันทึกไว้และข้อจำกัดการตรวจสอบดูได้จากเอกสารประกอบ

จัดรูปแบบโค้ดด้วย `npm.cmd --prefix client run format`
รายละเอียดการปรับโครงสร้าง การป้องกันอนุมัติห้องซ้ำ และการอัปเกรดฐานเดิมอยู่ใน
[ผลปรับปรุงโค้ดและประสิทธิภาพ](docs/CODE_QUALITY_IMPROVEMENTS.md)

หลังอัปเดตโค้ดรอบนี้ ให้รัน `npm.cmd --prefix server run db:setup` ก่อนเปิด Backend
คำสั่งจะตรวจเลขห้องซ้ำก่อนเพิ่มข้อบังคับในฐานข้อมูล โดยไม่ Reset/Seed หรือลบรายการเดิม
ถ้าพบเลขห้องซ้ำในหอเดียวกัน ระบบจะหยุดให้แก้ข้อมูลก่อน ไม่เลือกหรือลบรายการให้อัตโนมัติ

## โครงสร้างโปรเจกต์

```text
Dormify/
├── client/
│   ├── src/
│   │   ├── assets/       # โลโก้ ภาพเคลื่อนไหว และฟอนต์
│   │   ├── components/   # ส่วนประกอบหน้าจอและ Layout
│   │   ├── context/      # ข้อมูล Session และหอพักฝั่งหน้าจอ
│   │   ├── pages/        # หน้า Public, Admin และ User
│   │   ├── services/     # การเชื่อมต่อ Backend API
│   │   └── utils/        # รูปแบบเงิน วันที่ และข้อความแจ้งผล
│   └── scripts/          # สคริปต์ทดสอบหน้าจอ
├── server/
│   ├── src/              # Routes, Controllers และ Middleware
│   ├── prisma/           # Schema และฐาน SQLite ที่ไม่ Commit
│   ├── scripts/          # เตรียมฐานข้อมูลและสร้าง Admin
│   └── test/             # ชุดทดสอบ API
└── docs/                 # เอกสารโครงงาน แผนพัฒนา และผลทดสอบ
```

## เอกสารประกอบ

- [คู่มือ Authentication และการสร้าง Admin](docs/PHASE1_AUTH.md)
- [ธีมภาษาไทย ผลทดสอบหน้าจอ และข้อจำกัด](docs/UI_REDESIGN.md)
- [การย้าย Frontend เป็น TypeScript และผลทดสอบ](docs/FRONTEND_TYPESCRIPT.md)
- [คู่มือเตรียมเครื่องและ Local Environment](docs/PHASE0_SETUP.md)
- [วิเคราะห์ขอบเขตและแผนพัฒนา](docs/analysis/README.md)
- [แบบข้อมูลและ Business Rules](docs/analysis/PHASE1_BUSINESS_RULES_DESIGN.md)
- [กติกาการทำงาน 14 ข้อและสถานะรอยืนยัน](docs/BUSINESS_RULES.md)

เอกสารบางฉบับบันทึกสถานะในแต่ละช่วงพัฒนา อาจกล่าวถึงฟังก์ชันรุ่นก่อนที่ปรับไปแล้ว
ให้พิจารณาวันที่และขอบเขตของเอกสารนั้นร่วมด้วย

## ผู้พัฒนา

พัฒนาและปรับปรุงเป็น DORMIFY โดย [eakm0nn](https://github.com/eakm0nn)
สำหรับโครงงานจบระดับ ปวช.3

ฟอนต์ Noto Sans Thai ใช้ตาม [SIL Open Font License](client/src/assets/fonts/OFL.txt)
