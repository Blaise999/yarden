# V16 deployment notes

Deploy the entire extracted project, not the ZIP itself. Keep all existing production secrets and Redis data. No migration or reset is required. The new campaign settings and orders use new Redis keys.

Remove old `NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL` and `NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL` overrides if they point to large masters; otherwise upload the new `*-web.mp4` files to public Blob and set those two variables to the new URLs. Legacy `_4K_URL` variables are no longer used by the hero. Rebuild after environment changes. Built-in old CMS video filenames automatically select the new web copies; custom URLs remain respected.

Git LFS must deliver actual MP4 bytes, not pointer files. If using Blob, use a public store. The existing `.gitattributes` tracks the new video files too.

After deployment verify `/videos/yarden-desktop-web.mp4` and `/videos/yarden-mobile-web.mp4` load, then check the hero actually requests those URLs. Log into `/admin/angel`, add actual listening-party details and verify one consented test order. Production requires the same Upstash credentials and ADMIN_SESSION_SECRET as the existing site.

# Deploy to Vercel

## Environment
Set these on the intended Vercel environment, then redeploy:

| Variable | Purpose |
|---|---|
| UPSTASH_REDIS_REST_URL | HTTPS REST URL from your Upstash database |
| UPSTASH_REDIS_REST_TOKEN | Matching write-capable REST token |
| ADMIN_SESSION_SECRET | Random secret of at least 64 hexadecimal characters |
| YARD_SETUP_TOKEN | Separate random 64-character hexadecimal setup token |
| NEXT_PUBLIC_SITE_URL | Your actual HTTPS website origin |
| RESEND_API_KEY | Resend API key |
| EMAIL_FROM | Sender on a domain verified in Resend, e.g. Yarden <hello@your-domain.com> |
| EMAIL_REPLY_TO | Optional reply address |
| ADMIN_NOTIFICATION_EMAIL | Optional admin notification recipient |
| BLOB_READ_WRITE_TOKEN | Required only for CMS image uploads / Blob storage |

A complete KV_REST_API_URL / KV_REST_API_TOKEN pair is also supported. Credentials are never mixed between pairs. Existing Redis keys are retained. Back up your existing database before migration. Do not reset CMS to install this update: customized releases/news remain authoritative.

Choose Next.js, Node 22, `npm install`, and `npm run build`. Do not choose static export. `/api/health` returns 200 only when storage is reachable and the signing key is valid. Email configuration checks do not prove inbox delivery.

## Films: choose Git LFS or public Vercel Blob
The ZIP contains real bytes, not LFS pointers. `.gitattributes` tracks all four MP4s.

For GitHub:
```sh
git lfs install
git init
git add .
git commit -m "Repair Yarden ANGEL site"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```
Use the actual repository URL. No repository destination was supplied and no GitHub push was performed. Enable Git LFS support in the Vercel project's Git settings before deployment. Confirm the served videos are MP4 bytes with the included check script.

For Blob, upload the two silent *-uhd.mp4 files to a PUBLIC Blob store using the Vercel dashboard. Set NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL and NEXT_PUBLIC_YARDEN_MOBILE_4K_URL to the resulting public URLs, then rebuild. Optional poster URL variables are supported. CMS Site Settings can also set the video URLs; environment overrides take priority. The CMS image upload route accepts images up to 4 MiB; large videos must use Blob upload, not that route.

Original masters are kept unchanged in `public/videos/*-4k.mp4`. They are not requested by the player. The desktop original is 2880×2160; the mobile original is 2160×3840. They retain the original filenames. V15 defaults to silent H.264 stream copies in *-uhd.mp4 at the native master resolution, with faststart. No video re-encoding or artificial upscale was applied. The 2880×2160 desktop source is 4:3 2160p, not 3840×2160 widescreen. Each UHD file is about 58 MB; smooth playback depends on bandwidth and device decoding. The silent 1080p alternatives remain bundled if lower bandwidth delivery is desired.

```sh
npm run check:films -- https://YOUR-DOMAIN
```

## Go-live checks
1. Confirm `/api/health` is 200 with Redis connected.
2. Create the initial admin at `/admin`, then remove YARD_SETUP_TOKEN and redeploy. Keep ADMIN_SESSION_SECRET stable to preserve signed member cookies.
3. Edit one CMS item, refresh, and confirm it persists. Check all existing sections.
4. Register a Yard Pass, refresh, download the card, and confirm it appears in admin. Pass recovery is cookie/browser-bound; email is not a login method.
5. Subscribe using an inbox you control, confirm Resend delivery, then test the unsubscribe link. Use only an opted-in test recipient for campaign testing.
6. Test a real iPhone/Safari and Android/Chrome on Wi-Fi and mobile data. Browsers can block autoplay in low-power/data-saving modes. A small pause/resume control remains; there is no Play Now overlay.
7. Test image uploads with Blob configured. Verify your exact production origin and external streaming/video links.

A production build is verified; a live Vercel deployment, live Upstash account, Resend inbox delivery and Blob writes were not performed without account access/credentials.
