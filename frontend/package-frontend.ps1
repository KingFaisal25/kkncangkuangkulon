# ==========================================================
#  package-frontend.ps1
#  Build the frontend and zip dist/ for CWP upload.
#  Output: Absen-KKN-Main/dist-upload.zip
# ==========================================================
[CmdletBinding()]
param(
    [switch]$SkipBuild   # pass -SkipBuild to only zip an existing dist/
)

$ErrorActionPreference = 'Stop'
$root      = Split-Path -Parent $PSScriptRoot        # repo root (one above frontend/)
$fe        = Join-Path $PSScriptRoot ''              # frontend/
$dist      = Join-Path $PSScriptRoot 'dist'
$zipPath   = Join-Path $root 'dist-upload.zip'

if (-not $SkipBuild) {
    Write-Host '==> Building production frontend...' -ForegroundColor Cyan
    Push-Location $PSScriptRoot
    try {
        if (-not (Test-Path 'node_modules')) {
            Write-Host '    node_modules missing, running npm install...' -ForegroundColor Yellow
            npm install
        }
        npx vite build
    } finally { Pop-Location }
}

if (-not (Test-Path $dist)) {
    throw "dist/ not found at $dist. Run without -SkipBuild first."
}

# Sanity: make sure the .htaccess + models are present (required for CWP)
$mustHave = @('.htaccess', 'index.html', 'models')
foreach ($f in $mustHave) {
    if (-not (Test-Path (Join-Path $dist $f))) {
        Write-Warning "Missing in dist/: $f (upload will be incomplete)"
    }
}

# Remove old zip
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Write-Host '==> Zipping dist/ ...' -ForegroundColor Cyan
# Compress the CONTENTS of dist/ (not the dist folder itself) so the zip
# extracts directly into public_html/.
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ''
Write-Host 'DONE.' -ForegroundColor Green
Write-Host "Archive : $zipPath"
Write-Host "Size    : $sizeMB MB"
Write-Host ''
Write-Host 'Upload steps:' -ForegroundColor Cyan
Write-Host '  1. Upload dist-upload.zip to CWP File Manager -> public_html/'
Write-Host '  2. Right-click -> Extract (into public_html/)'
Write-Host '  3. Delete the .zip after extracting.'
Write-Host '  Make sure .htaccess extracted (enable "show hidden files" in File Manager).'