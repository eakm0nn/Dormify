# เอกสาร DORMIFY

จัดรวม 18 พฤศจิกายน 2026 (Asia/Bangkok) เริ่มอ่านตามงานที่ต้องทำ ไม่ต้องไล่อ่านรายงานทุก Phase

| ต้องการทำอะไร | อ่านไฟล์ |
|---|---|
| ดูสถานะจริงและงานที่ยังค้าง | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| ติดตั้ง รัน ดูฐานข้อมูล หรือย้ายเครื่อง/GitHub | [SETUP_NEW_MACHINE.md](SETUP_NEW_MACHINE.md) |
| ใช้งานฝั่งผู้ดูแล | [ADMIN_MANUAL.md](ADMIN_MANUAL.md) |
| ใช้งานฝั่งผู้เช่า | [USER_MANUAL.md](USER_MANUAL.md) |
| ตรวจเงื่อนไขการเช่าและคำนวณเงิน | [BUSINESS_RULES.md](BUSINESS_RULES.md) |
| พัฒนาต่อ อ่านโครงสร้าง Prisma และข้อจำกัด | [DEVELOPMENT.md](DEVELOPMENT.md) |
| ดูผลทดสอบล่าสุดและประวัติผลเก่า | [TEST_RESULTS.md](TEST_RESULTS.md) |
| เตรียมสาธิต ส่งงาน และตรวจเครื่องปลายทาง | [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) |
| เทียบขอบเขต Admin/User 25 ข้อ | [ตารางเทียบข้อกำหนด](analysis/REQUIREMENTS_TRACEABILITY_MATRIX.md) |
| รับช่วงงาน/ดูประวัติการตัดสินใจ | [WORK_LOG.md](WORK_LOG.md) |

PDF ต้นฉบับอยู่ใน [requirements](requirements/แบบเสนอโครงงานเอกอมร.pdf) ข้อความถอดสำหรับค้นหาอยู่ใน [PDF_TEXT_EXTRACTION.md](analysis/PDF_TEXT_EXTRACTION.md) รูปใน images เป็นภาพ Fixture จากการทดสอบ ไม่ใช่ข้อมูลผู้เช่าจริง

## เอกสารเดิมถูกรวมไว้ที่ใด

| กลุ่มไฟล์ที่เลิกแยก | เอกสารหลักแทน |
|---|---|
| Phase 0 setup, Authentication, phpMyAdmin, GitHub workflow | SETUP_NEW_MACHINE.md |
| คู่มือ Prisma, TypeScript, UI redesign, คุณภาพโค้ด, แบบข้อมูล/Workflow/แผนย้ายฐานเดิม | DEVELOPMENT.md |
| การจัดการห้องและระบบบริหารหอ | ADMIN_MANUAL.md / USER_MANUAL.md |
| ผล Phase 0, งานวันที่ 17, Deep review, Completion review, Submission review | TEST_RESULTS.md |
| วิเคราะห์ Repository, Roadmap และ analysis README | PROJECT_STATUS.md / DEVELOPMENT.md / ตารางข้อกำหนด |

ไฟล์รายงานเดิมถูกลบหลังสรุป ไม่สร้าง ZIP หรือสำเนาเพิ่ม รายละเอียดเหตุการณ์และชื่อไฟล์เดิมยังอยู่ใน WORK_LOG.md เพื่อแยกประวัติออกจากวิธีใช้งานปัจจุบัน การรวมเอกสารครั้งนี้ไม่ได้รันทดสอบแอปใหม่หรือเปลี่ยนโค้ด/ฐานข้อมูล
