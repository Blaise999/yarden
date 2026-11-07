# V16 checks — 7 November 2026

- npm install completed.
- npm run build, npm run lint and npm test run on the final source; logs are in docs/test-evidence with -v16 suffix.
- 39 local API integration checks passed: existing admin/CMS/Yard Pass/subscriber flows plus private order access, admin-only campaign edits, listening-party readback, CSRF rejection, input rejection, saved order details, status readback and closed reservation handling.
- Added a persistence test with ten concurrent distinct order submissions; verifies no lost orders in the local storage path, config persistence and unsafe event URL rejection.
- Browser reviewed vinyl layout and ANGEL portrait layout; selected a project photo, changed name and successfully downloaded the PNG.
- Desktop web video is 1920×1080; mobile is 1080×1920. Both are silent H.264 with faststart. Originals retained. Dark video overlay reduced; no CSS blur added.

Limits: no live deployment or GitHub push was performed. Live Upstash/Resend/Blob accounts were not available; provider contract tests use mocks. Physical phone playback, throttled-network performance and mobile screenshot QA were not performed. New UI was checked in the development preview. The portrait tool does not remove photo backgrounds; it overlays the booking board onto a monochrome portrait. Orders are reservations, not payment confirmations. Test data and local secrets are excluded from the ZIP.
