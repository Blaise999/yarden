// app/page.tsx
import PageClient, { type LinksShape, type HeroImageShape } from "./page.client";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const isAdmin = String(searchParams?.admin ?? "") === "1";
  const headerOffset = 84;

  const links: LinksShape = {
    youtubeChannel: "https://www.youtube.com/@yarden",
    youtubeVideosPage: "https://www.youtube.com/@yarden/videos",
    youtubeVideos: {
      meAndU: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    },
    releases: {
      muse: {
        spotify: "https://open.spotify.com/album/YOUR_ALBUM_ID",
      },
    },
  };

  // ✅ These casts keep TS happy even if Hero expects StaticImageData or a stricter object
  const heroA = { src: "/images/hero-a.jpg", alt: "Hero A" } as unknown as HeroImageShape;
  const heroB = { src: "/images/hero-b.jpg", alt: "Hero B" } as unknown as HeroImageShape;

  const nav = [
    { id: "top", label: "Home" },
    { id: "releases", label: "Releases" },
    { id: "watch", label: "Watch" },
    { id: "tour", label: "Tour" },
    { id: "pass", label: "Pass" },
    { id: "store", label: "Store" },
    { id: "newsletter", label: "Newsletter" },
  ];

  // Use `as any` until you paste the exact exported types from those sections
  const releases = [
    { id: "muse", title: "Muse", year: "2026", art: "/images/releases/muse.jpg" },
  ] as any;

  const visuals = [
    { id: "me-and-u", title: "ME & U", thumb: "/images/visuals/me-and-u.jpg", href: links.youtubeVideos.meAndU },
  ] as any;

  const tourConfig = { posterSrc: "/images/tour/poster.jpg" } as any;
  const shows = [] as any;

  const storeConfig = { currency: "USD" } as any;
  const merch = [] as any;

  return (
    <PageClient
      headerOffset={headerOffset}
      links={links}
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
