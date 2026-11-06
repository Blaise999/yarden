# Repair and validation report — 6 November 2026

## Implemented
- Updated Next.js 14.2.35 to 15.5.29, migrated async cookie APIs and searchParams, aligned ESLint, and removed the conflicting Tailwind 4 PostCSS config from this Tailwind 3 project.
- Consolidated homepage design into angel.css; V15 rebuild with near-black, warm-white and pale-green art direction, oversized mixed typography, a new album room and vinyl singles gallery, portrait story, film queue, objects grid, staggered journal, membership and footer, transparent hero navigation, album/single controls and newsroom presentation. Removed the film play overlay and original-quality selector. No Listen navigation button.
- V15 adds silent original-resolution UHD stream copies with faststart, retaining both original masters and HD alternatives. Removed redundant load() calls and background original-file probes. Preserved original master bytes with SHA256 comparison.
- Added local ANGEL and single artwork, corrected broken Apple Music links, and optimized two large editorial portraits to WebP. Added the actual TurnTable interview image.
- Fixed CMS deletion persistence (deleted stories no longer reappear), partial settings merges, malformed CMS input validation, malformed request handling, same-origin validation, atomic Redis rate limiting, and duplicate newsletter registration handling.
- Kept CMS releases/music/videos/store/tours/news/site settings/subscribers and existing Redis keys. Production has no ephemeral fallback. Configured Redis is used in development too.
- Added focus trapping/restoration to Yard Pass, hidden inactive mobile-menu links, a skip link, visible focus rings, reduced-motion styling, readable content before reveal scripts initialize, and better long-name/card-ID fitting.

## Executed checks
| Check | Result |
|---|---|
| npm install | Completed, lockfile included |
| npm run build | PASS — Next.js 15.5.29; build-v15.log included |
| npm run lint | PASS — zero ESLint errors or warnings |
| npm test | 3 passing suites; detailed assertions cover local persistence, concurrent create, duplicate pass, CMS delete/readback, malformed CMS, unsubscribe, Resend payload/failure, production Upstash REST command contract |
| API integration | 25 checks passed against a disposable development database, including admin bootstrap/login, CMS read/write, malformed input, privacy, registration/cookie retrieval and consent |
| Desktop browser | Silent autoplay observed; album selection changed to Muse; Yard Pass form created a stored pass and exposed download; download control exercised; desktop hero and issued card visually inspected |
| Media | Original masters preserved; V15 UHD files verified H.264, 30 fps, no audio, native resolution; media signatures checked |
| Accessibility review | Keyboard focus handling, labels, skip link and reduced-motion rules inspected; no formal WCAG certification or automated axe audit |

## Verification limits
- Upstash production transport and Resend payload tests use mocked responses, not live provider accounts. Live credentials were absent.
- No Vercel deployment or GitHub push was performed. There was no repository URL or connected deployment account.
- Mobile CSS/source selection was reviewed, but physical mobile devices, mobile browser rendering, network throttling/Lighthouse scores and sustained low-bandwidth playback were not measured. Desktop browser tests used the development preview.
- Blob image-upload success and real email delivery/bulk campaigns require provider credentials and remain unverified. Browser autoplay remains subject to device policy.
- External streaming embeds may depend on platform availability/region. The supplied catalogue was retained, with verified artwork/link repairs; not every third-party stream was played end-to-end.

## Editorial sources checked
- https://www.turntablecharts.com/news/2303-there-is-more-than-one-sound-to-yarden-s-music (5 Nov 2026; lead interview and its image)
- https://hypetribeng.com/yarden-angel-debut-album-dxtiny-kemuel-fimi/ (30 Oct 2026; ANGEL artwork/release)
- https://ghanaplug.com/yarden-unveils-angel-a-genre-bending-debut-album-exploring-the-many-side-of-his-artistry/
- https://albumtalks.com/yarden-announces-debut-album-angel/
- https://mmcnation.com/2026/10/16/yarden-release-sonically-pleasing-single-sdf-so-damn-fine/
- Apple Music ANGEL /6817875363, Muse /1837991942, Ifeoma /1795511082, Busy Body /1680800447, Celine /1884027763 and Sunset in Paris /6770536830.

Existing archive stories were retained. News headlines are short editorial summaries linked to their sources; asset provenance remains in the CMS data. Publication/artist authorization and asset licensing are outside the build test.

## V15 redesign checks
- Re-ran npm install, production build, lint, TypeScript and the existing automated suites after the redesign. Logs have the -v15 suffix.
- Desktop visual review covered hero, scrolled navigation, album room, vinyl singles stage and Yard Pass modal. Muse selection and Next single changed the displayed record successfully.
- Earlier 25 API integration checks cover the retained backend; they were not repeated for these presentation-only changes. Live provider and mobile-device limits above still apply.
- Hero uses 2160×3840 mobile and 2880×2160 desktop silent files by default. These are source-resolution copies, not invented 3840×2160 detail.
