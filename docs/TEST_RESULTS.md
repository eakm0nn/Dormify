# ผลทดสอบ DORMIFY

เอกสารรวม 18 พฤศจิกายน 2026 (Asia/Bangkok) ผลแต่ละส่วนระบุงานที่รันจริงแยกกัน งานรวมเอกสารเดิมไม่ได้รันทดสอบแอปซ้ำ ส่วนงาน CSS รอบถัดมารัน Browser/Build ใหม่ตามรายละเอียดด้านล่าง

## React Bits ใน Hero วันที่ 19 พฤศจิกายน 2026

นำ [Fade Content ของ React Bits](https://reactbits.dev/animations/fade-content) มาปรับจาก [Source TypeScript ทางการ](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx) ให้เหลือการเฟดตอน Mount ด้วย GSAP 3.15.1 ข้อความใช้ 0.32 วินาที ส่วนกรอบ GIF Delay 0.08 วินาทีและใช้ 0.32 วินาที เริ่ม Opacity 0.65 ไม่มี Blur/Transform/ScrollTrigger เนื้อหาและ Link อยู่ใน DOM ตามปกติ ไม่เฟดฟอร์มหรือตาราง เก็บ [License ต้นฉบับ](../client/src/components/reactbits/LICENSE.md) พร้อม Source

| ตรวจใหม่จริง | ผล |
|---|---|
| Build / TypeScript | npm.cmd --prefix client run build ผ่าน JS หลัก 403.79 kB / gzip 136.47 kB ไม่ได้วัด Lighthouse/Core Web Vitals |
| Lint / Format / Syntax | run lint, run format:check และ node --check client/scripts/ui-smoke.mjs ผ่าน |
| Unit | npm.cmd --prefix client test ผ่าน 5/5 |
| Browser | npm.cmd --prefix client run test:ui ผ่าน Chrome 68 กลุ่ม (66 เดิม + 2 กลุ่ม Motion) |
| Animation / Cleanup | Probe ใน React StrictMode รอเฟรมจริงแล้วตรวจ GSAP เล่น เนื้อหาไม่หายและโฟกัสปุ่มด้วย Keyboard ได้ เมื่อ Unmount ไม่เหลือ Tween/Inline opacity |
| Reduced Motion | เปิดค่าลดการเคลื่อนไหวก่อน Mount แล้วไม่เฟด; เปิดการเคลื่อนไหวบน Hero จนเริ่มเล่นจริง แล้วเปิด Reduced Motion กลับ ต้องหยุดและคืน Opacity 1 รูป GIF เปลี่ยนเป็น PNG เดิม |
| ฟังก์ชันเดิม | Suite ตรวจ Header/Mobile/Rules/Back/Forward/ตำแหน่ง Scroll, ตัวกรอง, Register/Login, เมนู Admin 13/User 9 และ Flow ห้อง/คำขอ/สัญญา/มิเตอร์/บิล/ชำระเงิน/แจ้งซ่อม/ปิดสัญญา |
| Responsive / ภาพ | ตรวจไม่มี Overflow ที่ 320/390/768/1024px รวม Breakpoint เมนูเดิม ตรวจ public-desktop.png และภาพ Mobile; react-bits-reduced-motion.png บันทึกหลังเปิด Reduced Motion |
| ข้อมูล | Fixture ใน dormify เดียว Cleanup ผ่าน Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ไม่ Reset/Seed/สร้างฐานใหม่ |

Gate เฉพาะส่วนที่เปลี่ยน: ENERGY 2 / RHYTHM 2 / MOTION 2; R-19 ผ่านโดยเฟดสั้นเฉพาะ Hero เพื่อให้เริ่มอ่านข้อความก่อนภาพแบรนด์; R-23/R-38 ผ่านโดยใช้ Asset/ข้อความ/ข้อมูลเดิม; R-35 ผ่านตาม Build และ Browser ที่ระบุ; R-39 ผ่านตาม Keyboard/Reduced Motion ตั้งแต่โหลดและระหว่างเล่น; R-40 คงขนาดภาพ/Fetch priority เดิม ไม่มี Layout animation ไม่อ้างผล Performance ที่ไม่ได้วัด ใช้ antislop โหมด During ตามที่เลือกไว้

ไฟล์ที่เปลี่ยนในงานนี้ 10 ไฟล์: client/src/components/reactbits/{FadeContent.tsx,LICENSE.md}, client/src/pages/Home.tsx, client/{package.json,package-lock.json,test/motion.tsx,scripts/ui-smoke.mjs} และ docs/{PROJECT_STATUS,WORK_LOG,TEST_RESULTS}.md ไม่เปลี่ยน Backend/Schema/Auth/.env/คำสั่งติดตั้ง เพิ่ม GSAP 1 Package และเก็บ Source เฉพาะส่วนที่ใช้ ไม่ติดตั้ง React Bits ทั้งชุด ไม่ Commit/Push ผล API suite แยก 50/50 ยังเป็นผลเก่า 18 พฤศจิกายน หลักฐานล่าสุด: client/.ui-artifacts/react-bits-20261119.log และ results.json (Ignore)

## เพิ่มข้อกำหนดการอยู่อาศัย วันที่ 19 พฤศจิกายน 2026

เพิ่มเมนู Header/Desktop, Mobile และ Footer ไป /#rules พร้อมส่วน H2 ข้อกำหนดการอยู่อาศัย แยกจากสิ่งอำนวยความสะดวกและย้ายข้อความเดิมมาไว้จุดเดียว ใช้ dormitory.rules จาก API เดิม ไม่สร้างกฎ/ข้อมูลตัวอย่างในเว็บจริง หากกำลังโหลด/โหลดล้มเหลว/ยังไม่มีกฎ แสดงสถานะตามจริง เนื้อหายังแก้จาก Admin ข้อมูลหอพักเดิม

| ตรวจจริง | ผล |
|---|---|
| เนื้อหา | Browser อ่านข้อความ Rules ที่บันทึกในหอ Fixture จริง แสดง H2 ตรงชื่อที่ผู้ใช้ขอ |
| Empty | ตั้ง rules ว่างเฉพาะหอ Fixture และเปิดใหม่ ตรวจข้อความให้สอบถามผู้ดูแล แล้วคืนค่า Fixture ก่อนเดิน Flow ที่เหลือ ไม่เปลี่ยนกฎหอจริง |
| Navigation | Header/Mobile/Footer ไป #rules ได้ รวม Rules ใน Back/Forward และตรวจตำแหน่งเลื่อนจริงร่วมกับเมนูเดิม |
| Responsive | ตรวจ 1024/1279/1280/1440px ไม่ล้น เมนูสาธารณะ 5 รายการยุบต่ำกว่า 1280px และใช้แนวนอนตั้งแต่ 1280px; Sidebar Admin/User ยังใช้ 1024px เดิม |
| Build/คุณภาพโค้ด | Build รวม TypeScript, Lint, Format และ node --check ui-smoke.mjs ผ่าน |
| Unit | npm.cmd --prefix client test ผ่าน 5/5 |
| Browser | npm.cmd --prefix client run test:ui ผ่าน Chrome 66 กลุ่ม (65 เดิม + Rules 1 กลุ่ม) รวมเมนูใหม่ในกรณี Desktop/Mobile/Back/Forward เดิมด้วย |
| ภาพ | เปิดดู public-desktop.png จริง เมนูใหม่แสดงใน Header สี/โลโก้/GIF เดิม |
| ข้อมูล | ใช้ Namespace สุ่มใน dormify เดียว หยุดเว็บปกติและรันทีละชุด Cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน db:check มี User 3/หอ 1/ห้อง 8/สัญญา 0/บิล 0 และรายการอื่นเดิม ไม่ Reset/Seed/เพิ่มฐาน |

Gate เฉพาะส่วนใหม่: R-17/R-38 PASS เนื้อหามาจากฐานจริงและไม่แต่งกฎ; R-24/R-26/R-35 PASS คลิกและวัดตำแหน่งจริงใน Chrome 66 กลุ่ม; R-03/C-4 PASS ตามขนาดที่ระบุ ไม่มี Page overflow; R-27 PASS ตาม Source มี Loading/Error/Empty และกรณี Empty ทดสอบจริง; R-37 PASS ทำเมนูตามคำขอ ไม่เพิ่ม Asset/ระบบอื่น ไม่อ้างรับรองความถูกต้องทางกฎหมายของข้อความที่เจ้าของหอบันทึก

ไฟล์ที่เปลี่ยน 6 ไฟล์: client/src/components/Layout.tsx, client/src/pages/Home.tsx, client/scripts/ui-smoke.mjs และ docs/{PROJECT_STATUS,WORK_LOG,TEST_RESULTS}.md ไม่เปลี่ยน Backend/Schema/Auth/Dependencies/.env/วิธีติดตั้ง ไม่ Commit/Push API suite แยก 50/50 เป็นผลเดิมวันที่ 18 พฤศจิกายน ไม่รันซ้ำในงานนี้ หลักฐานรอบใหม่อยู่ใน client/.ui-artifacts/rules-navigation-20261119.log และ results.json ซึ่ง Git Ignore ไว้

ตรวจส่งงาน: Frontend 5173/Backend 5000 ตอบ HTTP 200 จริง; check:delivery ผ่าน 147 ไฟล์ข้อความ/3 Lockfiles/Ignore rules; git diff --check ผ่าน; เอกสาร UTF-8 3 ไฟล์/ลิงก์ภายใน 24 จุดผ่าน

## เมนูสาธารณะและตำแหน่งเลื่อน วันที่ 19 พฤศจิกายน 2026

ผู้ใช้ส่งภาพ Header หน้าหลัก/ห้องพัก/สิ่งอำนวยความสะดวก/ติดต่อเรา และแจ้งว่ากดกลับไม่ได้ ทำซ้ำก่อนแก้ด้วย Chrome ได้จริงที่ `header Home returns to top`: URL กลับเป็น / แต่ scrollY ไม่กลับบน ผล 62 กลุ่มในรอบก่อนเน้นเส้นทาง/State จึงไม่ครอบคลุมปัญหาตำแหน่งเลื่อนนี้ และไม่ใช่หลักฐานว่าเมนูนี้ไม่มีข้อผิดพลาด

แก้ Layout ให้จัดตำแหน่งเฉพาะหน้าสาธารณะ / หลัง DOM/ข้อมูลหอพร้อม เลื่อนไป Hash หรือด้านบนเมื่อคลิกหน้าหลัก รวม POP ของประวัติส่วนต่าง ๆ ในหน้า ใช้ Router Link แทนการผสม Native anchor และ Router Link ใน Header/Mobile/Footer/Hero พร้อมรักษาคำค้นใน State ของ Link/Brand แยก publicNavigation ของการกดเมนูจาก REPLACE ที่เปลี่ยน Filter เพื่อให้กด URL เดิมได้โดยไม่เพิ่ม History ซ้ำและไม่ทำให้ตัวกรองกระโดด ไม่แก้การคืนตำแหน่งข้ามหน้าไม่มี Hash ไม่เปลี่ยน URL/Theme/API/สิทธิ์

| ตรวจใหม่จริง | ผล |
|---|---|
| Header Desktop 1440px | ห้องพัก → สิ่งอำนวยความสะดวก → ติดต่อ → หน้าหลัก ตำแหน่งเลื่อนตรงกับ Section/บนสุด รวม Back ทุกขั้นและ Forward ทุกขั้น |
| URL/เมนูเดิมซ้ำ | เลื่อนออกจาก Section แล้วกดเมนูเดิมกลับ Section; URL เป็น / อยู่แล้วแต่เลื่อนลง กดหน้าหลัก/Logo กลับบนได้ |
| Mobile 390px | เมนูปิดหลังเลือกส่วน ตำแหน่ง Section ตรง Back/Forward ได้ Logo กลับบน รวมกด Logo ซ้ำที่ URL เดิม |
| Deep link / จากรายละเอียดห้อง | เปิด /#facilities โดยตรงและกดเมนูจากหน้าห้องไป /#rooms หรือ /#contact แล้วตำแหน่งถูกต้องหลังข้อมูลโหลด |
| ตัวกรอง | เปลี่ยนเลขห้องที่กำลังดู #rooms แล้ว scrollY ไม่กระโดด Back จากอีก Section และกลับจากหน้าห้องยังคงคำค้นเดิม |
| วิธีวัด | วัด scrollY กับขอบ Section จริง หัก scroll-padding-top และจำกัดตามความสูงหน้า ไม่ใช่ตรวจ Hash อย่างเดียว ระยะคลาดเคลื่อนต่ำกว่า 4px; บนสุด scrollY ต่ำกว่า 2px |
| Browser รวม | npm.cmd --prefix client run test:ui ผ่าน Chrome 65 กลุ่ม (62 เดิม + 3 กลุ่ม Scroll regression) ไม่มี Unexpected browser exception |
| Source | npm.cmd --prefix client run build รวม TypeScript, run lint, run format:check และ node --check client/scripts/ui-smoke.mjs ผ่าน |
| Unit | npm.cmd --prefix client test ผ่าน 5/5 |
| ข้อมูล | ใช้ dormify ฐานเดียวและ Fixture namespace สุ่ม รันหลังหยุดเว็บปกติ Cleanup ยืนยัน Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน db:check หลังจบยัง User 3/หอ 1/ห้อง 8/สัญญา 0/บิล 0 และรายการอื่นเดิม ไม่ Reset/Seed/เพิ่มฐาน |

รอบก่อนแก้ล้มเหลวตามอาการจริง รอบแก้ระหว่างทางพบ Forward ไปหน้าไม่มี Hash และการคลิก URL เดิมที่ Router ใช้ REPLACE จึงแก้พฤติกรรมให้ครบ Test helper ต้องแยก Page.navigate ที่มี loaderId (เอกสารใหม่) กับ Hash ในเอกสารเดิม จึงปรับการรอเอกสารให้ตรง โดยไม่ลด Assertion ตำแหน่งเลื่อน ทุกรอบที่จบ Cleanup ผ่าน ใช้ผลสำเร็จรอบสุดท้าย 65 กลุ่มเท่านั้นเป็นหลักฐานปิดงาน

หลักฐาน: client/.ui-artifacts/header-reproduction-20261119.log (ก่อนแก้), header-navigation-20261119.log และ results.json (หลังแก้) อยู่ในโฟลเดอร์ที่ Git Ignore ไว้ ไม่เพิ่ม Report แยกไฟล์

### Gate เฉพาะเมนู/Scroll

| รายการ | ผลและหลักฐาน |
|---|---|
| R-24 / R-26 | PASS ตามกรณีข้างต้น: Link มีปลายทางจริงและคลิกแล้วแสดงตำแหน่งจริง รวม URL เดิม |
| R-27 / C-4 | PASS ตาม Flow: รอข้อมูลก่อน Deep link และเปลี่ยน Filter ไม่กระโดด ไม่รับรองทุกจังหวะ Layout/Network ที่ไม่ได้ทดสอบ |
| R-32 / R-39 | PASS เฉพาะ Source/ชุดเดิม: ยังใช้ Native Link กับ Focus เดิม ไม่เพิ่ม Mouse-only control หรือเปลี่ยน CSS Reduced motion; behavior:auto ใช้กติกา Scroll ของ CSS เดิม |
| R-35 / R-36 | PASS: มี Reproduction ที่ล้มเหลวก่อนแก้ และผล Chrome 65 กลุ่มหลังแก้ซึ่งวัดตำแหน่งจริง ไม่ใช้ URL อย่างเดียวรับรอง Scroll |
| R-23 / R-37 | PASS: ไม่เปลี่ยน Navigation destinations/Theme/Asset/URL style ทำเฉพาะคำขอเมนูตามภาพ |
| ข้อมูล/สิทธิ์ | PASS ตามการตรวจ: ไม่ใช้ publicNavigation เป็นสิทธิ์ API ไม่แก้ Backend/Auth/Schema และข้อมูลเดิมไม่เปลี่ยน |

ไฟล์รอบนี้ 7 ไฟล์: client/src/components/Layout.tsx, client/src/components/Brand.tsx, client/src/pages/Home.tsx, client/scripts/ui-smoke.mjs และ docs/{PROJECT_STATUS,WORK_LOG,TEST_RESULTS}.md ไม่เปลี่ยน Dependencies/.env/วิธีติดตั้ง ไม่ Commit/Push API suite แยก 50/50 ยังเป็นผลเดิมวันที่ 18 พฤศจิกายน ไม่ได้รันใหม่ในงาน Scroll นี้

ตรวจส่งงาน: Frontend 5173/Backend 5000 ตอบ HTTP 200 จริง; check:delivery ผ่าน 147 ไฟล์ข้อความ/3 Lockfiles/Ignore rules; git diff --check ผ่าน; เอกสาร UTF-8 3 ไฟล์/ลิงก์ภายใน 23 จุดผ่าน

## ปุ่มและเส้นทางไป–กลับ วันที่ 19 พฤศจิกายน 2026

คำขอ: ตรวจการกดปุ่ม/ลิงก์แล้วกลับมาที่เดิมได้ คง URL และวิธีเปิดเว็บตามเดิม ขอบเขตคือเส้นทาง ปุ่มปิด/ยกเลิก และการเก็บตำแหน่งรายการ ไม่ใช้ Browser Back เพื่อย้อนข้อมูลที่ยืนยันบันทึกแล้ว

พบและแก้: Link กลับจากรายละเอียดห้องเดิมชี้ /#rooms เสมอ แม้เปิดจากตาราง Admin จึงส่งต้นทาง /admin/rooms และหน้าตารางผ่าน Router state รับปลายทาง Admin เฉพาะค่าที่กำหนดและบัญชี Admin ใช้ RoomReturnLink ร่วมทั้งหน้าปกติและ Empty state ของห้องปิด/ไม่พบห้อง เก็บหน้าตารางใน History state และคืนคำค้น/Filter ของ Home ทั้ง Browser Back/Forward และปุ่มกลับ ไม่เพิ่ม Query string, เปลี่ยนรูปแบบ URL, เปลี่ยน Authentication หรือเปิดให้เข้าผ่าน LAN

| กลุ่มปุ่ม/เส้นทาง | สิ่งที่ทดสอบจริงและผล |
|---|---|
| Home และรายละเอียดห้อง | ตั้งเลขห้อง/สถานะ/ประเภท/งบ เข้า Room card แล้ว Browser Back/Forward และกด Back link ค่ากลับมาครบ ล้างตัวกรองยังทำงาน |
| Header/Anchor/Auth | ปุ่มเลือกห้อง/ติดต่อไป #rooms/#contact และ Back/Forward ได้; Login ไป Register/กลับ Login/กลับหน้าหลักได้; เปิด–ซ่อนรหัสผ่านไม่เปลี่ยนหน้า |
| เมนู User | มี 9 ปลายทางเดิมครบ ใช้ Menu click ไปหน้าอื่น แล้ว Browser Back/Forward กลับหน้าข้อมูลส่วนตัวได้ทุกเส้นทางที่วนตรวจ |
| เมนู Admin | มี 13 ปลายทางเดิมครบ ใช้ Menu click ไปหน้าอื่น แล้ว Browser Back/Forward กลับภาพรวมได้ทุกเส้นทางที่วนตรวจ |
| หลัง Logout | Token เดิมถูกปฏิเสธ และ Browser Back ไม่แสดงพื้นที่ส่วนตัวหลังออกจากระบบ |
| ห้อง/รูป/หอพัก | เปลี่ยนค่าเช่าแล้ว Cancel คงค่าเดิม ปิดแผงรูปกลับตารางได้ ยกเลิกหน้าต่างสถานะด้วยปุ่ม/Escape ไม่เปลี่ยน isActive แก้ชื่อหอแล้ว Cancel คงชื่อเดิม |
| รายการเช่า | กลับไปตรวจสอบ/Escape ปิดหน้าต่างอนุมัติโดยคำขอยัง PENDING แล้วการอนุมัติจริงใน Flow เดิมยังทำงาน |
| ผู้เช่า/สัญญา | Cancel เพิ่มผู้เช่า/สัญญาไม่สร้างข้อมูล Cancel แก้ชื่อผู้เช่า/ค่าเช่าฉบับร่างเก็บค่าเดิม เปิด–ปิดรายละเอียดสัญญากลับรายการเดิม |
| Gallery | ใช้ภาพ Fixture 2 ภาพ ทดสอบถัดไป/ก่อนหน้า/Thumbnail/Zoom/ปุ่มภาพใน Dialog/ปิด/Escape ยังอยู่รายละเอียดห้องเดิม |
| บิล/รับเงิน | เปิด–ปิดรายละเอียดบิลคืนจำนวนแถวเดิม กลับไปตรวจสอบ/Escape จากยืนยันรับเงินไม่สร้าง Settlement หรือเปลี่ยน Payment ที่ยัง PENDING; ยืนยันจริงภายหลังยังทำงาน |
| ซ่อม/ข่าวสาร/รายจ่าย | Cancel แบบแก้ไขคงข้อมูลเดิม ฟอร์มข่าวสาร/รายจ่ายคืนโหมดเพิ่มพร้อมค่าว่าง ไม่บันทึกค่าร่าง |
| ดาวน์โหลด/CSV | คลิกดาวน์โหลดหลักฐานจริง ตรวจ PNG header และหน้า /user/payments ไม่เปลี่ยน; CSV/แบ่งหน้าของชุดเดิมยังผ่าน รวม Export ประวัติ 503 รายการ |
| Admin หน้าตาราง 2 | ใช้ห้อง NAV เฉพาะ Fixture ให้มี 12 ห้อง เปิดห้องจากหน้า 2 แล้ว Browser Back/Forward และ Back link กลับ /admin/rooms หน้า 2 เดิมได้ ปุ่มก่อนหน้ากลับหน้า 1 ได้ |
| ห้องปิด/ไม่พบห้อง | เปิดห้องปิดจากตาราง Admin แล้วหน้า Empty state มี Back link ไป /admin/rooms พร้อมหน้าตารางเดิม โดยไม่เปลี่ยนสิทธิ์ให้ดูห้องปิดบนเว็บสาธารณะ |

ผลชุดล่าสุด: npm.cmd --prefix client run test:ui ผ่าน Chrome 62 กลุ่ม (48 เดิมและ 14 ใหม่) บน MySQL dormify เดียว ใช้ Namespace สุ่ม หยุดเว็บปกติและรันทีละชุด Cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน db:check หลังจบมี User 3/หอ 1/ห้อง 8/สัญญา 0/บิล 0 และรายการอื่นเดิม ไม่ Reset/Seed/เพิ่มฐานหรือทิ้งข้อมูล NAV ไว้

TypeScript/Build/Lint/Format, Unit 5/5 และ node --check ผ่าน ตรวจ Syntax ของ CDP evaluate ที่เป็นข้อความคงที่ 120 จุดด้วย Espree/vm.Script พบ 0 ข้อผิดพลาด ใช้แพ็กเกจที่มีอยู่ ไม่เพิ่ม Dependency API suite แยก 50/50 เป็นผลเก่าวันที่ 18 พฤศจิกายน ไม่อ้างว่าเพิ่งรันซ้ำในงานนี้

รอบแรก Test หยุดที่ room status escape พบการส่ง Escape ยังไม่มี KeyUp/Virtual key code ครบ จึงเพิ่ม Helper Page.bringToFront + KeyDown/KeyUp ไม่เปลี่ยน Logic ปิด Dialog ในแอป แล้วรันใหม่ผ่าน 61 กลุ่ม ก่อนเพิ่มกรณีห้องปิดและรันรอบสุดท้ายผ่าน 62 ทุกรอบ Cleanup ยืนยันข้อมูลเดิมไม่เปลี่ยน หลักฐานรอบที่ผ่านอยู่ใน client/.ui-artifacts/results.json และ navigation-20261119.log ซึ่ง Git Ignore ไว้

### Gate เฉพาะ Navigation และพฤติกรรมปุ่ม

| รายการ | ผลและหลักฐาน |
|---|---|
| R-24 | PASS: ตรวจ Link/Route จาก Source ร่วมกับ Menu click และ Back/Forward ของ Admin/User, Home, Auth และห้อง |
| R-26 / C-2 | PASS ตามกลุ่มในตาราง: Control ที่ทดสอบทำงานจริง ไม่มีการแก้ปลายทางให้หลบการทดสอบ |
| R-27 / C-4 | PASS ตาม Flow: State ของ Filter/หน้าตารางกลับมาครบและ Dialog/Form ปิดได้; ชุดเดิมยังทดสอบ Loading/Error/Empty ไม่รับรองทุกเงื่อนไขที่ไม่ได้ทดสอบ |
| R-32 / R-39 | PASS: ปุ่ม Native/Link เดิม Keyboard Back/Forward, Escape และ Focus ของชุดเดิมผ่าน |
| R-35 | PASS: รัน Build และ Chrome จริง 62 กลุ่ม ไม่ใช้การอ่าน Source อย่างเดียวแทนผลคลิก |
| R-36 / C-5 | PASS: ตัวเลขผลเป็นรอบใหม่จริง ไม่กล่าวว่าการย้อนหน้าจะย้อนเงินหรือยกเลิกข้อมูลที่บันทึกแล้ว |
| R-37 / R-23 | PASS: ทำเฉพาะคำขอตรวจไป–กลับ ไม่เปลี่ยนธีมหรือสร้าง Asset/เมนูใหม่ ภาพที่เพิ่มมีเฉพาะ Fixture ทดสอบ Gallery |
| ข้อมูล/สิทธิ์ | PASS ตามการตรวจ: ปลายทาง Admin เป็นค่าปิดที่กำหนดและตรวจบทบาท UI; ProtectedRoute/API/Auth เดิมยังบังคับสิทธิ์ Logout แล้ว Back ยังออกจากระบบ |

ข้อจำกัด: ผลนี้ครอบคลุมเส้นทาง/กลุ่ม Control และสถานะที่ระบุ ไม่ใช่การรับรองทุกปุ่มกับข้อมูลทุกแถวหรือทุกจังหวะ Network เมนูที่อยู่หน้าเดิมมีปลายทางถูกต้องแต่ไม่จำเป็นต้องเปลี่ยนหน้า mailto ตรวจ Source ของลิงก์เท่านั้น ไม่เปิดโปรแกรมอีเมลหรือส่งข้อความจริง ปุ่มบันทึก/ยืนยันยังบันทึกข้อมูลจริง การย้อนหน้าไม่ทำ Undo รายการนั้น

ตรวจปิดงาน: check:delivery ผ่าน 147 ไฟล์ข้อความ/3 Lockfiles/Ignore rules; git diff --check ผ่าน; เอกสาร UTF-8 3 ไฟล์/ลิงก์ภายใน 22 จุดผ่าน เปิดเว็บกลับและตรวจ Frontend 5173/Backend 5000 ตอบ HTTP 200 จริง

ไฟล์ที่แก้ในรอบนี้ 8 ไฟล์: client/src/components/RoomTable.tsx, client/src/components/PropertyCard.tsx, client/src/pages/Home.tsx, client/src/pages/PropertyDetails.tsx, client/scripts/ui-smoke.mjs และ docs/{PROJECT_STATUS,WORK_LOG,TEST_RESULTS}.md ไม่แก้ Backend/Schema/Dependencies/.env ไม่ Commit/Push

## รายละเอียดห้อง Admin/User และตาราง วันที่ 19 พฤศจิกายน 2026

ผู้ใช้สั่งทำต่อทั้ง 5 ส่วนตามข้อเสนอหลัง Home โดยคงสีขาว–ฟ้า มุมเล็ก โลโก้ GIF และฟังก์ชันเดิม แนวทางคือรูป/ราคา/สถานะก่อนรายละเอียดรอง, Admin เริ่มจากงานที่ต้องตรวจ และ User เห็นข้อมูลห้องกับบิลของตัวเอง ENERGY 2 / RHYTHM 2 / MOTION 2 ตามแบรนด์เดิม ไม่มี Animation หรือ Asset ใหม่

| ส่วนที่เปลี่ยน | ผลที่ได้ |
|---|---|
| รายละเอียดห้อง | ราคาใกล้ชื่อและสถานะห้อง Gallery ก่อนฟอร์ม และฟอร์มก่อนรายละเอียดรองบนมือถือ ใช้เส้นแบ่งแทนกล่องซ้อน คงการส่งคำขอและทุกสถานะเดิม |
| Admin | คำขอรอดำเนินการเด่นก่อนยอดบิลค้าง/งานซ่อม มี Link ไปหน้าจัดการจริง เก็บจำนวนห้อง/สัญญาและรายรับสุทธิทั้งหมด ไม่เรียกยอดรวมว่าเป็นรายเดือน |
| Sidebar | แบ่งหมวดงาน คง 13 ปลายทาง Admin/9 User ใช้เครื่องหมายเลือกที่มีความหมาย Escape ปิดเมนูและคืน Focus ให้ปุ่ม |
| User | หน้าเดิมแสดงสัญญา ACTIVE ทั้งหมด คำขอที่ API เรียงล่าสุด และบิล ISSUED ที่ครบกำหนดก่อน เมื่อ Due date เท่ากันเลือก ID เก่าก่อน ไม่รวมยอดเอง ไม่แก้ยอดหรือวันครบกำหนด ข้อมูลบัญชีเดิมยังอยู่ |
| ตาราง/ฟอร์ม | คอลัมน์เงินในห้อง สัญญา บิล ชำระเงิน เงินประกัน และรายจ่ายชิดขวา ตัวเลข Tabular ตารางเลื่อนและ Focus ด้วย Keyboard ได้ มีคำแนะนำบนจอแคบ ฟอร์มใช้ส่วนหัว/แถบปุ่มสม่ำเสมอ |

Profile มีการอ่านข้อมูลเพิ่มจาก Endpoint เดิม /api/operations/leases, /api/bookings/my-bookings และ /api/operations/invoices เพื่อแสดงเนื้อหาบนหน้านี้ ใช้ Authentication/Authorization ของ Backend เดิม ไม่เพิ่มสิทธิ์หรือ Endpoint และไม่แทนข้อมูลด้วย Mock

| ตรวจจริงรอบนี้ | ผล |
|---|---|
| Build / TypeScript | npm.cmd --prefix client run build ผ่านหลังแก้การเรียงบิลและ Image attributes สุดท้าย |
| Lint / Format / Syntax | npm.cmd --prefix client run lint และ run format:check ผ่าน; node --check client/scripts/ui-smoke.mjs ผ่าน |
| Unit | npm.cmd --prefix client test ผ่าน 5/5 |
| Browser | npm.cmd --prefix client run test:ui ผ่าน 48 กลุ่ม บน Chrome จริง รวมฐาน 43 กลุ่มและกรณีใหม่ 5 กลุ่ม |
| กรณีใหม่ | User แยก Loading/Network error/Retry/Empty, เมนู User ครบและ Escape คืน Focus, ราคาและฟอร์มอยู่ก่อนรายละเอียดรองที่จอแคบ, User เห็นห้องและบิลจากสัญญาจริง, ยอดเงินชิดขวาและเลื่อนตารางด้วย Keyboard |
| Responsive | ห้องและหน้า User ที่ 320/390/768/1440px; Suite เดิมยังตรวจ Home หลายขนาด, Admin Desktop/390/768px และหน้าปฏิบัติการบนมือถือ ไม่พบ Page overflow ในขนาดที่ทดสอบ |
| ตรวจภาพ | เปิดดู room-detail-390.png, room-detail-1440.png, admin-desktop.png, resident-overview-1440.png, resident-overview-390.png และ invoice-table-mobile.png จริง ภาพเป็นข้อมูล Fixture ไม่ใช่ข้อมูลผู้ใช้จริง |
| ฐานข้อมูล | ใช้ MySQL dormify เดียว Fixture namespace สุ่ม หยุดเว็บปกติและรันทีละชุด Cleanup ยืนยัน Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน db:check หลังจบพบ User 3/หอ 1/ห้อง 8/สัญญา 0/บิล 0 และรายการอื่นเดิม ไม่มี Fixture ค้าง |
| API suite แยก | ไม่รันซ้ำในงาน UI นี้ ผล 50/50 วันที่ 18 พฤศจิกายนยังเป็นหลักฐานเดิม Browser รอบนี้เรียก Backend/MySQL จริงทุก Flow โดยไม่แก้ Backend |
| ส่งงาน | check:delivery ผ่าน 147 ไฟล์ข้อความ/3 Lockfiles/Ignore rules; git diff --check ผ่าน; เอกสาร UTF-8 3 ไฟล์/ลิงก์ภายใน 21 จุดผ่าน; Frontend 5173/Backend 5000 ตอบ HTTP 200 หลังเปิดกลับ ไม่ Commit/Push |

ระหว่างทำพบ Test ดัก Request ที่ React Strict Mode ยกเลิกไปแล้ว จึงข้ามเฉพาะ Invalid InterceptionId ใน Test และรอ Request ที่ยังใช้งานได้; พบวันครบกำหนดบิลสองใบตรงกัน จึงเพิ่ม ID เก่าเป็นลำดับรองของหน้า Profile หลังข้อความทำต่อพบ Docker หยุด จึงเปิด Docker Desktop แบบ Hidden ใช้ Container/Volume เดิม ตรวจจำนวนข้อมูลเดิมก่อนเริ่มใหม่ ไม่ Reset/Seed และไม่เพิ่มฐาน Test/Shadow รอบที่ไม่จบไม่นับว่าผ่าน ผลสำเร็จรอบสุดท้ายเป็น 48 พร้อม Cleanup verified

ผลและ Log อยู่ใน client/.ui-artifacts/results.json และ workspace-ui-20261119.log ที่ Git Ignore ไว้ ไม่ส่งภาพ/Log ส่วนตัวขึ้น Git อัตโนมัติ

### Delivery Gate รอบรายละเอียดห้องและพื้นที่จัดการ

ผลต่อไปนี้จำกัดที่ Source/Flow/ขนาดจอที่ตรวจ ไม่ใช่การรับรองทุกสถานะหรือทุกอุปกรณ์ และไม่ใช้ผลทดสอบเก่ามาอ้างเป็นผลใหม่

| รายการ | สถานะและหลักฐาน |
|---|---|
| R-01 | PASS: ขาว/Soft เดิม ไม่มี Gradient/Glow ใหม่ |
| R-02 | PASS: ข้อความ UI ใหม่ใช้คำไทยตรงงาน ไม่มี Em dash |
| R-03 | PASS ตามขนาดที่ระบุ: Chrome ตรวจ Page scrollWidth ไม่ล้น |
| R-04 | PASS: ไอคอนเดิมสื่อห้อง ผู้พัก วันที่ และเมนู ไม่เพิ่มไอคอนตกแต่ง |
| R-05 | PASS: Gallery/ฟอร์มเช่า, งานรอตรวจ, ข้อมูลห้อง/บิล และตาราง ใช้โครงตามงานต่างกัน |
| R-06 | PASS: ใช้ Noto Sans Thai Local ตามแบรนด์เดิม |
| R-07 | PASS: ไม่เพิ่มพื้นหลัง Grid/Dots |
| R-08 | PASS: ไม่เพิ่มลูกศรบนทุกปุ่ม Link ปลายทางมีข้อความชัด |
| R-09 | PASS: Badge มาจากสถานะจริง ไม่ใช้ข้อความโฆษณาเหนือหัวข้อ |
| R-10 | PASS: ส่วนใหม่ไม่ใช้ Glassmorphism |
| R-11 | PASS: เก็บ Radius กลาง 6/8px Gallery placeholder ลดเหลือ 8px |
| R-12 | PASS: ไม่เพิ่มเงาลอย การเลือกเมนูใช้เครื่องหมายด้านในเพื่อระบุหน้าปัจจุบัน |
| R-13 | PASS: ไม่เพิ่ม Glow/Pulse |
| R-14 | PASS: ข้อมูลห้องเป็นคู่ชื่อ/ค่า งานรอตรวจเด่นกว่ายอดประกอบ ไม่สร้าง Card เท่ากันทุกส่วน |
| R-15 | PASS: ตรวจสอบคำขอ/ดูใบแจ้งหนี้/ดูงานแจ้งซ่อม/ไปหน้าชำระเงิน ระบุงานและมี Route จริง |
| R-16 | PASS: ใช้คำขอ สัญญา บิล และสถานะจริง ไม่เพิ่มข้อความอวดความสามารถ |
| R-17 | PASS: ตัวเลขมาจาก API เดิม ไม่มีสถิติแต่ง ค่าไม่พร้อมแสดง Loading/Error |
| R-18 | PASS: ไม่เพิ่มรีวิว/บุคคลสมมติในเว็บจริง Fixture แยกเฉพาะการทดสอบ |
| R-19 | PASS ตามขอบเขต: ไม่มี Animation ใหม่ GIF เดิมนอกส่วนที่แก้ยังคงตามคำสั่งผู้ใช้ |
| R-20 | PASS ตามแนวทาง: จัดจุดเน้นตามงานเช่าทั้งห้อง ตรวจคำขอ และบิลของผู้พัก ไม่เพิ่มกราฟเพื่อเติมพื้นที่ |
| R-21 | PASS: คง Light Theme |
| R-22 | PASS: ใช้ Gallery จาก Backend ไม่มีภาพตกแต่งใหม่ |
| R-23 | PASS: จัดหมวด Navigation ตามงานที่ผู้ใช้อนุมัติ ไม่เพิ่มปลายทางหรือ Asset |
| R-24 | PASS: Browser ตรวจ 13 เมนู Admin/9 User ครบ Routes เดิมไม่เปลี่ยน |
| R-25 | PASS เฉพาะคู่ที่ตรวจ: Ink/Stripe 14.37, Muted/Stripe 4.58, Brand/Soft 4.60, Muted/White 4.76, Navy/Soft 15.59 ต่อ 1 คำนวณสูตร WCAG จริง |
| R-26 | PASS ตาม Flow: Chrome 48 กลุ่มรวมเช่า ฟอร์ม ปุ่มยืนยัน CSV และงานการเงินเดิม |
| R-27 | PASS ตามกรณีใหม่: ดัก Request ทดสอบ Loading/Failure/Retry/Empty ของบิล และข้อมูลสัญญาจริง ไม่มีข้อความว่าไม่มียอดระหว่างที่โหลดล้มเหลว |
| R-28 | PASS: ไม่เพิ่ม FAQ |
| R-29 | PASS: Palette เดิม สีสถานะเดิม ไม่เพิ่มสีแกนใหม่ |
| R-30 | PASS ตาม Source/ภาพ: ใช้ DORMIFY เดิม ไม่คัดลอกหน้าเว็บผลิตภัณฑ์อื่น |
| R-31 | PASS: เหตุผลจัดลำดับ Gallery/ราคา/คำขอ/บิลและลดกล่องระบุไว้ด้านบน |
| R-32 | PASS เฉพาะการตรวจจริง: Escape คืน Focus, Enter เปิดตัวกรองเดิม, ArrowRight เลื่อนตาราง และ Focus outline ยังชัด |
| R-33 | PASS: แก้ Source โดยตรง ไม่เพิ่ม Script ฉีด UI ในเว็บจริง |
| R-34 | PASS: Light Theme เดียว ไม่เพิ่ม Toggle ที่ทำงานไม่ครบ |
| R-35 | PASS ตาม Flow ที่ระบุ: Build ผ่าน เปิด Chrome จริง เดินงาน API จริงและดูภาพใหม่ 6 ภาพ |
| R-36 | PASS: ไม่อ้างคะแนน Performance/ความปลอดภัยหรือความชอบผู้ใช้ที่ไม่ได้วัด |
| R-37 | PASS: ผู้ใช้สั่งทำตามแนวทางทั้ง 5 ส่วนและให้คงสี/มุมเล็กก่อนเริ่ม |
| R-38 | PASS: เนื้อหามาจาก Backend จริง ไม่เพิ่มระบบหรือข้อมูลหลอก |
| R-39 | PASS ตาม Control ที่แก้: Toggle มีชื่อ/ARIA, Gallery มี Alt, ตาราง Native และ Region Focus ได้, Label/Disabled/Focus เดิมคงอยู่ ไม่เพิ่ม Motion |
| R-40 | PASS เฉพาะ Source/ภาพ: Gallery มี Dimensions/Aspect ratio/fetchPriority high ไม่รายงาน Lighthouse/Core Web Vitals |
| Liveliness | PASS ตามแนวทาง 2/2/2: จุดเน้นต่างกันตามงาน ใช้ช่องว่างกับเส้นแบ่ง แบรนด์ขาว–ฟ้าและตัวอักษรไทยเดิม |
| C-1 | PASS: ทุกการเปลี่ยนหลักมีเหตุผลด้านลำดับงานและการอ่าน |
| C-2 | PASS ตาม Flow ที่ตรวจ: Link/ปุ่มมีพฤติกรรมจริง ไม่มี Control หลอกใหม่ |
| C-3 | PASS: ส่วนใหม่ใช้ข้อมูลห้อง คำขอ และบิลที่ผู้ใช้ต้องตรวจ |
| C-4 | PASS ตามขนาด/กรณีที่ระบุ ไม่รับรองสถานะหรืออุปกรณ์ที่ไม่ได้ทดสอบ |
| C-5 | PASS: ไม่เพิ่มตัวเลข ชื่อบุคคล หรือข้อกล่าวอ้างแต่งในเว็บจริง |

ไฟล์ที่แก้ในรอบนี้รวม 18 ไฟล์:

- หน้า: client/src/pages/PropertyDetails.tsx, AdminOverview.tsx, Profile.tsx, MyBookings.tsx, Invoices.tsx, Payments.tsx, Leases.tsx, Reports.tsx
- Component: client/src/components/PropertyGallery.tsx, Layout.tsx, OperationUI.tsx, RoomTable.tsx
- ส่วนกลาง: client/src/config/navigation.ts, client/src/index.css
- ทดสอบ: client/scripts/ui-smoke.mjs
- บันทึก: docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/TEST_RESULTS.md

ข้อจำกัด: การแก้ข้อมูลส่วนตัวยังไม่เปิดเช่นเดิม หน้าสรุป User แสดงบิลหนึ่งใบที่ครบกำหนดก่อน มี Link ดูบิลทั้งหมด ไม่ใช่ยอดรวมทุกบิล ไม่ย้าย Schema หรือแก้ Startup error เมื่อเปิดพอร์ตซ้ำที่เคยบันทึกในงาน Home

## Home และมุมโค้ง วันที่ 19 พฤศจิกายน 2026

คำขอ: ลดความรู้สึกเว็บสำเร็จรูปตามข้อเสนอ โดยเริ่ม Home ก่อน และลดมุมโค้ง คงสีขาว–ฟ้า หัวข้อหลัก โลโก้ กรอบ GIF และฟังก์ชันเดิม ใช้ antislop โหมด during ตามที่ผู้ใช้เลือกไว้

แนวทาง: เว็บหอพักที่ให้ผู้ใช้เทียบห้อง ราคา และสถานะจริงได้เร็ว ใช้ Noto Sans Thai เดิม; ENERGY 2 / RHYTHM 2 / MOTION 2 โดยไม่มี Animation ใหม่ GIF เป็น Asset เดิมที่ผู้ใช้กำหนดให้คงไว้ และยังใช้ภาพนิ่งเมื่อ Reduced Motion

เปลี่ยน Home, HeroVisual, PropertyCard, FilterSidebar และ index.css: ลดพื้นที่ Hero ย้ายสรุปห้องว่าง/ค่าเช่าไปหัวข้อห้องพัก วางราคาใกล้เลขห้อง ใช้ภาพสัดส่วน 16:10 ตัวกรองเป็นแถบและยุบได้บนมือถือ ลดกรอบซ้อนในข้อมูลหอ/ติดต่อ มุม Surface/Dialog 8px, ปุ่ม/Input/Navigation 6px และ Badge 4px ยกเลิกเงาปุ่มหลัก ส่วน Component ที่ระบุ Tailwind Radius แยกไว้ยังใช้ค่าของตัวเอง ไม่อ้างว่าลดทุกมุมของทั้งเว็บเป็น 8px

| ตรวจจริงรอบนี้ | ผล |
|---|---|
| Build และ TypeScript | npm.cmd --prefix client run build ผ่านหลังปรับ Spacing สุดท้าย |
| Lint / Format / Syntax | npm.cmd --prefix client run lint และ run format:check ผ่าน; node --check client/scripts/ui-smoke.mjs ผ่าน |
| Unit | npm.cmd --prefix client test ผ่าน 5/5 |
| Browser | Chrome 43 กลุ่มผ่าน เพิ่มตรวจราคาห้องอยู่ในจอแรกที่ 1440×1000, มุมโค้ง, การเปิดตัวกรองด้วย Enter/กรองงบ/ล้างค่า และ Layout ที่ 320/390/768/1024px |
| ข้อมูล | MySQL dormify 8.4.13 ฐานเดียว Fixture namespace สุ่ม Cleanup ตรวจ Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ไม่ Reset/Seed/เพิ่มฐาน |
| ตรวจภาพ | เปิดดู public-desktop.png, home-390.png และ home-768.png จริง เห็นราคาในจอแรก Desktop และกรอบ GIF แนวนอนบนมือถือ ไม่อ้างว่ามือถือเห็นราคาทุกห้องโดยไม่เลื่อน |
| API suite แยก | ไม่รันซ้ำในงาน UI นี้ เพราะไม่แก้ Backend/API/Schema; 50/50 เป็นผลวันที่ 18 พฤศจิกายน Browser รอบนี้เรียก Backend/MySQL จริง |

ข้อผิดพลาดระหว่างทำ: Browser ครั้งแรกหยุดที่การเปิดตัวกรองด้วย Enter พบคำสั่ง DevTools ยังไม่ส่ง Enter text จึงเพิ่ม Page.bringToFront และส่ง Input ครบแล้วเปิดได้จริงโดยไม่แก้ Logic ปุ่มเพื่อให้ Test ผ่าน ทุกรอบ Cleanup ผ่าน พบเซิร์ฟเวอร์ปกติเปิดค้างหลังเครื่องมือเช็กพอร์ตใน Sandbox ไม่แสดงผล จึงตรวจพอร์ตนอก Sandbox, หยุดเฉพาะ Process ของ DORMIFY และตรวจว่าพอร์ตว่างก่อนรันชุดสุดท้าย ผ่าน 43 กลุ่ม โดยไม่รัน Fixture สองชุดพร้อมกัน

ข้อค้นพบที่ไม่แก้ในงานนี้: npm start ซ้ำขณะพอร์ตถูกใช้งานทำให้ Vite แจ้ง Port in use และ Backend callback อ้าง server.address().port ขณะ address เป็น null การแก้ Startup error เป็นงาน Backend แยก ไม่เกี่ยวกับ Layout ปัจจุบัน

### Delivery Gate เฉพาะส่วนที่เปลี่ยน

Gate นี้ครอบคลุม Source, Build, Chrome และภาพที่ระบุ ไม่ใช่การรับรองทุกหน้า/ทุกสถานะของทั้งระบบ หรือรับรองว่าผู้ใช้จะชอบดีไซน์ ไม่มีการวัด Lighthouse/Core Web Vitals ในรอบนี้

| รายการ | ผลและหลักฐาน |
|---|---|
| R-01 | PASS: พื้นขาว/Soft เดิม ไม่เพิ่ม Gradient หรือ Glow |
| R-02 | PASS: ข้อความ UI ที่เขียนใหม่ใช้คำไทยตรงงาน ไม่มี Em dash |
| R-03 | PASS: ตรวจ scrollWidth ที่ 320/390/768/1024px ไม่ล้น |
| R-04 | PASS: ไอคอนเดิมสื่อเตียง/จำนวนผู้พัก/ประเภทห้อง/ค้นหา/ติดต่อ ไม่เพิ่มไอคอนตกแต่ง |
| R-05 | PASS: รายการห้องใช้ภาพและราคา ข้อมูลหอใช้คอลัมน์ ติดต่อใช้ข้อความ ไม่ครอบทุกส่วนด้วย Card |
| R-06 | PASS: Noto Sans Thai Local ตามแบรนด์เดิม ไม่เพิ่ม Font |
| R-07 | PASS: ไม่เพิ่มพื้นหลัง Grid/Dots |
| R-08 | PASS: เก็บลูกศรเฉพาะปุ่มไปเลือกห้องเดิม ไม่เพิ่มลูกศรทุก Link |
| R-09 | PASS: ชื่อหอเป็นข้อความธรรมดา Badge ห้องว่างใช้สถานะจริง |
| R-10 | PASS: ส่วนที่แก้ไม่ใช้ Glassmorphism |
| R-11 | PASS: Surface 8px / Controls 6px / Badge 4px ตรวจ Computed radius ใน Chrome |
| R-12 | PASS: Hero/Room cards ไม่มีเงาลอย เอาเงาปุ่มหลักออก |
| R-13 | PASS: ไม่เพิ่ม Glow/Pulse |
| R-14 | PASS: ห้องใช้รูปแบบเดียวเพื่อเทียบราคาและสถานะ ส่วนข้อมูลหอไม่ใช้ Feature cards ซ้ำ |
| R-15 | PASS: ปุ่มเลือกดูห้องพัก/ติดต่อหอพัก/ดูรายละเอียดระบุปลายทาง |
| R-16 | PASS: ลดข้อความรองซ้ำ ใช้ข้อมูลการส่งคำขอและทำสัญญาตามระบบ |
| R-17 | PASS: จำนวนห้อง/ค่าเช่ามาจาก DormitoryContext/API ไม่มีตัวเลขแต่ง |
| R-18 | PASS: ไม่มีรีวิว/บุคคลสมมติใหม่ |
| R-19 | PASS ตามขอบเขต: ไม่มี Animation ใหม่ เก็บ GIF ตามคำสั่งผู้ใช้และภาพนิ่ง Reduced Motion |
| R-20 | PASS ตามแนวทาง: เลขห้อง ราคา ประเภทห้อง สถานะ และเงื่อนไขทำสัญญาเป็นข้อมูลหลักของหน้าหอพัก |
| R-21 | PASS: คง Light Theme ตามคำสั่ง |
| R-22 | PASS: ใช้โลโก้/GIF ที่ผู้ใช้เลือก ไม่มีภาพตกแต่งใหม่ |
| R-23 | PASS: ไม่สร้าง Asset/Navigation/ข้อมูลใหม่ ช่องภาพว่างระบุว่ายังไม่มีรูปจริง |
| R-24 | PASS: href #rooms/#contact และ /rooms/:id ยังมีเป้าหมายจริง ไม่แก้ Routes |
| R-25 | PASS เฉพาะคู่สีที่ใช้: Ink/White 14.93, Navy/White 16.42, Muted/White 4.76, Muted/Soft 4.52, Brand/White 4.84, Brand/Soft 4.60 ต่อ 1 คำนวณสูตร WCAG จริง |
| R-26 | PASS: Browser เปิดตัวกรอง กรองงบ ล้างค่า ค้นหาและเลือกสถานะได้ รวม Flow เช่า/การเงินเดิม |
| R-27 | PASS เฉพาะ Source ที่แก้: เก็บ Loading/Error/Empty/ไม่พบตามตัวกรอง ไม่แทนความล้มเหลวด้วยตัวเลขสมมติ |
| R-28 | PASS: ไม่เพิ่ม FAQ |
| R-29 | PASS: คง Palette ขาว–ฟ้าเดิม สีสถานะเดิมแยกความหมาย |
| R-30 | PASS ตามการตรวจ Source/ภาพ: ใช้แบรนด์ DORMIFY เดิม ไม่มีการนำหน้าเว็บผลิตภัณฑ์อื่นมาคัดลอก |
| R-31 | PASS: ลดความสูงเพื่อเห็นราคา ลดกรอบเพื่ออ่านเนื้อหา มุมเล็กลงตามคำสั่ง รูปแบบห้องเหมือนกันเพื่อเปรียบเทียบ |
| R-32 | PASS เฉพาะที่ทดสอบ: Enter เปิดตัวกรองได้จริง Focus ชัด และ Suite เดิมตรวจ Keyboard focus |
| R-33 | PASS: เปลี่ยน Source โดยตรง ไม่เพิ่ม Script ฉีด Layout/CSS ในหน้าเว็บจริง |
| R-34 | PASS: มี Light Theme เดียว ไม่เพิ่ม Toggle ที่ทำงานไม่ครบ |
| R-35 | PASS ตามขอบเขต: Build ผ่าน Chrome 43 กลุ่มและตรวจภาพจริง การทดสอบเดิมยังเดิน Flow เช่า/สัญญา/บิล/น้ำไฟ/เงินประกัน/คืนเงิน/ซ่อม |
| R-36 | PASS: ไม่แต่งคำกล่าวเรื่องความปลอดภัย ความเร็ว สถิติ หรือผลรับรองจากผู้ใช้ |
| R-37 | PASS: ผู้ใช้อนุมัติแนวทาง Home ก่อนและสั่งลดมุมโค้ง คง Brand guidance เดิม |
| R-38 | PASS: ไม่เพิ่ม Mock data แทน Backend; Fixture มีเฉพาะการทดสอบและ Cleanup |
| R-39 | PASS ตามขอบเขต: ปุ่ม Native มีชื่อ/aria-expanded/aria-controls, Link/ปุ่มสูงอย่างน้อย 44px, Focus และ Labels เดิม; GIF เป็นข้อยกเว้นที่คงตามคำสั่งผู้ใช้ ไม่เพิ่ม Motion ใหม่ |
| R-40 | PASS เฉพาะ Source: Hero มี width/height และ fetchPriority=high ภาพห้องมี Aspect ratio ไม่อ้างคะแนน Performance |
| Liveliness | PASS ตามแนวทาง: Dials 2/2/2; หัวข้อและปุ่มหลักเป็นจุดเน้นก่อนเลือกรูป/ราคาห้อง; ขาว–ฟ้า/ปลาโลมาเป็นเอกลักษณ์เดิม; เส้นแบ่งกับช่องว่างแยกงานอ่านแต่ละส่วน |
| C-1 | PASS: เหตุผลการจัดลำดับ/มุมโค้ง/รูปแบบอยู่ในคำอธิบายด้านบน |
| C-2 | PASS ตาม Flow ที่รัน: ไม่มี Control ใหม่ที่ไม่ทำงาน |
| C-3 | PASS: ส่วนห้อง ข้อมูลอยู่อาศัย และติดต่อใช้เนื้อหาของหอจริง |
| C-4 | PASS ตามขนาดและ Flow ที่ระบุ: Chrome ไม่พบ Overflow/Exception; ไม่รับรองทุกอุปกรณ์หรือทุกสถานะที่ไม่ได้ทดสอบ |
| C-5 | PASS: ใช้ข้อมูล API จริง ไม่เพิ่มตัวเลขหรือรีวิวแต่ง |

ไฟล์ของงานนี้ 9 ไฟล์: client/src/pages/Home.tsx, client/src/components/HeroVisual.tsx, client/src/components/PropertyCard.tsx, client/src/components/FilterSidebar.tsx, client/src/index.css, client/scripts/ui-smoke.mjs และ docs/{PROJECT_STATUS,WORK_LOG,TEST_RESULTS}.md ไม่มีการเปลี่ยนแพ็กเกจ/วิธีติดตั้ง/Backend/Schema ในงานนี้

## Code Audit — ชุด W1–W6 วันที่ 18 พฤศจิกายน 2026

ทำเฉพาะชุดเก็บกวาดที่เสนอแล้วผู้ใช้สั่งเริ่ม ไม่เปลี่ยน Schema, Endpoint, Authentication หรือกติกาการเงิน

| รายการ | ผลตรวจจริงรอบนี้ |
|---|---|
| W1–W3: Import/ฟังก์ชัน Backend ที่ไม่ได้ใช้ | ลบ randomUUID และ bangkokToday เฉพาะ billingRoutes, Prisma เฉพาะ meterRoutes, choice เฉพาะ operationsRoutes; node --check ผ่าน และ ESLint Unused/Unreachable ใน 3 ไฟล์พบ 0 |
| W4: eslint-plugin-react-refresh | npm uninstall --save-dev --ignore-scripts --offline --no-audit --no-fund ผ่าน เอาแพ็กเกจและรายการ Lockfile ออก โดย react-refresh ของ Vite ยังอยู่ ตรวจด้วย npm ls แล้ว |
| W5: หน้า Admin ข่าวสาร | Chrome Network ยืนยันโหลด /history/announcements และไม่โหลด /history/notifications; User ยังโหลดประวัติแจ้งเตือนและทำเครื่องหมายว่าอ่านแล้วได้ |
| W6: หน้าประวัติชำระเงิน | Chrome แสดงรายการยืนยันแล้วจาก /payments โดยไม่เรียก /invoices, /leases, /deposits; หน้าชำระเงินจริงยังเรียกทั้ง 4 API ส่งโอน แนบหลักฐาน และ Admin ยืนยันได้ |
| Build/TypeScript/Lint/Format | ผ่านทั้งหมดด้วย npm --prefix client run build, run lint และ run format:check |
| Unit | npm --prefix client test ผ่าน 5/5 |
| API | npm --prefix server test ผ่าน 50/50 บน MySQL dormify เดียว |
| Browser | npm --prefix client run test:ui ผ่าน Chrome 40 กลุ่ม รวมกรณี Network ข้างต้น, Responsive, สิทธิ์, เช่า, สัญญา, บิล, มิเตอร์, เงินประกัน, คืนเงิน, ซ่อม และข่าวสาร |
| ข้อมูลเดิม | API และ Browser รันตามลำดับ Fixture Cleanup ยืนยัน Hash ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ไม่ Reset/Seed/เพิ่มฐาน |
| เอกสาร/ส่งงาน | check:delivery ผ่าน 147 ไฟล์ข้อความและ 3 Lockfiles; เอกสารที่แก้ UTF-8 3 ไฟล์/ลิงก์ภายใน 19 จุดผ่าน; git diff --check ผ่าน |

ข้อจำกัดสภาพแวดล้อม: Browser รอบแรกใน Sandbox หยุดที่ DevTools timeout: Page.enable ก่อนตรวจหน้าเว็บ Cleanup ผ่าน แล้วรันคำสั่งเดิมนอก Sandbox จึงผ่าน 40 กลุ่ม ผลรอบแรกไม่ถือว่าทดสอบ UI สำเร็จ Artifacts ของรอบที่ผ่านอยู่ใน client/.ui-artifacts/results.json และภาพหน้าจอในโฟลเดอร์เดียวกัน ซึ่ง Git Ignore ไว้

ไฟล์ที่แก้ในงานนี้ (รวม 12 ไฟล์):

- Backend: server/src/routes/billingRoutes.js, server/src/routes/meterRoutes.js, server/src/routes/operationsRoutes.js
- Frontend: client/src/hooks/useHistoryResource.ts, client/src/pages/News.tsx, client/src/pages/Payments.tsx
- แพ็กเกจ: client/package.json, client/package-lock.json
- ทดสอบ: client/scripts/ui-smoke.mjs
- บันทึก: docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/TEST_RESULTS.md

งานจาก Audit ที่ยังไม่ได้ทำ: W7 CSS .fade-in/Reduced-motion fixture, W8 สีขอบ CSS ซ้ำ, W9 PropertyCard fallback; S1 Options overfetch, S2 Helper ซ้ำ/ลำดับ Lock, S3 Endpoint ประวัติเดิมที่ยังมี Tests/อาจมีผู้ใช้ภายนอก, S4 Home useMemo, S5 จำนวน Query ใน Auto-billing, S6 Legacy Payment/Complaint/hasMess และ S7 ความหมาย Promise ของ History refresh การเก็บรายการนี้ไม่ใช่การอนุมัติให้ลบหรือเปลี่ยน Business logic

Gate เฉพาะงานเก็บกวาด: ฟังก์ชันเดิมและสถานะ Loading/Error ยังทำงานจาก Browser/API ที่รันจริง ไม่มีการเพิ่ม Layout/Control/Asset ใหม่ สี โลโก้ และ GIF คงเดิม ไม่ใช้ผลนี้รับรองทั้งระบบพร้อมใช้จริงหรือทดแทนการตรวจรับของเจ้าของหอและครู

## UI ใหม่ด้วยทั้ง 6 Skills

รอบถัดจากงาน CSS ผู้ใช้สั่งปรับ UI ใหม่โดยใช้ทั้ง 6 Skills ยังคง Palette ขาว/ฟ้าเดิม โลโก้ GIF หัวข้อหลัก Routes และ Business logic เดิม ไม่สร้าง Asset หรือฟีเจอร์เพิ่ม

Reading this as: Thai single-dormitory website and resident/admin workspace, with the existing white and sky-blue DORMIFY identity, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

| Skill | สิ่งที่นำมาใช้และเหตุผล |
|---|---|
| antislop | จัดลำดับข้อมูลตามงานเลือกห้อง/ทำรายการ ลดกริดและ Glow ที่ไม่สื่อข้อมูล ใช้สีเดิมตาม Brand direction |
| antislop-ui | Hero พื้น Soft เดิมแบบเรียบ กรอบแบรนด์เด่นจุดเดียว Room cards รูป 4:3 และราคา ส่วนสิ่งอำนวยความสะดวกไม่ทำกล่องซ้อน Sidebar แยกพื้นที่และ Metrics เป็นแถวอ่านเทียบกัน |
| antislop-human | รักษา Focus/Native controls/Labels/Empty-Loading-Error ขอบควบคุมชัด ตรวจ Contrast จริง ไม่ย้ายสิทธิ์มาไว้ใน UI |
| antislop-layoutmobile | Cards และ Metrics วางซ้อนเมื่อจอแคบ Sidebar ยุบได้ดังเดิม เส้นแบ่งคอลัมน์เปลี่ยนเป็นแนวนอนบนมือถือ ตรวจ 390px และ Tablet |
| antislop-copywriting | H2 ห้องพักและค่าเช่า/สอบถามรายละเอียดการเข้าอยู่ตรงกับเนื้อหาเดิม ไม่แต่งชื่อหอ ราคา สถิติ หรือรีวิว เก็บหัวข้อหลักที่ผู้ใช้ยืนยัน |
| antislop-code | ย่อคอมเมนต์ PropertyCard ให้ระบุข้อจำกัดชื่อไฟล์เก่าในบรรทัดเดียว รักษาเหตุผลที่มีประโยชน์ ไม่ใช้สกิลนี้แก้ Executable code ส่วน Layout markup เป็นงาน antislop-ui แยกจากการตรวจคอมเมนต์ |

เหตุผล R-31: ขาว/ฟ้าและ Noto Sans Thai Local เป็นแบรนด์เดิม; Hero graphic คือโลโก้ที่ผู้ใช้เลือก; เงาเฉพาะกรอบแบรนด์/Auth/สถานะเลือกช่วยแยกบริบท; Card รูป/ประเภท/ราคาเพื่อเปรียบเทียบห้อง; ไอคอนห้อง/ที่ตั้ง/ค้นหาสื่อข้อมูลเดิม; ไม่เพิ่ม Motion และเก็บ GIF ที่ผู้ใช้สั่งไว้ ไม่สร้างปุ่มหรือ Assets ใหม่

### Delivery Gate ของ UI รอบใหม่

- R-02/R-15/R-16 PASS: หัวข้อย่อยใหม่บอกเนื้อหาและการกระทำ ไม่มี Em dash หรือ Buzzword ในข้อความที่เขียนใหม่ หัวข้อหลักเดิมไม่เปลี่ยน
- R-03 PASS: Chrome Public/User/Admin 390px และ Tablet ไม่เกิด Page overflow; Cards/Metrics ปรับเรียงแนวตั้งตามหน้าจอ
- R-17/R-18/R-36/R-38 PASS: ไม่มีตัวเลข/ข้อมูล/คำรับรอง/รีวิวใหม่ ข้อมูลห้อง/รายงานมาจาก Backend เดิม
- R-23/R-37 PASS: ใช้คำสั่งสี/โลโก้/GIF/หัวข้อเดิมเป็น Direction ไม่มี Asset ใหม่ ไม่เปลี่ยนชื่อหอในฐาน
- R-24/R-26 PASS: Click-through 39 กลุ่มตรวจเมนูมือถือ เปิดห้อง สมัคร/เข้า/ออกระบบ ส่งคำขอ Confirm dialog และการจัดการจริง ไม่มีเมนูหรือ Action เพิ่ม
- R-25 PASS: contrast-check.py รอบนี้ตรวจ Primary/Soft 4.60:1 และ Muted/Soft 4.52:1; Token ข้อความ/สีสถานะและขอบ Field ที่ผ่านรอบก่อนคงเดิม
- R-27/R-32 PASS: Flow ทดสอบมี Empty invoice, Loading/Request pending, Login error, Keyboard focus และ Reduced motion ไม่เอา Outline/สถานะเดิมออก
- R-33 PASS: แก้ไฟล์ React/CSS ตรงจุด ไม่สร้าง Patch script เพื่อ Rewrite UI
- R-34/R-35 PASS: ธีม Light เดิม Build/TypeScript/Lint/Format ผ่าน Chrome 39 กลุ่มผ่าน และไม่มี Unexpected browser exceptions ดู Click-through ในส่วนก่อนหน้า ซึ่งรันทวนในรอบนี้ด้วยชุดเดิม
- R-39 ตรวจขอบเขต: ไม่เปลี่ยน Native controls/ชื่อ Accessible/Focus คงระบบเดิม GIF และกรอบตามข้อกำหนดผู้ใช้ ไม่มีการสร้าง Interaction ใหม่ ไม่อ้างว่าทดสอบด้วยโปรแกรมอ่านหน้าจอหรืออุปกรณ์จริงครบทุกกรณี
- R-40 ตรวจขอบเขต: พื้นที่ภาพ Card จองด้วย Aspect ratio 4:3 และ Lazy เฉพาะรูปห้องใต้ Hero ไม่เพิ่ม Script ภายนอก/สื่อใหม่ Hero เดิมไม่ Lazy ไม่รายงาน Lighthouse/Web Vitals ที่ไม่ได้วัด
- Purpose-Gate PASS: ไม่มีลายกริด/Glow ตกแต่งใหม่ เงา/เส้นแบ่ง/สี/ภาพ/ไอคอนมีเหตุผลในตาราง คง Action arrow เดิมเฉพาะการนำทาง ไม่เพิ่มบนทุกปุ่ม
- Liveliness/Quality Locks/C-1 ถึง C-5 PASS ในขอบเขต: แบรนด์เดิมเป็นจุดจำ พื้นที่ Public กับ Workspace ทำหน้าที่ต่างกัน ไม่จัดทุกส่วนเป็น Card เท่ากัน ฟังก์ชันเดิมผ่าน Flow และไม่แต่งข้อมูล

ผลตรวจจริง: Build รวม TypeScript, Lint และ Format ผ่าน; Browser 39 กลุ่มผ่าน Fixture cleanup ข้อมูลเดิมครบ 30 Models ไม่เปลี่ยน ตรวจภาพ Public Desktop/Mobile และ Admin Desktop ด้วยตาแล้ว รูปใน client/.ui-artifacts เป็น Fixture ไม่ใช่ข้อมูลผู้เช่าจริง ไม่รัน API suite/Unit ใหม่เพราะไม่ได้เปลี่ยน Business logic

ไฟล์แอป: Home.tsx, PropertyCard.tsx, Layout.tsx, AdminOverview.tsx, AuthFrame.tsx, HeroVisual.tsx และ index.css ไม่มีการแก้ Backend/Schema/API/Dependencies

## UI ด้วย antislop during, รอบก่อนที่ปรับเฉพาะ CSS

คำสั่งล่าสุดให้แก้เฉพาะ UI ไม่เพิ่มอะไร และเก็บสี/หัวข้อ/ข้อความ/โลโก้/GIF เดิม ขอบเขตโค้ดรอบนี้คือ client/src/index.css เท่านั้น ไม่มี DESIGN.md หรือ Component/ฟีเจอร์ใหม่

Reading this as: existing Thai dormitory UI with the owner's white and sky-blue identity, dial ENERGY 2 / RHYTHM 1 / MOTION 2. คงความเป็นมิตรจากโลโก้เดิม ลำดับเนื้อหาเดิม และ GIF เดิมตามคำสั่งคืนหน้า ไม่เพิ่ม Animation หรือส่วนควบคุมใหม่

| การปรับ | เหตุผลตาม R-31 |
|---|---|
| ลดเงา Surface | ให้เนื้อหากับแบบฟอร์มเด่นกว่าการยกกล่องทุกชิ้น |
| ขอบ Field/Outline/Icon button ใช้ Muted เดิม | มองเห็นขอบควบคุมชัดโดยไม่เพิ่มสีใหม่ |
| เมนูสูงอย่างน้อย 44px | เพิ่มพื้นที่กดใน Navigation โดยไม่เปลี่ยนปลายทาง |
| Pointer/Disabled/Active states | สื่อว่าชิ้นไหนกดได้ กำลังกด หรือใช้ไม่ได้ |
| หัวตารางเข้มและตัวเลข Tabular | แยกหัวตารางและเทียบจำนวนเงินได้ง่าย |
| ข้อความยาว/ฟอร์มมือถือ/Dialog | ตัดคำ ฟอนต์มือถือ 16px และเลื่อน Dialog ภายในจอได้ |
| Static chips ไม่มี Hover หลอก | สิ่งอำนวยความสะดวกที่ไม่ใช่ปุ่มไม่ควรทำท่าเหมือนกดได้ |

### Delivery Gate ในขอบเขต CSS ที่แก้

- R-02 PASS: ไม่เขียน/เปลี่ยนข้อความ UI หัวข้อและคำอธิบายเดิมอยู่ครบ
- R-03 PASS: Chrome ตรวจ Public/User/Admin บน 390px และ Tablet โดยไม่เกิด Page overflow; Nav link min-height 44px และ Field 48px จาก CSS
- R-17/R-18/R-36/R-38 PASS: ไม่มีข้อมูล สถิติ รีวิว รูป หรือคำกล่าวอ้างใหม่ ใช้ Backend จริงใน Flow เดิม
- R-23/R-37 PASS: ใช้ทิศทางแบรนด์ที่ผู้ใช้ยืนยันและ during ที่เลือก ไม่สร้าง Asset หรือเปลี่ยนหัวข้อ/โครงหน้า
- R-24/R-26 PASS: เมนู/ตัวกรอง/แบบฟอร์ม/Dialog/CSV ใช้ Action เดิม Click-through ด้านล่างผ่าน ไม่เพิ่มปุ่มลอยหรือ Link ว่าง
- R-25 PASS: ใช้ contrast-check.py ของ antislop-human; Muted #64748B ต่อ White = 4.76:1, ต่อ Soft #F3FAFF = 4.52:1; Primary #0769F4 ต่อ White = 4.84:1, ต่อ Soft = 4.60:1; Text #122747 ต่อ Soft = 14.17:1 ขอบควบคุม/โฟกัสเกิน 3:1 สถานะ Disabled ไม่ใช้เป็นคำรับรอง Contrast ของข้อความปกติ
- R-27/R-32 PASS: ทดสอบ Empty invoice, Loading/คำขอค้าง, Error/Login ผิด และ Keyboard focus ที่มองเห็นได้; ไม่มีการเอา Outline เดิมออก
- R-33 PASS: แก้ CSS โดยตรงด้วย apply_patch ไม่มี Patch script เพิ่มในโปรเจกต์
- R-34/R-35 PASS: ธีม Light เดิม Build รวม TypeScript ผ่าน Lint/Format ผ่าน Chrome 39 กลุ่ม และไม่มี Unexpected browser exceptions
- R-39 PASS เฉพาะ Affordance ที่แก้: Pointer/Disabled/Active styles อยู่ใน CSS กลาง Native controls/ชื่อ Accessible เดิมไม่ถูกเปลี่ยน
- R-40 ตรวจขอบเขต: ไม่สร้าง/แก้ Image/Video/Iframe หรือ Script โหลดหน้า ไม่รายงาน Lighthouse/Web Vitals ที่ไม่ได้วัด
- Purpose-Gate และ Quality Locks PASS ในส่วนที่เปลี่ยน: ไม่เพิ่ม Palette, Typography, Layout, Icon, Badge, Illustration หรือ Motion; เงา/Spacing/States มีเหตุผลในตาราง ไม่เพิ่มรูปแบบสำเร็จรูป
- Liveliness/C-1 ถึง C-5 PASS ในขอบเขต: คงอัตลักษณ์เดิม เน้นอ่านและทำรายการ ฟังก์ชันเดิมผ่าน Flow ทดสอบ ข้อมูลมีแหล่งจริง

นี่เป็น Gate ของการปรับ CSS ไม่ใช่คำรับรองว่าแก้ประเด็น Accessibility ทุกข้อของทุกหน้าหรือวัดบนโทรศัพท์จริงแล้ว การคง Hero/Grid/GIF และข้อความเดิมเป็นข้อกำหนดผู้ใช้ ไม่ใช้สกิลเป็นเหตุเปลี่ยนงานเหล่านั้นอีก

### หลักฐาน Click-through รอบ CSS

| การกระทำผ่าน Chrome | ผลจริง |
|---|---|
| Public ค้นหา/กรองห้อง, เมนูมือถือ | ห้องจาก API เปลี่ยนตามตัวกรอง เมนูเปิด/ปิด และ Layout 390px ไม่ล้น |
| Register/Login/Logout | สร้าง USER จริง แสดงข้อผิดพลาดรหัสผิด เข้าหน้าตาม Role และ Logout เพิกถอน Session |
| เลือกห้อง/ส่งคำขอ/อนุมัติ | บันทึก Booking จริง Confirm dialog เปลี่ยนสถานะ |
| แก้หอ/ห้อง/ปิดเปิด/แนบรูป | ข้อมูล Fixture บันทึกจริง เงื่อนไขห้ามปิดห้องที่มีการกันยังทำงาน |
| ผู้เช่า/สัญญา/มิเตอร์/ออกบิล | ฟอร์มสร้างและเริ่ม Lease กรอกอัตรา/เลขอ่านและออกบิลจริง |
| User ชำระ/แนบสลิป, Admin ยืนยัน | เก็บหลักฐาน ยืนยันบิล และแสดงประวัติของตน |
| แจ้งซ่อม/ข่าว/รายงาน/นโยบาย | บันทึกและเปลี่ยนสถานะผ่าน UI ตามสิทธิ์ |
| ตารางหน้า 2/CSV | เปลี่ยนหน้าได้และส่งออก 503 รายการ Fixture ครบ |
| จัดสรรน้ำไฟ/ปิดสัญญา/คืนเงิน/ฉบับถัดไป | Preview ตามหลักฐาน ยืนยันและบันทึกรับคืนจริงใน Fixture |
| Reduced motion/Keyboard | Fade-in หยุดและมี Outline เมื่อ Focus เมนู |

ผลรวม Browser 39 กลุ่มผ่านและ Fixture cleanup ตรวจข้อมูลเดิมไม่เปลี่ยน ตรวจ Hash โค้ด/Assets/Schema/Migrations/Lockfiles/สคริปต์ที่ไม่ได้แก้รวม 109 ไฟล์ก่อน–หลังตรงกัน ไม่มีการแก้ข้อความ Home หรือ GIF ในรอบนี้ ไม่รัน API suite/Unit ใหม่เพราะไม่มีการเปลี่ยน Logic

## ผลล่าสุด — 18 พฤศจิกายน 2026

| คำสั่ง/การตรวจ | ผลที่บันทึกไว้ |
|---|---|
| npm.cmd --prefix server test | API 50/50 ผ่าน หลังเพิ่มเงื่อนไขตรวจ Preview สำหรับยอดปรับน้ำไฟ |
| npm.cmd --prefix client run test:ui | Chrome 39 กลุ่มผ่าน รวมสมัคร–ขอเช่า–สัญญา–มิเตอร์–บิล–รับเงิน–แจ้งซ่อม–ปิดยอดและคืนเงิน |
| npm.cmd --prefix client test | Unit 5/5 ผ่าน: CSV ภาษาไทย/สูตร Spreadsheet เงิน วันที่ และค่า API ที่ไม่รู้จัก |
| typecheck / lint / format:check / build ของ Client | ผ่าน |
| npm.cmd run check:delivery | 165 text files ณ รอบเตรียมส่ง; Lockfile 3 ส่วน/Ignore ผ่าน หลังเอาผลทดสอบที่ถูกติดตามออก |
| Schema diff | ไม่พบความต่างกับ MySQL |
| ลิงก์เอกสารก่อนรวม | 67 ลิงก์ผ่าน เป็นจำนวนก่อนจัดเอกสารครั้งนี้ |
| Local health หลังเปิดระบบกลับ | Frontend 5173/API 5000 ตอบ 200 |

API/UI ใช้ MySQL 8.4.13 ฐาน dormify เดียว มี Fixture namespace สุ่มและ Cleanup เฉพาะของตน ตรวจ Hash ข้อมูลเดิมครบ 30 Models ว่าไม่เปลี่ยน ไม่มี Reset/Seed หรือฐาน Test/Shadow เพิ่ม ไม่ได้ทดลองกับผู้เช่าจริงหรือเครื่องปลายทาง

## กรณีสำคัญที่ครอบคลุม

- สมัครได้เฉพาะ USER; Admin สร้างผ่าน Local command; ตรวจสิทธิ์จากฐานและเพิกถอน Session หลัง Logout
- หอเดียว ห้องปิดไม่รับคำขอ อนุมัติพร้อมกันไม่กันห้องซ้ำ บันทึกห้อง/สัญญา/บิลเดิมไม่ถูกเขียนทับ
- รอบเดือนตามวันเริ่ม สิ้นเดือน วันครบกำหนด Snapshot ค่าเช่าล่วงหน้า น้ำไฟย้อนหลัง และกันบิลซ้ำ
- อัตรากลางรอบใช้มิเตอร์จริง การเปลี่ยนมิเตอร์เก็บหน่วยสะสม แก้เลขที่ใช้ออกบิลแล้วไม่ได้
- รับเงินเต็มยอด หลักฐานส่วนตัว Admin review และป้องกันรับเงิน/คืนเงินซ้ำ
- ใบลดหนี้ก่อนชำระไม่คืนเงินซ้ำหลังชำระ Refund/Proof upload ตรวจหลัง Row lock เพื่อไม่ใช้ Snapshot เก่า
- ค่าเช่าและส่วนลดเฉลี่ยตามวันจริง รอบอนาคตที่ไม่พักใช้ศูนย์ ไม่คืนเกินเงินรับสุทธิ
- ใบปรับน้ำไฟคร่อมวันออก: Admin กรอกยอด เหตุผล อ้างอิงมิเตอร์ ตรวจตัวอย่างใหม่จึงยืนยัน ปฏิเสธเกินเพดาน/รายการซ้ำ/ผิดสัญญา/หลักฐานว่าง เก็บยอดเดิมกับยอดใช้จริง
- Browser กรอกยอดปรับน้ำไฟและคืนเงิน 1,345 บาทของ Fixture จริง; ไม่แสดงปุ่มยืนยันขณะยอดจัดสรรยังไม่ครบ
- Server pagination/CSV ประวัติ: ตรวจ 503 แถวและอ่านเนื้อหาไฟล์ที่สร้างจริง; กันแถวใหม่เลื่อนหน้าด้วย Snapshot ID
- หน้าเว็บภาษาไทย ฟอนต์ Local รูปห้องจริงจาก API มือถือ/แท็บเล็ต Keyboard focus และ Reduced motion; ส่วนอาหาร/รีวิวถูกถอดแล้ว

## ประวัติผลเก่า

เป็นลำดับพัฒนา ไม่ใช่คำสั่งให้ย้อนกลับไปติดตั้ง SQLite หรือใช้ Flow เก่า

| ช่วงงาน | ผลที่เคยบันทึก | ขอบเขต ณ เวลานั้น |
|---|---|---|
| Phase 0 เดิม | API 9/9 | JavaScript/SQLite ตั้งต้น ยังไม่มีระบบบริหารครบ |
| ธีม/Authentication รุ่นแรก | API 15/15 | ปรับไทย/Role และ Session ก่อนย้าย MySQL |
| ปรับคุณภาพโค้ด/Frontend TS | API 21/21, Unit 3/3, Chrome 17 กลุ่ม | TypeScript strict, Race/Uniqueness และ Resource hook |
| เตรียม MySQL | API 23/23, Chrome 17 กลุ่ม | ย้ายฐานตามแผน ใช้ dormify เดียว |
| จัดการห้อง 14 พฤศจิกายน | API 28/28, Unit 3/3, Chrome 22 กลุ่ม | แก้หอ/ห้อง ปิดเปิด และรักษาใบเสนอราคาเก่า |
| ระบบบริหาร 14 พฤศจิกายน | API 40/40, Chrome 33 กลุ่ม | ผู้เช่า สัญญา มิเตอร์ บิล เงินประกัน ซ่อม ข่าว รายงาน Audit |
| เพิ่มส่วนที่เหลือ 17 พฤศจิกายน | API 45/45, Chrome 39 กลุ่ม, Unit 5/5 | รูป/หน่วยมิเตอร์/กลางรอบ/ปิดยอด/ต่อสัญญา/CSV |
| Deep review 17 พฤศจิกายน | API 48/48, Chrome 39 กลุ่ม | แก้ส่วนลดคืนซ้ำ Refund และ Proof race |
| ปิดสี่จุด 17 พฤศจิกายน | API 49/49, Chrome 39 กลุ่ม | ทะเบียนหอเดียว รวม End/Closeout ส่วนลดรายวัน ประวัติเกิน 500 |
| เตรียมส่ง 18 พฤศจิกายน | API 50/50, Chrome 39 กลุ่ม, Unit 5/5 | ยอดปรับน้ำไฟตามหลักฐานและเอกสารส่ง |

วันที่ 17 พฤศจิกายน npm audit ของ Root/Server/Client รายงาน 0 ช่องโหว่หลังปรับแพ็กเกจ ไม่ใช่ผล Audit สดวันนี้หรือ Penetration Test ผล Build ขนาดไฟล์แต่ละรอบไม่ใช่หลักฐานเวลาโหลดจริง

## ปัญหาที่พบระหว่างทดสอบและแก้แล้ว

- MySQL ไม่เปิด: เปิด Docker Desktop/Container ด้วย Volume เดิมแล้วทดสอบใหม่ ไม่ลบ Volume
- Chrome sandbox เชื่อม DevTools ไม่ได้: รันด้วยสิทธิ์ที่เหมาะสมก่อนตรวจ UI
- ตัวทดสอบกดก่อน API โหลดปุ่มเสร็จ: ปรับให้รอปุ่มพร้อมแล้วรันครบใหม่ ผลรอบที่ล้มเหลวไม่ถูกนับว่าผ่าน
- พบไฟล์ Hash ผลทดสอบติดตามใน Git: เอาออกและเพิ่ม Ignore ไม่ใช่การลบฐานข้อมูล

## วิธีรันทวนและข้อจำกัด

ทำตาม [คู่มือติดตั้ง](SETUP_NEW_MACHINE.md) เปิด MySQL หยุดใช้งานจริงชั่วคราว รัน API ก่อน UI ตามลำดับ ไม่รันพร้อมกันหรือระหว่างแก้ข้อมูลจริง

ยังไม่ยืนยันเครื่องอื่น ผลตรวจรับเจ้าของหอ/ครู หรืออัตราน้ำไฟถูกต้องตามกฎหมาย การนำเข้าใบปรับเก่าที่ประเภท/สิทธิ์คืนเป็น NULL ต้องตรวจหลักฐาน ห้ามตั้งค่าการเงินย้อนหลังโดยเดา ดู [ข้อจำกัดทางเทคนิค](DEVELOPMENT.md) และ [รายการตรวจรับ](SUBMISSION_CHECKLIST.md)

ประวัติการแก้ไฟล์/Environment และผลแต่ละช่วงละเอียดอยู่ใน [WORK_LOG.md](WORK_LOG.md)
