# 🛒 E-commerce Management System

ระบบจัดการร้านค้าออนไลน์ครบวงจร พัฒนาด้วย Next.js 15, TypeScript, Tailwind CSS, Prisma และ PostgreSQL (Supabase)

## 🎯 Features

### ✅ Phase 1 & 2 Completed:
- ✅ Database Schema (Prisma) - 9 Tables
- ✅ Authentication System (Login with JWT)
- ✅ Dashboard with Statistics
- ✅ Responsive Sidebar Navigation
- ✅ Orange Pastel Color Theme

### 🚧 In Progress (Phase 3 & 4):
- ⏳ Product Management (List, Create, Edit)
- ⏳ Order Management
- ⏳ Customer Management
- ⏳ Inventory Tracking
- ⏳ Reports & Analytics
- ⏳ Admin Settings

## 🗄️ Database Schema

### Tables:
1. **Users** - ผู้ใช้งานระบบ (Admin, Manager, Staff, Customer)
2. **Categories** - หมวดหมู่สินค้า
3. **Products** - สินค้า
4. **Customers** - ลูกค้า
5. **Orders** - คำสั่งซื้อ
6. **Order_Items** - รายการสินค้าในคำสั่งซื้อ
7. **Order_Statuses** - สถานะคำสั่งซื้อ (7 สถานะ)
8. **Inventory_Logs** - ประวัติการเคลื่อนไหวสต็อก

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL Database (Supabase recommended)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd anti
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Environment Variables**

Create a `.env` file in the root directory:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Secret
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

4. **Setup Supabase Database**

- Create a new project on [Supabase](https://supabase.com)
- Copy your database URL from Project Settings > Database
- Update the `.env` file with your credentials

5. **Run Prisma Migrations**

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed initial data (Order Statuses, Admin User, Categories)
npm run prisma:seed
```

6. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

After running the seed script, use these credentials:

- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`
- **Role:** Admin

## 📁 Project Structure

```
anti/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── dashboard/    # Dashboard data endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── globals.css       # Global styles (Orange Pastel Theme)
│   ├── layout.tsx        # Root layout with AuthProvider
│   └── page.tsx          # Home page (redirects)
├── components/
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── DashboardLayout.tsx # Dashboard wrapper
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   ├── prisma.ts         # Prisma client instance
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
└── .env                  # Environment variables
```

## 🎨 Color Theme (Orange Pastel)

```css
Primary: #FFB84D
Primary Hover: #FF9E44
Background: #FFF5E6
Card Background: #FFFFFF
Text Primary: #2D2D2D
Text Secondary: #6B7280
Success: #4ADE80
Warning: #FBBF24
Danger: #EF4444
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Custom CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT, bcryptjs
- **Icons:** Lucide React
- **Notifications:** SweetAlert2
- **Charts:** Recharts (for reports)

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma Commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npx prisma studio        # Open Prisma Studio (Database GUI)
```

## 🚀 Deployment to Vercel

### Quick Deploy
```powershell
# Run automated deployment script
.\DEPLOY_VERCEL.ps1
```

### Manual Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set up environment variables in Vercel Dashboard
5. Configure Stripe webhook

### Production Database Setup
```powershell
# After deploying to Vercel
.\SETUP_PRODUCTION_DB.ps1
```

📖 **Full Deployment Guide:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete instructions

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXTAUTH_SECRET` - Secret for authentication
- `NEXTAUTH_URL` - Your production URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret


## 🔄 Order Statuses

The system includes 7 order statuses:

1. 🔴 รอชำระเงิน (Pending Payment)
2. 🟠 รอจัดเตรียม (Preparing)
3. 🟡 กำลังแพ็คสินค้า (Packing)
4. 🔵 พร้อมจัดส่ง (Ready to Ship)
5. 🟣 กำลังจัดส่ง (Shipping)
6. 🟢 จัดส่งสำเร็จ (Delivered)
7. ⚫ ยกเลิก (Cancelled)

## 📊 Dashboard Features

- **Total Orders Today** - คำสั่งซื้อวันนี้
- **Total Revenue (Month)** - รายได้เดือนนี้
- **Pending Orders** - คำสั่งซื้อรอดำเนินการ
- **Low Stock Alert** - สินค้าใกล้หมด (< 10 ชิ้น)
- **Recent Orders Table** - รายการคำสั่งซื้อล่าสุด 10 รายการ

## 🔐 Role-Based Access Control (RBAC)

- **Admin** - Full access to all features
- **Manager** - Manage products, orders, customers
- **Staff** - View and update orders
- **Customer** - View own orders (future feature)

## 📝 Next Steps (Remaining Pages)

### Phase 3: Core Features
- [ ] Product List Page (with Search/Filter)
- [ ] Create/Edit Product Page
- [ ] Order List Page
- [ ] Order Detail Page

### Phase 4: Complete All Screens
- [ ] Customer List Page
- [ ] Customer Detail Page
- [ ] Add/Edit Customer Page
- [ ] Reports Page
- [ ] Admin Settings Page

## 🐛 Troubleshooting

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Connection Error
- Check your DATABASE_URL in `.env`
- Ensure Supabase project is active
- Verify database credentials

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

E-commerce Management System - 2026

---

**Status:** 🚧 In Development (Phase 2 Complete)
