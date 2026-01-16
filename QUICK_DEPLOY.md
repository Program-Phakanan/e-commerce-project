# ⚡ Quick Start: Deploy to Vercel in 10 Minutes

## 🎯 Goal
Deploy your e-commerce app to Vercel with working Stripe payments in ~10 minutes.

## 📋 Prerequisites (5 min)

### 1. Create Accounts (if you don't have)
- [ ] Vercel: https://vercel.com (Sign up with GitHub)
- [ ] Stripe: https://stripe.com (Test mode is free)
- [ ] Supabase: https://supabase.com (Free tier available)

### 2. Get Your Keys Ready

#### Supabase Database
1. Go to https://supabase.com/dashboard
2. Create new project (wait ~2 min for setup)
3. Go to **Project Settings > Database**
4. Copy **Connection String** (Direct Connection)
5. Replace `[YOUR-PASSWORD]` with your actual password

#### Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (pk_test_...)
3. Click **Reveal** on Secret key and copy (sk_test_...)

## 🚀 Deployment (5 min)

### Step 1: Deploy to Vercel (1 min)

#### Option A: Via Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your Git repository
3. Click **Deploy** (don't worry about env vars yet)

#### Option B: Via CLI
```powershell
npm i -g vercel
vercel
```

### Step 2: Add Environment Variables (2 min)

1. Go to your project on Vercel Dashboard
2. Click **Settings > Environment Variables**
3. Add these variables:

```bash
DATABASE_URL
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL
https://[PROJECT-REF].supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
[Your Supabase Anon Key]

NEXTAUTH_SECRET
[Any random string - use: openssl rand -base64 32]

NEXTAUTH_URL
https://your-project.vercel.app

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_test_[your_key]

STRIPE_SECRET_KEY
sk_test_[your_key]

STRIPE_WEBHOOK_SECRET
whsec_temp
```

**Note:** We'll update `STRIPE_WEBHOOK_SECRET` in Step 4

### Step 3: Redeploy (30 sec)

1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **Redeploy**

### Step 4: Setup Database (1 min)

Run this on your local machine:

```powershell
# Set your production database URL
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Backup current schema
Copy-Item prisma\schema.prisma prisma\schema.backup

# Use PostgreSQL schema
Copy-Item prisma\schema.production.prisma prisma\schema.prisma

# Generate and migrate
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Restore local schema
Copy-Item prisma\schema.backup prisma\schema.prisma
```

### Step 5: Setup Stripe Webhook (1 min)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Enter URL: `https://your-project.vercel.app/api/payment/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Click **Reveal** on Signing secret
7. Copy the `whsec_...` value
8. Go back to Vercel > Settings > Environment Variables
9. Update `STRIPE_WEBHOOK_SECRET` with the new value
10. Redeploy again

## ✅ Test Your Deployment (30 sec)

1. Open `https://your-project.vercel.app`
2. Login: `admin@ecommerce.com` / `admin123`
3. Go to Shop
4. Add item to cart
5. Checkout
6. Use test card: `4242 4242 4242 4242`
7. Any future expiry, any CVC
8. Complete payment
9. Check order status → Should be "Paid" ✅

## 🎉 Done!

Your e-commerce app is now live with working payments!

## 🔄 Next Steps

### To Accept Real Payments
1. Complete Stripe account verification
2. Switch to Live mode in Stripe Dashboard
3. Get Live API keys (pk_live_... and sk_live_...)
4. Create Live webhook
5. Update environment variables in Vercel
6. Redeploy

### To Customize
- Add your products via Admin Dashboard
- Update branding/colors
- Add more payment methods
- Configure shipping options

## 🆘 Quick Troubleshooting

### "Database connection error"
→ Check DATABASE_URL is correct and database is running

### "Stripe webhook not working"
→ Make sure STRIPE_WEBHOOK_SECRET is updated and redeployed

### "Build failed"
→ Run `npm run build` locally to see errors

### "Can't login"
→ Make sure you ran `npx prisma db seed` on production database

## 📚 Full Documentation

- Detailed Guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Testing: [STRIPE_TESTING.md](./STRIPE_TESTING.md)

---

**Need help?** Check the full documentation above or create an issue.
