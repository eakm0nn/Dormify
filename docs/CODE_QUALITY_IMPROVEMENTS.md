# ผลปรับปรุงโค้ดและประสิทธิภาพ

วันที่: 13 พฤศจิกายน 2026 (Asia/Bangkok)

## สิ่งที่เปลี่ยน

- Backend ใช้ PrismaClient จาก `server/src/lib/prisma.js` ร่วมกัน และใช้ Middleware ตรวจผล Validation กลาง
- ตรวจ ID และจำนวนผู้พักให้ตรงช่วง Int ของ Prisma, ราคาตั้งแต่ศูนย์, ชนิดข้อมูล และวันที่สิ้นสุดหลังวันเริ่มต้น
- อนุมัติคำขอได้เมื่อยังเป็น PENDING และห้องยังว่าง โดยตรวจและเขียนสถานะใน Transaction พร้อม Conditional Update
- ห้องเดียวมีคำขอ CONFIRMED ผ่าน API ได้เพียงรายการเดียว; คำขอ REJECTED/CANCELLED กลับมาอนุมัติไม่ได้
- คงพฤติกรรมปฏิเสธ/ยกเลิกคำขอที่อนุมัติแล้ว และคืนห้องว่างเมื่อไม่มีคำขอ CONFIRMED อื่นค้างอยู่
- เพิ่ม Unique Constraint เลขห้องภายในหอเดียวกัน และ Index สำหรับรายการจองตามผู้ใช้/ห้อง/สถานะ
- เพิ่ม `GET /api/properties/:propertyId` สำหรับหอที่เลือกด้วย VITE_DORMITORY_ID; ไม่ต้องโหลดทุกหอเมื่อกำหนด ID
- เพิ่ม `GET /api/bookings/summary?propertyId=...` สำหรับจำนวนห้องทั้งหมด ห้องว่าง และคำขอรอดำเนินการ โดยจำกัดสิทธิ์ ADMIN
- หน้า AdminOverview อ่านจำนวนจาก Summary API แทนการโหลดรายการจองทั้งหมดเพื่อนับ
- หน้า Public แสดงได้ระหว่างตรวจ Session; หน้าที่ต้องเข้าสู่ระบบยังรอการตรวจสิทธิ์
- ใช้ Lazy Loading สำหรับหน้ารายละเอียดห้อง สมัคร/เข้าสู่ระบบ และหน้า Admin/User
- ใช้ `useApiResource` จัดการ Loading/Error/Refresh และ AbortController กลาง; เปลี่ยนหน้า/Refresh แล้วไม่ให้ผลเก่าทับข้อมูลล่าสุด
- Explicit Refresh หลังบันทึกเริ่มคำขอใหม่เสมอ เพื่อไม่ใช้คำตอบจากคำขอที่เริ่มก่อนการบันทึก
- แยก RoomForm/RoomTable ออกจาก AdminRooms และย้ายข้อมูลเมนูไป `config/navigation.ts`
- จัดรูปแบบ Frontend ด้วย Prettier, ลบ Import ที่ไม่ใช้, เปิด noUnusedLocals/noUnusedParameters และตั้ง ESLint สำหรับ TypeScript/React Hooks
- ใช้ Intl Formatter ซ้ำ และแยกราคาที่ไม่มีข้อมูลออกจากราคา 0 บาท

## การอัปเกรดฐานเดิม

```powershell
npm.cmd --prefix server run db:setup
```

Setup ตรวจเลขห้องซ้ำในฐานเดิมก่อนสร้าง Unique Index แล้วจึงใช้ Prisma db push
หากพบข้อมูลซ้ำจะหยุดพร้อมแจ้งคู่ propertyId/roomNumber ให้ผู้ดูแลแก้ ไม่ลบข้อมูลหรือ Reset ฐาน
ไม่มีการใช้ `--accept-data-loss` หรือ `--force-reset`

การทดสอบรอบนี้ใช้ SQLite ชั่วคราวทั้งหมด ไม่ได้เปลี่ยนข้อมูลฐาน Local หรือไฟล์ Environment จริง
ทดสอบทั้งฐานใหม่ การปฏิเสธฐานที่มีเลขห้องซ้ำ และฐานรุ่นเก่าที่มี User/Property/Room อยู่แล้ว
กรณีฐานรุ่นเก่าที่ไม่มีข้อมูลซ้ำ อัปเกรดและ Setup ซ้ำได้ โดยจำนวนรายการ เลขห้อง และราคาเดิมยังอยู่ครบ

## ผลตรวจสอบ

- Backend: 21/21 Tests ผ่าน รวมการอนุมัติพร้อมกัน การสร้างเลขห้องซ้ำพร้อมกัน และการป้องกันข้อมูลเดิม
- Frontend unit tests: 3/3 ผ่าน ครอบคลุมเงิน วันที่ และค่า API ที่ไม่รู้จัก
- Chrome UI: 17 กลุ่มผ่าน รวมการสมัคร/เข้าสู่ระบบ/ออกจากระบบ ส่งและอนุมัติคำขอ เพิ่มห้อง Responsive และสิทธิ์
- เพิ่ม Browser Regression สำหรับผลตอบกลับสลับลำดับ, Refresh หลังบันทึก และยกเลิก Request เมื่อออกจากหน้า
- TypeScript strict, ESLint, Prettier และ Production Build ตรวจตามคำสั่งด้านล่าง

```powershell
npm.cmd --prefix server test
npm.cmd --prefix client test
npm.cmd --prefix client run lint
npm.cmd --prefix client run format:check
npm.cmd --prefix client run build
node client/scripts/ui-smoke.mjs
```

## ขนาด JavaScript จาก Production Build

| รายการ | ก่อนปรับ | หลังปรับ |
|---|---:|---:|
| Entry JavaScript ก่อนบีบอัด | 340.98 KB | ประมาณ 300.6 KB |
| Entry JavaScript แบบ gzip | 108.31 KB | ประมาณ 99.6 KB |

Entry JavaScript ลดประมาณ 12% ก่อนบีบอัด หรือ 8% แบบ gzip
หน้าที่แยกโหลดมีไฟล์ของตนเองและโหลดเมื่อเปิดหน้า ขนาดรวมทุกหน้าไม่ได้ลดลงตามตัวเลข Entry
นี่เป็นการวัดขนาด Build ไม่ใช่การรับรองเวลาโหลดจริง; โลโก้ รูปเคลื่อนไหว และฟอนต์ยังใช้ไฟล์เดิม

## ข้อจำกัดที่ยังเหลือ

- PENDING ยังไม่กันห้องและไม่มีเวลาหมดอายุ; ผู้ใช้หลายคนส่งคำขอได้ แต่อนุมัติห้องเดียวได้เพียงรายการเดียว
- ยังคงกติกาห้องว่างแบบ Boolean เดิม ไม่ได้เพิ่มการเช่าช่วงวันที่ที่ไม่ทับกัน
- ยอดใน Booking ยังเป็นค่าเช่ารายเดือนที่เสนอในคำขอ ไม่ใช่ยอดบิลที่คำนวณตามวัน/สัญญา
- รายการจองเต็มยังไม่มี Pagination; API สรุปลดข้อมูลเฉพาะหน้า Dashboard
- ยังใช้ SQLite และ Backend JavaScript; ไม่ได้ย้าย Framework, MySQL หรือเพิ่มระบบการเงิน/สัญญา
- เพิ่มเฉพาะ Dev Dependencies สำหรับ ESLint TypeScript และ Prettier; ไม่ได้ทำ Major Upgrade หรือแก้ช่องโหว่ Dependency ทั้ง Stack ในงานนี้
- รายงาน Phase 0 และ UI รุ่นเก่าเป็นประวัติ ณ เวลานั้น ให้ใช้เอกสารนี้อ้างอิงพฤติกรรมที่ปรับรอบล่าสุด
