# package-backend.ps1 - Zip Laravel backend (EXCLUDING vendor/) for CWP upload.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'

$be       = $PSScriptRoot
$root     = Split-Path -Parent $be
$zipPath  = Join-Path $root 'backend-upload.zip'

$excludeDirs  = @('vendor', 'node_modules', 'storage\logs', 'storage\framework\cache', 'storage\framework\sessions', 'storage\framework\views')
$excludeFiles = @('.env', 'serve.log', 'serve.err', '.env.supabase.example')

$tempStaging = Join-Path $env:TEMP "absen-backend-stage-$(Get-Random)"
if (Test-Path $tempStaging) { Remove-Item $tempStaging -Recurse -Force }
New-Item -ItemType Directory -Path $tempStaging -Force | Out-Null

Write-Host '==> Collecting backend files (excluding vendor/ and local env)...' -ForegroundColor Cyan
$files = Get-ChildItem -Path $be -Recurse -File -Force | Where-Object {
    $rel = $_.FullName.Substring($be.Length + 1)
    $skip = $false
    foreach ($d in $excludeDirs) {
        if ($rel -like "$d\*" -or $rel -like "$d/*") { $skip = $true; break }
    }
    if (-not $skip -and $excludeFiles -contains $_.Name) { $skip = $true }
    -not $skip
}

$count = 0
foreach ($f in $files) {
    $rel = $f.FullName.Substring($be.Length + 1)
    $dest = Join-Path $tempStaging $rel
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $f.FullName -Destination $dest -Force
    $count++
}

foreach ($d in @('storage\app\public', 'storage\framework\cache\data', 'storage\framework\sessions', 'storage\framework\views', 'storage\logs')) {
    $p = Join-Path $tempStaging $d
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
    Set-Content -Path (Join-Path $p '.gitkeep') -Value '' -NoNewline
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Write-Host "==> Zipping $count files..." -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $tempStaging '*') -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item $tempStaging -Recurse -Force -ErrorAction SilentlyContinue

$sizeKB = [math]::Round((Get-Item $zipPath).Length / 1KB, 0)
Write-Host ''
Write-Host 'DONE.' -ForegroundColor Green
Write-Host "Archive : $zipPath"
Write-Host "Size    : $sizeKB KB ($([math]::Round($sizeKB/1024,2)) MB)"
Write-Host "Files   : $count"
Write-Host ''
Write-Host 'Upload steps:' -ForegroundColor Cyan
Write-Host '  1. Upload backend-upload.zip into public_html/api_laravel/ then Extract'
Write-Host '  2. In SSH/Terminal run:'
Write-Host '        cd ~/public_html/api_laravel'
Write-Host '        cp .env.cwp.example .env   (edit DB / APP_URL / FRONTEND_URL)'
Write-Host '        composer install --no-dev --optimize-autoloader'
Write-Host '        php artisan key:generate'
Write-Host '        php artisan migrate --seed'
Write-Host '        php artisan config:cache && php artisan route:cache'
Write-Host '        chmod -R 775 storage bootstrap/cache'
Write-Host '  3. Set api subdomain docroot -> public_html/api_laravel/public'
