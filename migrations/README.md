# SubSync Database Migrations 📦

โฟลเดอร์นี้บรรจุไฟล์ SQL Schema และ Migration สำหรับระบบฐานข้อมูลของแอปพลิเคชัน **SubSync** บน Supabase

---

## 🚀 วิธีการรัน Migration บน Supabase

### วิธีที่ 1: รันผ่าน Supabase Dashboard (แนะนำ - ง่ายที่สุด)
1. เปิดเว็บไซต์ [supabase.com/dashboard](https://supabase.com/dashboard) แล้วเลือกโปรเจกต์ของคุณ
2. ที่เมนูด้านซ้าย เลือก **SQL Editor** (ไอคอน `>_`)
3. กดปุ่ม **+ New query**
4. คัดลอกโค้ดทั้งหมดจากไฟล์ [`001_create_subscriptions_table.sql`](file:///Users/mac/Desktop/SubSync/migrations/001_create_subscriptions_table.sql) มาวางในช่องแก้ไข
5. กดปุ่ม **Run** (สีเขียว) ด้านล่างขวา
6. เมื่อรันสำเร็จ ตาราง `subscriptions` จะพร้อมใช้งานทันที พร้อมระบบความปลอดภัยระดับแถว (RLS) ที่ผูกกับผู้ใช้แต่ละคน

---

### วิธีที่ 2: รันผ่าน Supabase CLI
หากคุณติดตั้ง Supabase CLI ไว้ในเครื่อง สามารถรันคำสั่ง:
```bash
supabase db push
# หรือ
supabase migration up
```

---

## 📋 รายการไฟล์ Migrations
* **`001_create_subscriptions_table.sql`**: สร้างตาราง `subscriptions`, ผูก Foreign Key กับ `auth.users`, เปิดใช้ Row Level Security (RLS) และสร้าง Index เพื่อให้การค้นหาและเรียงลำดับวันตัดบิลทำได้อย่างรวดเร็ว
