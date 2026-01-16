# 🔧 Database Connection Troubleshooting

## ปัญหา: Cannot connect to database

คุณกำลังเจอข้อผิดพลาดนี้:
```
Error: Can't reach database server at `db.xxxxx.supabase.co:5432`
```

## วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ DATABASE_URL

เปิดไฟล์ `.env` และตรวจสอบว่า `DATABASE_URL` มีรูปแบบที่ถูกต้อง:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**หรือ**

```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.com:5432/postgres"
```

### ขั้นตอนที่ 2: รับ Connection String จาก Supabase

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **Settings** (ไอคอนเฟือง) → **Database**
4. เลื่อนลงไปที่ **Connection String**
5. เลือก **URI** tab
6. คัดลอก connection string
7. **แทนที่ `[YOUR-PASSWORD]`** ด้วยรหัสผ่านที่คุณตั้งตอนสร้าง project

### ขั้นตอนที่ 3: วางใน .env

แก้ไขไฟล์ `.env`:

```env
# เปลี่ยนจาก
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# เป็น (ตัวอย่าง - ใช้ของคุณเอง)
DATABASE_URL="postgresql://postgres:your_actual_password@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### ขั้นตอนที่ 4: ทดสอบการเชื่อมต่อ

```bash
# ลองเชื่อมต่อฐานข้อมูล
npx prisma db push
```

ถ้าสำเร็จ คุณจะเห็น:
```
✔ Your database is now in sync with your Prisma schema.
```

### ขั้นตอนที่ 5: Seed ข้อมูล

```bash
npm run prisma:seed
```

---

## ตัวอย่าง Connection String ที่ถูกต้อง

### แบบที่ 1: Direct Connection
```env
DATABASE_URL="postgresql://postgres:MyP@ssw0rd123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### แบบที่ 2: Pooler Connection (แนะนำสำหรับ Production)
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyP@ssw0rd123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## เช็คลิสต์

- [ ] Connection string มี `postgresql://` นำหน้า
- [ ] มี username (ปกติคือ `postgres`)
- [ ] มี password ที่ถูกต้อง (ไม่ใช่ `[YOUR-PASSWORD]`)
- [ ] มี host ที่ถูกต้อง (ลงท้ายด้วย `.supabase.com`)
- [ ] มี port (`:5432` หรือ `:6543`)
- [ ] มี database name (`/postgres`)

---

## ถ้ายังไม่ได้

### วิธีที่ 1: ใช้ Supabase Client แทน

แก้ไขไฟล์ `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// ใช้ Supabase client สำหรับ auth
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// ใช้ Prisma สำหรับ database operations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### วิธีที่ 2: Reset Password

1. ไปที่ Supabase Dashboard
2. Settings → Database
3. คลิก **Reset Database Password**
4. ตั้งรหัสผ่านใหม่
5. อัพเดทใน `.env`

---

## ติดต่อ Support

ถ้ายังแก้ไม่ได้:

1. ตรวจสอบว่า Supabase project ยังเปิดอยู่
2. ตรวจสอบ internet connection
3. ลอง restart Supabase project
4. ดู Supabase logs ว่ามี error อะไร

---

## หลังจากแก้ไขแล้ว

```bash
# 1. Push schema to database
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed initial data
npm run prisma:seed

# 4. Run the app
npm run dev
```

เปิด http://localhost:3000 และ login ด้วย:
- Email: `admin@ecommerce.com`
- Password: `admin123`

---

**Good luck! 🚀**
