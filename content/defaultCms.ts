// content/defaultCms.ts
import type { ShowItem, TourConfig } from "../components/landing/TourSection";
import type { MerchItem, StoreConfig } from "../components/landing/StoreSection";
import type { PressItem, EmbedVideo } from "../components/landing/NewsletterSection";

export const CMS_KV_KEY = "yarden:cms:v1";

export interface CmsData {
  version: number;
  updatedAt: number;
  tour: {
    shows: ShowItem[];
    config: TourConfig;
  };
  store: {
    merch: MerchItem[];
    config: StoreConfig;
  };
  newsletter: {
    pressItems: PressItem[];
    videos: EmbedVideo[];
    backgroundImage?: string;
  };
}

export const DEFAULT_CMS: CmsData = {
  version: 1,
  updatedAt: Date.now(),

  tour: {
    shows: [
      { id: "lagos_1", dateLabel: "APR 12", city: "Lagos", venue: "— Venue TBA", status: "announce" },
      { id: "abuja_1", dateLabel: "MAY 03", city: "Abuja", venue: "— Venue TBA", status: "announce" },
      { id: "london_1", dateLabel: "JUN 21", city: "London", venue: "— Venue TBA", status: "announce" },
      { id: "berlin_1", dateLabel: "JUL 09", city: "Berlin", venue: "— Venue TBA", status: "announce" },
    ],
    config: {
      posterSrc: "/Pictures/yarden4.png",
      posterAlt: "Tour poster",
      headline: "Shows that feel like chapters.",
      description: "Right now it's placeholders. Later, admin updates dates instantly — no redesign needed.",
      ticketPortalHref: "",
      notifyCtaLabel: "Get alerts",
      providerHint: "Bandsintown",
    },
  },

  store: {
    merch: [
      {
        id: "tee_black",
        name: "Ankh Tee (Black)",
        price: "₦ —",
        images: ["/media/yarden/merch-tee.jpg"],
        tag: "Drop soon",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "poster_a2",
        name: "Era Poster (A2)",
        price: "₦ —",
        images: ["/media/yarden/merch-poster.jpg"],
        tag: "Limited",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "ankh_cap",
        name: "Ankh Cap",
        price: "₦ —",
        images: ["/media/yarden/merch-cap.jpg"],
        tag: "New",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "lanyard",
        name: "Pass Holder Lanyard",
        price: "₦ —",
        images: ["/media/yarden/merch-lanyard.jpg"],
        tag: "Exclusive",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
    ],
    config: {
      eyebrow: "Store",
      title: "Merch that matches the era.",
      desc: "Official drops and limited pieces.",
      storeHref: "#",
    },
  },

  newsletter: {
    pressItems: [
      {
        id: "wonderland-interview",
        title: 'Yarden talks debut EP "The One Who Descends"',
        outlet: "Wonderland Magazine",
        date: "Dec 1, 2023",
        href: "https://www.wonderlandmagazine.com/2023/12/01/yarden/",
        image: "https://media.wonderlandmagazine.com/uploads/2023/12/LEAD-yard6-scaled.jpg",
        tag: "Interview",
        excerpt: "A quick window into the EP's mood, meaning, and process.",
      },
      {
        id: "culturecustodian-news",
        title: "Yarden shares debut EP "The One Who Descends"",
        outlet: "Culture Custodian",
        date: "Dec 2023",
        href: "https://culturecustodian.com/yarden-shares-debut-ep-the-one-who-descends/",
        image:
          "https://i0.wp.com/culturecustodian.com/wp-content/uploads/2023/12/yard2-scaled.jpg?fit=819%2C1024&ssl=1",
        tag: "News",
        excerpt: "A tight write-up on the debut project and the story behind it.",
      },
      {
        id: "turntable-feature",
        title: "Best of New Music: debut EP + new single "TIME"",
        outlet: "TurnTable Charts",
        date: "Dec 5, 2023",
        href: "https://www.turntablecharts.com/news/1175",
        image: "https://ttcfilestorage.blob.core.windows.net/files-2022/TTC_638373737052040596.jpeg",
        tag: "Feature",
        excerpt: "A clean intro for new listeners — what to play first.",
      },
      {
        id: "pulse-press",
        title: "EP drops alongside the single "Time"",
        outlet: "Pulse Nigeria",
        date: "Dec 4, 2023",
        href: "https://www.pulse.ng/story/yarden-drops-the-one-who-descends-ep-alongside-the-new-single-time-2024072621214515034",
        image:
          "https://image.api.sportal365.com/process/smp-images-production/pulse.ng/26072024/8fbde703-9a86-4aca-aff0-49d90c576d96",
        tag: "Press",
        excerpt: "Quick coverage that's easy to share when people ask "who's that?"",
      },
      {
        id: "youtube-channel",
        title: "Official YouTube channel (videos + releases)",
        outlet: "YouTube",
        date: "Official",
        href: "https://www.youtube.com/@thisisyarden",
        image:
          "https://www.gstatic.com/marketing-cms/assets/images/08/25/fffdc76145f28be3a1ca63859c4a/external-logo-core-1.png=n-w1860-h1047-fcrop64=1,00000000ffffffff-rw",
        tag: "Watch",
        excerpt: "All official videos in one place.",
      },
    ],
    videos: [
      {
        id: "wetin",
        title: "Wetin (Official Video)",
        meta: "Watch here",
        youtubeId: "9lT3tKmYLO8",
        href: "https://www.youtube.com/watch?v=9lT3tKmYLO8",
      },
      {
        id: "time",
        title: "Time (Visual / Film)",
        meta: "Watch here",
        youtubeId: "pNcM1elCxTA",
        href: "https://www.youtube.com/watch?v=pNcM1elCxTA",
      },
    ],
    backgroundImage: "/Pictures/hero3.jpg",
  },
};
