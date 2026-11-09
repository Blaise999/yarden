# Yarden V25 — ANGEL Collection / Vinyl / Direct Support

## Art direction preserved

- Same original Yarden navbar wordmark, ankh favicon, silver-and-black palette and one-image hero.
- Original Yarden-provided merchandise imagery; all 13 are included as optimized WebP assets in `/public/merch/angel-drop/gallery/`. No generated people or new product claims.
- Collection opens with the provided two-model photo, shows Black/White editions as the only sale-bound products, and displays the entire 13-frame campaign archive in a keyboard-scrollable, touch-friendly gallery. Merch pricing remains “TBA / Coming soon.”
- Sound of Yarden now has a decorative, gently moving equalizer and enhanced release hover transitions. It does not autoplay music.
- Rewritten hero, music and support copy removes most vague brand slogans.
- Vinyl has an interactive sleeve/record illustration, reworked layout, and the same admin-editable interest form and order-submission API as V24. The illustrated sleeve is not a claim that final vinyl manufacturing is approved.

## Payment security

- Server-side Flutterwave validation, tokenized purchase records and emailed private links from V24 are preserved.
- SDK-independent private-Blob URL delivery added for the locked `@vercel/blob` 2.0.1 package. Only the trusted Vercel private Blob hostname is accepted; Authorization never reaches the browser. A dedicated `ANGEL_PRIVATE_BLOB_TOKEN` keeps private album delivery separate from the existing CMS Blob upload token. No album file or key was included. Checkout remains disabled until properly configured.
- Instructions in `V25-ALBUM-DELIVERY.md`.

## Deploy and verify

1. Extract the patch into the current Git working directory (retain `.git`, `.env.local`, and any live assets).
2. Run `npm ci`, `npm run check:v24`, `npm run check:v25`, and `npm run build`. Do not push if any fail.
3. Use Git commit/pull-rebase/push and let the existing Vercel production branch deploy.
4. Verify mobile homepage, all 13 gallery frames, `/vinyl` admin-configured waitlist, album CTA disabled until credentials/files are in place, and the original hero/logo.

## Remaining live-only checks

Next.js production compilation, DNS/Resend configuration, actual Flutterwave payments, private Blob download and real-device layout must be verified in Vercel. No external accounts were connected or altered by this archive.
