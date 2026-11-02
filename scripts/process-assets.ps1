# Regenerates optimised WebP assets in src/assets from the raw art in art-src/
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/process-assets.ps1
$root = Split-Path -Parent $PSScriptRoot
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }
$outDir = Join-Path $root "src\assets"
New-Item -ItemType Directory -Force $outDir | Out-Null
$page = "file:///" + ((Join-Path $root "scripts\process-assets.html") -replace '\\', '/')
$profile = Join-Path $env:TEMP "bts-chrome-profile"

$dom = & $chrome --headless=new --disable-gpu --no-sandbox --disable-web-security --allow-file-access-from-files `
  --user-data-dir="$profile" --virtual-time-budget=60000 --dump-dom $page 2>$null | Out-String

$m = [regex]::Match($dom, '<pre id="out">([\s\S]*?)</pre>')
if (-not $m.Success) { throw "No output from asset processor" }
foreach ($line in ($m.Groups[1].Value -split "`n")) {
  $line = $line.Trim()
  if (-not $line) { continue }
  $parts = $line.Split('|')
  if ($parts[0] -eq 'ERROR') { throw $line }
  $file = Join-Path $outDir $parts[0]
  [IO.File]::WriteAllBytes($file, [Convert]::FromBase64String($parts[2]))
  "{0,-26} {1,-10} {2,8:N0} KB" -f $parts[0], $parts[1], ((Get-Item $file).Length / 1KB)
}
