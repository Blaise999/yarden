# Yarden V10 — ANGEL / cinematic playback + design

This build preserves Redis, Blob, Resend, the CMS and Yard Pass. It adds a redesigned public ANGEL experience, a reliable responsive video element and a clickable YouTube visuals wall.

## Why the two films appeared broken

Both actual files in this ZIP are playable H.264/AAC MP4s. The earlier player used overlapping CSS layers with negative z-index values, provided 16–18 KB low-quality posters, and depended on deployed static assets. Since you migrated the films to Git LFS, Vercel also needs to pull the actual LFS objects, not the Git pointer files. We cannot know which problem affected your live site until it is checked after deployment.

V10:
- Uses positive video layers and true object-fit:cover (no CSS blur).
- Selects the **desktop OR mobile** file on the client after checking the viewport; it does not preload both simultaneously.
- Muted, `playsInline` autoplay with explicit manual Play/Pause and Sound Off/On controls.
- Retries playback when buffered or visible; offers **Play film / Retry film** if autoplay is blocked or a file fails.
- Includes new 1920×1080 and 1080×1920 posters rendered from the actual source films.
- Uses click-to-play YouTube embeds rather than a hidden iframe API.
- Can use public Vercel Blob URLs instead of Git LFS if preferred.

## Step 1 — Git LFS on Vercel (most important)

1. Open **Vercel -> Yarden -> Settings -> Git**.
2. Under **Git Large File Storage (LFS)**, enable support.
3. Redeploy **after** changing that setting. Existing deployments are not automatically repaired.
4. Confirm `git lfs ls-files` locally lists both videos and `git lfs push origin main` has uploaded them. Avoid `git lfs migrate` again.

Vercel's documented behavior: https://vercel.com/docs/project-configuration/git-settings#git-large-file-storage-lfs

## Step 2 — Install the V10 update

Extract this ZIP over your **existing** local `C:\Users\user\Desktop\Yarden-Cms` folder, preserving the hidden `.git` folder, `.env.local`, and any uncommitted custom work. Or apply the *V10 PATCH* ZIP to update only changed files.

```powershell
cd C:\Users\user\Desktop\Yarden-Cms
git lfs install
git lfs ls-files
npm run check:films
npm install
npm run build
git add -A
git status
git diff --cached --stat
git commit -m "Yarden V10 - HD films and ANGEL editorial redesign"
git push origin main
```

Do not commit `.env.local` or any API secrets. Check that the media files appear in `git lfs ls-files` before pushing.

## Step 3 — Verify the deployed actual MP4s

Open these URLs in a new browser tab (replace the placeholder with your actual deployment domain):
- `https://YOUR-YARDEN-DOMAIN/videos/yarden-desktop.mp4`
- `https://YOUR-YARDEN-DOMAIN/videos/yarden-mobile.mp4`

The browser should show a playable film, not a page of text starting `version https://git-lfs.github.com/spec/v1`.

To check both local and deployed files:

```powershell
npm run check:films -- https://YOUR-YARDEN-DOMAIN
```

The checker looks at the real MP4 `ftyp` signature, detects Git LFS pointer files, and reports any 404/HTTP failures.

## Alternative — Serve videos via existing Vercel Blob

This avoids Git LFS on the production website. Your project already has a public Blob store. From the Yarden project directory with the Vercel CLI linked and authorized:

```powershell
vercel link
vercel blob put ./public/videos/yarden-desktop.mp4 --pathname films/yarden-desktop-v10.mp4
vercel blob put ./public/videos/yarden-mobile.mp4 --pathname films/yarden-mobile-v10.mp4
```

Record the TWO distinct `.public.blob.vercel-storage.com` URLs returned. Do **not** substitute a Vercel dashboard address. You can either:

- In Yarden **/admin -> Settings**, paste each public Blob URL under **Desktop film / Mobile film** and save. This updates the persistent CMS video URLs; or
- Add environment variables to Vercel and redeploy:
  `NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL` and `NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL`.

The code prefers custom CMS URLs; it uses optional public env URLs when the CMS video value remains the original `/videos/...` default. The two poster images can remain served from `/videos/...poster.webp`.

These are large public files, so requests consume Blob bandwidth. The default 1080p renditions balance detail and loading speed. Do not upload private or sensitive materials to a public Blob store.

## Browser behavior

Muted inline autoplay is permitted in most browsers, but a visitor's power-saving/data-saving or accessibility settings may block it. An explicit Play control is essential. Background film sound is off by default; visitors may enable it. The sharper poster stays visible when the video can't be retrieved.

## Design changes

The ANGEL chapter now includes a moving album ticker, editorial listening room, two-photo artist feature, interactive visual wall, polished tour ledger/empty states, tactile merch cards, redesigned Yard Pass/newsletter area and monumental Yarden wordmark footer. All CMS-managed content stays CMS-managed. Custom releases and admin edits are preserved.

## Validation

- `npm run check:films` passes for both bundled full MP4 files.
- TypeScript/TSX files parsed with TypeScript 5.8 (syntax check).
- All updated CSS parsed without syntax errors.
- Full Next.js `npm run build` was not runnable in this environment because the dependency registry was inaccessible; run it locally before pushing. The changes may still uncover version-specific build or runtime issues.
