# Auto-restore script for Prof.jsx
# Run this if the file gets cleared

$backupPath = "Prof.jsx.backup"
$targetPath = "Prof.jsx"

if (Test-Path $backupPath) {
    Copy-Item $backupPath -Destination $targetPath -Force
    Write-Host "✅ Prof.jsx restored from backup!" -ForegroundColor Green
    $size = (Get-Item $targetPath).Length
    Write-Host "   File size: $size bytes" -ForegroundColor Cyan
} else {
    Write-Host "❌ Backup file not found!" -ForegroundColor Red
}


