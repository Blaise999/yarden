// content/cmsTypes.ts

// ═══════════════════════════════════════════════════════════════════
// RELEASES
// ═══════════════════════════════════════════════════════════════════

export type PlatformKey =
  | "spotify"
  | "apple"
  | "youtube"
  | "audiomack"
  | "boomplay"
  | "soundcloud"
  | "deezer"
  | "tidal";

export type PlatformLinks = Partial<Record<PlatformKey, string>>;

export type LinkSource = {
  label: string;
  href: string;
};

export type TrackItem = {
  title: string;
  meta?: string;
  duration?: string;
};

export type ReleaseItem = {
  id: string;
  title: string;
  subtitle?: string;
  year?: string;
  art: string;
  artSourceLabel?: string;
  artSourceHref?: string;
  chips?: string[];
  links: PlatformLinks;
  primary?: PlatformKey;
  fanLink?: string;
  linkSource?: LinkSource;
  tracklist?: TrackItem[];
  tracklistSource?: LinkSource;
  format?: string;
  enabled: boolean;
  highlight?: boolean; // Featured/highlighted release
};

// ═══════════════════════════════════════════════════════════════════
// VISUALS / VIDEOS
// ═══════════════════════════════════════════════════════════════════

export type VisualItem = {
  id: string;
  title: string;
  kind: "Official Video" | "Official Music Video" | "Official Visualizer" | "Visualizer";
  year: string;
  href: string;
  tag?: string;
  enabled: boolean;
};

// ═══════════════════════════════════════════════════════════════════
// TOUR
// ═══════════════════════════════════════════════════════════════════

export type ShowItem = {
  id: string;
  dateLabel: string;
  city: string;
  venue: string;
  href?: string;
  status?: "announce" | "onsale" | "soldout";
};

export type TourConfig = {
  posterSrc: string;
  posterAlt: string;
  headline: string;
  description: string;
  ticketPortalHref?: string;
  notifyCtaLabel?: string;
  providerHint?: string;
};

// ═══════════════════════════════════════════════════════════════════
// MERCH / STORE
// ═══════════════════════════════════════════════════════════════════

export type MerchItem = {
  id: string;
  name: string;
  price: string;
  images: string[];
  tag?: string;
  available: boolean;
  links?: { label: string; href: string }[];
};

export type StoreConfig = {
  eyebrow?: string;
  title: string;
  desc?: string;
  storeHref?: string;
};

// ═══════════════════════════════════════════════════════════════════
// NEWSLETTER / PRESS
// ═══════════════════════════════════════════════════════════════════

export type PressItem = {
  id: string;
  title: string;
  outlet: string;
  date: string;
  href: string;
  image?: string;
  tag?: string;
  excerpt?: string;
};

export type EmbedVideo = {
  id: string;
  title: string;
  meta?: string;
  youtubeId: string;
  href?: string;
};
