# YARDEN V13 — Complete ANGEL website + original source films

This is the full V13 Next.js website, with the CMS, Yard Pass, Redis and Resend integration from the previous release. The source files for both of your films are included without recompression, re-encoding, cropping, resizing, or removing their audio tracks.

## Film files

* public/videos/yarden-desktop.mp4 — optimized 1920x1080 HD video for faster automatic background playback.
* public/videos/yarden-mobile.mp4 — optimized 1080x1920 HD video for faster automatic background playback.
* public/videos/yarden-desktop-4k.mp4 — UNMODIFIED ORIGINAL desktop film from Yard.zip / 1105.mp4: **2880x2160**, approximately 58.5 MB. This is not native 3840x2160 UHD.
* public/videos/yarden-mobile-4k.mp4 — UNMODIFIED LATEST ORIGINAL mobile film from the user's 1105(1).mp4 upload: **2160x3840**, approximately 58.5 MB.

The original master MP4s still have audio tracks in their bytes; the browser player explicitly uses the muted attribute and sets volume=0. No data from either master file was altered.

The homepage normally autoplays the optimized HD files for responsiveness. The film's **ORIGINAL** quality button can use the original master sources after an availability check. This prevents forcing a ~58 MB stream on every visitor. The JS variable name `fourK` remains internal for compatibility, although the original desktop file isn't native UHD 4K.

## Install

Extract the FULL archive over your existing Yarden project directory, preserving its .git folder. Do not extract one more nested directory between package.json and app/. For example, make sure app/page.client.tsx and public/videos/yarden-desktop-4k.mp4 exist directly beneath the project directory.

Run:

    npm install
    npm run build
    npm run check:films
    git lfs install
    git lfs track "public/videos/*.mp4"
    git add -A
    git status
    git lfs ls-files
    git commit -m "Yarden V13 full site with untouched original desktop and mobile films"
    git push origin main

Verify .env.local, API keys and any credentials are NOT staged. GitHub upload of both source masters should use Git LFS; Vercel must download the real LFS assets. As an alternative, upload originals to Vercel Blob and use their URLs via NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL and NEXT_PUBLIC_YARDEN_MOBILE_4K_URL.

If those *_4K_URL variables are already set in your deployed Vercel project, they override the files bundled here. For bundled originals, remove or update those overrides before redeploying.

## Important

The full Next.js build and real Vercel playback are not verified in this packaging operation. This is the existing V13 full source plus original user-supplied films, not a claim that the existing build errors are universally resolved.
