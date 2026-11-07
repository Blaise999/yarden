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
  site: {
    eyebrow: string;
    title: string;
    tagline: string;
    description: string;
    desktopVideo: string;
    mobileVideo: string;
    desktopPoster: string;
    mobilePoster: string;
  };
  
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
  version: 3,
  updatedAt: 0,
  site: {
    eyebrow: "YARDEN / ANGEL — OUT NOW",
    title: "ANGEL.",
    tagline: "THE DEBUT ALBUM / OUT NOW",
    description: "Thirteen songs. Every shade of feeling.",
    desktopVideo: "",
    mobileVideo: "",
    desktopPoster: "/editorial/yarden-hero-desktop.webp",
    mobilePoster: "/editorial/yarden-hero-mobile.webp",
  },

  // ═══════════════════════════════════════════════════════════════════
  // RELEASES
  // ═══════════════════════════════════════════════════════════════════
  releases: [
    {
      id: "angel-album",
      title: "ANGEL",
      subtitle: "Debut studio album · 13 tracks",
      year: "2026",
      // Official ANGEL album artwork; hosted at the credited music publication.
      // Upload an owned master to Vercel Blob in Admin → Releases for independent long-term hosting.
      art: "/Pictures/angel.jpg",
      artSourceLabel: "Official ANGEL cover, via HypeTribe NG",
      artSourceHref: "https://hypetribeng.com/yarden-angel-debut-album-dxtiny-kemuel-fimi/",
      chips: ["Album", "2026", "Out now"],
      fanLink: "https://music.apple.com/us/album/angel/6817875363",
      linkSource: { label: "Apple Music album", href: "https://music.apple.com/us/album/angel/6817875363" },
      links: { apple: "https://music.apple.com/us/album/angel/6817875363" },
      primary: "apple",
      tracklist: [
        { title: "MORNING ANGEL" }, { title: "MI AMOR" }, { title: "ANGEL" },
        { title: "1CHANCE" }, { title: "2SOFT" }, { title: "SDF (SO DAMN FINE)" },
        { title: "SFD (SWEET FANTA DIALLO)", meta: "feat. dxtiny" },
        { title: "SUNSET IN PARIS" }, { title: "RAIN", meta: "feat. Kemuel" },
        { title: "SEXY FREAK", meta: "feat. Fimi" }, { title: "LUV" },
        { title: "U" }, { title: "TWILIGHT" },
      ],
      format: "Album", enabled: true, highlight: true,
    },
    {
      id: "muse-ep",
      title: "Muse",
      subtitle: "EP",
      year: "2025",
      art: "/Pictures/muse.jpg",
      artSourceLabel: "Audiomack album page",
      artSourceHref: "https://audiomack.com/thisisyarden/album/muse",
      chips: ["EP", "2025"],
      fanLink: "https://vyd.co/YardenMuse",
      linkSource: { label: "Vydia smart link", href: "https://vyd.co/YardenMuse" },
      links: {
        spotify: "https://open.spotify.com/album/6AwJzAvfgQPIXuqdtO1zx3",
        apple: "https://music.apple.com/us/album/muse-ep/1837991942",
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
      highlight: true,
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
      id: "sdf-2026-single",
      title: "SDF (So Damn Fine)",
      subtitle: "Single · ANGEL era",
      year: "2026",
      art: "/Pictures/angel.jpg",
      artSourceLabel: "ANGEL era artwork",
      artSourceHref: "https://music.apple.com/us/album/angel/6817875363",
      chips: ["Single", "2026"],
      fanLink: "https://music.apple.com/us/album/angel/6817875363",
      links: { apple: "https://music.apple.com/us/album/angel/6817875363" },
      primary: "apple", format: "Single", enabled: true,
    },
    {
      id: "sunset-in-paris-2026-single",
      title: "Sunset in Paris",
      subtitle: "Single",
      year: "2026",
      art: "/images/releases/sunset-in-paris.jpg",
      artSourceLabel: "Apple Music single artwork",
      artSourceHref: "https://www.youtube.com/watch?v=M7dENTsiKNs",
      chips: ["Single", "2026"],
      fanLink: "https://music.apple.com/us/album/sunset-in-paris-single/6770536830",
      links: { apple: "https://music.apple.com/us/album/sunset-in-paris-single/6770536830", youtube: "https://www.youtube.com/watch?v=M7dENTsiKNs" },
      primary: "apple", format: "Single", enabled: true,
    },
    {
      id: "celine-2026-single",
      title: "Celine",
      subtitle: "Single",
      year: "2026",
      art: "/images/releases/celine.jpg",
      artSourceLabel: "Apple Music single artwork",
      artSourceHref: "https://www.youtube.com/watch?v=d-f2EOBk5X4",
      chips: ["Single", "2026"],
      fanLink: "https://music.apple.com/us/album/celine-single/1884027763",
      links: { apple: "https://music.apple.com/us/album/celine-single/1884027763", youtube: "https://www.youtube.com/watch?v=d-f2EOBk5X4" },
      primary: "apple", format: "Single", enabled: true,
    },
    {
      id: "ifeoma-single",
      title: "Ifeoma",
      subtitle: "Yarden & taves",
      year: "2025",
      art: "/images/releases/ifeoma.jpg",
      artSourceLabel: "Apple Music single page",
      artSourceHref: "https://music.apple.com/us/song/1795511082",
      chips: ["Single", "with taves"],
      links: {
        spotify: "https://open.spotify.com/track/56haPB0vXs1b1Dq4DWEz6U",
        apple: "https://music.apple.com/us/song/1795511082",
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
        apple: "https://music.apple.com/pg/album/busy-body-single/1680800447",
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
      id: "sfd-angel-video-2026",
      title: "SFD (Sweet Fanta Diallo) ft. dxtiny",
      kind: "Official Music Video",
      year: "2026",
      href: "https://www.youtube.com/watch?v=XhWGq0aHULo",
      tag: "ANGEL / NEW",
      enabled: true,
    },
    {
      id: "angel-album-trailer-2026",
      title: "ANGEL — Official Album Trailer",
      kind: "Official Album Trailer",
      year: "2026",
      href: "https://www.youtube.com/watch?v=okkbole3lOU",
      tag: "ANGEL",
      enabled: true,
    },
    {
      id: "sunset-paris-video-2026",
      title: "Sunset in Paris",
      kind: "Official Music Video",
      year: "2026",
      href: "https://www.youtube.com/watch?v=M7dENTsiKNs",
      enabled: true,
    },
    {
      id: "celine-video-2026",
      title: "Celine",
      kind: "Official Music Video",
      year: "2026",
      href: "https://www.youtube.com/watch?v=d-f2EOBk5X4",
      enabled: true,
    },
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
    shows: [], // No invented concert dates. Add verified shows in the CMS.
    config: {
      posterSrc: "/editorial/yarden-listening.webp",
      posterAlt: "Tour poster",
      headline: "See it live.",
      description: "Dates, cities, and ticket links — announced here first.",
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
      title: "Store.",
      desc: "Official pieces and limited drops.",
      storeHref: "",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // NEWSLETTER / PRESS
  // ═══════════════════════════════════════════════════════════════════
  newsletter: {
    pressItems: [
      {
        id: "turntable-angel-interview-nov-2026",
        title: "There is more than one sound to Yarden's music",
        outlet: "TurnTable Charts",
        date: "Nov 5, 2026",
        href: "https://turntablecharts.com/news/2303-there-is-more-than-one-sound-to-yarden-s-music",
        image: "/Pictures/turntable-angel.jpeg",
        tag: "Cover interview",
        excerpt: "Yarden on his inspirations, new sounds and the feelings behind ANGEL.",
      },
      {
        id: "angel-album-release-2026",
        title: "Yarden's debut album ANGEL arrives with 13 tracks",
        outlet: "HypeTribe NG",
        date: "Oct 30, 2026",
        href: "https://hypetribeng.com/yarden-angel-debut-album-dxtiny-kemuel-fimi/",
        image: "/Pictures/angel.jpg",
        tag: "Album release",
        excerpt: "A new full-length world, featuring dxtiny, Kemuel and Fimi.",
      },
      {
        id: "ghanaplug-angel-oct-2026",
        title: "Yarden unveils ANGEL, a genre-bending debut",
        outlet: "Ghana Plug",
        date: "Oct 30, 2026",
        href: "https://ghanaplug.com/yarden-unveils-angel-a-genre-bending-debut-album-exploring-the-many-side-of-his-artistry/",
        image: "/editorial/yarden-listening.webp",
        tag: "Feature",
        excerpt: "A record moving through Afrosoul, alternative R&B and Afropop.",
      },
      {
        id: "album-talks-angel-2026",
        title: "ANGEL: Yarden announces a new chapter",
        outlet: "Album Talks",
        date: "Oct 27, 2026",
        href: "https://albumtalks.com/yarden-announces-debut-album-angel/",
        image: "/Pictures/hero2.jpg",
        tag: "Announcement",
        excerpt: "The thirteen-song project brings together romance, vulnerability and freedom to experiment.",
      },
      {
        id: "mmc-sdf-oct-2026",
        title: "SDF (So Damn Fine) opens the ANGEL era",
        outlet: "MMC Nation",
        date: "Oct 16, 2026",
        href: "https://mmcnation.com/2026/10/16/yarden-release-sonically-pleasing-single-sdf-so-damn-fine/",
        image: "/Pictures/hero.jpg",
        tag: "Single spotlight",
        excerpt: "The retro-leaning single that set the mood ahead of ANGEL.",
      },
      {
        id: "yarden-creative-interview-2025",
        title: "Yarden on Muse, influences and building for creatives",
        outlet: "The.Wav NG",
        date: "Nov 3, 2025",
        href: "https://thewavng.substack.com/p/yarden-on-muse-and-reaching-1-billion-8a9",
        image: "/Pictures/muse.jpg",
        tag: "Conversation",
        excerpt: "The artist on his influences, collaborations and bigger creative ambitions.",
      },
      {
        id: "wonderland-interview",
        title: "Yarden talks The One Who Descends",
        outlet: "Wonderland Magazine",
        date: "Dec 1, 2023",
        href: "https://www.wonderlandmagazine.com/2023/12/01/yarden/",
        image: "/Pictures/yarden1.png",
        tag: "Interview",
        excerpt: "An intimate look at the meaning and making of the EP.",
      },
      {
        id: "culturecustodian-news",
        title: "The One Who Descends: the first chapter",
        outlet: "Culture Custodian",
        date: "Dec 2023",
        href: "https://culturecustodian.com/yarden-shares-debut-ep-the-one-who-descends/",
        image: "/Pictures/towd.jpg",
        tag: "Archive",
        excerpt: "The release and the story behind the early Yarden world.",
      },
      {
        id: "turntable-feature",
        title: "Best of new music: TIME and the debut EP",
        outlet: "TurnTable Charts",
        date: "Dec 5, 2023",
        href: "https://www.turntablecharts.com/news/1175",
        image: "/Pictures/yarden3.jpg",
        tag: "Archive",
        excerpt: "An early introduction to Yarden's music and artistry.",
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
