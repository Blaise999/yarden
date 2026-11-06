# Yarden V9 — ANGEL era / high-resolution film

## Creative direction
The homepage now foregrounds ANGEL, the verified debut album released October 30, 2026 (13 songs, Etins Records). Yarden’s own interviews discuss: older music/1980s sound, a music-filled Lagos childhood, gospel through his mother, DJ recordings through his father, emotive songwriting, experimentation, and giving songs a soul. The artist-story section is editorial copy, not a fabricated direct quotation.

Sources: https://www.wonderlandmagazine.com/2023/12/01/yarden/ ; https://guardian.ng/art/yarden-sonics-of-solace/ ; https://notjustok.com/news/yarden-reveals-what-fueled-him-to-start-making-music/ ; https://thewavng.substack.com/p/yarden-on-muse-and-reaching-1-billion-8a9 ; https://music.apple.com/us/album/angel/6817875363 ; https://albumtalks.com/yarden-announces-debut-album-angel/

## Media quality
Original artist-provided sources from Yard.zip:
- Desktop: 1105.mp4 — 2880×2160, 30fps, ~58MB
- Mobile: 1105 2026-11-05-10-46-36.mp4 — 1214×2160, 30fps, ~49MB
V8 had 1600×900 at ~0.89Mbps and 720×1280 at ~0.66Mbps, no audio. V9 re-encodes to 1920×1080 and 1080×1920, 30fps and AAC audio, using much higher quality settings.

Files: public/videos/yarden-desktop.mp4 and yarden-mobile.mp4, plus the corresponding .webp posters. CSS displays edge-to-edge with object-fit:cover. The artist text is smaller and dark overlays lighter to reveal the film.

## IMPORTANT: Preserving your live CMS
The Redis key stays yarden:cms:v1. The migration adds ANGEL to V8 data if missing, upgrades *unchanged* V8 default hero copy, and preserves custom hero wording, videos, other releases, merch, tours, and subscribers. If you already manually changed the hero fields, edit them in Admin → Site Settings after deploy. The update does not forcibly reset CMS data.

## About ANGEL artwork
The ANGEL catalogue now uses the VERIFIED OFFICIAL album cover, served from the HypeTribe NG article URL. The art is not bundled locally, because direct network download was unavailable. This external URL can change or block hotlinking. For a durable deployment, obtain the label-supplied master cover and use Admin → Releases to upload it to the connected Vercel Blob store.

Verified new video IDs: SFD official MV `XhWGq0aHULo`; ANGEL album trailer `okkbole3lOU`; Sunset in Paris `M7dENTsiKNs`; Celine `d-f2EOBk5X4`.
The latest mobile asset is the new user-supplied `1105(1).mp4` (2160×3840). The site uses a 1080×1920 web-optimized derivative when available, keeping the original out of the ZIP to limit deployment size.

No placeholder tour dates were added. Resend, Redis, Blob, and admin logic are retained from V8. Do not commit .env.local or API keys.

## Secondary pages
The `/about` page now documents the verified artist story and ANGEL as the latest chapter. `/contact` no longer advertises invented `@yarden.music` inboxes: it links to verified public channels and explains that management contact details must be confirmed.
