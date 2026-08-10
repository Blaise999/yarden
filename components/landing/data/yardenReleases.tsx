// src/components/landing/data/yardenReleases.ts
import type { ReleaseItem } from "../ReleasesSection";

export const yardenReleases: ReleaseItem[] = [
  {
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
      apple: "https://music.apple.com/gb/album/muse/1800018266",
      audiomack: "https://audiomack.com/thisisyarden/album/muse",
      tidal: "https://tidal.com/album/458745789",
      youtube: "https://www.youtube.com/playlist?list=OLAK5uy_ncEjd3gh9V6wfc5OxDBPQZ6r7b5fAkx7k",
      // boomplay/deezer not reliably exposed in plain HTML here → left blank
    },
    primary: "spotify",
  },

  {
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
  },

  {
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
      // deezer/boomplay not reliably fetchable here → left blank
    },
    primary: "spotify",
  },

  {
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
      // youtube music link wasn’t consistently exposed → left blank
    },
    primary: "spotify",
  },

  {
    title: "The One Who Descends",
    subtitle: "EP",
    year: "2023",
    art: "/images/releases/the-one-who-descends.jpg",
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
      // deezer/boomplay not reliably fetchable here → left blank
    },
    primary: "spotify",
  },

  {
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
      // boomplay not reliably exposed → left blank
    },
    primary: "spotify",
  },
];
