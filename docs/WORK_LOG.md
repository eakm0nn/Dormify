# DORMIFY — บันทึกการทำงาน

ใช้ร่วมกับ [สถานะล่าสุด](PROJECT_STATUS.md) และ [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md)
เพิ่มรายการใหม่ไว้ด้านบนของส่วนประวัติ ไม่แก้ผลทดสอบเก่าให้ดูเหมือนเพิ่งรัน
รายการตั้งต้นด้านล่างสรุปย้อนหลังจากงานและผลเครื่องมือในบทสนทนา ไม่ได้รันทดสอบใหม่เพื่อสร้างประวัติ

## รูปแบบรายการใหม่

```text
### YYYY-MM-DD — ชื่องาน (Asia/Bangkok)
- คำขอ/ขอบเขต:
- ทำแล้ว/การตัดสินใจ:
- ไฟล์สำคัญ:
- ตรวจสอบ: คำสั่งและผลจริง หรือระบุว่าไม่ได้รันพร้อมเหตุผล
- ข้อมูล/Environment/แพ็กเกจ: ผลกระทบและสิ่งที่ต้องเตรียมบนเครื่องใหม่
- งานค้าง/เริ่มต่อ:
```

## ประวัติ

### 2026-11-13 — ลบไฟล์ LICENSE ตามคำสั่งผู้ใช้ (Asia/Bangkok)

- คำขอ: หลังอธิบายเงื่อนไข MIT แล้ว ผู้ใช้ยืนยันว่าให้ลบไฟล์ LICENSE
- ทำแล้ว: ตรวจพบว่าไฟล์ไม่มีใน Working Tree อยู่แล้ว จึงบันทึกการลบใน Git ตามคำสั่ง พร้อมอัปเดตสถานะสำหรับส่งต่อ
- ไฟล์ที่เกี่ยวข้อง: LICENSE, docs/PROJECT_STATUS.md และ docs/WORK_LOG.md
- ขอบเขต: ลบเฉพาะ LICENSE ระดับ Root ไม่แก้ใบอนุญาตฟอนต์หรือไฟล์ของ Dependencies และไม่เปลี่ยนประวัติ Git ซ้ำ
- ตรวจสอบจริง: Test-Path LICENSE เป็น False; ตรวจ Diff/Whitespace และรายการไฟล์ก่อน Commit; ไม่รันทดสอบแอปซ้ำเพราะไม่ได้เปลี่ยนโค้ดทำงาน
- ผลส่งจริง: Commit 22e1a1d ลบ LICENSE และอัปเดตบันทึกแล้ว; git push -u origin main สำเร็จจาก 06e4c76 เป็น 22e1a1d โดยไม่ Force Push
- ตรวจหลังส่ง: Working Tree สะอาด, main/origin/main ต่างกัน 0 Commit, Test-Path LICENSE เป็น False และ git ls-tree HEAD -- LICENSE ไม่พบไฟล์
- ข้อมูล/Environment: ไม่เปลี่ยนฐานข้อมูล .env หรือแพ็กเกจ
- เริ่มต่อ: อย่า Restore LICENSE โดยถือว่าการลบเป็นข้อผิดพลาด เพราะผู้ใช้สั่งลบชัดเจนแล้ว; คำอธิบายเงื่อนไขที่ตรวจไว้ยังอยู่ในประวัติรายการก่อนหน้า

### 2026-11-13 — ตรวจเงื่อนไขการนำ MIT License ออก (Asia/Bangkok)

- คำขอ: ผู้ใช้ถามว่าลบเงื่อนไข MIT จะมีผลหรือไม่ ยังไม่ได้สั่งให้เปลี่ยนไฟล์ในคำถามนี้
- ตรวจสอบ: อ่านข้อความ MIT จาก Open Source Initiative และคู่มือ License ของ GitHub; MIT อนุญาตใช้/แก้ไข/แจกจ่ายโดยกำหนดให้เก็บข้อความลิขสิทธิ์และใบอนุญาตกับสำเนาหรือส่วนสำคัญของซอฟต์แวร์
- ข้ออธิบาย: การลบไฟล์ไม่ได้ทำให้ลิขสิทธิ์หรือเงื่อนไขของโค้ดที่นำมาใช้หายไป; การแจกจ่ายโค้ดที่ยังอยู่ภายใต้ MIT โดยไม่มี Notice อาจไม่เป็นไปตามเงื่อนไข แนะนำเก็บไว้หรือขออนุญาตเจ้าของสิทธิ์แยกต่างหาก
- ขอบเขต: เป็นข้อมูลทั่วไปจากข้อความใบอนุญาต ไม่ได้วินิจฉัยสิทธิ์หรือผลทางกฎหมายเฉพาะกรณี และไม่เปลี่ยน License/Restore ไฟล์/Commit/Push ในรอบอธิบายนี้
- สถานะไฟล์: LICENSE ยังถูกลบใน Working Tree โดยไม่ Stage; ฉบับใน main ที่ส่งขึ้น GitHub ยังคงมีอยู่
- ผลตรวจ: แก้เฉพาะบันทึก ไม่รันทดสอบแอป; ตรวจ Whitespace
- แหล่งอ้างอิง: https://opensource.org/license/mit และ https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- เริ่มต่อ: อย่าส่งการลบ Notice โดยถือว่าการเปลี่ยนชื่อโปรเจกต์หรือประวัติ Git ทำให้เงื่อนไขเดิมสิ้นสุด ให้ตรวจสิทธิ์ที่ใช้จริงก่อนเปลี่ยน

### 2026-11-13 — ส่ง Snapshot ประวัติใหม่ขึ้น GitHub สำเร็จ (Asia/Bangkok)

- ผลจริง: สร้าง Root Snapshot 4450c62 จากไฟล์งานทั้งหมดที่ตรวจแล้ว และส่งแทน main เดิมด้วย Force-with-lease เฉพาะ refs/heads/main สำเร็จ
- การป้องกัน: Lease คาดหมาย Remote เดิม 5fd595c; เก็บ Bundle และ Patch ก่อนเปลี่ยนไว้ใน .git-backups/ ซึ่งไม่ถูกส่งขึ้น GitHub
- ตรวจ Snapshot: ไฟล์ตรงกับ Working Tree/Index ก่อนส่ง ไม่มีไฟล์ Secret/ฐานข้อมูล/Bundle; ค้นไม่พบชื่อบัญชีหรือแบรนด์โครงการก่อนหน้านอก LICENSE
- ตรวจหลังส่ง: main ในเครื่องและ origin/main ชี้ 4450c62 ตรงกัน; git shortlog main -sn พบผู้เขียน eak คนเดียว ไม่ได้แก้ชื่อผู้เขียนใน Commit ของบุคคลอื่น
- ไฟล์หลักที่เปลี่ยน: Package/Lockfile หลัก, ข้อความ Health API, README, บันทึก/คู่มือส่งต่อ, .gitignore และ LICENSE ที่เก็บเงื่อนไข MIT
- Tests รอบนี้: Backend 21/21 ผ่าน และ Package/Lockfile ตรงกัน; Frontend ไม่เปลี่ยน ไม่รันทดสอบหน้าจอซ้ำ
- ข้อจำกัด: ข้อความลิขสิทธิ์ใน LICENSE ยังคงอยู่ตามเงื่อนไขการแจกจ่าย; GitHub อาจ Cache รายชื่อ Contributors ประมาณ 24 ชั่วโมงหลัง Rewrite
- เริ่มต่อ: อีกเครื่องที่มีประวัติเก่าให้ Clone โฟลเดอร์ใหม่ตาม GITHUB_WORKFLOW.md และย้าย Environment/ข้อมูลที่สำรองไว้แยกต่างหาก ไม่ Merge ประวัติเก่ากลับมา
- บันทึกผลส่งต่อ: เพิ่มรายการนี้หลัง Push Snapshot แล้ว ส่งเอกสารสถานะตามด้วย Commit ปกติในประวัติใหม่
- ข้อสังเกต Working Tree: หลังส่งพบการลบ LICENSE ในเครื่องซึ่งไม่ได้ Stage; ไม่เขียนทับการเปลี่ยนแปลงที่พบและไม่ส่งการลบนี้ ข้อความใบอนุญาตยังอยู่ใน Snapshot บน GitHub

### 2026-11-13 — เปลี่ยนแบรนด์และเตรียมประวัติ Dormify ใหม่ (Asia/Bangkok)

- คำขอ: ผู้ใช้สั่งให้นำชื่อและสิ่งระบุต้นทางของโครงการก่อนหน้าออก หลังแจ้งผลกระทบเรื่อง Commit และการ Clone ใหม่
- ทำแล้ว: เปลี่ยนชื่อ Package หลัก/Lockfile เป็น dormify, เปลี่ยน Health API เป็น DORMIFY และนำชื่อบัญชี/แบรนด์ก่อนหน้าออกจาก README/บันทึก/เอกสาร
- ใบอนุญาต: คงข้อความลิขสิทธิ์และเงื่อนไข MIT ใน LICENSE และใบอนุญาตฟอนต์ที่ยังใช้งาน ไม่เปลี่ยนชื่อผู้เขียนใน Commit ของบุคคลอื่น
- สำรอง: Git bundle ครบทุก Ref และ Patch ของงานค้างที่ .git-backups/; ตรวจ bundle verify ผ่าน และ Ignore โฟลเดอร์สำรองเพื่อไม่ส่งขึ้น GitHub
- เตรียมส่ง: สร้าง Root Snapshot ใหม่จากไฟล์งานปัจจุบัน แล้วใช้ Force-with-lease เฉพาะ main โดยคาดหมาย Remote เดิม 5fd595c เพื่อไม่ทับงานที่อีกเครื่องส่งเพิ่ม
- ตรวจสอบจริง: npm --prefix server test ผ่าน 21/21; ตรวจชื่อ Package/Lockfile ตรงกัน; Whitespace ผ่าน; ไม่มีการเปลี่ยนไฟล์ Frontend ในรอบนี้
- ข้อมูล/Environment: ไม่ Reset ฐาน ไม่เปลี่ยน .env ไม่ส่ง Bundle หรือ Secret ขึ้น GitHub
- สถานะ: ยังเตรียม Snapshot; จะบันทึกผล Push จริงแยกเมื่อส่งสำเร็จ
- เริ่มต่อ: หลังเปลี่ยนประวัติสำเร็จ ให้ Clone อีกเครื่องลงโฟลเดอร์ใหม่และย้าย .env/ฐานที่สำรองไว้แยกต่างหาก ห้าม Merge ประวัติเก่ากลับมา

### 2026-11-13 — ตรวจชื่อที่ไม่รู้จักใน GitHub Contributors (Asia/Bangkok)

- คำขอ: ผู้ใช้พบชื่อ บัญชีผู้เขียนโค้ดรุ่นก่อน / ผู้เขียนโค้ดรุ่นก่อน ในภาพ Contributors ของ Repository
- ข้อค้นพบ: git shortlog --all -sn พบผู้เขียน ผู้เขียนโค้ดรุ่นก่อน จำนวน 7 Commit เดิม ตั้งแต่ efa0f61 ถึง c161ce3 ก่อน Commit 2fa41d1/59e5bae และก่อนงานที่ส่งจากเครื่องนี้
- หลักฐาน: git log --all --reverse แสดง efa0f61 เป็น Initial commit: ระบบเวอร์ชันก่อน ของ ผู้เขียนโค้ดรุ่นก่อน; Commit งานล่าสุด 903ad79/5fd595c ใช้ผู้เขียน eak
- ข้อสรุป: มีประวัติผู้เขียนโค้ดเดิมติดอยู่ใน Repository จึงอธิบายชื่อ Contributors ในภาพได้; Contributors เป็นข้อมูลผลงานจาก Commit ไม่ใช่หลักฐานสิทธิ์เขียน Repository
- ขอบเขต: ไม่ได้เพิ่ม Collaborator ไม่เปลี่ยนสิทธิ์ ไม่แก้ผู้เขียน/ลบประวัติ และไม่ได้ตรวจรายชื่อ Collaborators จริงบน GitHub; เจ้าของดูได้ที่ Settings > Collaborators
- ตรวจสอบ: อ่าน Git log/shortlog/status และเอกสาร GitHub เรื่อง Contributors/Access; ไม่รันทดสอบแอปเพราะตรวจประวัติและแก้เฉพาะบันทึก
- เริ่มต่อ: บันทึกการตรวจนี้ยังไม่ได้ Commit/Push; หากต้องตรวจสิทธิ์จริงให้ดูรายชื่อ Access ของ Repository แยกจาก Contributors

### 2026-11-13 — Commit และ Push งานจากเครื่องนี้สำเร็จ (Asia/Bangkok)

- คำขอ: ผู้ใช้ต้องการส่งงานที่ทำในเครื่องนี้ขึ้น Repository เดิมบน GitHub
- ตรวจบัญชี: Git ใช้ Credential Manager; การอ่าน Credential Store ใน sandbox ถูกจำกัด จึงตรวจนอก sandbox พบโปรไฟล์ GitHub และ git push --dry-run origin main ผ่าน โดยไม่แสดง Token/รหัสผ่าน
- ตรวจไฟล์: งานทั้งหมดถูก Stage แล้ว ตรวจ git diff --cached --check ผ่าน; รายการ Stage ไม่มี .env จริงหรือฐาน SQLite
- ทำแล้ว: git commit -m "Improve Dormify booking safety and add project handoff documentation" ได้ Commit 903ad79 รวม 71 ไฟล์
- ผลจริง: git push -u origin main สำเร็จ โดย Remote https://github.com/eakm0nn/Dormify.git เลื่อนจาก 59e5bae เป็น 903ad79 และ main ติดตาม origin/main แล้ว
- ไฟล์บันทึกผลส่งต่อ: docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/GITHUB_WORKFLOW.md, docs/SETUP_NEW_MACHINE.md
- ตรวจสอบ: ใช้ผลทดสอบโค้ดที่บันทึกไว้ก่อนหน้า ไม่รันแอปซ้ำในงานส่ง Git; ตรวจ Whitespace ของเอกสารผล Push ก่อนส่งตาม
- ข้อมูล/Environment: ไม่เปลี่ยน Remote ไม่ Force Push ไม่สร้างฐานใช้งาน และไม่ส่ง Secret/ฐานข้อมูล; ยังต้องเตรียม .env และ Dependencies บนอีกเครื่อง
- เริ่มต่อ: Clone/Pull main ล่าสุด อ่าน PROJECT_STATUS.md และทำตาม SETUP_NEW_MACHINE.md; เอกสารผล Push ส่งตามเป็น Commit แยกจากโค้ดงานหลัก

### 2026-11-13 — ตรวจ Remote และอธิบายการส่งงานผ่าน GitHub (Asia/Bangkok)

- คำขอ: วิธีเชื่อมโปรเจกต์กับ GitHub เพื่อส่งต่องาน
- ข้อค้นพบ: มี Remote origin ที่ https://github.com/eakm0nn/Dormify.git อยู่แล้ว และอยู่ Branch main จึงไม่ต้อง git init/add origin ซ้ำ
- ทำแล้ว: เพิ่มคู่มือ GitHub ที่อธิบายตรวจ/Stage/Commit/Push, Clone/Pull และการตั้งเครื่องปลายทาง พร้อมเชื่อมลิงก์กับคู่มือส่งต่อ
- ไฟล์สำคัญ: docs/GITHUB_WORKFLOW.md, docs/PROJECT_STATUS.md, docs/SETUP_NEW_MACHINE.md, docs/WORK_LOG.md, README.md
- ตรวจสอบ: git remote -v, git branch --show-current และ Git status แบบอ่านอย่างเดียว; ตรวจลิงก์/Whitespace ของเอกสาร ไม่รันทดสอบแอปซ้ำ
- ข้อมูล/Environment: ไม่อ่าน Credentials ไม่เปลี่ยน Remote ไม่ Stage/Commit/Push และยังไม่ตรวจ Authentication/สิทธิ์ Push/ประวัติ Remote ผ่านเครือข่าย
- เริ่มต่อ: ตรวจไฟล์ที่จะส่งแล้ว Commit/Push เมื่อผู้ใช้ต้องการส่งงานจริง; บนอีกเครื่อง Clone/Pull และทำตาม SETUP_NEW_MACHINE.md

### 2026-11-13 — เพิ่มระบบบันทึกและส่งต่องาน (Asia/Bangkok)

- คำขอ: ทุกครั้งที่ทำงานให้เก็บบันทึก เพื่อทำต่อบนอีกเครื่องได้
- ทำแล้ว: เพิ่มแนวทาง AGENTS.md, สถานะล่าสุด, Work log และคู่มือติดตั้ง/รับช่วงต่อ; ใส่ลิงก์เข้า README
- ไฟล์สำคัญ: AGENTS.md, docs/PROJECT_STATUS.md, docs/WORK_LOG.md, docs/SETUP_NEW_MACHINE.md, README.md
- ตรวจสอบ: ตรวจคำสั่งกับ package.json ทั้งสามส่วน ตรวจลิงก์ภายในเอกสารส่งต่อ และ Git whitespace; ไม่รันแอปซ้ำเพราะแก้เฉพาะเอกสาร
- ข้อมูล: ตรวจเฉพาะการมีอยู่ของไฟล์ พบว่ายังไม่มี .env ทั้งสองส่วนและ dev.db บนเครื่องนี้ ไม่อ่าน/เขียน Secret หรือสร้างฐานใช้งาน
- สถานะส่งต่อ: main / Base commit 59e5bae มีงานก่อนหน้าและไฟล์ใหม่ยังไม่ Commit ต้องนำ Working Tree ไปให้ครบ
- งานค้าง: ไม่มีงานโค้ดเพิ่มในรอบนี้ งานพัฒนาถัดไปให้ยึดขอบเขตที่ผู้ใช้สั่งและกติกาล่าสุด

### 2026-11-13 — ยืนยันข้อความกติกาสำหรับออกแบบ (Asia/Bangkok)

- คำขอ: ผู้ใช้ให้กติกา 14 ข้อ และระบุข้อ 3, 6, 9 เป็นข้อเสนอรอเจ้าของหอยืนยัน
- ทำแล้ว: บันทึกข้อความครบ 14 ข้อ และแก้สถานะในเอกสารออกแบบ/แผนข้อมูลให้ตรงกัน โดยเฉพาะข้อ 9 ที่เดิมเขียนว่ายืนยันฐานรอบบิลแล้ว
- ไฟล์สำคัญ: docs/BUSINESS_RULES.md, docs/analysis/PHASE1_BUSINESS_RULES_DESIGN.md, docs/analysis/MIGRATION_AND_DATA_MODEL.md, docs/analysis/README.md, README.md
- ตรวจสอบ: ตรวจจำนวนข้อ ข้อความสถานะ และ Git diff --check; ไม่รันทดสอบแอปเพราะไม่มีการเปลี่ยนโค้ด
- ข้อมูล/Environment: ไม่เปลี่ยนฐานข้อมูลหรือค่าตั้งระบบ ไม่เปิดใช้ 72 ชั่วโมง/ประกัน 1 เดือน/ครบกำหนด 5 วัน
- เริ่มต่อ: ใช้ BUSINESS_RULES.md เป็นข้อความต้นทาง แผนข้อมูลและ Workflow ยังเป็นแบบเสนอ ไม่ใช่ฟีเจอร์ที่ติดตั้งแล้ว

### 2026-11-13 — ปรับคุณภาพโค้ด ความถูกต้อง และการโหลดข้อมูล (Asia/Bangkok)

- คำขอ: ปรับปรุงตามผลรีวิวโค้ด โดยเน้นความถูกต้อง การดูแลต่อ และประสิทธิภาพ
- Backend: ใช้ PrismaClient/Validation กลาง ตรวจข้อมูลให้ครบ ป้องกันอนุมัติห้องซ้ำด้วย Transaction/Conditional Update เพิ่ม Unique roomNumber ต่อหอและ Index ที่เกี่ยวข้อง
- API: เพิ่ม GET /api/properties/:propertyId และ GET /api/bookings/summary?propertyId=...; เส้นทางเดิมยังรองรับ
- Frontend: Lazy Loading, useApiResource พร้อมยกเลิก/กันผลเก่า, Public ไม่รอ /me ทั้งหน้า, แยก RoomForm/RoomTable และข้อมูลเมนู, ใช้ Formatter ซ้ำและแยกค่าว่างจากราคา 0
- เครื่องมือ: เพิ่ม Dev Dependencies Prettier และ @typescript-eslint/parser/eslint-plugin, ตั้ง ESLint/Prettier, เปิด noUnusedLocals/noUnusedParameters และจัดรูปแบบ Frontend
- ไฟล์หลัก: client/src/App.tsx, hooks/useApiResource.ts, components/RoomForm.tsx/RoomTable.tsx, config/navigation.ts, context/*, pages/*, utils/format.ts; server/src/controllers/*, routes/*, lib/*, middleware/validate.js; server/prisma/schema.prisma, server/scripts/setup-db.js/ensure-room-uniqueness.js
- หลักฐาน: npm --prefix server test ผ่าน 21/21; npm --prefix client test ผ่าน 3/3; lint/format:check/build ผ่าน; node client/scripts/ui-smoke.mjs ผ่าน 17 กลุ่ม
- ตรวจฐานเก่า: จำลอง SQLite ที่มีข้อมูลแล้วอัปเกรดและ Setup ซ้ำ ข้อมูลเดิมครบ; กรณีเลขห้องซ้ำหยุดให้แก้ข้อมูล ไม่ลบรายการ
- ผลขนาด Build: Entry JS 340.98 → 300.57 KB, gzip 108.31 → 99.65 KB; เป็นขนาด Entry ไม่ใช่เวลาโหลดจริงหรือขนาดรวมทุกหน้า
- ข้อมูล/Environment: ใช้ฐานทดสอบชั่วคราว ไม่ย้าย MySQL ไม่แก้ .env หรือฐานใช้งาน; เครื่องอื่นต้อง npm ci และ db:setup หลังรับโค้ด
- งานค้าง: PENDING/การหมดอายุตามนโยบายใหม่, ผู้เช่า/สัญญา/เงิน/บิลและระบบอื่นตาม PROJECT_STATUS.md
- รายละเอียด: docs/CODE_QUALITY_IMPROVEMENTS.md
