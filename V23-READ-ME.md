# Yarden V23 — ANGEL / Silver Editorial

## What's new
- Static user-supplied studio hero photo: desktop DSC8643, mobile DSC8641 (optimized responsive WebP).
- No hero video, no automatic downloads and no video-player JS on the homepage.
- Glossy silver/charcoal direction instead of grain and lime typography.
- Focused homepage: hero, ANGEL spotlight, admin-editable listening parties, newsletter.
- Dedicated `/music`, `/films`, `/vinyl`, `/mugshot`, `/journal`, `/yard` and refreshed `/about` pages.
- Exact original Yarden navbar wordmark with embedded ankh; favicon untouched.
- V22 admin API, vinyl orders, mugshot API, saved data, and analytics remain intact.
- Source artwork preserved as needed for album covers; older artist photos are not used in new live-page content.

## Deployment
1. Apply the patch to the ROOT of the existing Git repository (the directory containing package.json).
2. `npm ci && npm run typecheck && npm run build && npm run check:performance`.
3. Push: `git add .; git commit -m "Yarden V23 silver editorial redesign"; git pull --rebase origin main; if ($LASTEXITCODE -eq 0) { git push origin main }` (PowerShell).
4. Vercel redeploys the production branch if linked.

`OPENAI_API_KEY` remains needed for AI mugshots, Upstash Redis for CMS/admin, `BLOB_READ_WRITE_TOKEN` for admin uploads, and `RESEND_API_KEY` for email.

## Note on photographs
Only images from the newly supplied `yarden.zip` are used for new artist photography. Admin-uploaded listening-party images remain user-editable and take precedence. Official music cover artwork remains unchanged.
