# เปิดดู MySQL ด้วย phpMyAdmin

เพิ่มและทดสอบวันที่ 14 พฤศจิกายน 2026 (Asia/Bangkok)

## เปิดและเข้าสู่ระบบ

เปิด Docker Desktop ให้ Engine พร้อม จาก Root ของโปรเจกต์รัน:

```powershell
npm.cmd run db:admin
```

เปิด http://127.0.0.1:8080 แล้วกรอก:

- ชื่อผู้ใช้: `dormify_app`
- รหัสผ่าน: ค่าของ `MYSQL_PASSWORD` ในไฟล์ `.env` ที่ Root ของเครื่องนี้ คัดลอกเฉพาะค่า ไม่รวมเครื่องหมายคำพูด
- Server ตั้งไว้เป็น `mysql` ใน Docker แล้ว ไม่ต้องกรอก Host เพิ่ม

รหัสนี้เป็นรหัส MySQL ไม่ใช่รหัส Admin ของเว็บไซต์ ไม่ต้องส่งรหัสในแชตหรือ Commit ไฟล์ .env
ใช้หน้า Login ปกติ ไม่มีการฝังบัญชี Root หรือเปิด Auto-login

หากเจอ `Access denied (1045)` ให้ใช้รหัสจาก **`.env` ตัวจริง ไม่ใช่ `.env.example`**
ไฟล์ `.env.example` เป็นตัวอย่างสำหรับตั้งเครื่องและไม่เปลี่ยนรหัส MySQL ที่สร้างไว้แล้ว
อัปเดตตามคำขอผู้ใช้: ลบ `.env.example` ที่ Root แล้ว เหลือ `.env` ตัวจริงสำหรับดูรหัส MySQL; setup ยังคงสร้าง Environment ให้เครื่องใหม่ได้โดยไม่ใช้ไฟล์ตัวอย่างนี้
ตรวจชื่อ `dormify_app`, คัดลอกค่าโดยไม่รวม Quotes/ช่องว่าง และล้างรหัสเดิมที่ Browser เติมให้อัตโนมัติก่อนลองใหม่
การตรวจวันที่ 14 พฤศจิกายนพบรหัสในไฟล์ตัวอย่างต่างจากค่าที่ใช้งานจริง ขณะที่ Login ด้วย .env ตัวจริงผ่าน ไม่ได้เปลี่ยนรหัสหรือสิทธิ์เพื่อแก้กรณีนี้

ต่อมาวันเดียวกันผู้ใช้เปลี่ยน Root .env และ Server URL จึงเกิด 1045 อีกครั้ง หลังผู้ใช้ยืนยันให้ทำ จึงซิงก์รหัส app/root ใน MySQL จริงตาม .env และซ่อม URL ที่ขาด Host/Port แล้ว ทดสอบ Login ใหม่ผ่าน ข้อมูลเดิมทั้งเจ็ดตารางตรงก่อนเปลี่ยน
การแก้ `.env` อย่างเดียวไม่เปลี่ยนรหัส MySQL ที่มีอยู่ ต้องเปลี่ยนบัญชีใน MySQL ให้ตรงกัน ปรับ DATABASE_URL ฝั่ง Server และ Restart Backend/โหลด Container Environment ใหม่โดยไม่ลบ Volume

เมื่อเข้าแล้ว เลือกฐาน `dormify` ด้านซ้าย จะเห็น `User`, `AuthSession`, `Property`, `Room`, `Booking`, `Payment`, `Complaint`
และตาราง `_prisma_migrations` สำหรับประวัติ Migration ซึ่งไม่ใช่ตารางข้อมูลธุรกิจเพิ่ม
คลิกชื่อตารางแล้วเลือก Browse/เปิดดูเพื่อดูรายการ หรือ Structure/โครงสร้างเพื่อดูคอลัมน์
ตารางว่างเป็นสถานะจริงจนกว่าจะสมัครสมาชิกหรือ Admin เพิ่มข้อมูล ไม่ใช่ข้อผิดพลาดของ phpMyAdmin

## ใช้ร่วมกับระบบเดิม

phpMyAdmin เป็นหน้าจัดการ MySQL; Backend ยังคงอ่าน/เขียนด้วย Prisma 5.22.0 ตามเดิม
ใช้ฐาน `dormify` และ Volume MySQL เดิม ไม่คัดลอกข้อมูล ไม่สร้างฐานใหม่ และไม่ต้องติดตั้ง XAMPP/MySQL เพิ่ม
การแก้/ลบผ่านเครื่องมือนี้มีผลกับข้อมูลจริงและข้าม Validation ของเว็บ ให้เพิ่มหอ/ห้องผ่านหน้า Admin ของเว็บตามปกติ
สร้างบัญชี Admin ด้วย `npm.cmd --prefix server run admin:create` เพื่อ Hash รหัสผ่าน ห้ามพิมพ์รหัสผ่านธรรมดาลงตาราง User
หากพัฒนา Schema ให้เปลี่ยน Prisma Schema และ Migration ตามขั้นตอน ไม่แก้โครงสร้างผ่าน phpMyAdmin แล้วปล่อยโค้ดไม่ตรงฐาน

## คำสั่งอื่น

```powershell
npm.cmd run db:status
npm.cmd run db:admin:stop
npm.cmd run db:stop
```

- `db:admin:stop` หยุดเฉพาะ phpMyAdmin
- `db:stop` หยุด phpMyAdmin และ MySQL โดยไม่ลบ Volume
- `db:up` เปิดเฉพาะ MySQL; phpMyAdmin อยู่ใน Profile `tools` เปิดด้วย `db:admin` เมื่อต้องใช้
- Prisma Studio ยังเปิดได้ด้วย `npm.cmd run db:studio` ที่พอร์ต 5555

พอร์ต phpMyAdmin ผูกเฉพาะ `127.0.0.1` ปกติ 8080 หากชนกับโปรแกรมอื่นกำหนด `PHPMYADMIN_PORT` ใน Root .env แล้วรัน db:admin ใหม่
เมื่อย้ายเครื่องใช้คู่มือ SETUP_NEW_MACHINE.md และรหัสจาก .env ของเครื่องปลายทาง โค้ด Compose ตาม Git แต่ข้อมูล/รหัสผ่านไม่ตาม Git

## ผลตรวจรอบเพิ่มเครื่องมือ

- Compose Validate ผ่าน; MySQL และ phpMyAdmin Healthy
- หน้า phpMyAdmin HTTP 200 มีฟอร์ม Login
- ทดสอบ HTTP Session/Cookie/CSRF โดยอ่านรหัสจาก .env ภายใน Process ไม่แสดงค่ารหัสหรือ Cookie: เข้าระบบด้วย dormify_app และเปิดโครงสร้าง dormify เห็นทั้งเจ็ดตารางได้
- Healthcheck เริ่มต้นใช้ PHP file_get_contents แล้วไม่ผ่าน เปลี่ยนเป็น curl ตรวจ HTTP และรันซ้ำผ่าน
- เทียบ Hash/จำนวนแถวก่อน–หลัง: User/Property/Room/Booking/Payment/Complaint ไม่เปลี่ยน (6 Models); AuthSession เปลี่ยนระหว่างที่เว็บเปิดใช้งาน จึงไม่อ้างว่าทั้งฐานเหมือนเดิมและไม่ย้อน/ลบ Session เพื่อให้ตรวจผ่าน
- ไม่เปลี่ยน API/Authentication ของเว็บหรือ Schema และไม่ได้รันชุดทดสอบแอปซ้ำในงานนี้

อ้างอิงการตั้งค่า Image: [phpMyAdmin Docker](https://github.com/phpmyadmin/docker/blob/master/README.md)
