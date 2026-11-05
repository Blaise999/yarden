# Run inside the folder that contains package.json. Creates local env file without shipping secrets.
$ErrorActionPreference = 'Stop'
if (Test-Path '.env.local') {
  Write-Host 'Existing .env.local detected. Not overwriting it.' -ForegroundColor Yellow
  exit 0
}
function New-RandomHex {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
}
$sessionSecret = New-RandomHex
$setupToken = New-RandomHex
@"
ADMIN_SESSION_SECRET=$sessionSecret
YARD_SETUP_TOKEN=$setupToken
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_NOTIFICATION_EMAIL=
EMAIL_REPLY_TO=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# BLOB_READ_WRITE_TOKEN= (only for legacy token stores)
"@ | Set-Content -Path '.env.local' -Encoding Ascii
Write-Host 'Created private .env.local with two random local-only secrets.' -ForegroundColor Green
Write-Host 'Add your Redis and email values yourself; never commit this file.'
