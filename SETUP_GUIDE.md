# 📘 Setup Guide - E-commerce Management System

## ⚠️ Important: Database Setup Required

Before running the application, you **MUST** set up a Supabase database. Follow these steps:

---

## 🔧 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name:** e-commerce-management
   - **Database Password:** (Create a strong password - SAVE THIS!)
   - **Region:** Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

---

## 🔑 Step 2: Get Database Credentials

### A. Get Database URL

1. In your Supabase project, go to **Settings** (⚙️ icon)
2. Click **Database** in the left sidebar
3. Scroll to **Connection String** section
4. Select **URI** tab
5. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the password you created in Step 1

### B. Get Supabase API Keys

1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## 📝 Step 3: Update .env File

1. Open the `.env` file in the project root
2. Replace the placeholders:

```env
# Replace this line with your actual database URL from Step 2A
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Replace with your Project URL from Step 2B
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Replace with your anon key from Step 2B
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Generate a random secret (or use this one for development)
NEXTAUTH_SECRET=e-commerce-secret-key-2026-change-in-production

# Keep this as is for local development
NEXTAUTH_URL=http://localhost:3000
```

---

## 🗄️ Step 4: Initialize Database

Run these commands **in order**:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create all database tables
npx prisma migrate dev --name init

# 3. Seed initial data (Admin user, Order statuses, Categories)
npm run prisma:seed
```

### Expected Output:
```
🌱 Starting database seeding...
📦 Creating order statuses...
👤 Creating admin user...
📂 Creating sample categories...
✅ Database seeding completed!
```

---

## 🚀 Step 5: Run the Application

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## 🔐 Step 6: Login

Use these default credentials:

- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`

You should see the Dashboard with statistics!

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database URL copied and updated in `.env`
- [ ] Supabase API keys updated in `.env`
- [ ] `npx prisma generate` completed successfully
- [ ] `npx prisma migrate dev` created tables
- [ ] `npm run prisma:seed` added initial data
- [ ] Application running on http://localhost:3000
- [ ] Successfully logged in with admin credentials
- [ ] Dashboard displays correctly

---

## 🐛 Common Issues

### Issue 1: "Environment variable not found: DATABASE_URL"
**Solution:** Make sure you saved the `.env` file after updating it.

### Issue 2: "Can't reach database server"
**Solution:** 
- Check your internet connection
- Verify the DATABASE_URL is correct
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password

### Issue 3: "Prisma Client not generated"
**Solution:** Run `npx prisma generate` again

### Issue 4: Seed script fails
**Solution:** 
- Make sure migrations ran successfully first
- Check database connection
- Try running: `npx prisma migrate reset` (WARNING: This will delete all data)

### Issue 5: Login page shows but can't login
**Solution:** 
- Make sure you ran the seed script
- Check browser console for errors
- Verify API route is working: http://localhost:3000/api/auth/login

---

## 🔍 Verify Database in Supabase

1. Go to your Supabase project
2. Click **Table Editor** in the left sidebar
3. You should see these tables:
   - users
   - categories
   - products
   - customers
   - orders
   - order_items
   - order_statuses
   - inventory_logs

4. Click on **users** table - you should see the admin user
5. Click on **order_statuses** table - you should see 7 statuses

---

## 🎯 Next Steps

Once you've successfully logged in:

1. ✅ Explore the Dashboard
2. ⏳ Wait for Product Management features (Phase 3)
3. ⏳ Wait for Order Management features (Phase 3)
4. ⏳ Wait for remaining pages (Phase 4)

---

## 📞 Need Help?

If you encounter any issues:

1. Check the error message in the terminal
2. Check the browser console (F12)
3. Verify all environment variables are set correctly
4. Make sure Supabase project is active and running

---

**Current Status:** Phase 1 & 2 Complete ✅
- Database Schema ✅
- Authentication ✅
- Dashboard ✅
- Sidebar Navigation ✅

**Next:** Phase 3 - Product & Order Management 🚧
