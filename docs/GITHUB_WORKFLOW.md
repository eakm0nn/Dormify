# DORMIFY — ส่งงานผ่าน GitHub และรับงานบนอีกเครื่อง

## สำคัญ: การเริ่มประวัติใหม่วันที่ 13 พฤศจิกายน 2026

ผู้ใช้สั่งให้เริ่มประวัติ main ใหม่จาก Snapshot ของงานปัจจุบัน ดูผลส่งจริงใน [PROJECT_STATUS.md](PROJECT_STATUS.md)
ส่ง Snapshot 4450c62 ขึ้น main สำเร็จแล้ว และมี Commit บันทึกผลตามมา
เมื่อประวัติใหม่ขึ้น GitHub แล้ว สำเนาที่มีประวัติก่อนหน้านั้นควร Clone ลงโฟลเดอร์ใหม่
ไม่ใช้ Pull/Merge/Rebase รวมประวัติก่อนหน้าเข้ากับ main ใหม่ เพราะจะนำ Commit ที่แยกออกแล้วกลับมา
สำรองงานที่ยังไม่ส่ง .env ฐานข้อมูล และไฟล์แนบของเครื่องนั้นก่อนเปลี่ยนสำเนา

```powershell
git clone https://github.com/eakm0nn/Dormify.git Dormify-next
cd Dormify-next
```

โฟลเดอร์ Dormify-next ต้องยังไม่มีอยู่ จากนั้นทำตาม SETUP_NEW_MACHINE.md
ขั้นตอน Pull ปกติด้านล่างใช้กับสำเนาที่ Clone หลังเริ่มประวัติใหม่นี้แล้วเท่านั้น

ตรวจเมื่อ 13 พฤศจิกายน 2026 (Asia/Bangkok): Branch ปัจจุบันคือ main และมี Remote origin แล้ว

```text
https://github.com/eakm0nn/Dormify.git
```

อัปเดตหลังตรวจจริง: เครื่องนี้มี Git Credential Manager และ Push ประวัติ main ใหม่สำเร็จแล้ว
ไม่ต้อง git init หรือ git remote add origin ซ้ำสำหรับสำเนานี้; เครื่องอื่นยังต้องมีบัญชีและสิทธิ์ของตนเอง
รายละเอียดเหตุการณ์อยู่ใน [WORK_LOG.md](WORK_LOG.md) ให้ตรวจ Git status ก่อนตัดสินใจว่ายังมีงานต้อง Commit หรือไม่

## ส่งงานที่แก้ในเครื่องนี้

รันจาก Root ของโปรเจกต์ โดยตรวจรายการที่จะส่งก่อน:

```powershell
git status
git diff --stat
git add .
git diff --cached --stat
git status
```

git add . รวมไฟล์ที่เปลี่ยนและไฟล์ใหม่ซึ่งไม่ถูก Ignore ให้ตรวจว่าต้องการส่งทั้งหมดก่อนขั้นถัดไป
ไฟล์ .env จริง ฐาน SQLite node_modules และ Build ถูก Ignore; ไม่เพิ่มไฟล์เหล่านั้นด้วย -f

เมื่อตรวจรายการแล้ว บันทึกและส่งขึ้น Remote ที่ตั้งไว้:

```powershell
git commit -m "Improve Dormify and add project handoff documentation"
git push -u origin main
```

หาก Git ขอ Login ให้ยืนยันบัญชีผ่านวิธีที่ Git Credential Manager หรือ GitHub จัดให้
การตั้งค่า Remote URL อย่างเดียวไม่ได้ยืนยันว่า Login หรือมีสิทธิ์เขียน Repository แล้ว
หากแจ้งว่าไม่มีชื่อ/Email ของผู้ Commit ให้ตั้ง user.name และ user.email ของตนสำหรับ Repository นี้ก่อน Commit
หาก Push ถูกปฏิเสธเพราะ Remote มีงานใหม่ ให้ตรวจและรวมงานนั้นก่อน ไม่ใช้ Force Push เพื่อข้าม

## รับงานบนอีกเครื่อง

กรณียังไม่มีสำเนา:

```powershell
git clone https://github.com/eakm0nn/Dormify.git
cd Dormify
```

กรณีมีสำเนาอยู่แล้ว ให้ตรวจงานในเครื่องก่อน เมื่อ Working Tree สะอาดจึงดึงงาน:

```powershell
git status
git pull --ff-only origin main
```

ถ้ามีงานค้างหรือ Pull ไม่ใช่ Fast-forward ให้จัดการงานทั้งสองฝั่งก่อน ไม่ Reset ทิ้งงานในเครื่อง
จากนั้นทำตาม [คู่มือเครื่องใหม่](SETUP_NEW_MACHINE.md) เพื่อติดตั้ง Dependencies และเตรียม Environment/ฐานข้อมูล
git clone หรือ git pull ไม่ติดตั้ง npm packages และไม่ส่ง .env/ฐาน SQLite ที่ถูก Ignore ไปด้วย

## ก่อนหยุดงานหรือสลับเครื่อง

1. อัปเดต [สถานะล่าสุด](PROJECT_STATUS.md) และ [บันทึกการทำงาน](WORK_LOG.md)
2. ตรวจ Git status และไฟล์ที่จะ Commit ให้ครบ รวมไฟล์ใหม่ที่ยัง Untracked
3. Commit/Push ตามขั้นตอน แล้วตรวจว่า Push สำเร็จก่อนย้ายเครื่อง
4. บนเครื่องปลายทาง Pull/Clone แล้วอ่าน PROJECT_STATUS.md ก่อนพัฒนาต่อ

อ้างอิงวิธีจัดการ Remote และส่งโค้ด: [GitHub Docs — Adding locally hosted code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

หลังเปลี่ยนประวัติ Contributors/สถิติอาจยัง Cache ข้อมูลก่อนหน้าประมาณ 24 ชั่วโมง ตาม [GitHub Docs — Contributor data is stale after history changes](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors#contributor-data-is-stale-after-history-changes)
