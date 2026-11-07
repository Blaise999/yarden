# Yarden ANGEL V21 — reliable hero film playback

## Root issue addressed
V20 chooses a CMS/remote 4K URL before loading the built-in MP4. Invalid, slow,
or LFS-served 4K files can leave the hero with a static poster while the player
waits for the remote URL and times out. The previous video diagnostic also
checked for UHD files that are not actually bundled in the web release.

## V21 changes
- The two real, fast-start H.264 web films are now the FIRST source used in the hero:
  desktop 1920x1080 (`/videos/yarden-desktop-web.mp4`); mobile 1080x1920
  (`/videos/yarden-mobile-web.mp4`). Both MP4s are included in this patch.
- If the primary local video fails, try the other bundled local H.264 file.
- Remote UHD videos, if configured, load independently AFTER the local video has
  produced an image. They become visible only once the remote stream is actually
  playing, with a crossfade. If the CDN stalls/fails, the local film remains.
- Do not load UHD on data-saver or reduced-motion devices.
- Manual play and pause continue to work; source switching no longer blocks the
  entire hero while waiting on a remote response.
- Explicit Git attributes prevent the web MP4 clips being replaced by Git LFS
  pointer files during checkout/build.
- `npm run check:films` checks the actual bundled video filenames and can also
  inspect the corresponding URLs in your deployed website.

## Deploy
Extract the PATCH ZIP into the EXISTING Yarden Git folder (not its parent).
The files `public/videos/yarden-desktop-web.mp4` and
`public/videos/yarden-mobile-web.mp4` MUST be copied too. Then, in PowerShell:

```powershell
git add .; git commit -m "Yarden V21 reliable film playback"; git pull --rebase origin main; if ($LASTEXITCODE -eq 0) { git push origin main }
```

If the rebase reports a conflict, resolve it before running git push. Never use
`--force` to bypass the conflict.

## Verify
After Vercel finishes deploying, run:

```powershell
npm run check:films -- https://thisisyarden.com
```

Or visit the two public film URLs in a browser:
- https://thisisyarden.com/videos/yarden-desktop-web.mp4
- https://thisisyarden.com/videos/yarden-mobile-web.mp4

Both should serve a PLAYABLE MP4 rather than a 404 page or an LFS pointer file.
Then test homepage on desktop and mobile, including the play/pause button.

`NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL` and `NEXT_PUBLIC_YARDEN_MOBILE_4K_URL`
are optional. They do NOT need to be deleted to get the HD hero working.

## QA
All four bundled MP4 files were decoded with ffmpeg and their streams checked
with ffprobe. Source syntax/transpilation was checked. An authenticated live
Vercel deployment and a full Next.js production build were not available here.
