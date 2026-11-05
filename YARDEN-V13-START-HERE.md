# YARDEN V13 — ANGEL newsroom & fan experience

Updated November 5, 2026.

## What changed
- Removed the **film PLAY / PAUSE** button from the hero's normal controls. Silent video still autoplays where permitted and retains an error/retry action only if autoplay is blocked or the film fails.
- Hero album CTA says **STREAM ANGEL**, without a film-play triangle.
- Removed the top navigation's separate **Listen** action. The Music section and streaming links remain.
- Turned the old Press list into an editorial **Newsroom**: leading ANGEL-era feature, photo-driven stories, real publication links, readable cards, and Show All / Show Fewer.
- Added and verified recent coverage including TurnTable Charts (November 5, 2026), HypeTribe (October 30, 2026), Ghana Plug (October 30, 2026), Album Talks (October 27, 2026), and MMC Nation (October 16, 2026).
- Reworked the fan section into two clear editorial panels: **Create Yard Pass** and **Subscribe to updates**. Marketing consent remains separate from pass creation.
- Refined the Yard Pass modal spacing, header and card visual treatment without changing membership persistence or email functionality.
- Existing Redis CMS content survives: the verified ANGEL-era stories are supplemented into current press entries without touching custom site content, fan data or subscribers. Existing press-card image gaps receive corresponding local imagery where available.

## Install the patch on your existing Yarden repo (recommended)
1. Extract `Yarden-V13-ANGEL-Newsroom-YardPass-PATCH.zip` over the **root** of `C:\Users\user\Desktop\Yarden-Cms`, replacing the matching paths.
2. From the root (where `package.json` is):
   ```powershell
   npm install
   npm run build
   git add app/page.client.tsx app/yarden-v13.css components/landing/YardenVideoHero.tsx components/landing/PassModal.tsx content/defaultCms.ts libs/cmsStore.ts
   git commit -m "Yarden V13 - ANGEL newsroom and fan experience refinement"
   git push origin main
   ```
3. Vercel should redeploy from GitHub if connected.

## Full project ZIP
`Yarden-V13-ANGEL-HD-Website-FULL.zip` includes the entire V13 source and the **optimized silent HD** desktop and mobile videos. It intentionally excludes the OPTIONAL huge 4K MP4s, making the download practical. If you already uploaded 4K videos to Vercel Blob, leave `NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL` and `NEXT_PUBLIC_YARDEN_MOBILE_4K_URL` configured. Otherwise the high-quality HD films play by default.

## Media and news-image notes
- Recent images include photographs of Yarden and album art. Some are existing local editorial assets used to illustrate coverage; they are not necessarily each publication's original lead photo.
- ANGEL artwork comes from an external image URL and has a local fallback if that host is unavailable. For permanent hosting, upload an authorized album artwork master into your Vercel Blob store and replace that CMS URL.
- Existing live press stories are retained. The new ANGEL-era stories are added to the newsroom automatically; manage them in **CMS → Newsletter / Press**.

## Tested
- All JS/TS/TSX files parsed (73 files).
- Relative source imports resolved.
- New CSS parsed with no errors.
- Full production `next build` still requires installed npm packages and the production deployment configuration; run locally before pushing. This package does not embed Resend/Redis/Blob secrets.
