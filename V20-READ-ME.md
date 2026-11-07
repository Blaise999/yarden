# Yarden ANGEL V20 — listening room and film repair

This builds on V19 **including the original Yarden wordmark/navbar logo patch**.

## What changed

- Replaced the old `Feel it in person` block with the ANGEL listening room. The image, title, eyebrow, intro, dates, venues, hours, descriptions, RSVP links, status, and per-event photos are managed through `/admin/angel`.
- Removed the duplicate basic listening-party list near the vinyl section. Listening dates now have one data source: the existing persistent `yarden:angel:config:v1` record. Existing saved event information and vinyl orders are preserved.
- Admin uploads use the existing authenticated `/api/admin/upload` endpoint and **Vercel Blob**. Set `BLOB_READ_WRITE_TOKEN` for uploads. Files must be JPG/PNG/WebP/GIF, 4 MB maximum.
- New events start **unpublished**. Old saved events (without a `published` flag) remain visible, preserving the previous content.
- Replaced the generic star in the listening-room art with the actual ankh extracted from the supplied YARD logo.
- Added a timeout fallback for silent hero film remote 4K URLs: when the 4K file doesn't yield playable video, the built-in H.264 file becomes the source. Also fixed an early return that could stop autoplay attempts before a source was ready.
- Updated Films player to parse common YouTube URL formats and provide an external YouTube link if embedding is restricted.

## How to use

1. Merge/extract the patch contents into your existing Yarden Git folder, **preserving `.git`**, or use the complete ZIP if starting fresh.
2. Open `/admin/angel` and edit `Listening room — appearance` and `Listening-party dates`.
3. For each new date, set a date, city, venue, time, status, photos and link; check `Published on homepage` and click `Save & publish updates`.
4. In Vercel, configure `BLOB_READ_WRITE_TOKEN` (for photo uploads) and the existing Redis storage credentials (for persistence). If you host UHD video with public URLs, keep the `NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL` and `NEXT_PUBLIC_YARDEN_MOBILE_4K_URL` variables.
5. Push the changed files and check that Vercel builds successfully, then test desktop/mobile playback and the admin updates live.

## QA limitations

- TypeScript/TSX syntax parsing and local import/asset checks were performed; the bundled MP4 containers were checked using ffprobe, and the desktop/mobile listening-room layouts were screenshot-tested with Chromium.
- The full Next.js production build could not run here because dependency installation from the npm registry is unavailable. The live API-backed features and external 4K sources need testing in Vercel.
- Some videos cannot be embedded if their YouTube owner disables embedding; this release includes a direct watch-on-YouTube link as a fallback.
