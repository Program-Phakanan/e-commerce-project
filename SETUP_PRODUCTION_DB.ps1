# Production Database Setup Script
# Run this after deploying to Vercel

Write-Host "🗄️  Production Database Setup" -ForegroundColor Cyan
Write-Host ""

# Get production database URL
Write-Host "Enter your PRODUCTION database URL:" -ForegroundColor Yellow
Write-Host "(Example: postgresql://user:password@host:5432/database)" -ForegroundColor Gray
$dbUrl = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Host "❌ Database URL is required!" -ForegroundColor Red
    exit 1
}

# Set environment variable
$env:DATABASE_URL = $dbUrl

Write-Host ""
Write-Host "✅ Database URL set!" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client!" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "Please check your database connection and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
Write-Host ""

# Ask about seeding
$seedDb = Read-Host "Do you want to seed the database with initial data? (y/n)"

if ($seedDb -eq "y") {
    Write-Host ""
    Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
    npx prisma db seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Seeding failed or partially completed." -ForegroundColor Yellow
        Write-Host "You may need to seed manually." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Production database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify data in your database" -ForegroundColor White
Write-Host "  2. Test your application at your Vercel URL" -ForegroundColor White
Write-Host "  3. Set up Stripe webhook (see VERCEL_DEPLOYMENT.md)" -ForegroundColor White
Write-Host ""
