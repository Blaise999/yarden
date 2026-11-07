# Run only from the Yarden repository root. Removes the unused V22 autoplay films.
if (-not (Test-Path "package.json")) { Write-Error "Open PowerShell in the Yarden project root first."; exit 1 }
if (Test-Path "public/videos") { Remove-Item "public/videos" -Recurse -Force }
if (Test-Path "components/landing/YardenVideoHero.tsx") { Remove-Item "components/landing/YardenVideoHero.tsx" -Force }
Write-Host "V23 cleanup complete. Original Yarden navbar logo, favicons, admin data and music art untouched."
