# Yarden — CMS & Yard Pass setup (November 2026)

## What changed

**V8 note:** For the current email integration and environment variables, begin with `EMAIL-AND-ENV-SETUP.md`.

- **Admin:** Fresh first-time setup at `/admin` using a one-time setup token and a password you choose. Passwords are stored as salted `scrypt` hashes in Redis, never hard-coded in this ZIP or `.env`. `/admin` → **Settings** lets you change the password and revokes existing sessions.
- **Session security:** Signed, HttpOnly, SameSite=Strict cookies, 12-hour expiry, session revocation after password change, login/setup rate limits, same-origin checks. Previously a random cookie value let anyone become an admin; that has been replaced.
- **CMS:** Music releases, singles/EPs/albums, artwork, streaming links and tracklists; official video listings; tours/venues/ticket links; merch products/images and outbound store links; news and video embeds; homepage hero copy and desktop/mobile video paths.
- **Yard Pass:** Save to persistent Redis, generate unique ID *on the server*, recognize the same browser on repeat visits and download a card. One pass per browser cookie. No public ID-lookup endpoint. Pass photos/PNGs are generated locally on the device and are not stored on the backend. The admin can view members and export CSV.
- **Audience:** Explicit opt-in to an updates list, managed separately from Yard Pass; admin can export the list. **V8 adds Resend email support:** Yard Pass welcome emails, opt-in confirmation, and a limited CMS newsletter sender. Sending requires a verified Resend domain and the environment variables listed in `EMAIL-AND-ENV-SETUP.md`.
- **Uploads:** Images are validated (MIME and magic signature), maximum 4 MB, saved to Vercel Blob (requires configuration).
- **Local dev:** Files persist under `.local-data/`, not ephemeral memory. This directory and `.env.local` are gitignored.

## Step 1: open the correct folder

Extract this ZIP. Open the `Yarden-CMS` folder that contains `package.json`.

```
npm install
```

## Step 2: set two secrets

Generate a strong random secret using PowerShell:

```
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run it **twice**, and use different generated values.

Create `.env.local` from `.env.example`. Set:

```
ADMIN_SESSION_SECRET=<first 64-character random secret>
YARD_SETUP_TOKEN=<second 64-character random secret>
```

Do not commit `.env.local` or paste secrets into chat. The retired `ADMIN_PASSWORD` environment variable is intentionally no longer used.

## Step 3: run and create your new admin password

```
npm run dev
```

Visit `http://localhost:3000/admin`. On first visit select your admin password (12+ characters) and enter `YARD_SETUP_TOKEN`. After setup, go to **Settings** to change your password at any time.

**Important:** This resets the *authentication system*, not your previously saved CMS content. If your existing project has CMS data in Redis under `yarden:cms:v1`, that data will still be read. The first-time password setup can be completed only once for each database.

## Step 4: set up production on Vercel

1. Create/connect an **Upstash Redis** database. Set `KV_REST_API_URL` and `KV_REST_API_TOKEN` in Vercel Project → Settings → Environment Variables, or set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Select Production (and Preview only if you deliberately want it). Link this project to the intended database.
2. Set the same **ADMIN_SESSION_SECRET** and **YARD_SETUP_TOKEN** environment variables in Vercel. Use strong unique values; don't use local-dev secrets for the public deployment.
3. Create/connect a **Vercel Blob** store for admin image uploads. With a token-based store, set `BLOB_READ_WRITE_TOKEN`; newer OIDC-enabled Blob setups may use automatic project credentials when supported by the installed SDK.
4. In Vercel Framework Settings choose **Next.js**, root directory `./`, leave output directory and build command on framework defaults.
5. Deploy with `vercel --prod` or your connected Git branch.
6. Open `https://YOUR-PROJECT.vercel.app/api/health`; `healthy` means both Redis and session secret are configured. It does **not** mean mail sending is configured.
7. Open `/admin` on the live domain, set up password once with your live setup token, change it anytime in **Settings**.

**Without Redis on production, CMS and Yard Pass writes are intentionally unavailable.** They will not claim to succeed and silently disappear. Local `.local-data` is development-only; don't try to persist data to Vercel's ephemeral file system.

**New admin password is not set automatically.** Choose it yourself on the setup screen. Never share credentials or setup tokens in a public repo.

## Editing content

- **Settings:** Homepage hero headline, kicker, description, video and poster paths; change admin password.
- **Releases:** Add EP/album/single, assign cover art, platform links, tracklist, featured status, enabled toggle. Save after editing.
- **Videos:** Add/link videos and publish selectively.
- **Tour:** Add only confirmed dates, venues, official ticket URLs and posters. Empty tour list displays “No tour dates announced yet.” No fictional events are published.
- **Merch:** Add name, image(s), price, stock/availability and real merchant link. This is an **outbound catalogue**, not a payment processor or order-management system.
- **Newsletter / Press:** Press articles, images, external links and video embeds.
- **Audience:** View and export opted-in email contacts. Use the built-in Send test email and Send update controls only after setting up Resend. See `EMAIL-AND-ENV-SETUP.md`.
- **Passes:** View member records and export CSV. A visitor can download their pass in their current browser; deleting cookies/device changes breaks access. Cross-device account recovery requires verified-email authentication and is not implemented.

## Security / privacy notes

- The original source ZIP contained obfuscated auto-run scripts. They were **excluded in the earlier cleaned version**, and are not present here. Avoid opening the untrusted original folder with VS Code's tasks enabled.
- If you already ran untrusted scripts from the old Yarden ZIP, scan your PC and rotate exposed API tokens/passwords as appropriate. This package does not repair a previously compromised machine.
- **Do not publish member email lists, phone numbers or pass ID database contents.** CSV exports contain personal data. Limit administrator access.
- **Do not claim verified identities:** the pass identifies a cookie-bound fan registration, not a verified real person or identity document. One-per-browser is not one-per-human; visitors can clear cookies or change devices.
- `YARD_SETUP_TOKEN` should remain secret, even after setup. You may remove it from production after first-time setup if you no longer need it; changing it does not reset an existing password.
- Preview and production databases should ideally be separate.
- Review the privacy policy and use a verified operator contact before collecting real fan data publicly. No consent or mail-delivery provider is configured by default.

## Running checks

```
npm run build
npm run dev
```

For a fresh local password setup: stop dev server, delete `.local-data/yard-data.json` (THIS ERASES local CMS, passes and audience; **never** do this to your live Redis database), restart, and visit `/admin`.
