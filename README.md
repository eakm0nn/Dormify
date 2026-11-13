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
| ฐานข้อมูล | MySQL 8.4 ผ่าน Docker (ฐาน dormify เดียว) |
| ORM | Prisma 5.22.0 |
| Authentication | JWT, bcrypt และ Session ในฐานข้อมูล |

Frontend ใช้ TypeScript แล้ว Backend ยังคง Node.js/Express JavaScript และฐานข้อมูลใช้ MySQL 8.4.13 ผ่าน Docker
Schema/Migrations ใช้ Prisma 5.22.0 และเก็บ SQL ใน Git

## ติดตั้งและรันบน Local

ต้องมี Git, Node.js/npm และ Docker Desktop ที่เปิด Engine แล้ว ใช้คำสั่งจาก Root
บน PowerShell ใช้ npm.cmd เพื่อเลี่ยงข้อจำกัด npm.ps1 ระบบอื่นใช้ npm ได้

~~~powershell
npm.cmd ci
npm.cmd --prefix server ci
npm.cmd --prefix client ci
npm.cmd run setup
npm.cmd run db:up
npm.cmd run db:setup
npm.cmd --prefix server run admin:create
npm.cmd run dev
~~~

setup สร้างไฟล์ .env ทั้งสามส่วนและสุ่ม Secrets ไม่แสดงค่าและไม่เขียนทับค่าที่มีอยู่
db:setup ใช้ migrate deploy ไม่ Reset/Seed หรือสร้างฐาน Test/Shadow
หากพบ SQLite เดิม สคริปต์หยุดรักษาข้อมูล ต้องวางแผนนำเข้าแยกก่อน ไม่มีการ Import อัตโนมัติ

admin:create รับอีเมล ชื่อ และรหัสผ่านใน Terminal ไม่มีบัญชี Default และไม่ยกสิทธิ์บัญชีเดิม
ฐานใหม่เริ่มว่าง ให้เข้าสู่ระบบ Admin เพื่อบันทึกหอพักและเพิ่มห้องจริง

- เว็บ: http://127.0.0.1:5173
- API: http://127.0.0.1:5000
- Ctrl+C หยุดเว็บ/API; MySQL ยังทำงาน หยุดด้วย npm.cmd run db:stop และเปิดใหม่ด้วย npm.cmd run db:up

ข้อมูลอยู่ใน Docker volume dormify_mysql_data และไม่ตาม Git เช่นเดียวกับ .env
Compose และ Migration ช่วยติดตั้งซ้ำ แต่ไม่ Sync ข้อมูลข้ามเครื่อง ห้ามลบ Volume เพื่อแก้การติดตั้ง
รายละเอียด Environment/พอร์ต/การนำข้อมูลเดิมมาใช้ ดู [คู่มือเครื่องใหม่](docs/SETUP_NEW_MACHINE.md)

## ตรวจสอบและทดสอบ

ดูตารางฐานข้อมูล: รัน npm.cmd run db:studio แล้วเปิด http://127.0.0.1:5555 โดยเปิด Terminal ค้างไว้ พอร์ต MySQL 3306 ใช้เปิดเป็นเว็บไม่ได้ รายละเอียดเชื่อม Workbench/DBeaver อยู่ในคู่มือเครื่องใหม่

เปิด MySQL/ทำ db:setup ก่อน หยุดการใช้งานจริงชั่วคราว และรัน API/UI ตามลำดับ:

~~~powershell
npm.cmd --prefix server test
npm.cmd --prefix client run test:ui
npm.cmd --prefix client test
npm.cmd --prefix client run lint
npm.cmd --prefix client run format:check
npm.cmd --prefix client run build
npm.cmd --prefix server run db:check
~~~

API/UI ใช้ Fixture namespace สุ่มในฐาน dormify เดียว ลบเฉพาะข้อมูลที่สร้างเองและตรวจแฮชข้อมูลเดิม ไม่ Reset/Seed/สร้างฐานเพิ่ม
ห้ามรันสองชุดพร้อมกันหรือระหว่างคนแก้ข้อมูล หากทดสอบหยุดกลางทางให้ตรวจ Fixture ค้างตามคู่มือ
UI ใช้ Chrome ที่ติดตั้งในเครื่อง กำหนด CHROME_PATH ได้ ภาพ/results.json อยู่ใน client/.ui-artifacts/ ไม่ตาม Git
ผลรอบย้าย MySQL: Backend 23/23, Frontend 3/3, Chrome 17 กลุ่ม, Lint/Format/Build ผ่าน

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
│   ├── prisma/           # Schema และ SQL migrations สำหรับ MySQL
│   ├── scripts/          # เตรียมฐานข้อมูลและสร้าง Admin
│   └── test/             # ชุดทดสอบ API
└── docs/                 # เอกสารโครงงาน แผนพัฒนา และผลทดสอบ
```

## เอกสารประกอบ

- [เริ่มใช้ Prisma สำหรับผู้เริ่มต้น](docs/PRISMA_START.md)

- [คู่มือ Authentication และการสร้าง Admin](docs/PHASE1_AUTH.md)
- [ธีมภาษาไทย ผลทดสอบหน้าจอ และข้อจำกัด](docs/UI_REDESIGN.md)
- [การย้าย Frontend เป็น TypeScript และผลทดสอบ](docs/FRONTEND_TYPESCRIPT.md)
- [คู่มือเตรียมเครื่องและ Local Environment](docs/PHASE0_SETUP.md)
- [วิเคราะห์ขอบเขตและแผนพัฒนา](docs/analysis/README.md)
- [แบบข้อมูลและ Business Rules](docs/analysis/PHASE1_BUSINESS_RULES_DESIGN.md)
- [กติกาการทำงาน 14 ข้อและสถานะรอยืนยัน](docs/BUSINESS_RULES.md)
- [สิ่งที่ต้องเตรียมสำหรับฐานข้อมูล](docs/DATABASE_PREPARATION.md)

เอกสารบางฉบับบันทึกสถานะในแต่ละช่วงพัฒนา อาจกล่าวถึงฟังก์ชันรุ่นก่อนที่ปรับไปแล้ว
ให้พิจารณาวันที่และขอบเขตของเอกสารนั้นร่วมด้วย

## ผู้พัฒนา

พัฒนาและปรับปรุงเป็น DORMIFY โดย [eakm0nn](https://github.com/eakm0nn)
สำหรับโครงงานจบระดับ ปวช.3
