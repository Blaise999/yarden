# Yarden site — 2026 redesign (v3) — drop-in

Copy every file/folder here into your repo at the **same path** (overwrite when asked).
No new dependencies. Nothing else in your project needs changing.

## What's in this drop
- `app/page.client.tsx` — the whole landing page, rebuilt. Scoped under `.yd`.
- `app/redesign.css` — all styling (scoped under `.yd`, cannot leak into /admin).
- `app/page.tsx` — patched to pass `press` (from `cms.newsletter.pressItems`) to the page.
- `app/layout.tsx` — full SEO/OG/Twitter metadata + ankh icons + preconnects (speed).
- `app/{favicon.ico,icon.svg,apple-icon.png,opengraph-image.png,manifest.ts}` + `public/icon-192/512.png` — ankh brand icons.
- `components/landing/PassModal.tsx` + `components/landing/pass/YardPassGen.tsx` — the **working** Yard Pass generator.
- `app/admin/AdminPage.client.tsx` — admin CMS restyled to a dark on-brand console (logic untouched).
- `components/CookieConsent.tsx`, `content/defaultCms.ts` (cleaned).
- `preview/yarden-redesign.html` — open in any browser to preview (fully self-contained, the pass generator works in it too).

## What changed in v3 (your feedback, point by point)
1. **Now Playing** rotates through the **singles** every ~4s, each linking out to that single.
2. **Catalogue** now spotlights **only projects (EPs)** — Muse + The One Who Descends — and **auto-rotates** with dots/arrows. Singles live in "The singles" grid below. Detection is robust (format/subtitle/chips = EP/Album, or a tracklist ≥ 2).
3. **Correct links** everywhere: play/tracklist → the release's primary streaming link; "All platforms" → the smart link (`vyd.co/YardenMuse`, `yarden.lnk.to/towd`); platform pills come straight from each release's `links`.
4. **Lyrics rotate** every ~5.6s. ⚠️ **Edit `LYRICS` at the top of `page.client.tsx`** — line 1 ("ME & U") is confirmed; replace/extend lines 2–4 with your exact deepest lines.
5. **Videos autoplay** (muted) and **advance** automatically; click any queue item to jump; a mute/unmute button appears once playing. (Muted autoplay needs a real browser — it won't fire in a headless preview.)
6. **On the road** poster is now the **CMS `posterSrc`** of your next show — edit it in admin (upload the next concert's promo image). Falls back to `/Pictures/yard.jpg` if none is set.
7. **Merch** rebuilt as a clean, uniform 4-card grid (tag, name, price/Notify, gold hover).
8. **Get the Pass** is a real, working generator: fill name/email/phone/gender → a live **canvas pass** renders → **downloads a PNG** and **POSTs to `/api/passes`** (your existing endpoint, unchanged).

Also: hero A↔B crossfade, mobile hamburger menu, real socials (IG/TikTok/X/YouTube/Audiomack) everywhere, lazy-loading + preconnects for speed, reduced-motion respected.

## Notes
- Single artwork uses each release's `art`; if a path 404s it falls back to a hero image.
- The tour poster and pass both have graceful fallbacks, so nothing renders broken.
- Everything is under `.yd`, so `/admin` styling is untouched.
