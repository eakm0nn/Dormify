# เริ่มใช้ Prisma ใน DORMIFY

อัปเดต 13 พฤศจิกายน 2026 (Asia/Bangkok)
โปรเจกต์นี้ติดตั้ง Prisma CLI/Client 5.22.0 และเชื่อม MySQL ไว้แล้ว ไม่ต้องติดตั้งใหม่ สมัครบัญชี Prisma หรือใช้ Prisma Cloud

## แต่ละส่วนทำอะไร

หน้าเว็บเรียก API ของ Express → Controller ใช้ Prisma Client → อ่าน/บันทึกลง MySQL
ข้อมูลจริงเก็บในฐาน dormify ไม่ได้เก็บใน Prisma Studio
Prisma Studio เป็นหน้าดู/แก้ข้อมูล ใช้ phpMyAdmin หรือ Workbench แทนได้ โดยโค้ด Backend ยังใช้ Prisma ตามเดิม

| ส่วน | ไฟล์/ตำแหน่ง | ใช้ทำอะไร |
|---|---|---|
| Schema | server/prisma/schema.prisma | กำหนดตาราง คอลัมน์ และความสัมพันธ์ |
| Database URL | server/.env | การเชื่อม MySQL ไม่ส่งค่าจริงขึ้น Git/แชต |
| Client กลาง | server/src/lib/prisma.js | ให้ Controllers ใช้ Client ตัวเดียวร่วมกัน |
| Query | server/src/controllers/ | อ่าน/บันทึกข้อมูลหลัง Express ตรวจสิทธิ์/ข้อมูลเข้า |
| Migration | server/prisma/migrations/ | SQL ประวัติการเปลี่ยนโครงสร้างฐาน |
| Studio | http://127.0.0.1:5555 | ดู/แก้ข้อมูลผ่านเบราว์เซอร์เมื่อเปิดเครื่องมือไว้ |

## คำสั่งที่ใช้ประจำ

รันจาก Root บน PowerShell ใช้ npm.cmd เครื่องนี้ตั้งค่า/schema แล้ว จึงเริ่มจากเปิด Docker Desktop:

```powershell
npm.cmd run db:up
npm.cmd --prefix server run db:check
npm.cmd run dev
```

เปิด Terminal อีกหน้าสำหรับดูตาราง:

```powershell
npm.cmd run db:studio
```

เข้า http://127.0.0.1:5555 เลือกตาราง เช่น Room หรือ User และเปิด Terminal ค้างไว้ กด Ctrl+C เพื่อหยุด
Studio ไม่ได้ใช้บัญชี Admin ของเว็บ แต่ใช้การเชื่อมต่อ server/.env และแก้ข้อมูลจริงได้
หาก Studio เปิดอยู่แล้วไม่ต้องเปิดซ้ำอีก Process บนพอร์ตเดิม

สำหรับเครื่องใหม่ ใช้ npm ci ทั้งสามส่วน → npm run setup → db:up → db:setup ตาม [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)
สร้าง Admin ผ่าน admin:create ของ Server ไม่กรอกรหัสผ่านธรรมดาลงตาราง User เพราะระบบต้องเก็บ Password hash

## อ่าน Schema เบื้องต้น

ดูตัวอย่างจากตาราง Room ปัจจุบัน:

```prisma
roomNumber String  @db.VarChar(50)
price      Decimal @db.Decimal(12, 2)
isAvailable Boolean @default(true)
```

นี่เป็นเพียงบางฟิลด์ใน Model ไม่ใช่ Model ครบสำหรับคัดลอกทับไฟล์
String คือข้อความ, Decimal คือเงิน, Boolean คือจริง/เท็จ และ @default คือค่าเริ่มต้น
Model Room เชื่อมกับ Property และ Booking พร้อมกำหนดเลขห้องไม่ซ้ำภายในหอเดียวกัน

## เขียนคำสั่งอ่านข้อมูล

ตัวอย่างภายใน Controller ฝั่ง Server ซึ่งใช้ CommonJS ตามโค้ดจริง:

```javascript
const prisma = require('../lib/prisma');

const getAvailableRooms = async (req, res, next) => {
    try {
        const rooms = await prisma.room.findMany({
            where: { isAvailable: true },
            orderBy: { roomNumber: 'asc' },
        });
        res.json(rooms);
    } catch (error) {
        next(error);
    }
};
```

findMany อ่านหลายรายการ, findUnique อ่านรายการจากคีย์ที่ไม่ซ้ำ, create เพิ่ม, update แก้, delete ลบ
ตัวอย่างข้างบนอ่านอย่างเดียว และเป็นตัวอย่างประกอบ ไม่ได้เพิ่ม Route ใหม่ในระบบ
ดู Query ที่ใช้งานจริงใน server/src/controllers/propertyController.js
การตรวจสิทธิ์ ADMIN/USER และตรวจข้อมูลเข้ายังต้องทำใน Express ก่อนเรียก Prisma ไม่ได้เกิดเองเพราะใช้ ORM
ฝั่ง React เรียก Express API ตามเดิม ไม่ Import Prisma Client หรือใส่ DATABASE_URL ใน Frontend

## เมื่อเพิ่มฟิลด์หรือตาราง

แยกให้ออกระหว่างเปลี่ยนข้อมูล เช่น เพิ่มห้อง กับเปลี่ยนโครงสร้าง เช่น เพิ่มคอลัมน์ใน Room
การเพิ่มข้อมูลทั่วไปไม่ต้องแก้ Schema/Generate/Migration ทุกครั้ง

หากเปลี่ยนโครงสร้าง ให้แก้ Schema → สร้างและตรวจ SQL Migration ใหม่ → ใช้ db:setup เพื่อ Generate Client และ Apply Migration ที่มีแล้ว → ทดสอบ API/UI
db:setup ปัจจุบันใช้ migrate deploy จึงไม่สร้าง Migration ใหม่จากการแก้ Schema ให้อัตโนมัติ
การรัน prisma generate อย่างเดียวสร้างโค้ด Client ไม่ได้เพิ่มคอลัมน์ใน MySQL
หยุด Backend ก่อน Generate โดยเฉพาะ Windows ที่อาจล็อก Prisma Engine

โปรเจกต์นี้กำหนดฐาน dormify เดียว จึงไม่ใช้ migrate dev ซึ่งอาจสร้าง Shadow database และไม่ใช้ Reset/Seed/db push ข้ามประวัติ Migration
อย่าแก้โครงสร้างตารางผ่าน phpMyAdmin/Studio แล้วปล่อย Schema/Migration ไม่ตรงกัน การเปลี่ยนโครงสร้างต้องเก็บใน Git เพื่อเครื่องอื่นติดตั้งตามได้
ส่วนการแก้ค่าข้อมูลผ่านเครื่องมือไม่ใช่ Migration และมีผลกับฐานจริง

อ้างอิงแนวคิด: [Prisma Client CRUD](https://www.prisma.io/docs/orm/v6/prisma-client/queries/crud), [Generate Client](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/generating-prisma-client), [Shadow database](https://www.prisma.io/docs/orm/v6/prisma-migrate/understanding-prisma-migrate/shadow-database)
เอกสารอ้างอิงเป็นแนวคิด ไม่ใช่ให้ติดตั้ง Prisma รุ่นใหม่หรือเปลี่ยนรูปแบบ Config ของโปรเจกต์ 5.22.0
