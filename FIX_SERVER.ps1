
Write-Host "Stopping any running Node.js processes (optional step, manual check recommended)..."
# Stop-Process -Name node -ErrorAction SilentlyContinue 

Write-Host "Cleaning up Prisma client cache..."
Remove-Item -Recurse -Force node_modules/.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Regenerating Prisma Client..."
npx prisma generate

Write-Host "Done! Please run 'npm run dev' again."
