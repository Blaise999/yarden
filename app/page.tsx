// app/page.tsx
import type { ReleaseItem } from "../components/landing/ReleasesSection";
import type { VisualItem } from "../components/landing/VisualsSection";
import type { ShowItem, TourConfig } from "../components/landing/TourSection";
import type { MerchItem, StoreConfig } from "../components/landing/StoreSection";

import PageClient from "./page.client";

type NavItem = { id: string; label: string };

export type LinksShape = {
  youtubeChannel: string;
  youtubeVideosPage: string;

  youtubeVideos: {
    meAndU: string;
    time: string;
    wait: string;
    soul: string;
    busyBody: string;
    ifeoma: string;
  };

  releases: {
    towd: {
      spotify: string;
      apple: string;
      youtube: string;
      audiomack: string;
      boomplay: string;
    };
    muse: {
      spotify: string;
      apple: string;
      youtube: string;
      audiomack: string;
    };
  };
};

export type HeroImageShape = { src: string; alt: string };

const HEADER_OFFSET = 84;

export default function Page() {
  const LINKS: LinksShape = {
    youtubeChannel: "https://www.youtube.com/@thisisyarden",
    youtubeVideosPage: "https://www.youtube.com/@thisisyarden/videos",

    youtubeVideos: {
      meAndU: "https://youtu.be/jtwvI2wm7Kg?si=HKUa2gVrfVRmIIWL",
      time: "https://youtu.be/t09I8srzieU",
      wait: "https://youtu.be/hZ40sphEARA?si=1Aiz05OU8_UJOZAx",
      soul: "https://youtu.be/sE2wMOVFuYY?si=V6NSy4CFpqZZgtnD",
      busyBody: "https://youtu.be/E0h6P_blGig?si=GgtQAyOvaZ11BdIp",
      ifeoma: "https://youtu.be/NWQGjtyS6Vk?si=HV0d292X2gxvvVLh",
    },

    releases: {
      towd: {
        spotify: "https://open.spotify.com/album/6y3G0lel5n8pd29aTR41d9",
        apple: "https://music.apple.com/us/album/the-one-who-descends-ep/1716592249",
        youtube:
          "https://music.youtube.com/playlist?list=OLAK5uy_mzLBDEm-gHIRKRbNtZVJPUEBam7-4Q5rE",
        audiomack: "https://audiomack.com/thisisyarden/album/the-one-who-descends",
        boomplay: "https://www.boomplay.com/albums/80894900",
      },
      muse: {
        spotify: "https://open.spotify.com/album/63Fi9c3GqnaR2aTbm4lR5D",
        apple: "https://music.apple.com/us/album/muse-ep/1837991942",
        youtube:
          "https://music.youtube.com/playlist?list=OLAK5uy_ncEjd3gh9V6wfc5OxDBPQZ6r7b5fAkx7k",
        audiomack: "https://audiomack.com/thisisyarden/album/muse",
      },
    },
  };

  const nav: NavItem[] = [
    { id: "top", label: "Home" },
    { id: "releases", label: "Music" },
    { id: "watch", label: "Watch" },
    { id: "tour", label: "Tour" },
    { id: "pass", label: "Pass" },
    { id: "store", label: "Store" },
    { id: "newsletter", label: "News" },
  ];

  const heroA: HeroImageShape = { src: "/Pictures/hero.jpg", alt: "Yarden cover — clean" };
  const heroB: HeroImageShape = { src: "/Pictures/hero3.jpg", alt: "Yarden cover — detailed" };

  // ---- DATA ----
  const releases: ReleaseItem[] = [
    {
      title: "The One Who Descends",
      subtitle: "Debut EP",
      year: "2023",
      art: "/Pictures/towd.jpg",
      artSource: "Press kit / assets",
      format: "EP", // ✅ force EP so filters never hide it
      chips: ["New nostalgia", "World-building"],
      links: {
        spotify: LINKS.releases.towd.spotify,
        apple: LINKS.releases.towd.apple,
        youtube: LINKS.releases.towd.youtube,
        audiomack: LINKS.releases.towd.audiomack,
        boomplay: LINKS.releases.towd.boomplay,
      },
      primary: "spotify",
    },
    {
      title: "Muse",
      subtitle: "EP",
      year: "2025",
      art: "/Pictures/muse.jpg",
      artSource: "Press kit / assets",
      format: "EP", // ✅ THIS is the main guarantee Muse always shows under EPs
      chips: ["Aesthetic era", "Visual-first"],
      links: {
        spotify: LINKS.releases.muse.spotify,
        apple: LINKS.releases.muse.apple,
        youtube: LINKS.releases.muse.youtube,
        audiomack: LINKS.releases.muse.audiomack,
      },
      primary: "youtube",
    },
  ];

  const visuals: VisualItem[] = [
    { title: "ME & U", kind: "Official Music Video", year: "2025", href: LINKS.youtubeVideos.meAndU, tag: "Official" },
    { title: "Time", kind: "Official Video", year: "2024", href: LINKS.youtubeVideos.time, tag: "Official" },
    { title: "Wait", kind: "Official Video", year: "2024", href: LINKS.youtubeVideos.wait, tag: "Official" },
    { title: "Soul", kind: "Official Visualizer", year: "2024", href: LINKS.youtubeVideos.soul, tag: "Visualizer" },
    { title: "Ifeoma", kind: "Visualizer", year: "2023", href: LINKS.youtubeVideos.ifeoma, tag: "Visualizer" },
    { title: "Busy Body", kind: "Visualizer", year: "2023", href: LINKS.youtubeVideos.busyBody, tag: "Visualizer" },
  ];

  const tourConfig: TourConfig = {
    posterSrc: "/Pictures/yarden4.png",
    posterAlt: "Tour poster",
    headline: "Shows that feel like chapters.",
    description: "Right now it’s placeholders. Later, admin updates dates instantly — no redesign needed.",
    ticketPortalHref: "",
    notifyCtaLabel: "Get alerts",
    providerHint: "Bandsintown",
  };

  const shows: ShowItem[] = [
    { id: "lagos_1", dateLabel: "APR 12", city: "Lagos", venue: "— Venue TBA", status: "announce" },
    { id: "abuja_1", dateLabel: "MAY 03", city: "Abuja", venue: "— Venue TBA", status: "announce" },
    { id: "london_1", dateLabel: "JUN 21", city: "London", venue: "— Venue TBA", status: "announce" },
    { id: "berlin_1", dateLabel: "JUL 09", city: "Berlin", venue: "— Venue TBA", status: "announce" },
  ];

  const storeConfig: StoreConfig = {
    eyebrow: "Store",
    title: "Merch that matches the era.",
    desc: "Official drops and limited pieces.",
    storeHref: "#",
  };

  const merch: MerchItem[] = [
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
  ];

  const isAdmin = false;

  return (
    <PageClient
      headerOffset={HEADER_OFFSET}
      links={LINKS}
      nav={nav}
      heroA={heroA}
      heroB={heroB}
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
