# YARDEN V12 — ANGEL SILENT CINEMA + REAL YARD PASS

## What changed
- The default hero loads **1080p HD**, NEVER 4K automatically. Visitors can choose 4K manually only when available.
- Both the desktop and portrait mobile MP4 files have been rebuilt **without an audio track**, and their MP4 headers are optimized for playback (`faststart`). There is no sound button.
- HD: desktop 1920×1080 (~6.8 MB); mobile 1080×1920 (~5.8 MB). 4K: desktop 3840×2160 (~30 MB), mobile native 2160×3840 (~58 MB). Desktop 4K is an upscale/crop from an original 2880×2160 master, not native 4K acquisition.
- New sharp 14-second-frame posters, transparent overlay navigation, reduced GPU-heavy grain/filter layers, playback fallback/retry and no React re-render on every video timeupdate.
- ANGEL-era Yard Pass card: refined canvas art, preview, true 2160×1320 PNG output, browser-local render; no images stored in Redis.
- Real `/api/health` Redis PING, not just a Boolean env check. Registration reports distinct codes for missing Redis credentials, missing admin secret, or unreachable service. Pass-form opening checks service availability.
- Sending Yard Pass welcome and admin email notifications now occurs concurrently, with a Resend request timeout capped at 4.5 seconds (instead of up to 20 seconds sequentially). Email delivery is optional and does not invalidate successfully saved membership.
- CMS, Redis record keys, existing Yard Pass records, Resend logic, and album/merch/tour editors are preserved.

## Which ZIP should I use?
1. `Yarden-V12-ANGEL-FULL-Nextjs-HD-4K-SILENT.zip`: All source, artwork, and all four silent MP4s. Extract over your Yarden folder without removing `.git`.
2. `Yarden-V12-ANGEL-FIX-PATCH.zip`: Code, CSS, docs and posters only. Use on top of V11 or above.
3. `Yarden-V12-Optimized-HD-Silent-Films.zip`: Two **new silent, optimized HD MP4s** and posters; combine with the small code patch. Recommended if Git LFS still gives you trouble.
4. `Yarden-V12-Optional-Silent-4K-Films.zip`: Two silent 4K MP4s, for optional visitor-initiated playback. Much larger files.

## Fix the actual Yard Pass storage error on Vercel
Vercel > Project **yarden** > Storage already shows your Upstash Redis as available. That is good, but it doesn't by itself prove the *production deployment* has credentials or the admin session secret.

Visit `https://YOUR-ACTUAL-YARDEN-DOMAIN/api/health` after deployment. This public status endpoint returns **no credentials**.

You need ALL of these to be `true`:
- `checks.persistentStorage`: at least one *complete* Redis environment-variable pair exists.
- `checks.redisReachable`: the server successfully pinged Upstash Redis.
- `checks.sessionSigningSecret`: `ADMIN_SESSION_SECRET` is present and is 64+ hexadecimal characters.

Production environment variables (set in Vercel project Settings > Environment Variables):
```
ADMIN_SESSION_SECRET=GENERATE_A_FRESH_64_CHAR_HEX_VALUE
YARD_SETUP_TOKEN=GENERATE_A_DIFFERENT_64_CHAR_HEX_VALUE
UPSTASH_REDIS_REST_URL=YOUR_OWN_REAL_UPSTASH_URL
UPSTASH_REDIS_REST_TOKEN=YOUR_OWN_REAL_UPSTASH_TOKEN
```
Use `KV_REST_API_URL` and `KV_REST_API_TOKEN` instead if Vercel provided those. Only ONE complete Redis pair is needed. Do not mix pairs. If Vercel integration automatically created variables, don't duplicate them; verify their *exact names* and that they're available in Production.

Generate both admin secrets separately (PowerShell):
```
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```
Run that twice and use a DIFFERENT output for each variable. If you already have a working admin account or Yard Pass cookies, **retain the existing `ADMIN_SESSION_SECRET`**; replacing it would invalidate existing sessions/cookies. Don't share keys in chat or commit `.env.local`.

After changing env variables, **redeploy** the Vercel Production deployment so the new variables are active. Then check `/api/health` again and create a test Yard Pass. You do **not** need Supabase.

Resend must have a fresh private API key and verified `EMAIL_FROM`, but lack of Resend should not prevent Yard Pass registration. If the previously pasted key is still active, revoke and replace it.

## Video playback on Vercel — do not deploy Git LFS pointer text
These are *real MP4 files*. GitHub with LFS enabled can hold them, but Vercel must also fetch the LFS data. If it doesn't, the deployed `/videos/*.mp4` URL may return a 100–200 byte text pointer rather than an actual movie.

**Most reliable**: In Vercel > Storage > `yarden-blob`, upload the two HD films to your public Blob store, copy each public URL, and set:
```
NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL=https://YOUR-REAL-DESKTOP-HD-BLOB-URL
NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL=https://YOUR-REAL-MOBILE-HD-BLOB-URL
```
The above explicit URLs override old CMS default film paths. Do not enter fake/sample URLs. Redeploy.

If you upload the optional 4K silent MP4s, also set:
```
NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL=https://YOUR-REAL-DESKTOP-4K-BLOB-URL
NEXT_PUBLIC_YARDEN_MOBILE_4K_URL=https://YOUR-REAL-MOBILE-4K-BLOB-URL
```
The new hero defaults to silent HD EVEN WHEN a 4K URL is configured. Users must click `4K` to play it.

Optional: If your old CMS saved blurry poster URLs, replace them in Admin > Settings, or override with:
```
NEXT_PUBLIC_YARDEN_DESKTOP_POSTER_URL=https://YOUR-REAL-DESKTOP-POSTER-URL
NEXT_PUBLIC_YARDEN_MOBILE_POSTER_URL=https://YOUR-REAL-MOBILE-POSTER-URL
```

If you prefer Git LFS, verify **Vercel > Yarden > Settings > Git > Git LFS** is enabled, then redeploy. From the local project folder, run:
```
npm run check:films -- https://YOUR-ACTUAL-YARDEN-DOMAIN
```
If using Blob URL overrides, check those Blob URLs directly instead of relying on the old `/videos/` local path checker.

## GitHub update (existing repo)
In `C:\Users\user\Desktop\Yarden-Cms`:
```
 git remote -v
 npm install
 npm run build
 git add -A
 git status
 git commit -m "Yarden V12 - silent fast cinematic films and Yard Pass redesign"
 git push origin main
```
Repository should be `https://github.com/Blaise999/yarden.git`. Preserve `.git`. Do not run `git init` again, force-push, or commit env files.

## Verification status
- All 73 JS/TypeScript sources checked for syntax and relative import paths.
- Four MP4s validated as real H.264 video, no audio streams, with decoding samples and faststart format.
- Local persistence passed create/read/save/set deduplication tests.
- Zip integrity checked.
- A complete Next.js build cannot be verified in this offline environment; run `npm install` and `npm run build` locally. Live Upstash, Blob and Vercel credentials are not accessible to this ZIP build, so production storage and playback MUST be checked using the deployed endpoints above.
