# V18 — Search Engine Visibility + Ankh Favicons

This version includes the complete V17 artist website, music, HD videos, vinyl requests, admin, and AI fan mugshot (requires an API key). V18 improves search metadata, site-name structured data, favicon graphics, sitemap, crawler rules, and per-page canonical URLs. Google rankings and search-result favicons are not guaranteed. See `SEO-DEPLOY-CHECKLIST.md`.

# Yarden — ANGEL V17 (Next.js complete site)

This ZIP is a continuation of the user's **V16 project**, not a rebuilt demo. Original source, video delivery encodes, CMS, Yard Pass, vinyl order management and listening-party editor are preserved. Original UHD masters are available in the separate companion master-video ZIP, to avoid a fragile 270+ MB download.

## Quick start

1. `npm ci` (or `npm install`), then `npm run dev`.
2. Copy `.env.example` to `.env.local`. Populate your existing Redis, admin, email, etc. environment variables. Do not commit `.env.local`.
3. For realistic fan mugshots, create an OpenAI API key with access to `gpt-image-1.5` image editing and set **`OPENAI_API_KEY`** in `.env.local` (local) and Vercel **Project Settings → Environment Variables** (production). Do **not** use `NEXT_PUBLIC_` for this key. Redeploy after adding it.
4. Also set `ADMIN_SESSION_SECRET` (64+ hex characters) and working Upstash Redis in Vercel; the endpoint uses these for persistent, hashed per-visitor rate limits and a site-wide daily generation cap. `MUGSHOT_DAILY_LIMIT` defaults to **100**.
5. Use `/admin` for the existing CMS, vinyl reservations, and listening-party editor.

## V17 changes

- **Homepage:** smaller restrained `ANGEL.` title, tiny letter-spaced YARDEN signature so the cinema is visible; cleaner overlays and responsive dimensions.
- **Ankh:** replaced the unrelated ✳ star in the site wordmark, footer and Yard card with an ankh drawing matching the recurring visual motif in Yarden's published artwork. No unverified claim is made that this hand-drawn SVG is an official proprietary vector logo.
- **Fan studio:** `#mugshot` section linked from main nav. Fans upload a selfie, optionally enter their name, consent to third-party AI processing, and receive a realistic booking photograph. Site overlays crisp promotional board text independently of AI to prevent misspelling, allows minor board positioning, and produces a 1024×1536 PNG for sharing.
- **AI security & costs:** server-side `/api/mugshot` uses image-edit API; no key is shipped to the browser; JPG/PNG/WebP validation, client-side resampling, server upload size limit, 3 generations/hour per hashed visitor, global daily limit (default 100). Doesn't store fan pictures or generated results on the website. AI generation is **not free** and is disabled until `OPENAI_API_KEY` is configured.
- **Privacy:** visitor consent and `/privacy` notice updated for off-site AI image processing.
- **Originals preserved:** the desktop 2880×2160 and mobile 2160×3840 UHD masters were verified byte-for-byte against V16 and are supplied in the **companion Original UHD Masters ZIP**. Extract that ZIP alongside the web-ready ZIP to restore `public/videos/*-uhd.mp4`. The web-ready ZIP has the smaller faster HD files and all site code. See `DEPLOYMENT.md` for large-video deployment.

## Verification

- Updated TypeScript and TSX sources passed a static TypeScript syntax transpile check.
- Archived video file hashes can be compared against V16 and are not edited.
- **Full `npm run build` and live AI API generation were not verified in this environment** because npm dependencies could not be fetched and no OpenAI API key was available. Run `npm ci && npm run typecheck && npm run build` on your local machine or Vercel before going live.

If the AI editor sometimes moves fingers or the slate, prefer clear front-facing photographs. Exact identity, pose and framing cannot be guaranteed for arbitrary photographs.

## Package choices

- **WEB-READY-COMPLETE.zip:** full Next.js code and fast-loading HD video assets (approximately 54 MB). Can deploy without UHD masters.
- **Original-UHD-Masters-Desktop-Mobile.zip:** optional native-resolution UHD video files (approximately 116 MB). Unzip into the same directory as the web-ready project, restoring the original `public/videos` paths. They are not loaded by default unless the video URLs are configured accordingly.
- **Update.zip:** only changed code and CSS for users who already have V16. Extract into the V16 project folder, accepting file replacements.
