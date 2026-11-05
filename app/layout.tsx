import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import CookieConsent from "../components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Set this to the production origin. Falls back to Vercel's URL, then localhost.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "https://thisisyarden.com";

const TITLE = "Yarden — ANGEL | Debut Album & Yard Pass";
const DESCRIPTION =
  "Enter Yarden’s world. Hear ANGEL, the 13-track debut album released October 30, 2026, and explore his music, visuals and the Yard Pass.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Yarden",
  },
  description: DESCRIPTION,
  applicationName: "Yarden",
  keywords: [
    "Yarden",
    "thisisyarden",
    "Afrobeats",
    "new nostalgia",
    "the descendants",
    "ANGEL album",
    "Muse EP",
    "Nigerian artist",
    "music",
    "tour",
  ],
  authors: [{ name: "Yarden" }],
  creator: "Yarden",
  publisher: "Etins Records",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Yarden",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    // app/opengraph-image.png is picked up automatically by Next.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@thisisyarden",
    creator: "@thisisyarden",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
  // favicon.ico, icon.svg, apple-icon.png in /app are auto-wired.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} antialiased bg-[#05060A] text-white min-h-screen`}
      >
        {/* speed: warm up the origins the redesign hits */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
