# Yarden V9.1 — ANGEL era, new mobile hero, verified 2026 videos

## What changed
- ANGEL is the lead release across the site (13 tracks, released October 30, 2026); Muse and The One Who Descends remain selectable.
- ANGEL artwork comes from the source article at https://hypetribeng.com/yarden-angel-debut-album-dxtiny-kemuel-fimi/ . This is a hotlinked copy of the verified real cover. **For reliable long-term hosting, upload a licensed/original master to Vercel Blob using Admin → Releases and replace this external cover URL.**
- Verified video queue starts with SFD (Sweet Fanta Diallo) ft. dxtiny, ANGEL album trailer, Sunset in Paris, and Celine; earlier videos follow. These YouTube links are the artist's uploads and have working IDs.
- New mobile hero is derived from the uploaded `1105(1).mp4` at 1080×1920; desktop hero 1920×1080. Both play edge-to-edge and are not subjected to blur filters. Posters updated. Your original 4K mobile master was used for encoding but isn't bundled because of deployment size.
- Album copy, hero messaging, artist story, About and Contact pages now reflect the ANGEL era; fake booking email addresses removed.
- All V8 backend features — Upstash Redis, Vercel Blob, secure admin CMS, Yard Pass, opt-in audience, Resend sending, unsubscribe — remain present.
- Existing Redis key `yarden:cms:v1` retained. First load migrates older V8 CMS data **in memory**, inserting ANGEL and verified new videos without overwriting customized releases/merch/tour/hero text. Saving from the admin persists the migrated data.

## Launch on your existing GitHub / Vercel deployment
1. Unzip over your working `Yarden-Cms` source folder, not over another project's directory.
2. Check `.gitignore` excludes `.env`, `.env.local`, `.vercel`, `node_modules` and `.next`. Never commit real secrets.
3. Add Redis, Blob, session-secret and rotated Resend credentials under **Vercel → Yarden → Settings → Environment Variables**. These are still required; see `EMAIL-AND-ENV-SETUP.md`.
4. Run `npm install`, `npm run build`, then `git add -A`, `git status`, `git commit -m "Yarden ANGEL V9.1"`, `git push origin main` inside your already linked Yarden repo.
5. Visit `/admin`, verify saved data and upload an authorized official ANGEL artwork file to Blob for reliable media hosting. Run a test email if configured. Verify new videos and both responsive hero movies on the live site.

## Validation caveats
- Syntax of 69 TypeScript/JSX files checked, incoming and output video dimensions/decoding checked, and compressed video outputs verified.
- Full Next.js build not run: npm dependencies were unavailable offline (`ENOTCACHED` during `npm ci --offline`). Run it on your PC or Vercel and forward any errors.
- Not affiliated with or approved by the artist unless authorized. Do not publish unreleased copyrighted assets without rights.
