# Yarden ANGEL — digital album delivery (V25)

The website is **not taking money** until the artist's authorized digital album package and Flutterwave account are configured and tested. The $40 album and custom $100–$1,000 support options both provide the **same album download**. No automatic bonus files or endorsements have been invented.

## Files the artist needs to supply

1. Final, mastered ANGEL WAV files in approved track order, with final filenames.
2. Official cover art and (optionally) 320 kbps MP3 versions, track credits, and an approved thank-you PDF.
3. Confirmation that the artist/label has rights to distribute these files directly to purchasers.

Keep the final distribution ZIP outside the Git repository and **never place it in `/public`**. For the ZIP, use a folder like `Yarden-ANGEL-Digital-Album/` containing ordered `.wav` files, cover art and optional extras. Compress the folder and check that it opens before uploading. For large lossless albums, factor in Vercel Function transfer and execution costs.

## Private Blob storage setup

1. In **Vercel → Storage**, create/connect a **Private Blob store** (not a public store) to the Yarden project.
2. Upload `Yarden-ANGEL-Digital-Album.zip` using the Vercel dashboard or the server-side SDK with `access: 'private'`.
3. Copy the complete private blob URL (`https://<store>.private.blob.vercel-storage.com/<path>`), and set it as the **server-only** `ANGEL_ALBUM_PRIVATE_BLOB_URL` environment variable.
4. Set the private store token to `ANGEL_PRIVATE_BLOB_TOKEN` in Vercel Production. **Keep your existing `BLOB_READ_WRITE_TOKEN` unchanged** if the CMS uses it for public image uploads. The app falls back to `BLOB_READ_WRITE_TOKEN` only if a dedicated token is absent. The app validates the URL hostname before sending the secret to Vercel Blob.
5. Alternatively, `ANGEL_ALBUM_PRIVATE_BLOB_PATH` works with `@vercel/blob >=2.3.0`, which supports `get()`. If using the locked 2.0.1 SDK, use the private URL method instead.

## Flutterwave + email

Set `FLW_SECRET_KEY`, `FLW_SECRET_HASH`, `NEXT_PUBLIC_SITE_URL=https://thisisyarden.com`, `RESEND_API_KEY`, and verified `EMAIL_FROM` in Vercel's **Production** variables. Keep keys **server-only**; never use `NEXT_PUBLIC_` with secret keys. Flutterwave webhook URL: `https://thisisyarden.com/api/support/webhook`. The checkout persists an order, and the backend independently verifies the Flutterwave reference, USD currency, amount and customer email before granting a tokenized download.

Only **after** the storage, licensed files, checkout, webhook, emails and direct download are tested should `ANGEL_SUPPORT_CHECKOUT_ENABLED` be set to `true`. Test a $40 order and a custom-tier order, incomplete payment, webhook replay, and receipt/download on mobile. The current site must continue to display “connecting soon” until then.

## Notes

- Do not send big WAV attachments directly with Resend; send the signed-by-application download link instead.
- The album link is a bearer entitlement tied to a paid order; handle it like a password.
- These delivery functions are **prepared but not tested against live merchant accounts**.
- If the zip is very large (100MB+), streaming via Vercel Functions may be costly. Evaluate object-storage/CDN strategy before launch.

Sources: https://vercel.com/docs/vercel-blob/private-storage and https://vercel.com/docs/vercel-blob/using-blob-sdk
