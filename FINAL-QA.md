# Yarden ANGEL V19 — Final branding and launch QA

## Source-of-truth logo
- The supplied `yarden-main (1)(2).zip` contains `public/Pictures/logo.png`: custom YARD wordmark with distinctive flared ankh. This is an original supplied graphic, not a newly invented artist logo.
- Full source preserved as `public/brand/yard-original-upload.png`.
- `public/brand/yard-original-ivory.png` is a readable color variant of the exact logo silhouette and is used on The Yard collector card.
- `public/brand/ankh-original-ivory.png` is the exact flared silhouette extracted from the supplied logo (no generic outline). Used consistently throughout the site.
- Favicon/icon images trace that exact silhouette. Search engine display and indexing remain controlled by search engines.

## Production environment
- Admin: `ADMIN_SESSION_SECRET`, one valid pair of `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`). For first setup only `YARD_SETUP_TOKEN`; remove after activation.
- Email: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Verify the sending domain in Resend and configure TXT/MX/DKIM on the DNS provider that owns the domain (Vercel for thisisyarden.com).
- Mugshot: `OPENAI_API_KEY`; optional `MUGSHOT_DAILY_LIMIT=100`. Requires a funded API account and real-world validation with a test selfie. This app has a consent check and rate limits, and does not store photos.
- Original UHD master films are NOT in this small web ZIP. This package contains web-ready HD versions; higher-resolution masters are in the separate original-videos ZIP. If already using Vercel Blob/CDN, keep `NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL` / `NEXT_PUBLIC_YARDEN_MOBILE_4K_URL` exactly as set; V19 now actually reads those variables and prioritizes them over standard web-video URLs. If the external link fails, playback automatically falls back to the bundled web-ready video.

## Launch QA checklist
- Run `npm ci && npm run typecheck && npm test && npm run build` with Node >=20.9 from the project root.
- Open desktop + mobile to check hero video, posters, resize behavior and pause button.
- Verify `https://thisisyarden.com/favicon.ico`, `/sitemap.xml`, `/robots.txt` and metadata after deployment.
- Verify a first-time admin login, change-password, album editing, vinyl order submission and newsletter email in production with Redis and Resend configured.
- Confirm the mugshot image edit works end-to-end with actual OpenAI key and balance; simulated syntax checks cannot verify external API results.
- Review public tour dates, content, and album links in admin before publishing.

## Deployment
Copy this archive's project folder contents into your existing Git checkout (keep `.git/` and `.env.local` untouched). From that checkout: `git add . && git commit -m "Yarden V19 brand and hero final QA" && git push origin HEAD`.
