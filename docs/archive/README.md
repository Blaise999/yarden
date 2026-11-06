# Yarden V10 — ANGEL cinematic edition

**Start here:** [V10-ANGEL-DEPLOY-AND-VIDEO-FIX.md](V10-ANGEL-DEPLOY-AND-VIDEO-FIX.md) — sharp HD film playback, Git LFS / Vercel Blob video troubleshooting, ANGEL redesign, safe deployment.

# YARDEN V8 — CMS, Yard Pass & Email

**Start with [`EMAIL-AND-ENV-SETUP.md`](EMAIL-AND-ENV-SETUP.md)** for production environment variables, Upstash Redis, Vercel Blob, Resend and how to rotate an exposed email API key.

- Original Yarden cinematic website and separate mobile/desktop video files
- Secure admin setup and password changes
- Music, merch, tour, press, visual, hero, and release CMS controls
- Persistent Yard Pass membership with cookie-based access
- Explicit opt-in marketing list, subscriber export, unsubscription
- Resend transactional messages plus small-list CMS newsletter testing/sending

No credentials are included. `.env.local` is gitignored; run `SETUP-YARDEN-ENV.ps1` to generate local-only admin secrets if needed.

## Quick start

```powershell
npm install
.\SETUP-YARDEN-ENV.ps1
npm run dev
```

Then open `http://localhost:3000/admin`. For production, configure ALL secrets on Vercel and redeploy.

Full instructions and limitations: [`EMAIL-AND-ENV-SETUP.md`](EMAIL-AND-ENV-SETUP.md).

# Yarden — Cinematic Next.js site + Secure CMS (V7)

This is the Yarden project. It includes the 21-second desktop and mobile hero films, responsive album/EP listening room, singles rail, videos, tours, merch, press, Yard Pass membership, and the rebuilt admin CMS.

**Start here: [`CMS-START-HERE.md`](./CMS-START-HERE.md)**

Quick local setup:

1. `npm install`
2. Copy `.env.example` to `.env.local` and set **your own** two unique random values for `ADMIN_SESSION_SECRET` and `YARD_SETUP_TOKEN` (instructions in the setup guide).
3. `npm run dev`
4. Open `http://localhost:3000/admin`; enter setup token and **create your own new admin password** (12+ characters). This is a first-run step, not a preset password.
5. Open the main website at `http://localhost:3000`.

For a live Vercel deployment, add Upstash Redis to persist CMS edits, Yard Pass registrations and newsletter opt-ins. Connect Blob for image uploads. Those integrations are **not automatically connected by this ZIP**.

Never commit `.env.local`, `.local-data`, `.next`, `.vercel` or `node_modules`. The private storage must be configured before collecting real fan data.

Security note: the older source ZIP contained obfuscated auto-run scripts; these have **not** been carried into this edition. Use this clean folder rather than the original unsafe extraction.

`README-V6-REDESIGN.md` covers the earlier visual redesign; `CMS-START-HERE.md` is authoritative for V7 backend setup.
