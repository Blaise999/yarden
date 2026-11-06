# Yarden V8: Email + CMS + Yard Pass environment setup

## What is already built

- Admin CMS and Yard Pass are backed by Upstash Redis in production, and media uploads go to Vercel Blob.
- After a **new** Yard Pass registration is saved, the app attempts a transactional welcome email with the pass ID, and optionally notifies a configured admin address. It never adds pass holders to the marketing list automatically.
- After a separate, explicit newsletter opt-in is saved, the app attempts a subscriber welcome email with an unsubscribe link. Already subscribed addresses are not repeatedly emailed.
- Admin → **Audience** supports **Send test email**, and a deliberate **Send to N subscribers** action. It sends only to opted-in subscribers, max 40 per campaign, with unsubscribe links. Use **Resend Broadcasts** for a larger list.
- Every outgoing email uses the provider's API server-side. No private API key is sent to the browser.
- A user who unsubscribes is excluded from future CMS newsletters. A new explicit opt-in can reactivate a previously opted-out address.
- New admin email/API security logic is independent of the current admin password; the password is set at /admin.

## Important: rotate the Resend key that was pasted into a chat

That key should be treated as compromised. Revoke it in Resend and generate another. Never save a real API key in source, Git, an uploaded ZIP, or a screenshot. The ZIP contains **no** real Resend, Redis, or Blob credentials.

## Step 1 — Link the CORRECT Yarden project

Open a PowerShell terminal inside the extracted `Yarden-CMS` folder containing `package.json`:

```powershell
npm install
npx vercel login
npx vercel link
npx vercel project inspect
```

Confirm the project name is **yarden**, not any previous project. The screenshot showed existing connected resources `YARDEN` (Upstash for Redis) and `yarden-blob` (Blob) attached to `yarden` in all environments. Those connections do not prove their environment variables are present in a new deployment. Check Settings → Environment Variables for the actual values/names.

## Step 2 — Verify Upstash Redis on Vercel

At **Vercel → yarden → Settings → Environment Variables**, look for a COMPLETE pair:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

or:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

If the integration generates prefixed names, copy the REST URL and REST token under the exact names above (Production, plus Preview if needed). Do not use the non-REST `REDIS_URL` for this project.

## Step 3 — Verify Blob

At **Vercel → Storage → yarden-blob**, confirm **yarden** is a connected project. For a modern OIDC-connected Blob store, Vercel supplies credentials automatically, so you do **not** need a `BLOB_READ_WRITE_TOKEN`. For legacy token stores, the token must be available as `BLOB_READ_WRITE_TOKEN`. The existing `app/api/admin/upload/route.ts` uses `@vercel/blob`. Test a CMS image upload after deploying.

## Step 4 — Admin secrets

At **Vercel → yarden → Settings → Environment Variables**, set both independently:

- `ADMIN_SESSION_SECRET` — a new 64-character random hexadecimal string
- `YARD_SETUP_TOKEN` — a **different** 64-character random hexadecimal string, used once for initial admin setup

In PowerShell generate each with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The production values must be in Vercel, not only on your PC. Never share them. Set the admin password once through the live `/admin` page after deployment; don't set it in environment variables.

## Step 5 — Resend setup

In **Resend → Domains**, verify a domain you own and configure the DNS records it asks for. You must have permission to use that domain. In **Resend → API Keys**, rotate the key shared in chat and create a replacement.

At **Vercel → yarden → Settings → Environment Variables**, add:

| Variable | Example (NOT a real address or key) | Required? |
|---|---|---|
| `RESEND_API_KEY` | (fresh private `re_...` key) | Yes for emails |
| `EMAIL_FROM` | `updates@YOUR-VERIFIED-DOMAIN.com` | Yes for emails |
| `ADMIN_NOTIFICATION_EMAIL` | `you@your-inbox.com` | Optional for admin alerts |
| `EMAIL_REPLY_TO` | `management@YOUR-VERIFIED-DOMAIN.com` | Optional |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-YARDEN-DOMAIN.com` | Yes for links/unsubscribe |

`EMAIL_FROM` must use an email address on a domain that you have verified in Resend. Avoid `onboarding@resend.dev` in production. The application intentionally does not silently guess a sender address or production domain.

Save variables for **Production** (and Preview/Development only where you want them). **Redeploy after changing env values.** The `.env.example` is safe to commit and contains no secrets.

## Step 6 — Optional local environment

On your PC, inside the extracted project:

```powershell
.\SETUP-YARDEN-ENV.ps1
```

If PowerShell blocks local scripts, you can instead run the script using `powershell -ExecutionPolicy Bypass -File .\SETUP-YARDEN-ENV.ps1` after reviewing its contents. It creates **`.env.local` only if one doesn't exist**, with random development-only admin secrets and blank service fields. Fill in your own local values or pull appropriate Development environment settings from Vercel. Do not copy development signing keys to production or overwrite an existing secure local env file.

## Step 7 — Deploy and verify

```powershell
npm run build
npx vercel --prod
```

Check these URLs on your actual Yarden domain:

- `/api/health` — inspect `persistentStorage`, `sessionSigningSecret`, `emailDeliveryConfigured`, and `emailLinksConfigured`. This checks configuration presence, **not network delivery or credentials validity**.
- `/admin` — log in / first-time setup; edit a release and refresh to verify Redis.
- Admin → Merch — upload a small image to verify Blob.
- `/` — opt into the newsletter using a test inbox, verify welcome email and opt-out link.
- Admin → Audience — set subject and body, **send test**, verify the inbox, then send a real update only if appropriate.
- Yard Pass — register from a fresh browser and verify welcome email while checking pass persistence.

The newsletter sender makes at most **40 recipient sends per campaign** and requires explicit confirmation; it isn't intended for a large mailing list. Resend may have separate provider limits and sender-domain requirements. Resend errors are reported without leaking credentials. If some campaign deliveries fail, inspect Resend logs **before trying again**, to avoid duplicate deliveries.

## What this project still does not do

- It doesn't verify a fan's identity or let a pass holder recover their cookie-bound pass on another device.
- It doesn't process merch payments or automate product shipping.
- It doesn't provide high-volume broadcasting, scheduled sending, or inbound mailbox hosting.
- Emails aren't guaranteed delivered until your verified domain, Resend key, provider account, and sending limits are tested on Vercel.

### Security note

Don't publish the ZIP with your real `.env.local`. This package deliberately contains `.env.example` and a setup script instead. If you previously opened or ran an untrusted earlier Yarden source version with obfuscated VS Code auto-run scripts, review your machine and rotate potentially exposed credentials as well.
