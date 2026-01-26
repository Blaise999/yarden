// content/defaultCms.ts
import type {
  ShowItem,
  TourConfig,
  MerchItem,
  StoreConfig,
  PressItem,
  EmbedVideo,
  ReleaseItem,
  VisualItem,
} from "./cmsTypes";

export const CMS_KV_KEY = "yarden:cms:v2";

export interface CmsData {
  version: number;
  updatedAt: number;
  
  releases: ReleaseItem[];
  
  visuals: VisualItem[];
  
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
  updatedAt: 0,

  // ═══════════════════════════════════════════════════════════════════
  // RELEASES
  // ═══════════════════════════════════════════════════════════════════
  releases: [
    {
      id: "muse-ep",
      title: "Muse",
      subtitle: "EP",
      year: "2025",
      art: "/Pictures/muse.jpg",
      artSourceLabel: "Audiomack album page",
      artSourceHref: "https://audiomack.com/thisisyarden/album/muse",
      chips: ["EP", "2025", "New"],
      fanLink: "https://vyd.co/YardenMuse",
      linkSource: { label: "Vydia smart link", href: "https://vyd.co/YardenMuse" },
      links: {
        spotify: "https://open.spotify.com/album/6AwJzAvfgQPIXuqdtO1zx3",
        apple: "https://music.apple.com/gb/album/muse/1800018266",
        audiomack: "https://audiomack.com/thisisyarden/album/muse",
        tidal: "https://tidal.com/album/458745789",
        youtube: "https://www.youtube.com/playlist?list=OLAK5uy_ncEjd3gh9V6wfc5OxDBPQZ6r7b5fAkx7k",
      },
      primary: "spotify",
      tracklist: [
        { title: "Julie" },
        { title: "Joanna" },
        { title: "Ifeoma", meta: "feat. taves" },
        { title: "Soul" },
        { title: "Busy Body" },
        { title: "ME & U", meta: "feat. Mellissa" },
      ],
      format: "EP",
      enabled: true,
    },
    {
      id: "towd-ep",
      title: "The One Who Descends",
      subtitle: "EP",
      year: "2023",
      art: "/Pictures/towd.jpg",
      artSourceLabel: "Linkfire smart link",
      artSourceHref: "https://yarden.lnk.to/towd",
      chips: ["EP", "2023"],
      fanLink: "https://yarden.lnk.to/towd",
      linkSource: { label: "Linkfire smart link", href: "https://yarden.lnk.to/towd" },
      links: {
        spotify: "https://open.spotify.com/album/6y3G0lel5n8pd29aTR41d9",
        apple: "https://music.apple.com/gb/album/the-one-who-descends-ep/1716592299",
        audiomack: "https://audiomack.com/thisisyarden/album/the-one-who-descends",
        soundcloud: "https://soundcloud.com/thisisyarden/sets/the-one-who-descends",
        tidal: "https://tidal.com/album/470835374",
        youtube: "https://music.youtube.com/playlist?list=OLAK5uy_njlHHfd6AmXZZqHLHIDzth9L9yGzafsz8",
      },
      primary: "spotify",
      tracklist: [
        { title: "Wait", duration: "2:53" },
        { title: "Divine", duration: "2:49" },
        { title: "Time", duration: "2:22" },
        { title: "So Cold", meta: "feat. Morien & Swayvee", duration: "3:57" },
        { title: "Pressure" },
      ],
      format: "EP",
      enabled: true,
    },
    {
      id: "ifeoma-single",
      title: "Ifeoma",
      subtitle: "Yarden & taves",
      year: "2025",
      art: "/images/releases/ifeoma.jpg",
      artSourceLabel: "Apple Music single page",
      artSourceHref: "https://music.apple.com/gb/album/ifeoma-single/1764347207",
      chips: ["Single", "with taves"],
      links: {
        spotify: "https://open.spotify.com/track/56haPB0vXs1b1Dq4DWEz6U",
        apple: "https://music.apple.com/gb/album/ifeoma-single/1764347207",
        youtube: "https://www.youtube.com/watch?v=kR70fgGumGI",
        soundcloud: "https://soundcloud.com/thisisyarden/ifeoma",
        audiomack: "https://audiomack.com/thisisyarden/song/ifeoma",
        tidal: "https://tidal.com/album/451130989",
      },
      primary: "spotify",
      format: "Single",
      enabled: true,
    },
    {
      id: "soul-single",
      title: "Soul",
      subtitle: "Single",
      year: "2024",
      art: "/images/releases/soul.jpg",
      artSourceLabel: "Linkfire smart link",
      artSourceHref: "https://yarden.lnk.to/soul",
      chips: ["Single", "2024"],
      fanLink: "https://yarden.lnk.to/soul",
      linkSource: { label: "Linkfire smart link", href: "https://yarden.lnk.to/soul" },
      links: {
        spotify: "https://open.spotify.com/track/0vgwRl8tsq9nVaXWuT8Sws",
        apple: "https://music.apple.com/us/song/soul/1762456818",
        youtube: "https://www.youtube.com/watch?v=sE2wMOVFuYY",
        audiomack: "https://audiomack.com/thisisyarden/song/soul",
        soundcloud: "https://soundcloud.com/thisisyarden/soul",
        tidal: "https://tidal.com/track/380788326",
      },
      primary: "spotify",
      format: "Single",
      enabled: true,
    },
    {
      id: "busybody-single",
      title: "Busy Body",
      subtitle: "Single",
      year: "2023",
      art: "/images/releases/busy-body.jpg",
      artSourceLabel: "Feature.fm smart link",
      artSourceHref: "https://ffm.to/busybody",
      chips: ["Single", "2023"],
      fanLink: "https://ffm.to/busybody",
      linkSource: { label: "Feature.fm smart link", href: "https://ffm.to/busybody" },
      links: {
        spotify: "https://open.spotify.com/album/7eo3r91jjVGLJBZCU2Yp9a",
        apple: "https://music.apple.com/gb/album/busy-body-single/1719736181",
        youtube: "https://www.youtube.com/watch?v=mJCl3nZQfAw",
        audiomack: "https://audiomack.com/thisisyarden/song/busy-body",
        deezer: "https://www.deezer.com/album/425811637",
        tidal: "https://tidal.com/album/458745790",
      },
      primary: "spotify",
      format: "Single",
      enabled: true,
    },
    {
      id: "wetin-single",
      title: "Wetin",
      subtitle: "Single",
      year: "2022",
      art: "/images/releases/wetin.jpg",
      artSourceLabel: "Feature.fm smart link",
      artSourceHref: "https://ffm.to/yarden-wetin",
      chips: ["Single", "2022"],
      fanLink: "https://ffm.to/yarden-wetin",
      linkSource: { label: "Feature.fm smart link", href: "https://ffm.to/yarden-wetin" },
      links: {
        spotify: "https://open.spotify.com/track/3yu5otkADG1ldufrPxABoo",
        apple: "https://music.apple.com/gb/album/wetin/1656995361",
        youtube: "https://www.youtube.com/watch?v=9lT3tKmYL38",
        deezer: "https://www.deezer.com/track/2042744547",
        tidal: "https://tidal.com/track/263408478",
      },
      primary: "spotify",
      format: "Single",
      enabled: true,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // VISUALS / VIDEOS
  // ═══════════════════════════════════════════════════════════════════
  visuals: [
    {
      id: "meu-video",
      title: "ME & U (feat. Mellissa)",
      kind: "Official Music Video",
      year: "2025",
      href: "https://youtu.be/jtwvI2wm7Kg?si=HKUa2gVrfVRmIIWL",
      tag: "New",
      enabled: true,
    },
    {
      id: "ifeoma-visualizer",
      title: "Ifeoma (with Taves)",
      kind: "Visualizer",
      year: "2025",
      href: "https://youtu.be/NWQGjtyS6Vk?si=HV0d292X2gxvvVLh",
      enabled: true,
    },
    {
      id: "soul-visualizer",
      title: "Soul",
      kind: "Official Visualizer",
      year: "2024",
      href: "https://youtu.be/sE2wMOVFuYY?si=V6NSy4CFpqZZgtnD",
      enabled: true,
    },
    {
      id: "wait-video",
      title: "Wait",
      kind: "Official Video",
      year: "2024",
      href: "https://youtu.be/hZ40sphEARA?si=1Aiz05OU8_UJOZAx",
      enabled: true,
    },
    {
      id: "time-video",
      title: "Time",
      kind: "Official Video",
      year: "2024",
      href: "https://youtu.be/t09I8srzieU",
      enabled: true,
    },
    {
      id: "busybody-visualizer",
      title: "Busy Body",
      kind: "Visualizer",
      year: "2023",
      href: "https://youtu.be/E0h6P_blGig?si=GgtQAyOvaZ11BdIp",
      enabled: true,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // TOUR
  // ═══════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════
  // STORE / MERCH
  // ═══════════════════════════════════════════════════════════════════
  store: {
    merch: [
      {
        id: "tee_black",
        name: "Ankh Tee (Black)",
        price: "₦ —",
        images: ["/Pictures/merch1.jpg"],
        tag: "Drop soon",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "poster_a2",
        name: "Era Poster (A2)",
        price: "₦ —",
        images: ["/Pictures/merch2.jpg"],
        tag: "Limited",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "ankh_cap",
        name: "Ankh Cap",
        price: "₦ —",
        images: ["/Pictures/merch3.jpg"],
        tag: "New",
        available: false,
        links: [{ label: "Notify me", href: "#" }],
      },
      {
        id: "lanyard",
        name: "Pass Holder Lanyard",
        price: "₦ —",
        images: ["/Pictures/merch4.jpg"],
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

  // ═══════════════════════════════════════════════════════════════════
  // NEWSLETTER / PRESS
  // ═══════════════════════════════════════════════════════════════════
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
        title: 'Yarden shares debut EP "The One Who Descends"',
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
        title: 'Best of New Music: debut EP + new single "TIME"',
        outlet: "TurnTable Charts",
        date: "Dec 5, 2023",
        href: "https://www.turntablecharts.com/news/1175",
        image: "https://ttcfilestorage.blob.core.windows.net/files-2022/TTC_638373737052040596.jpeg",
        tag: "Feature",
        excerpt: "A clean intro for new listeners — what to play first.",
      },
      {
        id: "pulse-press",
        title: 'EP drops alongside the single "Time"',
        outlet: "Pulse Nigeria",
        date: "Dec 4, 2023",
        href: "https://www.pulse.ng/story/yarden-drops-the-one-who-descends-ep-alongside-the-new-single-time-2024072621214515034",
        image:
          "https://image.api.sportal365.com/process/smp-images-production/pulse.ng/26072024/8fbde703-9a86-4aca-aff0-49d90c576d96",
        tag: "Press",
        excerpt: 'Quick coverage that's easy to share when people ask "who\'s that?"',
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
