# Yarden Search & Favicon Setup (V18)

## Included
- One brand identity: "Yarden" with "thisisyarden" and "thisisyarden.com" as alternate names in WebSite JSON-LD.
- Artist (Person) and ANGEL (MusicAlbum) structured data on the homepage.
- Better meta title, description, Open Graph/Twitter image tags, and site-wide ankh favicons.
- Same original flared ankh extracted from `public/Pictures/logo.png` for ICO, SVG, PNG and Apple icons.
- Canonical domain `https://thisisyarden.com`, with correct per-page canonical URLs.
- Public sitemap `/sitemap.xml` and crawler rules at `/robots.txt`.
- `noindex` for admin pages and local fan profile/signup pages.

## After deploying to the production domain
1. Open `https://thisisyarden.com/favicon.ico`, `/icon.svg`, `/icon-192.png`, `/apple-icon.png`, `/robots.txt` and `/sitemap.xml`. Check successful responses and correct MIME types.
2. View page source and verify `WebSite` structured data with `name: "Yarden"`, `alternateName` and the homepage canonical.
3. Verify `thisisyarden.com` in [Google Search Console](https://search.google.com/search-console/about) using the DNS record provided by Google. This needs account/domain-owner access.
4. Submit `https://thisisyarden.com/sitemap.xml` in Search Console and request indexing for the homepage with URL Inspection.
5. Use Search Console Performance to monitor queries such as Yarden, thisisyarden and Yarden ANGEL.
6. Recheck on mobile after Google recrawls. Google may take days/weeks to refresh the favicon and site name.

## Important
Google determines the ranking and whether it displays a particular favicon or site name. Correct metadata makes pages eligible, but cannot guarantee ranking first for generic searches such as `Yarden`. The logo is based on the ankh extracted from this project's YARD image; confirm with Yarden's authorized brand assets before claiming exact official mark.
