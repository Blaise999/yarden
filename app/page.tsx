// app/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import LandingHeader from "../components/Header";
import { HeroSection as Hero } from "../components/landing/HeroStage";

import { ReleasesSection, type ReleaseItem } from "../components/landing/ReleasesSection";
import { VisualsSection, type VisualItem } from "../components/landing/VisualsSection";
import { TourSection, type ShowItem, type TourConfig } from "../components/landing/TourSection";

import PassSection from "../components/landing/pass/PassGenerator";
import StoreSection, { type MerchItem, type StoreConfig } from "../components/landing/StoreSection";
import { NewsletterSection } from "../components/landing/NewsletterSection";

import Footer from "../components/landing/Footer";
import { PassModal } from "../components/landing/PassModal";

type NavItem = { id: string; label: string };

const HEADER_OFFSET = 84; // still used for Hero foreground padding

function scrollToId(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [locked]);
}

export default function Page() {
  const [active, setActive] = useState<string>("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  useBodyLock(menuOpen || passOpen);

  // ---- OFFICIAL LINKS ----
  const LINKS = useMemo(
    () => ({
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
          youtube: "https://music.youtube.com/playlist?list=OLAK5uy_mzLBDEm-gHIRKRbNtZVJPUEBam7-4Q5rE",
          audiomack: "https://audiomack.com/thisisyarden/album/the-one-who-descends",
          boomplay: "https://www.boomplay.com/albums/80894900",
        },
        muse: {
          spotify: "https://open.spotify.com/album/63Fi9c3GqnaR2aTbm4lR5D",
          apple: "https://music.apple.com/us/album/muse-ep/1837991942",
          youtube: "https://music.youtube.com/playlist?list=OLAK5uy_ncEjd3gh9V6wfc5OxDBPQZ6r7b5fAkx7k",
          audiomack: "https://audiomack.com/thisisyarden/album/muse",
        },
      },
    }),
    []
  );

  const nav: NavItem[] = useMemo(
    () => [
      { id: "top", label: "Home" },
      { id: "releases", label: "Music" },
      { id: "watch", label: "Watch" },
      { id: "tour", label: "Tour" },
      { id: "pass", label: "Pass" },
      { id: "store", label: "Store" },
      { id: "newsletter", label: "News" },
    ],
    []
  );

  const onNav = useCallback((id: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  }, []);

  const onOpenPass = useCallback(() => {
    setMenuOpen(false);
    setPassOpen(true);
  }, []);

  const onClosePass = useCallback(() => setPassOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setPassOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ hero images (public paths)
  const heroA = useMemo(() => ({ src: "/Pictures/hero.jpg", alt: "Yarden cover — clean" }), []);
  const heroB = useMemo(() => ({ src: "/Pictures/hero2.jpg", alt: "Yarden cover — detailed" }), []);

  // ---- DATA ----
  const releases: ReleaseItem[] = useMemo(
    () => [
      {
        title: "The One Who Descends",
        subtitle: "Debut EP",
        year: "2023",
        art: "/Pictures/towd.jpg",
        artSource: "Press kit / assets",
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
        chips: ["Aesthetic era", "Visual-first"],
        links: {
          spotify: LINKS.releases.muse.spotify,
          apple: LINKS.releases.muse.apple,
          youtube: LINKS.releases.muse.youtube,
          audiomack: LINKS.releases.muse.audiomack,
        },
        primary: "youtube",
      },
    ],
    [LINKS]
  );

  const visuals: VisualItem[] = useMemo(
    () => [
      { title: "ME & U", kind: "Official Music Video", year: "2025", href: LINKS.youtubeVideos.meAndU, tag: "Official" },
      { title: "Time", kind: "Official Video", year: "2024", href: LINKS.youtubeVideos.time, tag: "Official" },
      { title: "Wait", kind: "Official Video", year: "2024", href: LINKS.youtubeVideos.wait, tag: "Official" },
      { title: "Soul", kind: "Official Visualizer", year: "2024", href: LINKS.youtubeVideos.soul, tag: "Visualizer" },
      { title: "Ifeoma", kind: "Visualizer", year: "2023", href: LINKS.youtubeVideos.ifeoma, tag: "Visualizer" },
      { title: "Busy Body", kind: "Visualizer", year: "2023", href: LINKS.youtubeVideos.busyBody, tag: "Visualizer" },
    ],
    [LINKS]
  );

  const tourConfig: TourConfig = useMemo(
    () => ({
      posterSrc: "/media/yarden/tour-poster.jpg",
      posterAlt: "Tour poster",
      headline: "Shows that feel like chapters.",
      description: "Right now it’s placeholders. Later, admin updates dates instantly — no redesign needed.",
      ticketPortalHref: "",
      notifyCtaLabel: "Get alerts",
      providerHint: "Bandsintown",
    }),
    []
  );

  const shows: ShowItem[] = useMemo(
    () => [
      { id: "lagos_1", dateLabel: "APR 12", city: "Lagos", venue: "— Venue TBA", status: "announce" },
      { id: "abuja_1", dateLabel: "MAY 03", city: "Abuja", venue: "— Venue TBA", status: "announce" },
      { id: "london_1", dateLabel: "JUN 21", city: "London", venue: "— Venue TBA", status: "announce" },
      { id: "berlin_1", dateLabel: "JUL 09", city: "Berlin", venue: "— Venue TBA", status: "announce" },
    ],
    []
  );

  const storeConfig: StoreConfig = useMemo(
    () => ({
      eyebrow: "Store",
      title: "Merch that matches the era.",
      desc: "Official drops and limited pieces.",
      storeHref: "#",
    }),
    []
  );

  const merch: MerchItem[] = useMemo(
    () => [
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
    []
  );

  const tintSources = useMemo<Record<string, string>>(
    () => ({
      top: heroA.src,
      releases: releases[0]?.art ?? heroA.src,
      watch: heroB.src,
      tour: tourConfig.posterSrc ?? heroB.src,
      pass: heroA.src,
      store: merch[0]?.images?.[0] ?? heroB.src,
      newsletter: heroB.src,
    }),
    [heroA.src, heroB.src, releases, tourConfig.posterSrc, merch]
  );

  // scroll spy
  useEffect(() => {
    const ids = nav.map((n) => n.id).filter((id) => id !== "top");
    const observers: IntersectionObserver[] = [];

    const onScrollTop = () => {
      if (window.scrollY < 120) setActive("top");
    };

    window.addEventListener("scroll", onScrollTop, { passive: true });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setActive(id);
        },
        { threshold: 0.22 }
      );

      io.observe(el);
      observers.push(io);
    });

    return () => {
      window.removeEventListener("scroll", onScrollTop);
      observers.forEach((o) => o.disconnect());
    };
  }, [nav]);

  const isAdmin = false;

  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      <div className="relative">
        <LandingHeader
          nav={nav}
          activeId={active}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
          onCloseMenu={() => setMenuOpen(false)}
          onNav={onNav}
          onOpenPass={onOpenPass}
          onLogo={() => onNav("top")}
          tintSources={tintSources}
          heroBgSrc={heroA.src}
        />

        <main id="top">
          <Hero
            heroA={heroA}
            heroB={heroB}
            listenHref={LINKS.releases.muse.spotify}
            followHref={LINKS.youtubeChannel}
            onOpenPass={onOpenPass}
            nowPlaying={{
              title: "ME & U",
              hint: "Official music video",
              href: LINKS.youtubeVideos.meAndU,
            }}
            eraLabel="Muse"
            headerOffset={HEADER_OFFSET}
            pinDistance={950}
          />

          <section id="releases" className="scroll-mt-24">
            <ReleasesSection releases={releases} onOpenPass={onOpenPass} initialCount={2} />
          </section>

          <section id="watch" className="scroll-mt-24">
            <VisualsSection
              items={visuals}
              channelHref={LINKS.youtubeChannel}
              videosHref={LINKS.youtubeVideosPage}
              maxItems={8}
            />
          </section>

          <section id="tour" className="scroll-mt-24">
            <TourSection shows={shows} config={tourConfig} onOpenPass={onOpenPass} editable={isAdmin} />
          </section>

          <section id="pass" className="scroll-mt-24">
            <PassSection />
          </section>

          <section id="store" className="scroll-mt-24">
            <StoreSection merch={merch} config={storeConfig} editable={isAdmin} />
          </section>

          <section id="newsletter" className="scroll-mt-24">
            <NewsletterSection />
          </section>

          <Footer />
        </main>

        <PassModal open={passOpen} onClose={onClosePass} />
      </div>
    </div>
  );
}
