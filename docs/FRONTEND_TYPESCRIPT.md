# Frontend TypeScript — 13 พฤศจิกายน 2569

## ขอบเขตปัจจุบัน

ย้าย Frontend เป็น React + Vite + TypeScript ตามคำขอ โดยพักการย้าย MySQL ไว้ก่อน
Backend ยังใช้ JavaScript + Express + Prisma 5.22.0 และ SQLite เดิม
ไม่ได้เปลี่ยน Prisma Schema, Environment หรือย้ายข้อมูลฐานจริง
ฟังก์ชันที่ยังไม่พัฒนา เช่น สัญญา มิเตอร์ และบิล ยังคงแสดงสถานะเดิม

## ไฟล์ที่เปลี่ยน

- ไฟล์ React ทั้งหมดใน `client/src` จาก `.jsx` เป็น `.tsx` รวมหน้า Public, Admin, User, Components และ Context
- `client/src/services/api.ts` และ `client/src/utils/*.ts` จาก JavaScript เป็น TypeScript
- `client/src/types/api.ts`: ชนิดข้อมูล User, Role, Room, Dormitory, Booking และผล Authentication ตาม API เดิม
- `client/src/types/react.d.ts`: ชนิด HTML `inert` สำหรับ React 18 และเมนูมือถือเดิม
- `client/src/vite-env.d.ts`: ชนิด Environment และไฟล์ Asset
- `client/tsconfig.json`: เปิด `strict`, `noEmit` และการตรวจ JSX
- `client/vite.config.ts`: เปลี่ยนนามสกุลจาก JavaScript
- `client/index.html`: เปลี่ยน Entry เป็น `/src/main.tsx`
- `client/package.json`, `client/package-lock.json`: เพิ่ม TypeScript 5.9.3 และคำสั่ง `typecheck`; Build ต้องผ่านการตรวจชนิดข้อมูลก่อน
- `README.md`: อัปเดตเทคโนโลยีและคำสั่งตรวจสอบ

ไฟล์ `.js` ของ Tailwind/PostCSS และสคริปต์ Browser `.mjs` ยังใช้ตามเครื่องมือเดิม
โค้ดแอปใน `client/src` ไม่มี `@ts-nocheck`, `@ts-ignore` หรือการประกาศ `any` เพื่อข้ามข้อผิดพลาด
ชนิดข้อมูลฝั่งเว็บไม่ได้ทดแทนการตรวจข้อมูลและสิทธิ์ที่ Backend

## ผลทดสอบจริง

1. `npm.cmd --prefix client run build` — ผ่านทั้ง `tsc --noEmit` และ Vite Production Build
2. `node client/scripts/ui-smoke.mjs` — ผ่าน 15 กลุ่มทดสอบใน Chrome แบบ Headless

Browser Tests เรียก Backend จริงและใช้ SQLite ชั่วคราวแยกจากฐานใช้งาน:
โหลดห้องผ่าน API, ค้นหา/กรองห้อง, ฟอนต์/โลโก้, หน้าจอมือถือ,
สมัครสมาชิก USER, รหัสผ่านผิด, เมนู User, ป้องกันปลอมบทบาทผ่านข้อมูลที่แคช,
ส่งคำขอเช่า, Logout และเพิกถอน Session, หน้า Admin, เพิ่มห้อง,
อนุมัติคำขอ, Layout แท็บเล็ต/มือถือ และ Reduced Motion/Keyboard Focus

ผลลัพธ์และภาพหน้าจออยู่ใน `client/.ui-artifacts/` ซึ่งไม่ขึ้น Git
ผลนี้ไม่ได้รับรองฟังก์ชันที่ยังไม่พัฒนา และไม่ได้ทดสอบ MySQL

## คำสั่งใช้งาน

```powershell
npm.cmd start
npm.cmd --prefix client run typecheck
npm.cmd --prefix client run build
```

เอกสารวิเคราะห์และรายงาน UI รุ่นก่อนหน้าอาจอ้างนามสกุล `.jsx`/`.js` ของ Frontend
ให้ใช้ `.tsx`/`.ts` ตามไฟล์ปัจจุบัน เอกสารเหล่านั้นเป็นบันทึกช่วงก่อนย้าย
