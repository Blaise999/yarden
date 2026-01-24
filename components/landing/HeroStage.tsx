// HeroSection.tsx (FULL EDIT — fixes “hero disappears” via pin layer + overflow fix,
// keeps hero-header event sync intact)
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  cx,
  usePrefersReducedMotion,
  Pill,
  Button,
  RadialGlow,
  AnchorGrid,
  FloatingCursorSpotlight,
  IconAnkh,
  IconSpark,
  IconArrowUpRight,
  IconPlay,
} from "./ui";

gsap.registerPlugin(ScrollTrigger);

type HeroImage = { src: string; alt: string; focus?: string };
type NowPlaying = {
  title: string;
  hint?: string;
  href: string;
  official?: { spotify?: string; apple?: string; youtube?: string };
  hintB?: string;
};

type SocialLink = { label: string; href: string };
type NextShow = { dateLabel: string; city: string; venue: string; href?: string };

function detectSafari() {
  if (typeof navigator === "undefined") return { isSafari: false, isIOS: false };
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isWebKit = /AppleWebKit/.test(ua);
  const isNotChrome = !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/.test(ua);
  const isSafari = isWebKit && isNotChrome;
  return { isSafari, isIOS };
}

function useSafariInfo() {
  const [info, setInfo] = useState<{ isSafari: boolean; isIOS: boolean }>({
    isSafari: false,
    isIOS: false,
  });
  useEffect(() => setInfo(detectSafari()), []);
  return info;
}

// Hero -> Header event (stage + presence)
const HERO_STAGE_EVENT = "yarden:hero-stage";
type HeroStageDetail = { stage: "A" | "B"; progress: number; inHero: boolean };

function emitHeroStage(detail: HeroStageDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HERO_STAGE_EVENT, { detail }));
}

export function HeroSection(props: {
  heroA: HeroImage;
  heroB: HeroImage;
  listenHref: string;
  followHref: string;
  onOpenPass: () => void;
  nowPlaying: NowPlaying;

  pinDistance?: number;
  headerOffset?: number; // fallback only (CSS var --header-h is primary)
  fullBleed?: boolean;

  headlineA?: string;
  subheadA?: string;
  headlineB?: string;
  subheadB?: string;

  badgesA?: string[];
  badgesB?: string[];
  statsA?: Array<{ label: string; value: string; hint?: string }>;
  statsB?: Array<{ label: string; value: string; hint?: string }>;

  eraLabel?: string;

  tourHref?: string;
  shopHref?: string;
  videosHref?: string;
  socials?: SocialLink[];
  press?: string[];
  nextShow?: NextShow;
  onJoinNewsletter?: (payload: { email: string }) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { isSafari, isIOS } = useSafariInfo();

  const fallbackHeaderOffset = props.headerOffset ?? 84; // fallback if CSS var missing
  const fullBleed = props.fullBleed ?? true;

  // Refs
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);

  const mediaRef = useRef<HTMLDivElement | null>(null);
  const artARef = useRef<HTMLDivElement | null>(null);
  const artBRef = useRef<HTMLDivElement | null>(null);
  const patternRef = useRef<HTMLDivElement | null>(null);
  const glowFxRef = useRef<HTMLDivElement | null>(null);

  const nowARef = useRef<HTMLDivElement | null>(null);
  const nowBRef = useRef<HTMLDivElement | null>(null);

  const sceneARef = useRef<HTMLDivElement | null>(null);
  const sceneBRef = useRef<HTMLDivElement | null>(null);
  const railARef = useRef<HTMLDivElement | null>(null);
  const railBRef = useRef<HTMLDivElement | null>(null);

  // event throttle
  const lastDetailRef = useRef<HeroStageDetail>({ stage: "A", progress: 0, inHero: false });
  const rafEmitRef = useRef<number | null>(null);
  const scheduleEmit = (detail: HeroStageDetail) => {
    lastDetailRef.current = detail;
    if (typeof window === "undefined") return;
    if (rafEmitRef.current) cancelAnimationFrame(rafEmitRef.current);
    rafEmitRef.current = requestAnimationFrame(() => emitHeroStage(lastDetailRef.current));
  };

  // iOS Safari: lock a stable viewport height
  useEffect(() => {
    if (!isIOS) return;
    const el = rootRef.current;
    if (!el) return;

    const setVH = () => el.style.setProperty("--hero-vh", `${window.innerHeight}px`);
    setVH();

    window.addEventListener("resize", setVH, { passive: true });
    window.addEventListener("orientationchange", setVH as any, { passive: true } as any);

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH as any);
    };
  }, [isIOS]);

  const [pinDistance, setPinDistance] = useState<number>(() => {
    if (typeof props.pinDistance === "number") return props.pinDistance;
    if (typeof window === "undefined") return 1400;
    return window.innerWidth < 768 ? 980 : 1550;
  });

  useEffect(() => {
    if (typeof props.pinDistance === "number") {
      setPinDistance(props.pinDistance);
      return;
    }
    let raf = 0;
    const onResize = () => {
      const next = window.innerWidth < 768 ? 980 : 1550;
      setPinDistance((prev) => {
        if (prev === next) return prev;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        return next;
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [props.pinDistance]);

  // Copy (short)
  const headlineA = props.headlineA ?? "Yarden";
  const subheadA = props.subheadA ?? "Music. Visuals. Live.";

  const headlineB = props.headlineB ?? "Visuals";
  const subheadB = props.subheadB ?? "Watch the journey.";

  const nextShow: NextShow =
    props.nextShow ??
    ({
      dateLabel: "SOON",
      city: "Tour",
      venue: "Dates and ticket links",
      href: props.tourHref,
    } as NextShow);

  const eraLabel = props.eraLabel?.trim();

  // load tracking (we only refresh after both images load once)
  const [loadedCount, setLoadedCount] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const loadedAOnce = useRef(false);
  const loadedBOnce = useRef(false);
  const refreshedOnce = useRef(false);
  const prevProgressRef = useRef(0);

  // Ensure hero is visible after mount to prevent disappearing
  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // initial state for header
  useEffect(() => {
    scheduleEmit({ stage: "A", progress: 0, inHero: false });
    return () => {
      if (rafEmitRef.current) cancelAnimationFrame(rafEmitRef.current);
      scheduleEmit({ stage: "A", progress: 0, inHero: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      // If reduced motion, keep Scene A as default and don't create ScrollTrigger.
      if (reducedMotion) return;

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      });

      const section = sectionRef.current;
      const pinEl = pinRef.current;
      const media = mediaRef.current;
      const artA = artARef.current;
      const artB = artBRef.current;

      const pattern = patternRef.current;
      const glowFx = glowFxRef.current;

      const sceneA = sceneARef.current;
      const sceneB = sceneBRef.current;
      const railA = railARef.current;
      const railB = railBRef.current;

      const nowA = nowARef.current;
      const nowB = nowBRef.current;

      if (
        !section ||
        !pinEl ||
        !media ||
        !artA ||
        !artB ||
        !sceneA ||
        !sceneB ||
        !railA ||
        !railB ||
        !nowA ||
        !nowB
      ) {
        return;
      }

      // --- ✅ Fix for “hero disappears” ---
      // Keep pinned hero above the rest of the page while ScrollTrigger is active.
      const PIN_Z = 40;
      const setPinnedLayer = (pinned: boolean) => {
        // section is relative already; pinEl becomes fixed/transform depending on pinType
        gsap.set(section, { zIndex: pinned ? PIN_Z : 0 });
        gsap.set(pinEl, { zIndex: pinned ? PIN_Z : 0 });
      };

      // Kill old trigger cleanly (hot reload / re-mount)
      ScrollTrigger.getById("hero-pin")?.kill(true);

      // Hard reset: ensures we never start with overlapping states
      // Use immediateRender: false to prevent flash
      gsap.set([artA], { opacity: 1, visibility: "visible", scale: 1, y: 0, x: 0, immediateRender: true });
      gsap.set([artB], { opacity: 0, visibility: "visible", scale: 1.12, y: 60, x: 0, immediateRender: true });
      gsap.set(sceneA, { opacity: 1, y: 0, immediateRender: true });
      gsap.set(sceneB, { opacity: 0, y: 12, immediateRender: true });
      gsap.set(railA, { opacity: 1, y: 0, immediateRender: true });
      gsap.set(railB, { opacity: 0, y: 12, immediateRender: true });
      gsap.set(nowA, { opacity: 1, y: 0, immediateRender: true });
      gsap.set(nowB, { opacity: 0, y: 8, immediateRender: true });

      if (pattern) gsap.set(pattern, { opacity: 0.16, scale: 1, immediateRender: true });
      if (glowFx) gsap.set(glowFx, { opacity: 0, scale: 0.92, immediateRender: true });

      // Safari stability flags
      gsap.set([media, artA, artB, pattern, glowFx].filter(Boolean), {
        backfaceVisibility: "hidden",
        webkitBackfaceVisibility: "hidden",
        transformStyle: isSafari ? "flat" : "preserve-3d",
      });

      // Ensure the pinned block always keeps a stable composited layer
      gsap.set(pinEl, { willChange: "transform" });
      gsap.set(media, {
        borderRadius: 0,
        scale: 1,
        y: 0,
        x: 0,
        willChange: "transform, opacity",
        transformOrigin: "50% 50%",
        force3D: !isSafari, // Safari: keep lighter
      });

      if (isSafari) {
        gsap.set([artA, artB], { z: 0.01, force3D: false });
      } else {
        gsap.set([artA, artB], { force3D: true });
      }

      // Pointer events switching (prevents ghost clicks)
      let inB = false;
      const setInB = (next: boolean) => {
        if (inB === next) return;
        inB = next;
        sceneA.style.pointerEvents = next ? "none" : "auto";
        railA.style.pointerEvents = next ? "none" : "auto";
        nowA.style.pointerEvents = next ? "none" : "auto";

        sceneB.style.pointerEvents = next ? "auto" : "none";
        railB.style.pointerEvents = next ? "auto" : "none";
        nowB.style.pointerEvents = next ? "auto" : "none";
      };
      setInB(false);

      const masterTL = gsap.timeline({ defaults: { overwrite: "auto" } });

      const transitionStart = 0.45;
      const transitionDuration = 0.25;
      const sf = transitionDuration;

      masterTL.to(media, { scale: 0.995, duration: 1, ease: "none" }, 0);

      masterTL.to(
        artA,
        { opacity: 0, scale: 1.2, y: -60, duration: transitionDuration, ease: "expo.inOut" },
        transitionStart
      );
      masterTL.to(
        artB,
        { opacity: 1, scale: 1, y: 0, duration: transitionDuration, ease: "expo.inOut" },
        transitionStart
      );

      if (pattern) {
        masterTL.to(
          pattern,
          { opacity: 0.32, scale: 1.08, duration: 0.85 * sf, ease: "expo.out" },
          transitionStart + 0.05 * sf
        );
      }

      const switchDur = 0.6 * sf;
      const switchAStart = transitionStart + 0.08 * sf;
      const switchBStart = transitionStart + 0.16 * sf;

      masterTL.to(sceneA, { opacity: 0, y: -10, duration: switchDur, ease: "expo.out" }, switchAStart);
      masterTL.to(sceneB, { opacity: 1, y: 0, duration: switchDur, ease: "expo.out" }, switchBStart);
      masterTL.to(railA, { opacity: 0, y: -10, duration: switchDur, ease: "expo.out" }, switchAStart);
      masterTL.to(railB, { opacity: 1, y: 0, duration: switchDur, ease: "expo.out" }, switchBStart);

      const nowDur = 0.45 * sf;
      const nowAStart = transitionStart + 0.12 * sf;
      const nowBStart = transitionStart + 0.18 * sf;

      masterTL.to(nowA, { opacity: 0, y: -6, duration: nowDur, ease: "power2.out" }, nowAStart);
      masterTL.to(nowB, { opacity: 1, y: 0, duration: nowDur, ease: "power2.out" }, nowBStart);

      // threshold used only for header vibe + pointer-events swap
      const midTransition = transitionStart + transitionDuration / 2;

      const flash = () => {
        if (!glowFx) return;
        gsap.killTweensOf(glowFx);
        gsap.fromTo(
          glowFx,
          { opacity: 0, scale: 0.92 },
          { opacity: 0.22, scale: 1.12, duration: 0.22, ease: "power2.out" }
        );
        gsap.to(glowFx, { opacity: 0, duration: 0.35, ease: "power2.in", delay: 0.08 });
      };

      // Ensure initial layer state
      setPinnedLayer(false);

      ScrollTrigger.create({
        id: "hero-pin",
        trigger: section,
        start: "top top",
        end: () => `+=${pinDistance}`,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: isSafari ? 0.65 : 0.8,
        animation: masterTL,

        // Safari: fixed pin + reparent can be stable; we keep it.
        // The “disappearing hero” issue is typically z-index / overlap, fixed by setPinnedLayer().
        pinType: isSafari ? "fixed" : "transform",
        pinReparent: isSafari,

        onEnter: (self) => {
          setPinnedLayer(true);
          scheduleEmit({ stage: self.progress >= midTransition ? "B" : "A", progress: self.progress, inHero: true });
        },
        onEnterBack: (self) => {
          setPinnedLayer(true);
          scheduleEmit({ stage: self.progress >= midTransition ? "B" : "A", progress: self.progress, inHero: true });
        },
        onLeave: (self) => {
          setPinnedLayer(false);
          scheduleEmit({ stage: "B", progress: 1, inHero: false });
        },
        onLeaveBack: (self) => {
          setPinnedLayer(false);
          scheduleEmit({ stage: "A", progress: 0, inHero: false });
        },

        onUpdate: (self) => {
          const p = self.progress;
          const next = p >= midTransition;

          setInB(next);

          // hero-stage sync for header (tint + vibe only)
          scheduleEmit({ stage: next ? "B" : "A", progress: p, inHero: true });

          if (glowFx) {
            const crossedUp = prevProgressRef.current < midTransition && p >= midTransition;
            const crossedDown = prevProgressRef.current >= midTransition && p < midTransition;
            if (crossedUp || crossedDown) flash();
          }

          prevProgressRef.current = p;
        },

        onRefreshInit: () => {
          // keep pinned layer correct during refresh passes
          const st = ScrollTrigger.getById("hero-pin");
          const pinned = !!st && st.isActive;
          setPinnedLayer(pinned);

          gsap.set([media, artA, artB], { x: 0 });
        },
        onRefresh: () => {
          const st = ScrollTrigger.getById("hero-pin");
          const pinned = !!st && st.isActive;
          setPinnedLayer(pinned);
        },
      });

      return () => {
        masterTL.kill();
        ScrollTrigger.getById("hero-pin")?.kill(true);
        setPinnedLayer(false);
        scheduleEmit({ stage: "A", progress: 0, inHero: false });
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, pinDistance, isSafari] }
  );

  // Refresh after both images load (prevents wrong pin start/end + overlap on first paint)
  useEffect(() => {
    if (reducedMotion || loadedCount < 2 || refreshedOnce.current) return;
    refreshedOnce.current = true;
    requestAnimationFrame(() => {
      ScrollTrigger.getById("hero-pin")?.refresh();
      ScrollTrigger.refresh();
    });
  }, [loadedCount, reducedMotion]);

  // Safari filters can cause flicker while pinned; keep it simple.
  const imageFilter = isSafari ? "none" : "contrast(1.14) saturate(1.22) brightness(1.06)";

  // Safe bottom space so the “Now / Featured” card never sits on top of text/rail.
  const safeBottomStyle: React.CSSProperties = {
    paddingBottom: "max(18rem, calc(15rem + env(safe-area-inset-bottom)))",
  };

  // Header-synced top padding (CSS var driven) with fallback
  const topPadStyle: React.CSSProperties = {
    paddingTop: `calc(var(--header-h, ${fallbackHeaderOffset}px) + 22px)`,
  };

  return (
    <div ref={rootRef} className="overflow-x-hidden">
      <section
        ref={sectionRef as any}
        className={cx(
          "relative overflow-x-hidden overflow-y-visible",
          fullBleed && "relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw]",
          !heroReady && "opacity-0",
          heroReady && "opacity-100 transition-opacity duration-300"
        )}
        style={{ isolation: "isolate" }}
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <RadialGlow className="left-[-120px] top-[-120px] h-[520px] w-[520px] bg-white/10 md:h-[620px] md:w-[620px]" />
          <RadialGlow className="right-[-140px] top-[40px] h-[560px] w-[560px] bg-white/8 md:h-[660px] md:w-[660px]" />
          <AnchorGrid />
        </div>

        {/* Pin wrapper */}
        <div
          ref={pinRef}
          className={cx("relative z-0 mx-auto w-full", "min-h-[100svh] md:min-h-[860px]")}
          style={isIOS ? ({ minHeight: "var(--hero-vh, 100vh)" } as any) : undefined}
        >
          {/* MEDIA */}
          <div
            ref={mediaRef}
            className={cx(
              "absolute inset-0 z-0 overflow-hidden bg-black", // ✅ keep a real bg (no white flash)
              "shadow-[0_40px_100px_rgba(0,0,0,0.75)]",
              "ring-1 ring-white/10"
            )}
            style={{ willChange: "transform" }}
          >
            <FloatingCursorSpotlight disabled={reducedMotion || isSafari} />

            <div
              ref={glowFxRef}
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 22%, rgba(255,255,255,0.04) 48%, transparent 72%)",
                mixBlendMode: "screen",
              }}
            />

            <div
              ref={patternRef}
              className={cx("pointer-events-none absolute inset-0 opacity-0", !isSafari && "mix-blend-soft-light")}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 15% 20%, rgba(255,255,255,0.16) 0%, transparent 38%),
                  radial-gradient(circle at 85% 25%, rgba(255,255,255,0.12) 0%, transparent 44%),
                  repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 18px),
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 24px)
                `,
                WebkitMaskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 74%)",
                maskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 74%)",
              }}
            />

            {/* HERO A */}
            <div ref={artARef} className="absolute inset-0 opacity-100">
              <Image
                src={props.heroA.src}
                alt={props.heroA.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: props.heroA.focus ?? "50% 35%", filter: imageFilter }}
                onLoadingComplete={() => {
                  if (!loadedAOnce.current) {
                    loadedAOnce.current = true;
                    setLoadedCount((c) => c + 1);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-black/6" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/06 to-transparent" />
            </div>

            {/* HERO B */}
            <div ref={artBRef} className="absolute inset-0 opacity-0">
              <Image
                src={props.heroB.src}
                alt={props.heroB.alt}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: props.heroB.focus ?? "50% 35%", filter: imageFilter }}
                onLoadingComplete={() => {
                  if (!loadedBOnce.current) {
                    loadedBOnce.current = true;
                    setLoadedCount((c) => c + 1);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/24 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/12 to-transparent" />
            </div>

            {/* Bottom Now / Featured */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 md:bottom-8 md:left-8 md:right-8">
              <div className="rounded-3xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-2xl sm:p-5">
                <div className="relative">
                  <div ref={nowARef} className="opacity-100">
                    <div className="text-[10px] uppercase tracking-[0.32em] text-white/70">Now</div>
                    <div className="mt-1.5 truncate text-lg font-semibold text-white sm:text-xl md:text-2xl">
                      {props.nowPlaying.title}
                    </div>
                    <div className="mt-1 text-[13px] text-white/65 sm:text-sm">
                      {props.nowPlaying.hint ?? "Streaming everywhere"}
                    </div>
                  </div>

                  <div ref={nowBRef} className="absolute inset-0 opacity-0" aria-hidden>
                    <div className="text-[10px] uppercase tracking-[0.32em] text-white/70">Featured</div>
                    <div className="mt-1.5 truncate text-lg font-semibold text-white sm:text-xl md:text-2xl">
                      {props.nowPlaying.title}
                    </div>
                    <div className="mt-1 text-[13px] text-white/65 sm:text-sm">
                      {props.nowPlaying.hintB ?? "Watch the latest visual"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3 md:mt-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {props.nowPlaying.official?.spotify && (
                      <Button variant="ghost" href={props.nowPlaying.official.spotify} target="_blank">
                        Spotify
                      </Button>
                    )}
                    {props.nowPlaying.official?.apple && (
                      <Button variant="ghost" href={props.nowPlaying.official.apple} target="_blank">
                        Apple
                      </Button>
                    )}
                    {props.nowPlaying.official?.youtube && (
                      <Button variant="ghost" href={props.nowPlaying.official.youtube} target="_blank">
                        YouTube
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    href={props.nowPlaying.href}
                    target="_blank"
                    iconLeft={<IconPlay className="h-5 w-5" />}
                  >
                    Play
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FOREGROUND */}
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 md:px-8" style={{ ...topPadStyle, ...safeBottomStyle }}>
            <div className="pt-2">
              <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
                {/* LEFT */}
                <div>
                  <Pill tone="brand" className="uppercase tracking-wider">
                    <IconAnkh className="h-4 w-4" />
                    <span>Yarden</span>
                    {eraLabel ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-normal text-white/75 ring-1 ring-white/10">
                        {eraLabel}
                      </span>
                    ) : null}
                  </Pill>

                  <div className="relative mt-7 min-h-[420px] sm:min-h-[380px] md:min-h-[320px]">
                    {/* Scene A */}
                    <div ref={sceneARef} className="opacity-100">
                      <h1 className="text-balance text-4xl font-semibold tracking-tighter text-white sm:text-5xl md:text-7xl">
                        {headlineA}
                      </h1>
                      <p className="mt-4 text-pretty text-base leading-relaxed text-white/75 sm:text-lg md:mt-5 md:text-xl">
                        {subheadA}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
                        <Button
                          variant="primary"
                          href={props.listenHref}
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Listen
                        </Button>
                        <Button
                          variant="secondary"
                          href={props.followHref}
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Follow
                        </Button>
                        <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-5 w-5" />}>
                          Pass
                        </Button>
                        {props.videosHref ? (
                          <Button variant="ghost" href={props.videosHref} iconRight={<IconArrowUpRight className="h-5 w-5" />}>
                            Visuals
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Scene B */}
                    <div ref={sceneBRef} className="absolute inset-0 opacity-0" aria-hidden>
                      <h2 className="text-balance text-4xl font-semibold tracking-tighter text-white sm:text-5xl md:text-7xl">
                        {headlineB}
                      </h2>
                      <p className="mt-4 text-pretty text-base leading-relaxed text-white/75 sm:text-lg md:mt-5 md:text-xl">
                        {subheadB}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
                        <Button
                          variant="primary"
                          href={props.videosHref ?? props.followHref}
                          target={props.videosHref ? undefined : "_blank"}
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Watch
                        </Button>
                        {props.tourHref ? (
                          <Button variant="secondary" href={props.tourHref} iconRight={<IconArrowUpRight className="h-5 w-5" />}>
                            Tour
                          </Button>
                        ) : null}
                        <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-5 w-5" />}>
                          Pass
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT RAIL */}
                <div className="relative min-h-[340px] sm:min-h-[320px] md:min-h-[300px]">
                  {/* Rail A */}
                  <div ref={railARef} className="opacity-100">
                    <RailCard
                      label="Next"
                      title={`${nextShow.dateLabel} · ${nextShow.city}`}
                      body={nextShow.venue}
                      href={nextShow.href ?? props.tourHref}
                      cta={nextShow.href || props.tourHref ? "Tickets" : undefined}
                    />

                    {props.shopHref || props.videosHref ? (
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        {props.videosHref ? (
                          <RailCard label="Visuals" title="Latest drops" body="Official videos and highlights." href={props.videosHref} cta="Open" />
                        ) : null}
                        {props.shopHref ? (
                          <RailCard label="Shop" title="Merch" body="Limited pieces and vault items." href={props.shopHref} cta="View" />
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* Rail B */}
                  <div ref={railBRef} className="absolute inset-0 opacity-0" aria-hidden>
                    <RailCard label="Archive" title="Visual world" body="Watch the catalog." href={props.videosHref ?? props.followHref} cta="Enter" />
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <RailCard label="Listen" title="Streaming" body="Go to the latest release." href={props.listenHref} cta="Open" />
                      {props.tourHref ? <RailCard label="Tour" title="Dates" body="Updates + ticket links." href={props.tourHref} cta="View" /> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /FOREGROUND */}
        </div>
        {/* /PIN WRAPPER */}
      </section>
    </div>
  );
}

function RailCard({
  label,
  title,
  body,
  href,
  cta,
  onClick,
}: {
  label: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="rounded-3xl bg-black/26 p-4 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-white">{title}</div>
      <div className="mt-1 text-[12px] leading-relaxed text-white/70">{body}</div>
      {cta ? (
        <div className="mt-3">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/12">
            {cta}
            <IconArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      ) : null}
    </div>
  );

  if (href)
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );

  if (onClick)
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );

  return inner;
}
