# DORMIFY — ฐานข้อมูลและงานที่ต้องทำต่อ

อัปเดต 13 พฤศจิกายน 2026 (Asia/Bangkok)
ย้ายโค้ดและฐาน Local เป็น MySQL 8.4.13 ผ่าน Docker แล้ว คง Node.js/Express และ Prisma 5.22.0
คำสั่งติดตั้งอยู่ใน [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)

## ทำแล้ว

- ฐานแอปเดียว dormify หลายตาราง หลายบัญชี ADMIN/USER ไม่สร้าง dormify_dev/dormify_test/Shadow database
- MySQL มี System schemas ตามปกติ ซึ่งไม่ใช่ฐานแอปเพิ่มเติม
- Compose ตรึง mysql:8.4 ด้วย digest เก็บข้อมูลใน dormify_mysql_data เปิดพอร์ตเฉพาะ 127.0.0.1
- dormify_app แยกจาก Root; Secrets สุ่มด้วย setup เก็บใน .env ที่ Ignore
- Migration SQL เจ็ด Models เดิม: User, AuthSession, Property, Room, Booking, Payment, Complaint
- Role ENUM ADMIN/USER; เงิน DECIMAL(12,2); utf8mb4/collation utf8mb4_unicode_ci; วันเวลา DATETIME(3) เก็บ UTC แสดง Asia/Bangkok
- Email/เลขห้องไม่แยกตัวพิมพ์ตาม Collation; Unique เลขห้องต่อหอ
- ค่าเช่า API รับ 0 ถึง 9999999999.99 ไม่เกินสองตำแหน่ง ป้องกันปัดเศษเงียบ/เกินขนาด
- ใช้ migrate deploy ไม่ใช้ migrate dev/db push/reset กับฐานใช้งาน
- Setup/Admin/API/UI tests ใช้ MySQL; Fixture namespace ในฐานเดียว ตรวจข้อมูลเดิมหลังลบ

เครื่องนี้ไม่พบ SQLite เดิมก่อนเริ่ม จึงสร้าง MySQL ว่าง ไม่ได้ทำ ETL/นำเข้าข้อมูลจากอีกเครื่อง
หากมี SQLite ที่อื่น ต้องตรวจ Mapping/กระทบยอดก่อนย้าย สคริปต์หยุดเมื่อพบ file: URL/dev.db เพื่อรักษาข้อมูล

## ผลตรวจจริง

Backend 23/23, Chrome 17 กลุ่มผ่านบน MySQL 8.4.13 รวมสิทธิ์ ความเป็นส่วนตัว การอนุมัติพร้อมกัน ภาษาไทย เงินสองตำแหน่ง และ Setup ซ้ำรักษาข้อมูล
Frontend unit 3/3, Lint, Format และ TypeScript/Build ผ่าน
หลังลบ Fixture ทั้งเจ็ด Models เป็น 0 ไม่มี Admin/ห้องจำลองค้าง ไม่ Reset/Seed/สร้างฐานเพิ่ม
รายละเอียดอยู่ใน [บันทึกงาน](WORK_LOG.md)

## งานที่ยังต้องพัฒนา

เป้าหมาย Admin 13 + User 12 ข้อยังคงครบ การย้ายฐานไม่ได้ทำทุกฟีเจอร์เสร็จ:

1. ผู้รับผิดชอบหลัก/ผู้พักร่วม และ Lease แยกคำขอจากสัญญาจริง
2. การถือสิทธิ์ห้อง/หมดอายุที่ปรับค่าได้เมื่อเจ้าของยืนยัน
3. ประวัติอัตราน้ำไฟ มิเตอร์ รอบบิล Invoice/รายการที่เก็บอัตราเดิม
4. ชำระเต็มยอด เงินสด/โอน ตรวจหลักฐาน เงินประกันแยกจากรายรับ/คืนเงิน
5. แจ้งซ่อม รายจ่าย รายงาน ข่าวสาร/Notifications และ Audit log

Payment/Complaint เดิมเป็น Models ยังไม่ใช่ระบบการเงิน/แจ้งซ่อมสมบูรณ์
ข้อ 3/6/9 ใน [กติกา](BUSINESS_RULES.md) ทั้งแนวทางยังรอยืนยัน ไม่เปิด 72 ชั่วโมง/ประกันหนึ่งเดือน/ครบกำหนดห้าวันเอง

## Migration และย้ายข้อมูลครั้งต่อไป

Git ส่ง Compose/Schema/Migrations ได้ Volume/Secrets ต้องจัดการแยก ไม่ลบ Volume เพื่อเปลี่ยนรหัส
Migration ต่อไปต้องตรวจ SQL/ผลต่อข้อมูล เก็บในประวัติแล้ว migrate deploy ไม่ใช้ migrate dev ที่อาจสร้าง Shadow database
SQL เริ่มต้นสร้างด้วย Prisma 5 migrate diff --from-empty --to-schema-datamodel ... --script แบบไม่เชื่อมฐาน ห้ามรัน SQL เริ่มต้นซ้ำตรง ๆ บนฐานที่มีตาราง
ดู [แผนข้อมูล](analysis/MIGRATION_AND_DATA_MODEL.md) ร่วมกับสถานะปัจจุบัน
