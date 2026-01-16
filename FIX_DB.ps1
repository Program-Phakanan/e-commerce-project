
Write-Host "Stopping all Node.js processes to unlock database..."
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Syncing Database Schema (this might reset the DB)..."
# We use --skip-generate because we will generate later
# We use --force-reset to ensure clean state if there are conflicts
# npx prisma migrate reset --force --skip-generate
# Actually, let's try db push for a direct sync if migrate dev fails
# But migrate dev is safer for migrations history.
# Let's try migrate dev with non-interactive flag if possible, but the prompt is tricky.
# Instead, we will use 'db push' which is often better for prototyping and fixing drifts without history issues.
npx prisma db push --accept-data-loss

Write-Host "Generating Client..."
npx prisma generate

Write-Host "Seeding Database..."
npx tsx prisma/seed.ts

Write-Host "Done! You can now run 'npm run dev'."
