
Write-Host "Stopping Node processes..."
taskkill /F /IM node.exe

Write-Host "Cleaning .next folder..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "Starting server..."
npm run dev
