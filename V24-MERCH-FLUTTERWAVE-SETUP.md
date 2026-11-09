# Yarden ANGEL V24 — Merch + Direct Digital Support

## Homepage
- Silver editorial hero retained, no hero video.
- Two real ANGEL merch designs from the newly supplied photography: Ivory Edit and Noir Edit.
- Prices **not invented**; both show `PRICE TBA / COMING SOON`. Newsletter CTA available.
- Product art was optimized to `public/merch/angel-drop/*.webp` (no old photography mixed into the merch campaign).
- Merch cards have hover-reveal editorial photos, subtle reveal and marquee motion, and reduced-motion support.
- Digital support starts at $40 and a custom $100–$1,000 tier. Both get the digital ANGEL album; higher amount supports Yarden further.

## NOT YET TAKING PAYMENTS
Live checkout is deliberately disabled. It rejects requests until **all** of these are configured:

1. `FLW_SECRET_KEY` — Flutterwave v3 merchant secret key, server-side only.
2. `FLW_SECRET_HASH` — match Flutterwave dashboard webhook secret hash. Webhook: `https://thisisyarden.com/api/support/webhook`.
3. `NEXT_PUBLIC_SITE_URL=https://thisisyarden.com` — the authorized redirect origin.
4. `ANGEL_ALBUM_PRIVATE_BLOB_PATH` — exact pathname (NOT a public URL) of the licensed, complete ANGEL ZIP uploaded to a **private** Vercel Blob store. Obtain artist/label approval for direct downloads before upload.
5. `BLOB_READ_WRITE_TOKEN` — token from the private Blob store.
6. `RESEND_API_KEY` and a verified `EMAIL_FROM` — send purchase receipts and album download links.
7. `ANGEL_SUPPORT_CHECKOUT_ENABLED=true` — flip only after testing sandbox and live merchant readiness and confirming USD is supported by the connected merchant.
8. `@vercel/blob` >=2.3.0 — private get() support. **The current repository's pinned lockfile still contains v2.0.1**. Before enabling checkout, update locally with `npm install @vercel/blob@^2.3.1`, commit BOTH package.json and package-lock.json, and run `npm run build`. No SDK update was installed in this build environment because npm registry access was unavailable. The server checks the installed SDK and keeps checkout disabled if `get()` does not exist.

The amount is calculated and validated server-side. The checkout reference is stored in Redis before requesting a hosted Flutterwave link. Payment is accepted only after re-verifying status, transaction reference, USD amount, and purchaser email against Flutterwave's API. Webhooks also check the `verif-hash` header and verify payments independently. A verified receipt creates a private, bearer-token download entitlement and (if Resend is configured) emails a download link. The download handler streams the file from private Blob with `no-store`; payment records are visible at `/admin/support` to existing logged-in admins.

This is an integration prepared for activation, **not a verified live checkout**. Test a successful $40 sandbox checkout, successful custom support tier, failed payment, replayed webhook, expected email, private ZIP download, and admin ledger before live rollout. Review rights, refund policy, taxes, and Flutterwave's availability for the merchant's USD account.

## Apply patch to Git
Extract the patch over the existing repository. Keep `.git` and `.env.local` unchanged. On Windows PowerShell:

```powershell
npm run build; if ($LASTEXITCODE -eq 0) { git add -A; git commit -m "Yarden V24 ANGEL merch and digital support"; git pull --rebase origin main; if ($LASTEXITCODE -eq 0) { git push origin main } }
```

Important: Do not configure `ANGEL_SUPPORT_CHECKOUT_ENABLED=true` until the album download, email, and merchant details have been verified. Payment failures and webhook faults must be investigated from the Flutterwave Dashboard, not inferred from browser redirects alone.
