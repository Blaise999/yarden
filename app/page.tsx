// app/page.tsx
import { headers, cookies } from "next/headers";

import type { ReleaseItem } from "../components/landing/ReleasesSection";
import type { VisualItem } from "../components/landing/VisualsSection";
import type { ShowItem, TourConfig } from "../components/landing/TourSection";
import type { MerchItem, StoreConfig } from "../components/landing/StoreSection";

import { DEFAULT_CMS, type CmsData } from "../content/defaultCms";
import PageClient from "./page.client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NavItem = { id: string; label: string };

const HEADER_OFFSET = 84;

async function getPublicCms(): Promise<CmsData> {
  try {
    const h = headers();
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      process.env.VERCEL_URL ??
      "localhost:3000";

    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

    const base = host.startsWith("http") ? host : `${proto}://${host}`;

    const res = await fetch(`${base}/api/admin/cms/public`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CMS;

    const json = await res.json();
    return (json?.cms as CmsData) ?? DEFAULT_CMS;
  } catch {
    return DEFAULT_CMS;
  }
}

export default async function Page() {
  const cms = await getPublicCms();

  const nav: NavItem[] = [
    { id: "top", label: "Home" },
    { id: "releases", label: "Music" },
    { id: "watch", label: "Watch" },
    { id: "tour", label: "Tour" },
    { id: "pass", label: "Pass" },
    { id: "store", label: "Store" },
    { id: "newsletter", label: "News" },
  ];

  // Keep your hero images static (or move into CMS later)
  const heroA = { src: "/Pictures/heroo.png", alt: "Yarden cover — clean" };
  const heroB = { src: "/Pictures/hero3.jpg", alt: "Yarden cover — detailed" };

  // ✅ Use CMS data (fallback to defaults)
  const releases = ((cms.releases ?? DEFAULT_CMS.releases).filter((r: any) => r?.enabled !== false) ??
    []) as unknown as ReleaseItem[];

  const visuals = ((cms.visuals ?? DEFAULT_CMS.visuals).filter((v: any) => v?.enabled !== false) ??
    []) as unknown as VisualItem[];

  const tourConfig = (cms.tour?.config ?? DEFAULT_CMS.tour.config) as unknown as TourConfig;
  const shows = (cms.tour?.shows ?? DEFAULT_CMS.tour.shows) as unknown as ShowItem[];

  const storeConfig = (cms.store?.config ?? DEFAULT_CMS.store.config) as unknown as StoreConfig;
  const merch = (cms.store?.merch ?? DEFAULT_CMS.store.merch) as unknown as MerchItem[];

  // ✅ If you want admin editing on the live site:
  const isAdmin = !!cookies().get("yard_admin_token")?.value;

  // links object (you can keep your old hardcoded LINKS, but it’s not needed for CMS rendering)
  const LINKS: any = {
    youtubeChannel: "https://www.youtube.com/@thisisyarden",
    youtubeVideosPage: "https://www.youtube.com/@thisisyarden/videos",
    youtubeVideos: {},
    releases: {},
    spotify: releases?.[0]?.links?.spotify ?? "#",
  };

  return (
    <PageClient
      headerOffset={HEADER_OFFSET}
      links={LINKS}
      nav={nav}
      heroA={heroA as any}
      heroB={heroB as any}
      releases={releases}
      visuals={visuals}
      tourConfig={tourConfig}
      shows={shows}
      storeConfig={storeConfig}
      merch={merch}
      isAdmin={isAdmin}
    />
  );
}
