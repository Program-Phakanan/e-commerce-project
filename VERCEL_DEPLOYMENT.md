# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel Account (sign up at https://vercel.com)
- Stripe Account (https://stripe.com)
- Supabase Account (https://supabase.com) หรือ PostgreSQL Database

## Step 1: เตรียม Database (Production)

### Option A: ใช้ Supabase (แนะนำ)
1. สร้างโปรเจกต์ใหม่ที่ https://supabase.com
2. ไปที่ Project Settings > Database
3. คัดลอก Connection String (Direct Connection)
4. เก็บไว้สำหรับใส่ใน Vercel Environment Variables

### Option B: ใช้ PostgreSQL อื่นๆ
- Neon (https://neon.tech)
- Railway (https://railway.app)
- PlanetScale (https://planetscale.com)

## Step 2: Deploy ไป Vercel

### 2.1 Install Vercel CLI (Optional)
\`\`\`bash
npm i -g vercel
\`\`\`

### 2.2 Deploy ผ่าน Vercel Dashboard (แนะนำสำหรับครั้งแรก)

1. ไปที่ https://vercel.com/new
2. Import Git Repository หรือ Upload โปรเจกต์
3. เลือก Framework Preset: **Next.js**
4. ตั้งค่า Environment Variables (ดูด้านล่าง)
5. คลิก **Deploy**

### 2.3 Deploy ผ่าน CLI
\`\`\`bash
# ใน directory ของโปรเจกต์
vercel

# หรือ deploy เป็น production ทันที
vercel --prod
\`\`\`

## Step 3: ตั้งค่า Environment Variables ใน Vercel

ไปที่ Project Settings > Environment Variables และเพิ่มตัวแปรต่อไปนี้:

### Database
\`\`\`
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
\`\`\`

### Supabase (ถ้าใช้)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
\`\`\`

### NextAuth
\`\`\`
NEXTAUTH_SECRET=your_production_secret_key_here
NEXTAUTH_URL=https://your-app.vercel.app
\`\`\`

### Stripe
\`\`\`
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (หรือ pk_live_... สำหรับ production)
STRIPE_SECRET_KEY=sk_test_... (หรือ sk_live_... สำหรับ production)
STRIPE_WEBHOOK_SECRET=whsec_... (จะได้จาก Step 4)
\`\`\`

**หมายเหตุ:** 
- ใช้ `pk_test_` และ `sk_test_` สำหรับทดสอบ
- ใช้ `pk_live_` และ `sk_live_` เมื่อพร้อม production จริง

## Step 4: ตั้งค่า Stripe Webhook

### 4.1 สร้าง Webhook Endpoint
1. ไปที่ Stripe Dashboard > Developers > Webhooks
2. คลิก **Add endpoint**
3. ใส่ URL: `https://your-app.vercel.app/api/payment/stripe/webhook`
4. เลือก Events ที่ต้องการ listen:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. คลิก **Add endpoint**

### 4.2 คัดลอก Webhook Secret
1. คลิกที่ Webhook endpoint ที่สร้างไว้
2. คลิก **Reveal** ใน Signing secret section
3. คัดลอก `whsec_...`
4. เพิ่มใน Vercel Environment Variables เป็น `STRIPE_WEBHOOK_SECRET`

### 4.3 Redeploy
หลังจากเพิ่ม `STRIPE_WEBHOOK_SECRET` แล้ว ต้อง redeploy:
\`\`\`bash
vercel --prod
\`\`\`
หรือไปที่ Vercel Dashboard > Deployments > Redeploy

## Step 5: Run Database Migrations

### 5.1 ผ่าน Vercel CLI
\`\`\`bash
# ตั้งค่า DATABASE_URL ชั่วคราว
$env:DATABASE_URL="postgresql://..." # Windows PowerShell
# หรือ
export DATABASE_URL="postgresql://..." # Mac/Linux

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
\`\`\`

### 5.2 ผ่าน Vercel Build Command (แนะนำ)
เพิ่ม build script ใน `package.json`:
\`\`\`json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
\`\`\`

**หมายเหตุ:** Seed ต้องทำแยกหลัง deploy เสร็จ

## Step 6: ทดสอบ Payment

### 6.1 ใช้ Test Cards ของ Stripe
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155
- CVC: ใส่เลข 3 หลักอะไรก็ได้
- Expiry: ใส่วันที่อนาคต
- ZIP: ใส่อะไรก็ได้

### 6.2 ทดสอบ PromptPay (ใน Test Mode)
Stripe Test Mode รองรับ PromptPay simulation

### 6.3 ตรวจสอบ Webhook
1. ไปที่ Stripe Dashboard > Developers > Webhooks
2. คลิกที่ endpoint ของคุณ
3. ดู Events log เพื่อตรวจสอบว่า webhook ทำงานถูกต้อง

## Step 7: เปิดใช้งาน Production (Live Mode)

เมื่อพร้อมรับเงินจริง:

1. **Activate Stripe Account**
   - กรอกข้อมูลธุรกิจใน Stripe Dashboard
   - ยืนยันตัวตน

2. **สลับเป็น Live Keys**
   - ไปที่ Stripe Dashboard > Developers > API keys
   - Toggle เป็น "Viewing live data"
   - คัดลอก Live keys (`pk_live_...` และ `sk_live_...`)
   - อัพเดตใน Vercel Environment Variables

3. **สร้าง Live Webhook**
   - สร้าง webhook endpoint ใหม่ใน Live mode
   - ใช้ URL เดียวกัน: `https://your-app.vercel.app/api/payment/stripe/webhook`
   - อัพเดต `STRIPE_WEBHOOK_SECRET` ด้วย live webhook secret

4. **Redeploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

## Troubleshooting

### Database Connection Error
- ตรวจสอบว่า DATABASE_URL ถูกต้อง
- ตรวจสอบว่า IP ของ Vercel ไม่ถูก block (Supabase อนุญาตทุก IP by default)

### Stripe Webhook ไม่ทำงาน
- ตรวจสอบ URL ว่าถูกต้อง
- ตรวจสอบ STRIPE_WEBHOOK_SECRET
- ดู logs ใน Vercel Dashboard > Deployments > Functions

### Payment ไม่อัพเดทสถานะ
- ตรวจสอบ webhook events ใน Stripe Dashboard
- ตรวจสอบ logs ใน Vercel
- ตรวจสอบว่า database มี OrderStatus "Paid"

## คำแนะนำเพิ่มเติม

### Security
- อย่า commit `.env` เข้า git
- ใช้ strong secret สำหรับ NEXTAUTH_SECRET
- เก็บ Stripe keys ไว้เป็นความลับ

### Performance
- ใช้ Edge Functions สำหรับ API routes ที่เหมาะสม
- Enable Vercel Analytics
- ใช้ CDN สำหรับ static assets

### Monitoring
- ติดตั้ง Vercel Analytics
- ตรวจสอบ Stripe Dashboard เป็นประจำ
- ตั้ง alerts สำหรับ failed payments

## ขั้นตอนสำคัญสุด ✅

1. ✅ Deploy to Vercel
2. ✅ ตั้งค่า Environment Variables
3. ✅ Run Database Migrations
4. ✅ ตั้งค่า Stripe Webhook
5. ✅ ทดสอบ Payment Flow
6. ✅ Seed Database (Products, Payment Methods, etc.)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Next.js Docs: https://nextjs.org/docs
