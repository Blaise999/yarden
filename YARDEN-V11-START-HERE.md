# YARDEN / ANGEL V11 — cinematic 4K & animated listening rooms

V11 is based on the complete V10 CMS / Yard Pass / Redis / Blob / Resend project.
It DOES NOT change the admin database, password, newsletters, audience, or CMS content.

## What was rebuilt

- Two proper 4K **delivery** files: `yarden-mobile-4k.mp4` is the user's native 2160 × 3840 vertical master, remuxed with streaming-friendly `moov` metadata first. `yarden-desktop-4k.mp4` is 3840 × 2160 output **cropped and upscaled** with Lanczos from the 2880 × 2160 landscape master. It has no newly captured source detail. The previous 1080p versions are kept as bandwidth-friendly HD fallbacks.
- New sharp posters: 1920×1080 desktop, 1080×1920 mobile.
- The player checks whether 4K local files exist before offering 4K. It avoids selecting unavailable files on patch-only deployments, plays HD as fallback and provides Play, Pause, Mute and quality controls. `prefers-reduced-motion` prevents automatic playback.
- Album gallery: ANGEL remains the default, but all project covers / tracklists / streaming links transition together. Auto-rotation (11 sec) and manual previous/next controls, including a pause control, pause on hover/focus. The gallery only rotates while visible. Any release data in the CMS remains authoritative.
- Singles: large animated featured art, spinning vinyl, orbit, lyrical typography, accessible next/previous, auto-rotation (7.6 sec), single selector timeline, dynamic outgoing track link. Pause on hover/focus. Reduced-motion browsers get static animation-free content.
- Existing CMS, Redis, Resend, authentication, email sending and Yard Pass remain in place. No secrets are bundled.

## Small upgrade patch vs complete project

- **SMALL PATCH**: extract the patch onto the existing Yarden folder. It does **not** include the 4K videos, only code, posters, docs and the media checker. The player retains HD until a 4K source is available. To enable 4K with the patch, separately copy the videos from the 4K media pack into `public/videos/`, or upload them to Vercel Blob and configure the public URLs.
- **COMPLETE PROJECT**: contains the entire website and all FOUR MP4 files (2 × HD, 2 × 4K), with CMS / email features intact. Preserve your existing `.git` folder and `.env.local`; never commit secrets.

## Film deployment: IMPORTANT

MP4s are large. They are tracked with **Git LFS** in `.gitattributes`.
If your Vercel project does not fetch LFS assets, it may serve ~130-byte text pointers instead of the movies, and BOTH films will appear broken. In Vercel → Project → Settings → Git, enable Git LFS if your account/project has this option, then redeploy.

**More reliable alternative (recommended)**: use the existing PUBLIC Vercel Blob store `yarden-blob` to serve the videos directly (not the CMS's small image uploader):

1. Open Vercel → Yarden → Storage → `yarden-blob` → Browse / Upload.
2. Upload `yarden-desktop-4k.mp4` and `yarden-mobile-4k.mp4`. Also upload the HD copies if you want ALL playback to bypass Git LFS.
3. Copy the **exact public URL** for each MP4. The browser must be able to fetch it directly without a login.
4. In Yarden → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL=https://<actual-blob-url>/...`
   - `NEXT_PUBLIC_YARDEN_MOBILE_4K_URL=https://<actual-blob-url>/...`
   - optional HD: `NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL=...` and `NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL=...`
5. Redeploy. Next.js `NEXT_PUBLIC_` variables are built into the client bundle; merely editing them without redeploying does not update the site.

**CMS precedence**: an actual custom video URL saved in Admin → Settings takes precedence over the optional HD env URLs. The 4K URLs are independent of CMS and appear when available. In the browser, the 4K control only appears after an availability check for local media; explicit HTTPS Blob 4K URLs are trusted, with an on-error HD fallback.

## Install & push to your existing GitHub repository

```powershell
cd C:\Users\user\Desktop\Yarden-Cms
npm install
npm run check:films
npm run build

git remote set-url origin https://github.com/Blaise999/yarden.git
git lfs install
git lfs track "public/videos/*-4k.mp4"
git add -A
git status
# Make sure NO .env.local, .env, .vercel or node_modules are staged.
git commit -m "Yarden V11 - 4K cinema and interactive ANGEL discography"
git push origin main
```

After Vercel deploys, check `https://YOUR-YARDEN-DOMAIN/videos/yarden-desktop-4k.mp4` and its mobile counterpart in a browser or verify with `npm run check:films -- https://YOUR-YARDEN-DOMAIN`. This confirms actual MP4 bytes, not just a 200 HTTP status.

If a Git push repeatedly times out with LFS, use Vercel Blob hosting for MP4 files and commit the small source patch instead. **Never force-push or remove the original repository history.**

## Media notes

- Desktop 4K delivery is upscale/crop from the original master. It cannot reveal pixel detail that was never captured. We have deliberately *not* applied blurry CSS filters to either video.
- Automatic 4K is chosen only for sufficiently large high-density displays without a reported slow/data-saving connection; visitors can switch to 4K or HD manually.
- 4K media uses significant bandwidth, particularly mobile. Host via a CDN and keep HD fallbacks. MP4 H.264/AAC + faststart is used for broad browser support; full adaptive HLS transcoding is a future performance enhancement.
- If CMS Settings already has a custom film URL, it may override HD files; check that setting when a film still doesn't play.
