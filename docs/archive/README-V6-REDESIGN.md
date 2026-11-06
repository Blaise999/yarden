# Yarden — Cinematic Film Edition (desktop + mobile)

This is a redesign of **the uploaded Yarden Next.js application**, using the two videos provided in `Yard.zip`. No Dagbana code or branding is included.

## What changed

- `components/landing/YardenVideoHero.tsx`: new film-led hero with autoplay (muted), loop, play/pause, unmute, scroll cue, reduced-motion support, and off-screen pausing.
- Desktop 1600 × 900, 24 fps H.264 film: `public/videos/yarden-desktop.mp4` (~2.3 MB).
- Mobile 720 × 1280, 24 fps H.264 film: `public/videos/yarden-mobile.mp4` (~1.7 MB).
- Compressed local WebP posters provide instant fallback when autoplay is blocked.
- `components/landing/YardenMusicGallery.tsx`: featured album / EP showcase, cover transition, working platform links, track listing, manual EP selection, and horizontal singles rail with tap-friendly controls.
- `app/yarden-film.css`: separate desktop and mobile compositions, editorial typography, responsive layout, motion with reduced-motion fallback.
- Original Yarden visuals, tour, store, press, newsletter/pass UI, app routes and CMS data retained.
- YouTube video player is loaded only when the visitor scrolls near the visuals section.

## Run on Windows

Extract to your own project folder and open in VS Code.

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`.

To test a production build:

```powershell
npm run build
```

`YARDEN-PREVIEW.html` is a **static visual sample**, not the Next.js app. Open it in your browser for the hero / releases layout; use `npm run dev` for functional EP changes, links, and CMS content.

## Existing content and editing

Album and single metadata, platform links, editorial features, and live/merch placeholders are sourced from `content/defaultCms.ts` or the existing CMS. The site links to releases from the uploaded project. The singles "Ifeoma", "Soul", and "Wetin" use official artwork image URLs; "Busy Body" has a designed fallback instead of a broken image because its original local artwork was missing. Replace that artwork when you have an approved image. This website is a concept until approved by Yarden/management. Verify the original project's tour, press and merchant data before publishing as official.

## IMPORTANT: original uploaded ZIP security

The original ZIP contained obfuscated executable JavaScript in `init`, appended to `tailwind.config.js`, and hidden at `app/api/admin/cms/reset/public/fonts/fa-brand-400.orc`, with VS Code configuration that auto-ran the disguised script when the folder opened. These are **not needed** for a Next.js site and were **excluded / replaced** in this package. The package's `dev`, `build`, and `start` scripts no longer execute `node init`. Do **not** reuse the original `init`, `.vscode` folder, `tailwind.config.js` or `.orc` file from the uploaded ZIP.

If you already opened the original archive in VS Code or ran `npm run dev` / `npm run build` with it, consider that the original code **may have executed**. Run Microsoft Defender's full and offline scans, inspect affected credentials/sessions, and rotate development tokens if warranted. This package's code has been inspected for the specific hidden scripts found, but it is not a comprehensive security audit of all original source and dependencies.

## Notes

- Original media and streaming artwork require the proper permissions for an official public website.
- Use the original artist's platform URLs in the CMS when you update the releases.
- On mobile, actual device screen dimensions vary, so the portrait film may crop slightly (CSS `object-fit: cover`).
- Autoplay with sound is generally blocked by browsers; initial playback is muted by design.
