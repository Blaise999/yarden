export type CmsShowStatus = "tickets" | "soldout" | "announce";

export type CmsTourShow = {
  id: string;
  dateISO?: string;
  dateLabel?: string;
  city: string;
  venue: string;
  href?: string;
  status?: CmsShowStatus;
};

export type CmsTourConfig = {
  headline?: string;
  description?: string;
  posterSrc: string;
  posterAlt?: string;
  ticketPortalHref?: string;
  notifyCtaLabel?: string;
  providerHint?: "Bandsintown" | "Seated" | "Custom";
};

export type CmsMerchLink = { label: string; href: string };

export type CmsMerchItem = {
  id: string;
  name: string;
  price?: string;
  images: string[]; // allows swipe/gallery
  tag?: string;
  href?: string;
  links?: CmsMerchLink[];
  available?: boolean;
};

export type CmsPressItem = {
  id: string;
  title: string;
  outlet: string;
  date: string;
  href: string;
  image: string; // can be remote URL
  tag?: string;
  excerpt?: string;
};

export type CmsEmbedVideo = {
  id: string;
  title: string;
  meta?: string;
  youtubeId: string;
  href?: string;
};

export type CmsData = {
  version: number;
  updatedAt: number;

  tour: { config: CmsTourConfig; shows: CmsTourShow[] };
  store: {
    config: { eyebrow?: string; title?: string; desc?: string; storeHref?: string };
    merch: CmsMerchItem[];
  };
  newsletter: {
    backgroundImage: string;
    pressItems: CmsPressItem[];
    videos: CmsEmbedVideo[];
  };
};

export const CMS_KV_KEY = "yarden:cms:published:v1";

export const DEFAULT_CMS: CmsData = {
  version: 1,
  updatedAt: Date.now(),

  tour: {
    config: {
      headline: "Shows that feel like chapters.",
      description: "Official tour dates, ticket links, and announcements.",
      posterSrc: "/media/yarden/tour-poster.jpg",
      posterAlt: "ter",
      ticketPortalHref: "#",
      notifyCtaLabel: "Get alerts",
      providerHint: "Custom",
    },
    shows: [
      {
        id: "show_lagos",
        dateISO: "2026-03-14",
        city: "Lagos",
        venue: "Eko Convention Centre",
        href: "#",
        status: "announce",
      },
      {
        id: "show_abuja",
        dateISO: "2026-03-21",
        city: "Abuja",
        venue: "Congress Hall",
        href: "#",
        status: "announce",
      },
      {
        id: "show_ph",
        dateISO: "2026-03-29",
        city: "Port Harcourt",
        venue: "Aztech Arcum (Main Hall)",
        href: "#",
        status: "announce",
      },
      {
        id: "show_london",
        dateISO: "2026-04-12",
        city: "London",
        venue: "O2 Academy Islington",
        href: "#",
        status: "announce",
      },
    ],
  },

  store: {
    config: {
      eyebrow: "Store",
      title: "Merch that matches the era.",
      desc: "Official drops and limited pieces.",
      storeHref: "#",
    },
    merch: [
      {
        id: "m_ankh_tee",
        name: "Ankh Tee (Black)",
        price: "₦ —",
        images: ["/media/yarden/merch-tee.jpg", "/media/yarden/merch-tee-2.jpg"],
        tag: "Drop soon",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "m_poster",
        name: "Era Poster (A2)",
        price: "₦ —",
        images: ["/media/yarden/merch-poster.jpg"],
        tag: "Limited",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "m_cap",
        name: "Ankh Cap",
        price: "₦ —",
        images: ["/media/yarden/merch-cap.jpg"],
        tag: "New",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "m_hoodie",
        name: "Ankh Hoodie",
        price: "₦ —",
        images: ["/media/yarden/merch-hoodie.jpg"],
        tag: "Soon",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
    ],
  },

  newsletter: {
    backgroundImage: "/media/yarden/newsletter.jpg",
    pressItems: [
      {
        id: "p_channel",
        title: "Official YouTube channel (videos + releases)",
        outlet: "YouTube",
        date: "Official",
        href: "https://www.youtube.com/@thisisyarden",
        image: "https://i.ytimg.com/vi/9lT3tKmYLO8/hqdefault.jpg",
        tag: "Watch",
        excerpt: "All official videos in one place.",
      },
      {
        id: "p_turntable",
        title: "TurnTable Charts — coverage",
        outlet: "TurnTable Charts",
        date: "2023",
        href: "https://www.turntablecharts.com/",
        image: "https://www.turntablecharts.com/favicon.ico",
        tag: "Press",
        excerpt: "Fast shareable coverage.",
      },
    ],
    videos: [
      {
        id: "v_wetin",
        title: "Wetin (Official Video)",
        meta: "Watch here",
        youtubeId: "9lT3tKmYLO8",
        href: "https://www.youtube.com/watch?v=9lT3tKmYLO8",
      },
      {
        id: "v_time",
        title: "Time (Visual / Film)",
        meta: "Watch here",
        youtubeId: "pNcM1elCxTA",
        href: "https://www.youtube.com/watch?v=pNcM1elCxTA",
      },
    ],
  },
};
