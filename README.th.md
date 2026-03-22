# Kanban Workspace

TaskFlow เป็นแอป Kanban workspace ที่แยกเป็น Next.js frontend และ NestJS backend รองรับระบบล็อกอิน บอร์ด คอลัมน์ งาน สมาชิก คำเชิญ การแจ้งเตือน ธีม และการเก็บบอร์ดแยกตามผู้ใช้ฝั่ง frontend

## เทคโนโลยีหลัก

- Frontend: Next.js 16, React 19
- Backend: NestJS 10
- ฐานข้อมูล/บริการหลัก: Supabase
- Database engine: PostgreSQL

## ฐานข้อมูล

โปรเจกต์นี้ใช้ PostgreSQL เป็นฐานข้อมูลหลัก และใช้งานผ่าน Supabase

ตารางหลักที่ใช้มี เช่น:

- `users`
- `boards`
- `board_members`
- `columns`
- `tasks`
- `notifications`

## โครงสร้างโปรเจกต์

```text
Kanban/
|- backend/   # NestJS API
|- frontend/  # Next.js app
```

## ความสามารถหลัก

- สมัครสมาชิกและเข้าสู่ระบบ
- สร้างบอร์ดและจัดการสมาชิกในบอร์ด
- เชิญสมาชิกเข้าบอร์ด
- สร้างคอลัมน์และงาน
- ลากย้ายงานระหว่างคอลัมน์
- หน้า My Tasks และ Members
- รองรับ Light/Dark mode

## ไฟล์ Environment

ตัวอย่าง backend: [backend/.env.example](/c:/src/Kanban/backend/.env.example)  
ตัวอย่าง frontend: [frontend/.env.example](/c:/src/Kanban/frontend/.env.example)

ก่อนรันระบบ ให้สร้างไฟล์จริงดังนี้:

- `backend/.env`
- `frontend/.env.local`

ตัวแปรที่ backend ต้องมี:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `DATABASE_URL`
- `PORT`

ตัวแปรที่ frontend ต้องมี:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

## ติดตั้ง dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## รันแบบ Development

รัน backend:

```bash
cd backend
npm run start:dev
```

รัน frontend:

```bash
cd frontend
npm run dev
```

URL ปกติในเครื่อง:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## ข้อมูลฐานข้อมูล

- schema หลัก: `backend/schema.sql`
- migration เพิ่มเติม: `backend/migration_v2.sql`, `backend/migration_v3.sql`

ถ้ายังไม่ได้สร้างตารางใน Supabase ให้รันไฟล์ SQL เหล่านี้ใน Supabase SQL Editor

## คำสั่งที่ใช้บ่อย

Backend:

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run start`

## หมายเหตุ

- `node_modules` และไฟล์ `.env` ถูกตั้งค่าให้ ignore ใน git แล้ว
- route ของ frontend ใช้ App Router ภายใต้ `frontend/src/app`
- ถ้าแก้ route แล้ว Next.js ทำงานแปลก ให้รีสตาร์ต dev server ใหม่

## English Version

English documentation: [README.md](/c:/src/Kanban/README.md)
