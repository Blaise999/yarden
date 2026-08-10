# Yarden — full package (redesign + admin + polish)

Everything is in this one zip. Paths mirror your repo — copy the folders over
your project root, replacing files at the same paths. `preview/` is just for
looking; it isn't part of the app.

## 1. The redesign (this is the big one)

**`app/page.client.tsx` (new) + `app/redesign.css` (new)**
- A complete, self-contained redesign of the public site — hero, discography,
  a lyric moment, visuals, tour ledger, store lookbook, and the join/close.
- Wired to your CMS: it reads the same `releases`, `visuals`, `shows`, and
  `merch` props your `app/page.tsx` already passes. **You don't change
  `page.tsx`.** The featured release is the one flagged `highlight` (falls back
  to the first). Streaming pills, video links, tour dates, and merch links all
  come from your data.
- **All styling is scoped under a single `.yd` wrapper** (that's what
  `redesign.css` does), so it can't leak into `/admin` or anywhere else. Fonts
  (Lora + Poppins) load via an `@import` at the top of that CSS.
- Your **Pass modal is preserved** — every "Get the Pass" / "Get alerts"
  button opens `PassModal`.
- Direction is pulled straight from the Muse cover: gold #E4B13C on ink
  #0A0A0F, warm bone text, the ankh, a serif-italic display (Lora) against a
  geometric UI face (Poppins). Every section has its own structure, so it stops
  reading like one template repeated.

**Look before you wire:** open `preview/yarden-redesign.html` in a browser to
see the whole thing rendered.

## 2. Metadata, icons, cookie banner
- `app/layout.tsx` — full OG/Twitter/robots/theme-color metadata + mounts the
  cookie banner.
- `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`,
  `app/opengraph-image.png`, `app/manifest.ts`, `public/icon-192.png`,
  `public/icon-512.png` — ankh icon set (auto-wired by App Router).
- `components/CookieConsent.tsx` — on-brand consent banner.

## 3. Admin console
- `app/admin/AdminPage.client.tsx` — dark, on-brand console. Design-layer only;
  every handler and API call is unchanged.

## 4. Content
- `content/defaultCms.ts` — leaked dev copy removed, a couple lines tightened.

## Env
`.env.local` (and Vercel env):
```
NEXT_PUBLIC_SITE_URL=https://thisisyarden.com
```

## Delete (leftover Next starter junk)
```
public/next.svg  public/vercel.svg  public/window.svg
public/globe.svg  public/file.svg
```

## Honest notes — quick follow-ups, not blockers
- **Mobile nav**: below 900px the links are hidden and there's no hamburger yet.
  Easy add — say the word and I'll wire a menu.
- **Video thumbnails**: the visuals feature uses the hero image as its poster.
  Add a `thumb` field per visual in the CMS and I'll use it.
- **Join email field**: the input is visual; its button opens the Pass modal.
  Point it at your real newsletter endpoint when you have one.
- **Single artwork**: a few singles reference `/images/releases/*.jpg`, which may
  not exist yet — they fall back to the hero image. Drop the real art under
  `public/images/releases/` (or fix the CMS paths) and they'll show.
- Your old section components (`HeroStage`, `ReleasesSection`, etc.) are no longer
  used by the front page but are kept — `page.tsx` still imports their *types*.
  Safe to leave.
