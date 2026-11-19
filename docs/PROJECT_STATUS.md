# DORMIFY — สถานะล่าสุดสำหรับทำงานต่อ

อัปเดต 19 พฤศจิกายน 2026 (Asia/Bangkok) อ่านหน้านี้ → [WORK_LOG](WORK_LOG.md) รายการล่าสุด → [BUSINESS_RULES](BUSINESS_RULES.md) แล้วตรวจ Git status/โค้ดจริงก่อนแก้ เอกสารอาจเก่ากว่า Working Tree

## สิ่งที่ทำแล้ว

นำ React Bits Fade Content มาปรับใช้ใน Hero แล้ว: ข้อความเฟด 0.32 วินาที กรอบ GIF เริ่มช้ากว่า 0.08 วินาที ใช้ GSAP 3.15.1 เฉพาะการเฟดตอนเข้า ไม่เปลี่ยนสี/มุม/ข้อความ/การนำทาง และไม่มีการเลื่อนหรือเบลอเนื้อหา รองรับ Reduced Motion ตั้งแต่เปิดหน้าและระหว่างเล่น พร้อม Cleanup เมื่อออกจากหน้า เก็บ Source/License ที่ client/src/components/reactbits ไม่เปลี่ยน Backend/Schema/ข้อมูลจริง Chrome ล่าสุดผ่าน 68 กลุ่ม รวม 2 กลุ่ม Motion ใหม่, Build/TypeScript/Lint/Format และ Unit 5/5 ผ่าน ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน [รายละเอียดและไฟล์ที่แก้](TEST_RESULTS.md) เครื่องใหม่ใช้ npm ci ตาม Lockfile เดิม ไม่ต้องติดตั้ง CLI ของ React Bits ยังไม่ Commit/Push

เพิ่มข้อกำหนดการอยู่อาศัยในเมนูสาธารณะ Header/Mobile/Footer และส่วน /#rules แล้ว ใช้ dormitory.rules เดิมพร้อม Loading/Error/Empty ไม่แต่งกฎใหม่ ย้ายข้อความจากส่วนสิ่งอำนวยความสะดวกไม่ให้ซ้ำ เมนูสาธารณะยุบเมื่อจอเล็กกว่า 1280px เพื่อไม่ล้น ส่วน Sidebar เดิมยังใช้ 1024px Build/TypeScript/Lint/Format, Unit 5/5 และ Chrome 66 กลุ่มผ่าน ตรวจเนื้อหาจากฐานจริง/Fallback และ Back/Forward/ตำแหน่งเลื่อนรวม #rules ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน [ผลตรวจ](TEST_RESULTS.md) ไม่ Commit/Push

แก้เมนูสาธารณะตามภาพผู้ใช้แล้ว: หน้าหลักกลับบน ห้องพัก/สิ่งอำนวยความสะดวก/ติดต่อเลื่อนไปยังส่วนจริง รวมกดเมนูเดิมซ้ำและ Browser Back/Forward ใช้ Router Link/History รูปแบบเดียว เก็บ Filter เดิมและแยก REPLACE ของ Filter ไม่ให้กระโดด รอข้อมูลหอก่อนจัดตำแหน่ง Deep link ผลใหม่ Chrome 65 กลุ่มผ่านพร้อมวัด scrollY/Section จริงบน Desktop/Mobile, TypeScript/Build/Lint/Format และ Unit 5/5 ผ่าน Cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ผลเดิม 62 กลุ่มตรวจเส้นทางแต่ไม่ครอบคลุมตำแหน่งเลื่อนนี้ จึงใช้ผลใหม่ [ดูรายละเอียด](TEST_RESULTS.md) ไม่ Commit/Push

ตรวจปุ่มไป–กลับล่าสุด 19 พฤศจิกายนเสร็จ: รายละเอียดห้องและ Empty state ของห้องปิดที่เปิดจากตาราง Admin กลับมายังตารางและหน้าเดิม เก็บคำค้น/Filter Home เมื่อ Back/Forward หรือกด Back link ผ่าน Router state โดยไม่เพิ่ม Query string/เปลี่ยนรูปแบบ URL หรือใช้ State นี้เป็นสิทธิ์ API Browser ผ่าน 62 กลุ่ม รวมเมนู Admin 13/User 9, ยกเลิก/ปิดฟอร์มและหน้าต่างโดยไม่บันทึก, Gallery หลายภาพ และดาวน์โหลดหลักฐานอยู่หน้าเดิม พร้อม Cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน TypeScript/Build/Lint/Format และ Unit 5/5 ผ่าน ดู [ผลตรวจและข้อจำกัด](TEST_RESULTS.md) ไม่ Commit/Push

UI ล่าสุด 19 พฤศจิกายน ต่อจาก Home เสร็จตาม 5 ส่วนที่ผู้ใช้สั่ง: รายละเอียดห้องเน้นราคา/Gallery/ฟอร์มก่อนรายละเอียดรอง, Admin เน้นคำขอรอตรวจ/บิลค้าง/งานซ่อม, Sidebar แบ่งหมวดโดยรักษาเมนู Admin 13/User 9, User เห็นห้อง/คำขอ/บิลของตนจาก API เดิม และตารางเงินชิดขวา/เลื่อนด้วย Keyboard ได้ คงขาว–ฟ้าและมุมเล็ก Build/TypeScript/Lint/Format, Unit 5/5 และ Chrome 48 กลุ่มผ่านจริง พร้อม Cleanup ยืนยันข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน Profile อ่าน API เดิมเพิ่มเพื่อแสดงข้อมูลบนหน้านี้ ไม่เพิ่ม Endpoint/Role/Schema/Dependencies ดู [ผลทดสอบ/Gate/ไฟล์ที่แก้](TEST_RESULTS.md) และ WORK_LOG ยังไม่ Commit/Push

UI Home ก่อนหน้า 19 พฤศจิกายน: ปรับ Home ตามคำสั่งลดความรู้สึกเว็บสำเร็จรูปและลดมุมโค้ง Hero เตี้ยลง คงหัวข้อหลัก/โลโก้/กรอบ GIF สีขาว–ฟ้าเดิม สรุปห้องว่าง/ค่าเช่าอยู่ใกล้รายการห้อง ราคาอยู่ข้างเลขห้อง ตัวกรองเป็นแถบและเปิด/ยุบด้วยปุ่มบนมือถือ ส่วนข้อมูลหอและติดต่อไม่ใช้กล่องซ้อน Surface/Dialog 8px, Controls 6px, Badge 4px โดย Radius ที่กำหนดแยกใน Component อื่นยังคงอยู่ ไม่ออกแบบ Admin/User ใหม่ทั้งหน้าในรอบ Home นั้น Build/TypeScript/Lint/Format, Unit 5/5 และ Chrome 43 กลุ่มผ่าน ตรวจภาพจริงและจอ 320/390/768/1024px ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ดู [ผลทดสอบและ Gate](TEST_RESULTS.md)

เก็บกวาด Code Audit ชุด W1–W6 วันที่ 18 พฤศจิกายน 2026 ตามคำสั่งเริ่มทำ: เอา Import/ฟังก์ชันที่ไม่ใช้ใน Backend 3 ไฟล์และ eslint-plugin-react-refresh ออก เพิ่มการปิดโหลดประวัติที่ซ่อนอยู่ในหน้า Admin ข่าวสาร และหยุดโหลดบิล/สัญญา/เงินประกันในหน้าประวัติชำระเงิน โดยหน้าชำระเงินจริงยังโหลดครบ ไม่เปลี่ยน API/Schema/Business rules ผลรอบนี้ Build/TypeScript/Lint/Format, Unit 5/5, API 50/50 และ Chrome 40 กลุ่มผ่าน พร้อม Fixture cleanup ยืนยันข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ดูรายการไฟล์และข้อจำกัดใน [ผลทดสอบ](TEST_RESULTS.md) งาน W7–W9 และข้อเสนอ S1–S7 จาก Audit ยังไม่ได้ทำ ไม่ลบตารางฐานข้อมูล ไม่ Commit/Push

เก็บกวาดก่อนหน้า: เอาปุ่มหัวใจและแชร์พร้อม State/Handler ที่ไม่ใช้แล้วออกจาก PropertyDetails ตามคำสั่ง เก็บฟอร์มขอเช่าและ Gallery เดิม Build/TypeScript/Lint/Format ผ่าน ไม่ได้รัน Browser suite ซ้ำในงานลบสองปุ่มนั้น ส่วนรอบ W1–W6 ด้านบนรัน Browser ใหม่แล้ว

คำสั่ง UI ล่าสุด 18 พฤศจิกายน: ผู้ใช้ให้ปรับ UI ใหม่ด้วย antislop ทั้ง6 Skills ในโหมด during ปรับ Home/Cards/Sidebar/Metrics/Auth และสไตล์กลาง โดยคงสีขาว–ฟ้า โลโก้ GIF หัวข้อหลักและระบบเดิม ไม่เปลี่ยนชื่อหอ/Backend/Schema/API Build/TypeScript/Lint/Format และ Chrome39กลุ่มผ่าน พร้อม Cleanup ข้อมูลเดิมไม่เปลี่ยน ดูเหตุผล/Gate/Click-through ใน TEST_RESULTS.md ไม่เพิ่มฟีเจอร์หรือ DESIGN.md

- React/Vite/TypeScript ฝั่งเว็บ, Node/Express JavaScript, Prisma 5.22/MySQL Docker ฐาน dormify เดียว; Roles ADMIN/USER
- เว็บหอเดียวและทะเบียนหอใน Backend ดูห้อง/รูป/สิ่งอำนวยความสะดวก ส่งคำขอ อนุมัติ กันห้อง หมดอายุ และทำสัญญา
- ผู้เช่าผูก USER สัญญา/ผู้พักร่วม ต่ออายุ/ย้ายห้องเป็นฉบับถัดไป มิเตอร์/อัตรากลางรอบ บิล Snapshot และกันบิลซ้ำ
- รับเงินสด/โอนพร้อมสลิปส่วนตัว ตรวจยืนยัน เงินประกันแยก ใบปรับยอด คืนเงิน และปิดสัญญาตามวันจริง
- ส่วนลดค่าเช่าเฉลี่ยตามวันที่อยู่ น้ำไฟคร่อมวันออกให้ Admin ระบุยอด/เหตุผล/หลักฐานแล้วตรวจตัวอย่างก่อนยืนยัน ไม่เดาค่าและไม่คืนเกินเงินรับสุทธิ
- แจ้งซ่อม ข่าวสาร/แจ้งเตือนเฉพาะตน รายงานรับ–จ่าย สถิติ Audit และ Export ประวัติทุกหน้าตามตัวกรอง
- UI ไทย ขาว–ฟ้า Local font Responsive; เอารีวิว/อาหาร/ตัวเลือกประเภทที่พักหลายแบบออก เก็บข้อกำหนดการอยู่อาศัย

## ผลตรวจล่าสุดและข้อมูล

รอบล่าสุด 19 พฤศจิกายน: Chrome 66 กลุ่ม, Unit 5/5 และ TypeScript/Lint/Format/Build ผ่าน บน MySQL dormify เดียว Fixture cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน API suite แยก 50/50 เป็นผลวันที่ 18 พฤศจิกายน ไม่รันซ้ำในงานเพิ่มเมนู/ส่วน Rules นี้ Schema ไม่เปลี่ยน ดู [ผลทดสอบ](TEST_RESULTS.md)

ฐานมี 30 Models/7 Migrations; ข้อมูลที่เคยตรวจรอบล่าสุดมีหอ 1/ห้อง 8 และข้อมูลอื่นตามการใช้งาน ไม่ใช้จำนวนนี้แทนการตรวจฐานสด โค้ด/Compose ตาม Git แต่ข้อมูลอยู่ใน Docker volume dormify_mysql_data และ Environment อยู่ใน .env ของเครื่อง ไม่ตาม Git

รูปห้องและหลักฐานเก็บใน MySQL รุ่น Payment/Complaint และ Property.ownerId เดิมยังเก็บรักษาความสัมพันธ์ ไม่ลบเองเมื่อเก็บกวาดไฟล์ สำรอง SQLite/Environment เก่าที่ Ignore ยังไม่ได้ลบ

## สิ่งที่ยังต้องตรวจจริง

1. Commit/Push งานล่าสุดให้ครบเมื่อผู้ใช้สั่ง ไม่ส่ง Secret/ฐานหรือผลทดสอบส่วนตัว
2. Clone/ติดตั้งและลองใช้งานบนเครื่องอื่นจริง ไม่ใช้ผล Build เครื่องเดิมแทน
3. ให้เจ้าของหอตรวจอัตราและยอดเงินจริง ทดลองครบวงจร และให้ครูตรวจรับ/จัดรูปเล่มตามแบบจริง

ข้อจำกัด: ใบปรับนำเข้าที่ประเภท/สิทธิ์คืนเป็น NULL ต้องตรวจหลักฐาน, Snapshot Export ตรึง ID ไม่ใช่ค่าทั้งฐาน, บิลอัตโนมัติต้องเปิดนโยบาย/Backend และมีมิเตอร์ครบ ดู [DEVELOPMENT](DEVELOPMENT.md) ไม่เพิ่มฟีเจอร์นอก PDF เพียงเพื่อให้รายการดูครบ

## เริ่มต่อหรือย้ายเครื่อง

เครื่องมือนอกโปรเจกต์: ติดตั้ง anti-slop Core 3.2.31 พร้อมอีก 5 skills ใน Codex ระดับผู้ใช้บนเครื่องนี้แล้ว ไม่ใช่ dependency ของเว็บและไม่ตาม Git ไปเครื่องใหม่ ยังไม่ได้ใช้ปรับดีไซน์จากงานติดตั้ง ดู WORK_LOG สำหรับรายละเอียด

- [ติดตั้ง/รัน/GitHub/เครื่องมือฐานข้อมูล](SETUP_NEW_MACHINE.md)
- [คู่มือ Admin](ADMIN_MANUAL.md) / [User](USER_MANUAL.md)
- [ตรวจรับและลำดับสาธิต](SUBMISSION_CHECKLIST.md) / [เทียบ PDF 25 ข้อ](analysis/REQUIREMENTS_TRACEABILITY_MATRIX.md)
- [สารบัญเอกสาร](README.md) / [ประวัติการทำงาน](WORK_LOG.md)

การรวมเอกสารวันที่ 18 เป็นงานเอกสารอย่างเดียว ไม่รันทดสอบแอปใหม่ ไม่แก้โค้ด/Environment/Schema/ข้อมูล ไม่ Commit/Push ผลเก่ากับข้อเสนอเก็บใน WORK_LOG/TEST_RESULTS แทนรายงาน Phase หลายฉบับที่ขัดกัน

ผลตรวจหลังรวม: Markdown 30 → 12 ฉบับ ลิงก์ภายใน 73 จุดผ่าน Hash PDF ไม่เปลี่ยน check:delivery และ git diff --check ผ่าน
