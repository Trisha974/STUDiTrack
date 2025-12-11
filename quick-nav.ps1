# Quick Navigation Helper Script
# Usage: .\quick-nav.ps1 [server|react|root]

param(
    [Parameter(Position=0)]
    [ValidateSet('server', 'react', 'react-app', 'root')]
    [string]$Target = 'root'
)

$rootPath = Split-Path -Parent $PSScriptRoot

switch ($Target) {
    'server' {
        $targetPath = Join-Path $rootPath 'server'
        if (Test-Path $targetPath) {
            Set-Location $targetPath
            Write-Host "✅ Navigated to server directory" -ForegroundColor Green
            Write-Host "📁 Current: $(Get-Location)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Server directory not found at: $targetPath" -ForegroundColor Red
        }
    }
    'react' {
        $targetPath = Join-Path $rootPath 'react-app'
        if (Test-Path $targetPath) {
            Set-Location $targetPath
            Write-Host "✅ Navigated to react-app directory" -ForegroundColor Green
            Write-Host "📁 Current: $(Get-Location)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ React-app directory not found at: $targetPath" -ForegroundColor Red
        }
    }
    'react-app' {
        $targetPath = Join-Path $rootPath 'react-app'
        if (Test-Path $targetPath) {
            Set-Location $targetPath
            Write-Host "✅ Navigated to react-app directory" -ForegroundColor Green
            Write-Host "📁 Current: $(Get-Location)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ React-app directory not found at: $targetPath" -ForegroundColor Red
        }
    }
    'root' {
        Set-Location $rootPath
        Write-Host "✅ Navigated to root directory" -ForegroundColor Green
        Write-Host "📁 Current: $(Get-Location)" -ForegroundColor Cyan
    }
}

Write-Host "`n💡 Tip: Use '.\quick-nav.ps1 server' or '.\quick-nav.ps1 react' to navigate quickly" -ForegroundColor Yellow


