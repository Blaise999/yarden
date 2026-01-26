// app/page.client.tsx
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

/**
 * Export types here so `app/page.tsx` can import them safely
 */
export type LinksShape = {
  youtubeChannel?: string;
  youtubeVideosPage?: string;
  youtubeVideos?: Record<string, string>;
  releases?: {
    muse?: { spotify?: string };
    spotify?: string;
    [key: string]: any;
  };
  spotify?: string;
};

/**
 * This keeps heroA/heroB aligned with the Hero component prop type.
 */
export type HeroImageShape = React.ComponentProps<typeof Hero>["heroA"];

type NavItem = { id: string; label: string };

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

type PageClientProps = {
  headerOffset: number;
  links: LinksShape;
  nav: NavItem[];

  heroA: HeroImageShape;
  heroB: HeroImageShape;

  releases: ReleaseItem[];
  visuals: VisualItem[];

  tourConfig: TourConfig;
  shows: ShowItem[];

  storeConfig: StoreConfig;
  merch: MerchItem[];

  isAdmin: boolean;
};

export default function PageClient(props: PageClientProps) {
  const {
    headerOffset,
    links: LINKS,
    nav,
    heroA,
    heroB,
    releases,
    visuals,
    tourConfig,
    shows,
    storeConfig,
    merch,
    isAdmin,
  } = props;

  // ✅ SAFETY: prevent runtime crash when links are missing/mismatched
  const museSpotify =
    (LINKS as any)?.releases?.muse?.spotify ??
    (LINKS as any)?.releases?.spotify ??
    (LINKS as any)?.spotify ??
    "#";

  const youtubeChannel =
    (LINKS as any)?.youtubeChannel ??
    "#";

  const youtubeVideosPage =
    (LINKS as any)?.youtubeVideosPage ??
    "#";

  const meAndU =
    (LINKS as any)?.youtubeVideos?.meAndU ??
    (LINKS as any)?.youtubeVideos?.["meAndU"] ??
    "#";

  const [active, setActive] = useState<string>("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  useBodyLock(menuOpen || passOpen);

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

  // ✅ SAFETY: heroA/heroB might be StaticImageData or string-based, so we normalize src
  const heroASrc = (heroA as any)?.src ?? "";
  const heroBSrc = (heroB as any)?.src ?? "";

  const tintSources = useMemo<Record<string, string>>(
    () => ({
      top: heroASrc,
      releases: releases[0]?.art ?? heroASrc,
      watch: heroBSrc,
      tour: (tourConfig as any)?.posterSrc ?? heroBSrc,
      pass: heroASrc,
      store: merch[0]?.images?.[0] ?? heroBSrc,
      newsletter: heroBSrc,
    }),
    [heroASrc, heroBSrc, releases, tourConfig, merch]
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
          heroBgSrc={heroASrc}
          heroAltSrc={heroBSrc}
          listenHref={museSpotify} // ✅ fixed
        />

        <main id="top">
          <Hero
            heroA={heroA}
            heroB={heroB}
            listenHref={museSpotify} // ✅ fixed
            followHref={youtubeChannel} // ✅ safe
            onOpenPass={onOpenPass}
            nowPlaying={{
              title: "ME & U",
              hint: "Official music video",
              href: meAndU, // ✅ fixed
            }}
            eraLabel="Muse"
            headerOffset={headerOffset}
            pinDistance={950}
          />

          <section id="releases" className="scroll-mt-24">
            <ReleasesSection releases={releases} onOpenPass={onOpenPass} initialCount={2} />
          </section>

          <section id="watch" className="scroll-mt-24">
            <VisualsSection
              items={visuals}
              channelHref={youtubeChannel} // ✅ safe
              videosHref={youtubeVideosPage} // ✅ safe
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
