Pokémon Full Art Checklist (PWA) — วิธีติดตั้ง

1) เอาขึ้นเว็บ (ฟรี เลือกอย่างใดอย่างหนึ่ง)
   - Netlify Drop: เข้า app.netlify.com/drop แล้วลากโฟลเดอร์นี้ (unzip ก่อน) วาง จะได้ลิงก์ https
   - GitHub Pages: สร้าง repo → อัปโหลดทุกไฟล์ในโฟลเดอร์ → Settings > Pages > Deploy from branch
2) เปิดลิงก์บนมือถือ
   - Android (Chrome): เมนู ⋮ > "ติดตั้งแอป" / Add to Home screen
   - iPhone (Safari): ปุ่ม Share > Add to Home Screen
3) ข้อมูลที่ติ๊กจะเก็บในเครื่อง (ปิด-เปิดแอปแล้วยังอยู่) ถ้าจะซิงค์ Google Sheet ทำตามข้างล่าง

ซิงค์ Google Sheet + อัปเดตลิสอัตโนมัติ
   a) อัปโหลดไฟล์ pokemon-jp-fullart-checklist-001-1025.xlsx เข้า Google Drive แล้วเปิดด้วย Google Sheets (แท็บ 'Checklist 001-1025' ต้องอยู่ครบ)
   b) ส่วนขยาย > Apps Script > วางโค้ดจาก Code.gs > Deploy > New deployment > Web app
      Execute as: Me / Who has access: Anyone > Authorize > คัดลอก URL ที่ลงท้าย /exec
   c) ในแอป กด ⚙︎ > วาง URL > บันทึก + ซิงค์
   - ติ๊กจะถูกบันทึกลงแท็บ 'Ticks' และซิงค์ข้ามเครื่อง
   - ถ้าแก้/เพิ่มแถวใน 'Checklist 001-1025' (ทุกแถวที่มีเลข No. จะแสดง; คอลัมน์ D = 0 จะขึ้นเป็น 0 ใบ) แล้วเปิดแอป หรือกด "อัปเดตลิส" แอปจะดึงลิสใหม่เอง ข้อมูลที่ติ๊กไม่หาย
   - ไม่ใช้ซิงค์ก็ได้ ใช้ "นำเข้าลิสใหม่ (JSON)" ใน ⚙︎ หรือแทนที่ list.json แล้วอัปโหลดใหม่

ทำเป็น APK (ถ้าต้องการจริงๆ)
   เอา URL ที่ได้จากข้อ 1 ไปใส่ที่ pwabuilder.com > Package for stores > Android > ดาวน์โหลด APK มาติดตั้ง (เปิดอนุญาตติดตั้งจากแหล่งอื่น)
