# Yarden — ANGEL complete project

Use Node.js 22 LTS and npm. This is the entire Next.js project, including the original desktop and mobile film masters, silent original-resolution playback copies (2880×2160 desktop, 2160×3840 mobile), retained HD alternatives, artwork, CMS, and tests.

```sh
npm install
cp .env.example .env.local
npm run dev
```
On Windows, copy `.env.example` to `.env.local` in Explorer. Generate separate signing/setup secrets using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` twice, then put the results in ADMIN_SESSION_SECRET and YARD_SETUP_TOKEN. Never reuse the example placeholders. Visit `/admin` to create your admin account.

Development uses a local JSON database unless a complete Redis credential pair is supplied. Production requires Redis. Read DEPLOYMENT.md and TEST-REPORT.md before deployment.

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

The homepage now imports one consolidated `app/angel.css`. Older CSS files remain in the project for reference/compatibility, but are not loaded by the homepage. Original CMS sections and admin routes are preserved.
