import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import CookieConsent from "../components/CookieConsent";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../libs/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const TITLE = "Yarden | ANGEL Album, Music & The Yard";
const DESCRIPTION = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Yarden",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Yarden",
    "thisisyarden",
    "thisisyarden.com",
    "Yarden ANGEL",
    "Yarden singer",
    "Yarden official website",
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
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Yarden — ANGEL, the debut album" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@thisisyarden",
    creator: "@thisisyarden",
    images: ["/opengraph-image.png"],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
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
