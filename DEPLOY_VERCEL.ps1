# Vercel Deployment Script
# This script helps you deploy to Vercel quickly

Write-Host "🚀 Starting Vercel Deployment Process..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI is not installed." -ForegroundColor Yellow
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before deploying, make sure you have:" -ForegroundColor White
Write-Host "  ✓ Created a Vercel account" -ForegroundColor Gray
Write-Host "  ✓ Set up a production database (Supabase/Neon/Railway)" -ForegroundColor Gray
Write-Host "  ✓ Have your Stripe API keys ready" -ForegroundColor Gray
Write-Host "  ✓ Reviewed VERCEL_DEPLOYMENT.md guide" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Ready to deploy? (y/n)"

if ($continue -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔧 Running pre-deployment checks..." -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Build locally to check for errors
Write-Host "Building project locally..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Local build successful!" -ForegroundColor Green
Write-Host ""

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "You will need to:" -ForegroundColor Yellow
Write-Host "  1. Link to your Vercel account" -ForegroundColor Yellow
Write-Host "  2. Set up environment variables in Vercel Dashboard" -ForegroundColor Yellow
Write-Host "  3. Configure Stripe webhook after deployment" -ForegroundColor Yellow
Write-Host ""

vercel

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables" -ForegroundColor White
Write-Host "  2. Add all required environment variables (see VERCEL_DEPLOYMENT.md)" -ForegroundColor White
Write-Host "  3. Redeploy after adding environment variables" -ForegroundColor White
Write-Host "  4. Set up Stripe webhook (see VERCEL_DEPLOYMENT.md Step 4)" -ForegroundColor White
Write-Host "  5. Run database migrations on production database" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
