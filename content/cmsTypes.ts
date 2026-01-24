// content/cmsTypes.ts
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
