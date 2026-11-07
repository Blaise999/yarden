# V16 — playback repair and ANGEL fan experiences

Start with `npm install`, then copy `.env.example` to `.env.local` and set your secrets. See DEPLOYMENT.md for production setup.

- Default silent playback now uses `yarden-desktop-web.mp4` (1920×1080) and `yarden-mobile-web.mp4` (1080×1920), with fast-start and lighter overlays. Original masters remain included. These delivery files prioritize clarity and smoothness over forcing 4K.
- Log into `/admin`, then select **Vinyl orders & listening parties**, or visit `/admin/angel` after login.
- Edit vinyl title, description, price label and whether reservations are open. Orders include name, email, phone, address, country, quantity and notes; statuses are new/contacted/fulfilled/cancelled. No payment is collected.
- Add/remove listening-party dates, venue, city, local time/timezone, status and HTTPS details links. No invented dates are seeded.
- Fans can upload a JPG/PNG/WebP, enter their name, zoom/reposition and download a 1080×1350 ANGEL portrait. Photos remain on their device. This is a graphic composition, not AI background removal or a face replacement.
- Existing CMS, subscriber and Yard Pass functionality is preserved.

Read V16-TEST-REPORT.md for checks and limitations.
