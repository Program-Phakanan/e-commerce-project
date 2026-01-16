# 🎯 Quick Deployment Checklist

## ✅ Pre-Deployment (ทำก่อน Deploy)

### 1. เตรียม Database
- [ ] สร้าง PostgreSQL Database (Supabase/Neon/Railway)
- [ ] คัดลอก Connection String

### 2. เตรียม Stripe Account
- [ ] สมัคร Stripe Account (https://stripe.com)
- [ ] คัดลอก Test API Keys (pk_test_... และ sk_test_...)

### 3. ตรวจสอบโค้ด
- [ ] Build ผ่าน: `npm run build`
- [ ] ไม่มี error ใน console

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

#### Option A: ใช้ Script (แนะนำ)
```powershell
.\DEPLOY_VERCEL.ps1
```

#### Option B: Manual
```bash
npm i -g vercel
vercel
```

### Step 2: ตั้งค่า Environment Variables

ไปที่ **Vercel Dashboard > Project > Settings > Environment Variables**

เพิ่มตัวแปรเหล่านี้:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase (ถ้าใช้)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Auth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx (จะได้จาก Step 4)
```

**หมายเหตุ:** ใส่ `STRIPE_WEBHOOK_SECRET` เป็น placeholder ก่อน (เช่น `whsec_temp`) จะอัพเดทใน Step 4

### Step 3: Redeploy หลังเพิ่ม Environment Variables

```bash
vercel --prod
```

หรือไปที่ Vercel Dashboard > Deployments > Redeploy

### Step 4: Setup Production Database

**⚠️ สำคัญ:** ใช้ schema สำหรับ PostgreSQL

```powershell
# 1. Backup schema.prisma เดิม
Copy-Item prisma\schema.prisma prisma\schema.sqlite.backup

# 2. ใช้ PostgreSQL schema
Copy-Item prisma\schema.production.prisma prisma\schema.prisma

# 3. Set DATABASE_URL ชั่วคราว
$env:DATABASE_URL="postgresql://user:pass@host:5432/db"

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed database
npx prisma db seed

# 7. คืน schema เดิมสำหรับ local development
Copy-Item prisma\schema.sqlite.backup prisma\schema.prisma
```

**หรือใช้ Script:**
```powershell
.\SETUP_PRODUCTION_DB.ps1
```

### Step 5: ตั้งค่า Stripe Webhook

1. ไปที่ **Stripe Dashboard > Developers > Webhooks**
2. คลิก **Add endpoint**
3. ใส่ URL: `https://your-app.vercel.app/api/payment/stripe/webhook`
4. เลือก Events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. คลิก **Add endpoint**
6. คัดลอก **Signing secret** (whsec_...)
7. อัพเดท `STRIPE_WEBHOOK_SECRET` ใน Vercel
8. **Redeploy** อีกครั้ง

### Step 6: ทดสอบ

1. เปิด `https://your-app.vercel.app`
2. Login ด้วย: `admin@ecommerce.com` / `admin123`
3. ทดสอบสั่งซื้อสินค้า
4. ใช้ Test Card: `4242 4242 4242 4242`
5. ตรวจสอบว่า order status เปลี่ยนเป็น "Paid"

## 🔍 Verification Checklist

- [ ] เว็บเปิดได้ไม่มี error
- [ ] Login ได้
- [ ] Dashboard แสดงข้อมูล
- [ ] สินค้าแสดงใน Shop
- [ ] เพิ่มสินค้าลงตะกร้าได้
- [ ] Checkout ได้
- [ ] Stripe Checkout เปิดได้
- [ ] ชำระเงินด้วย Test Card สำเร็จ
- [ ] Order status เปลี่ยนเป็น "Paid" อัตโนมัติ
- [ ] Webhook events แสดงใน Stripe Dashboard

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**แก้ไข:**
- ตรวจสอบ `DATABASE_URL` ถูกต้อง
- ตรวจสอบ database online
- ตรวจสอบ IP whitelist (Supabase อนุญาตทุก IP by default)

### Prisma Client Error
```
Error: @prisma/client did not initialize yet
```
**แก้ไข:**
- Redeploy: `vercel --prod`
- ตรวจสอบ `postinstall` script ใน package.json

### Stripe Webhook ไม่ทำงาน
```
Order status ไม่เปลี่ยนเป็น Paid
```
**แก้ไข:**
- ตรวจสอบ webhook URL ถูกต้อง
- ตรวจสอบ `STRIPE_WEBHOOK_SECRET` ถูกต้อง
- ดู webhook logs ใน Stripe Dashboard
- ดู function logs ใน Vercel

### Build Failed
```
Error: Build failed
```
**แก้ไข:**
- ตรวจสอบ error message
- Build local ก่อน: `npm run build`
- แก้ไข errors แล้ว push ใหม่

## 📚 เอกสารเพิ่มเติม

- 📖 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - คู่มือ deployment แบบละเอียด
- 💳 [STRIPE_TESTING.md](./STRIPE_TESTING.md) - วิธีทดสอบ Stripe
- 🔧 [README.md](./README.md) - คู่มือโปรเจกต์

## 🎉 เสร็จสิ้น!

เมื่อทำครบทุกขั้นตอนแล้ว:
- ✅ เว็บ deploy แล้วบน Vercel
- ✅ Database พร้อมใช้งาน
- ✅ Stripe payment ใช้งานได้จริง
- ✅ Webhook อัพเดท order status อัตโนมัติ

## 🔄 Next: เปิดใช้งาน Live Mode

เมื่อพร้อมรับเงินจริง:

1. **Activate Stripe Account**
   - กรอกข้อมูลธุรกิจ
   - ยืนยันตัวตน

2. **Switch to Live Keys**
   - ใช้ `pk_live_...` และ `sk_live_...`
   - อัพเดทใน Vercel Environment Variables

3. **Create Live Webhook**
   - สร้าง webhook ใหม่ใน Live mode
   - อัพเดท `STRIPE_WEBHOOK_SECRET`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

**Need Help?** ดูเอกสารเพิ่มเติมใน [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
