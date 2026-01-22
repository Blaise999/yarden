// src/components/landing/VisualsSection.tsx
"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Button,
  IconArrowUpRight,
  IconClose,
  IconPlay,
  Modal,
  Pill,
  SectionHeader,
  cx,
  usePrefersReducedMotion,
} from "./ui";

export type VisualItem = {
  title: string;
  kind: "Official Video" | "Official Music Video" | "Official Visualizer" | "Visualizer";
  year: string;
  href: string;
  tag?: string;
};

// ✅ Channel links
const YARDEN_CHANNEL = "https://www.youtube.com/@thisisyarden";
const YARDEN_VIDEOS = "https://www.youtube.com/@thisisyarden/videos";
const YARDEN_PLAYLISTS = "https://www.youtube.com/@thisisyarden/playlists";

// ✅ Real titles (newest-ish first)
const DEFAULT_ITEMS: VisualItem[] = [
  {
    title: "ME & U (feat. Mellissa)",
    kind: "Official Music Video",
    year: "2025",
    href: "https://youtu.be/jtwvI2wm7Kg?si=HKUa2gVrfVRmIIWL",
    tag: "New",
  },
  {
    title: "Ifeoma (with Taves)",
    kind: "Visualizer",
    year: "2025",
    href: "https://youtu.be/NWQGjtyS6Vk?si=HV0d292X2gxvvVLh",
  },
  {
    title: "Soul",
    kind: "Official Visualizer",
    year: "2024",
    href: "https://youtu.be/sE2wMOVFuYY?si=V6NSy4CFpqZZgtnD",
  },
  {
    title: "Wait",
    kind: "Official Video",
    year: "2024",
    href: "https://youtu.be/hZ40sphEARA?si=1Aiz05OU8_UJOZAx",
  },
  {
    title: "Time",
    kind: "Official Video",
    year: "2024",
    href: "https://youtu.be/t09I8srzieU",
  },
  {
    title: "Busy Body",
    kind: "Visualizer",
    year: "2023",
    href: "https://youtu.be/E0h6P_blGig?si=GgtQAyOvaZ11BdIp",
  },
];

type YTTarget = { kind: "video"; id: string } | { kind: "playlist"; id: string };

// ⚠️ removed “live/<id>” handling (as requested)
function getYTTarget(url: string): YTTarget | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? { kind: "video", id } : null;
    }

    const v = u.searchParams.get("v");
    if (v) return { kind: "video", id: v };

    const list = u.searchParams.get("list");
    if (list && (u.pathname.includes("playlist") || !v)) return { kind: "playlist", id: list };

    const parts = u.pathname.split("/").filter(Boolean);
    const s = parts.indexOf("shorts");
    if (s !== -1 && parts[s + 1]) return { kind: "video", id: parts[s + 1] };

    const e = parts.indexOf("embed");
    if (e !== -1 && parts[e + 1]) return { kind: "video", id: parts[e + 1] };

    return null;
  } catch {
    return null;
  }
}

function getYTVideoIdForThumb(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const v = u.searchParams.get("v");
    if (v) return v;

    const parts = u.pathname.split("/").filter(Boolean);
    const s = parts.indexOf("shorts");
    if (s !== -1 && parts[s + 1]) return parts[s + 1];

    const e = parts.indexOf("embed");
    if (e !== -1 && parts[e + 1]) return parts[e + 1];

    return null;
  } catch {
    return null;
  }
}

// inline fallback so it ALWAYS works (no local images needed)
function svgFallbackDataUrl(label: string) {
  const safe = (label || "YARDEN").toUpperCase().slice(0, 18);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0B0F14"/>
        <stop offset="1" stop-color="#141B24"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="20%" r="70%">
        <stop offset="0" stop-color="rgba(255,255,255,.14)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 .18 0"/>
      </filter>
    </defs>
    <rect width="1200" height="675" fill="url(#g)"/>
    <rect width="1200" height="675" fill="url(#r)"/>
    <rect width="1200" height="675" filter="url(#grain)" opacity=".18"/>
    <g opacity=".9">
      <path d="M520 290 L520 385 L615 337.5 Z" fill="rgba(255,255,255,.85)"/>
    </g>
    <text x="60" y="600" font-family="ui-sans-serif, system-ui" font-size="42" fill="rgba(255,255,255,.72)" letter-spacing="6">
      ${safe}
    </text>
    <text x="60" y="640" font-family="ui-sans-serif, system-ui" font-size="18" fill="rgba(255,255,255,.45)" letter-spacing="3">
      VISUALS
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getThumbCandidates(href: string): string[] {
  const id = getYTVideoIdForThumb(href);
  if (!id) return [];
  return [
    `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`,
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi_webp/${id}/mqdefault.webp`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/0.jpg`,
  ];
}

function SmartThumb(props: {
  candidates: string[];
  fallback: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onSettled?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const src = props.candidates[idx] ?? props.fallback;

  return (
    <img
      src={src}
      alt={props.alt}
      className={cx("h-full w-full object-cover", props.className)}
      loading={props.priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={() => props.onSettled?.()}
      onError={() => {
        setIdx((p) => {
          const next = p + 1;
          return next < props.candidates.length ? next : p;
        });
        props.onSettled?.();
      }}
    />
  );
}

type ResolvedItem = VisualItem & {
  _key: string;
  thumbs: string[];
  yt: YTTarget | null;
  fallback: string;
};

function buildEmbedSrc(t: YTTarget, autoplay: 0 | 1) {
  if (t.kind === "video") {
    return `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=${autoplay}&rel=0&modestbranding=1&playsinline=1`;
  }
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${t.id}&autoplay=${autoplay}&rel=0&modestbranding=1&playsinline=1`;
}

// desktop-only spotlight preview (muted, no controls, loops)
function buildPreviewSrc(t: YTTarget | null) {
  if (!t || t.kind !== "video") return null;
  const id = t.id;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    fs: "0",
    disablekb: "1",
    iv_load_policy: "3",
    cc_load_policy: "0",
    loop: "1",
    playlist: id,
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

gsap.registerPlugin(ScrollTrigger);

export function VisualsSection(props?: {
  id?: string;
  items?: VisualItem[];

  channelHref?: string;
  videosHref?: string;
  playlistsHref?: string;

  eyebrow?: string;
  title?: string;
  desc?: string;

  cycleMs?: number;
  maxItems?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const id = props?.id ?? "watch";

  const base = props?.items?.length ? props.items : DEFAULT_ITEMS;
  const maxItems = props?.maxItems ? Math.max(1, props.maxItems) : undefined;
  const raw = maxItems ? base.slice(0, maxItems) : base;

  const channelHref = props?.channelHref ?? YARDEN_CHANNEL;
  const videosHref = props?.videosHref ?? YARDEN_VIDEOS;
  const playlistsHref = props?.playlistsHref ?? YARDEN_PLAYLISTS;

  const cycleMs = Math.max(4500, props?.cycleMs ?? 6500);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const heroScanRef = useRef<HTMLDivElement | null>(null);
  const heroGlowRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ResolvedItem | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  const [spotIdx, setSpotIdx] = useState(0);
  const [heroPreviewReady, setHeroPreviewReady] = useState(false);

  const items = useMemo<ResolvedItem[]>(() => {
    return raw.map((v) => {
      const yt = getYTTarget(v.href);
      const fallback = svgFallbackDataUrl("Yarden");
      const thumbs = getThumbCandidates(v.href);
      return {
        ...v,
        _key: v.href || v.title,
        yt,
        fallback,
        thumbs: thumbs.length ? thumbs : [fallback],
      };
    });
  }, [raw]);

  const safeSpotIdx = Math.min(spotIdx, Math.max(0, items.length - 1));
  const spotlight = items[safeSpotIdx] ?? items[0];

  const openPlayer = (item: ResolvedItem) => {
    if (!item?.yt) {
      window.open(item.href, "_blank", "noreferrer");
      return;
    }
    setActive(item);
    setIframeReady(false);
    setOpen(true);
  };

  // reset desktop preview readiness each time spotlight changes
  useLayoutEffect(() => {
    setHeroPreviewReady(false);
  }, [spotIdx]);

  // spotlight transition (scan + punchy but clean)
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const media = heroMediaRef.current;
    const scan = heroScanRef.current;
    const glow = heroGlowRef.current;
    if (!media || !scan || !glow) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.set(scan, { opacity: 0, xPercent: -140 });
    tl.to(glow, { opacity: 1, duration: 0.2 }, 0);
    tl.to(media, { scale: 1.015, duration: 0.28 }, 0);
    tl.to(scan, { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.05);
    tl.to(scan, { xPercent: 140, duration: 0.42, ease: "power2.out" }, 0.08);
    tl.to(scan, { opacity: 0, duration: 0.18 }, 0.3);
    tl.to(media, { scale: 1.0, duration: 0.5 }, 0.16);
    tl.to(glow, { opacity: 0.55, duration: 0.6 }, 0.2);

    return () => tl.kill();
  }, [spotIdx, reducedMotion]);

  // enter reveal + auto-cycle while in view
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    const ctx = gsap.context(() => {
      const hero = stage.querySelector<HTMLElement>("[data-hero='1']");
      const railItems = Array.from(stage.querySelectorAll<HTMLElement>("[data-rail-item='1']"));
      const mobileCards = Array.from(stage.querySelectorAll<HTMLElement>("[data-mobile-card='1']"));

      if (!hero) return;

      gsap.set(hero, { opacity: 0, y: 22, scale: 1.015, filter: "blur(10px)" });
      gsap.set(railItems, { opacity: 0, x: 16, rotateY: -10, filter: "blur(8px)" });
      gsap.set(mobileCards, { opacity: 0, y: 14, filter: "blur(8px)" });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

      tl.to(hero, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75 });
      tl.to({}, { duration: 0.25 });
      tl.to(railItems, { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.05 }, "-=0.1");
      tl.to(mobileCards, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.05 }, "-=0.35");

      ScrollTrigger.create({
        trigger: stage,
        start: "top 78%",
        once: true,
        onEnter: () => tl.play(),
      });

      // auto-cycle start/stop in viewport
      let timer: number | null = null;

      const start = () => {
        if (timer) return;
        timer = window.setInterval(() => {
          setSpotIdx((i) => (i + 1) % Math.max(1, items.length));
        }, cycleMs);
      };

      const stop = () => {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
      };

      const auto = ScrollTrigger.create({
        trigger: stage,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: start,
        onEnterBack: start,
        onLeave: stop,
        onLeaveBack: stop,
      });

      // pause auto briefly after user actions
      let userPause: number | null = null;
      const pauseAutoBriefly = () => {
        stop();
        if (userPause) window.clearTimeout(userPause);
        userPause = window.setTimeout(() => {
          if (!reducedMotion) start();
        }, Math.max(2500, Math.floor(cycleMs * 0.65)));
      };

      (root as any).__pauseAuto = pauseAutoBriefly;

      return () => {
        stop();
        if (userPause) window.clearTimeout(userPause);
        auto.kill();
        tl.kill();
      };
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion, items.length, cycleMs]);

  const autoplay: 0 | 1 = reducedMotion ? 0 : 1;
  const embedSrc = active?.yt ? buildEmbedSrc(active.yt, autoplay) : null;

  const previewSrc = buildPreviewSrc(spotlight?.yt ?? null);
  const showDesktopPreview = Boolean(previewSrc) && !reducedMotion && !open;

  return (
    <section id={id} className="relative py-20 md:py-24">
      {/* split padding: header stays padded, stage can go edge-to-edge on mobile */}
      <div ref={rootRef} className="mx-auto max-w-7xl">
        <div className="px-5 md:px-8">
          <SectionHeader
            eyebrow={props?.eyebrow ?? "Watch"}
            title={props?.title ?? "Visuals"}
            desc={props?.desc ?? "Featured first. Then the queue — tap any clip to play right here."}
            right={
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" href={channelHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                  YouTube
                </Button>
                <Button variant="ghost" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                  All videos
                </Button>
                <Button variant="ghost" href={playlistsHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                  Playlists
                </Button>
              </div>
            }
          />
        </div>

        {/* STAGE (edge-to-edge on mobile, framed from md+) */}
        <div ref={stageRef} className="mt-8 md:mt-10 md:px-8">
          <div
            className={cx(
              "relative overflow-hidden",
              "rounded-none md:rounded-[36px]",
              "bg-transparent md:bg-white/[0.03]",
              "md:ring-1 md:ring-white/10",
              "shadow-none md:shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
            )}
          >
            {/* subtle atmosphere (desktop mostly) */}
            <div className="pointer-events-none absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-black/45 via-transparent to-black/45" />

            <div className="relative z-[2] p-0 md:p-7">
              <div className="grid gap-0 lg:grid-cols-12 lg:gap-6 lg:items-stretch">
                {/* HERO (go big on mobile) */}
                <button
                  type="button"
                  onClick={() => openPlayer(spotlight)}
                  className={cx(
                    "group relative w-full overflow-hidden text-left",
                    // remove the “card-in-card” feeling on mobile
                    "rounded-none lg:rounded-[28px]",
                    "bg-black/10 lg:bg-white/[0.035]",
                    "ring-0 lg:ring-1 lg:ring-white/12",
                    "shadow-none lg:shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    "lg:col-span-8 lg:h-full"
                  )}
                  data-hero="1"
                >
                  <div className="relative h-full">
                    <div
                      ref={heroMediaRef}
                      className={cx(
                        "relative overflow-hidden",
                        // BIG viewing area on mobile
                        "h-[52svh] min-h-[320px] max-h-[560px]",
                        // keep classic shape on tablets
                        "md:h-auto md:aspect-video",
                        // fill on desktop grid
                        "lg:aspect-auto lg:h-full"
                      )}
                    >
                      {/* base thumbnail */}
                      <SmartThumb
                        candidates={spotlight.thumbs}
                        fallback={spotlight.fallback}
                        alt={`Yarden — ${spotlight.title}`}
                        priority
                        onSettled={() => (ScrollTrigger as any)?.refresh?.()}
                        className="scale-[1.02]"
                      />

                      {/* unify chaotic thumbs (subtle matte + vignette) */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.12),rgba(0,0,0,0.00)_55%)]" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/12 to-black/0" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-black/18" />

                      {/* desktop premiere preview */}
                      {showDesktopPreview ? (
                        <div
                          className={cx(
                            "pointer-events-none absolute inset-0 hidden lg:block transition-opacity duration-500",
                            heroPreviewReady ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <iframe
                            src={previewSrc!}
                            title={`Preview — ${spotlight.title}`}
                            className="absolute inset-0 h-full w-full"
                            onLoad={() => setHeroPreviewReady(true)}
                            allow="autoplay; encrypted-media; picture-in-picture"
                          />
                        </div>
                      ) : null}

                      {/* scan + glow accent (light) */}
                      <div
                        ref={heroScanRef}
                        className="pointer-events-none absolute inset-0 opacity-0"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.16) 45%, rgba(255,255,255,0.00) 70%)",
                          mixBlendMode: "screen",
                        }}
                      />
                      <div
                        ref={heroGlowRef}
                        className="pointer-events-none absolute inset-0 opacity-0"
                        style={{
                          background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0.00) 60%)",
                        }}
                      />

                      {/* mobile/desktop play badge (center) */}
                      <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div
                          className={cx(
                            "rounded-full px-4 py-3 backdrop-blur-xl",
                            "bg-black/45 ring-1 ring-white/12",
                            "text-white/90",
                            "shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                          )}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <IconPlay className="h-4 w-4" />
                            Watch
                          </div>
                        </div>
                      </div>

                      {/* desktop top pills only (don’t steal mobile space) */}
                      <div className="absolute left-5 top-5 hidden md:flex items-center gap-2">
                        <Pill tone="brand" className="gap-2">
                          <IconPlay className="h-4 w-4" />
                          Featured
                        </Pill>
                        <Pill tone="muted">{spotlight.kind}</Pill>
                        <Pill tone="muted">{spotlight.year}</Pill>
                        {spotlight.tag ? <Pill tone="ghost">{spotlight.tag}</Pill> : null}
                      </div>

                      {/* desktop glass label (kept clean) */}
                      <div className="absolute bottom-5 left-5 hidden lg:block">
                        <div className="rounded-2xl bg-black/40 px-4 py-3 ring-1 ring-white/12 backdrop-blur-xl">
                          <div className="text-[11px] uppercase tracking-widest text-white/60">@thisisyarden</div>
                          <div className="mt-1 text-[20px] font-semibold text-white">{spotlight.title}</div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                            <span>Play</span>
                            <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* mobile meta BELOW (clean + roomy) */}
                    <div className="lg:hidden px-5 pb-5 pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="brand" className="gap-2">
                          <IconPlay className="h-4 w-4" />
                          Featured
                        </Pill>
                        <Pill tone="muted">{spotlight.kind}</Pill>
                        <Pill tone="muted">{spotlight.year}</Pill>
                        {spotlight.tag ? <Pill tone="ghost">{spotlight.tag}</Pill> : null}
                      </div>

                      <div className="mt-3 text-[20px] font-semibold text-white">{spotlight.title}</div>
                      <div className="mt-2 text-sm text-white/60">
                        <span className="text-white/70">@thisisyarden</span>
                        <span className="mx-2 opacity-60">•</span>
                        <span>Tap to watch</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* DESKTOP QUEUE (right column) */}
                <div className="hidden lg:block lg:col-span-4 lg:h-full">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">On deck</div>
                    <div className="text-xs text-white/50">Rotating</div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {items.slice(0, 6).map((v, i) => {
                      const isNow = v._key === spotlight._key;

                      return (
                        <button
                          key={v._key}
                          type="button"
                          data-rail-item="1"
                          onClick={() => {
                            const idx = items.findIndex((x) => x._key === v._key);
                            if (idx !== -1) {
                              setSpotIdx(idx);
                              (rootRef.current as any)?.__pauseAuto?.();
                            }
                          }}
                          className={cx(
                            "group relative flex items-center gap-3 rounded-2xl p-3 text-left transition",
                            "ring-1",
                            isNow ? "bg-white/[0.06] ring-white/20" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.05]"
                          )}
                        >
                          {/* active edge */}
                          <div
                            className={cx(
                              "absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-full transition-opacity",
                              isNow ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                            )}
                            style={{
                              background: "linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.10))",
                            }}
                          />

                          <div className="relative h-16 w-24 overflow-hidden rounded-xl ring-1 ring-white/10">
                            <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                            {isNow ? (
                              <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 ring-1 ring-white/12 backdrop-blur">
                                NOW
                              </div>
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-white/45 tabular-nums">{String(i + 1).padStart(2, "0")}</div>
                              <div className="truncate text-sm font-semibold text-white">{v.title}</div>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                              <span>{v.kind}</span>
                              <span className="opacity-60">•</span>
                              <span>{v.year}</span>
                              {v.tag ? (
                                <>
                                  <span className="opacity-60">•</span>
                                  <span className="text-white/70">{v.tag}</span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          <div className="shrink-0 text-white/35 group-hover:text-white/70 transition">
                            <IconArrowUpRight className="h-4 w-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                      See all
                    </Button>
                    <Button variant="ghost" href={playlistsHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                      Playlists
                    </Button>
                  </div>
                </div>
              </div>

              {/* MOBILE QUEUE (horizontal, big tap targets, snap) */}
              <div className="lg:hidden px-5 pb-6">
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">On deck</div>
                  <div className="text-xs text-white/50">Swipe</div>
                </div>

                <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-2">
                  <div className="flex gap-3 snap-x snap-mandatory">
                    {items.map((v) => {
                      const isNow = v._key === spotlight._key;

                      return (
                        <button
                          key={`${v._key}-mobile`}
                          type="button"
                          data-mobile-card="1"
                          onClick={() => {
                            const idx = items.findIndex((x) => x._key === v._key);
                            if (idx !== -1) {
                              setSpotIdx(idx);
                              (rootRef.current as any)?.__pauseAuto?.();
                            }
                          }}
                          className={cx(
                            "snap-start shrink-0 text-left",
                            "w-[78%] min-w-[280px] max-w-[360px]",
                            "rounded-3xl overflow-hidden",
                            "bg-white/[0.03] ring-1 transition",
                            isNow ? "ring-white/20" : "ring-white/10"
                          )}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                            <div className="absolute left-3 top-3 flex items-center gap-2">
                              <Pill tone="muted" className="gap-2">
                                <IconPlay className="h-4 w-4" />
                                Play
                              </Pill>
                              {isNow ? <Pill tone="brand">Now</Pill> : null}
                            </div>

                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="truncate text-sm font-semibold text-white">{v.title}</div>
                              <div className="mt-1 text-xs text-white/55">
                                {v.kind} • {v.year}
                                {v.tag ? <span className="text-white/70"> • {v.tag}</span> : null}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    All videos
                  </Button>
                  <Button variant="ghost" href={playlistsHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Playlists
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal player */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setActive(null);
          setIframeReady(false);
        }}
        title={active ? `${active.title}` : "Watch"}
      >
        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <div className="aspect-video">
              <div className={cx("absolute inset-0 transition-opacity", iframeReady ? "opacity-0" : "opacity-100")}>
                {active ? (
                  <SmartThumb candidates={active.thumbs} fallback={active.fallback} alt={active.title} className="opacity-95" priority />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              </div>

              {embedSrc ? (
                <iframe
                  src={embedSrc}
                  title={active?.title ?? "Video"}
                  className={cx("h-full w-full transition-opacity", iframeReady ? "opacity-100" : "opacity-0")}
                  onLoad={() => setIframeReady(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full w-full place-items-center p-6 text-sm text-white/70">
                  This link can’t be embedded. Use “Open on YouTube”.
                </div>
              )}
            </div>

            {/* bigger, cleaner close target */}
            <button
              onClick={() => {
                setOpen(false);
                setActive(null);
                setIframeReady(false);
              }}
              className={cx(
                "absolute right-3 top-3 rounded-full",
                "bg-black/65 p-2.5 text-white/85 ring-1 ring-white/12 backdrop-blur",
                "hover:bg-black/80 hover:text-white transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              )}
              aria-label="Close"
              type="button"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {active?.href ? (
              <Button variant="secondary" href={active.href} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                Open on YouTube
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setActive(null);
                setIframeReady(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
