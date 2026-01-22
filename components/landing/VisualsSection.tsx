// src/components/landing/VisualsSection.tsx
"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Button,
  IconArrowUpRight,
  IconClose,
  IconPlay,
  Pill,
  SectionHeader,
  cx,
  usePrefersReducedMotion,
} from "./ui";

gsap.registerPlugin(ScrollTrigger);

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
    </defs>
    <rect width="1200" height="675" fill="url(#g)"/>
    <rect width="1200" height="675" fill="url(#r)"/>
    <g opacity=".9">
      <path d="M520 290 L520 385 L615 337.5 Z" fill="rgba(255,255,255,.9)"/>
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

/**
 * ✅ FIX: make media fill *any* aspect-ratio box.
 * Percentage heights don’t reliably resolve inside aspect-ratio containers,
 * so we absolutely-fill the box.
 */
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
      className={cx("absolute inset-0 h-full w-full object-cover", props.className)}
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

function IconExpand(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden="true">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useIsMobile(breakpointPx = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpointPx - 1}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [breakpointPx]);
  return isMobile;
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function WatchOverlay(props: {
  open: boolean;
  item: ResolvedItem | null;
  embedSrc: string | null;
  onClose: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile(1024);

  const [iframeReady, setIframeReady] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useLockBodyScroll(props.open);

  useEffect(() => {
    setIframeReady(false);
  }, [props.item?._key]);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!props.open || !props.item) return null;

  const requestFullscreen = async () => {
    const el = shellRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const anyEl = el as any;
      const req = el.requestFullscreen?.bind(el) || anyEl.webkitRequestFullscreen?.bind(el);
      if (req) await req();
    } catch {
      // ignore
    }
  };

  const showAutoplay: 0 | 1 = !reducedMotion ? 1 : 0;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close"
        onClick={props.onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      <div className={cx("absolute inset-0 flex", isMobile ? "flex-col" : "items-center justify-center p-6")}>
        <div
          className={cx(
            "relative w-full overflow-hidden ring-1 ring-white/10 bg-[#0B0F14]",
            isMobile
              ? "h-full"
              : "max-w-5xl rounded-[28px] shadow-[0_35px_110px_rgba(0,0,0,0.75)]"
          )}
        >
          {/* top bar */}
          <div
            className={cx(
              "relative z-[2] flex items-center justify-between gap-3",
              "px-4 py-3",
              "bg-black/35 ring-1 ring-white/10 backdrop-blur-xl"
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{props.item.title}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/55">
                <span>{props.item.kind}</span>
                <span className="opacity-50">•</span>
                <span>{props.item.year}</span>
                {props.item.tag ? (
                  <>
                    <span className="opacity-50">•</span>
                    <span className="text-white/75">{props.item.tag}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestFullscreen}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs",
                  "bg-white/[0.06] text-white/80 ring-1 ring-white/12",
                  "hover:bg-white/[0.10] hover:text-white transition"
                )}
              >
                <IconExpand className="h-4 w-4" />
                Full screen
              </button>

              <button
                type="button"
                onClick={props.onClose}
                className={cx(
                  "inline-flex items-center justify-center rounded-full p-2",
                  "bg-white/[0.06] text-white/80 ring-1 ring-white/12",
                  "hover:bg-white/[0.10] hover:text-white transition"
                )}
                aria-label="Close"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ✅ FIX: keep the video box 16:9 so the player fills it (no huge dead space) */}
          <div ref={shellRef} className="relative w-full bg-black">
            <div className="relative w-full aspect-video bg-black">
              {/* placeholder while iframe loads */}
              <div className={cx("absolute inset-0 transition-opacity", iframeReady ? "opacity-0" : "opacity-100")}>
                <div className="relative h-full w-full">
                  <SmartThumb
                    candidates={props.item.thumbs}
                    fallback={props.item.fallback}
                    alt={props.item.title}
                    className="opacity-90"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                </div>
              </div>

              {props.embedSrc ? (
                <iframe
                  src={props.embedSrc.replace("autoplay=0", `autoplay=${showAutoplay}`)}
                  title={props.item.title}
                  className={cx(
                    "absolute inset-0 h-full w-full transition-opacity",
                    iframeReady ? "opacity-100" : "opacity-0"
                  )}
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

            {/* bottom actions */}
            <div
              className={cx(
                "relative z-[2] flex flex-wrap items-center gap-2",
                "px-4 py-4",
                "bg-black/35 ring-1 ring-white/10 backdrop-blur-xl",
                isMobile ? "sticky bottom-0" : ""
              )}
            >
              {props.item.href ? (
                <Button
                  variant="secondary"
                  href={props.item.href}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  Open on YouTube
                </Button>
              ) : null}

              <Button variant="ghost" onClick={props.onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const isMobile = useIsMobile(1024);

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
  const upNext = items.filter((_, i) => i !== safeSpotIdx);

  const openPlayer = (item: ResolvedItem) => {
    if (!item?.yt) {
      window.open(item.href, "_blank", "noreferrer");
      return;
    }
    setActive(item);
    setOpen(true);
  };

  useLayoutEffect(() => {
    setHeroPreviewReady(false);
  }, [spotIdx]);

  // spotlight transition (scan + clean punch)
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const media = heroMediaRef.current;
    const scan = heroScanRef.current;
    const glow = heroGlowRef.current;
    if (!media || !scan || !glow) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.set(scan, { opacity: 0, xPercent: -140 });
    tl.to(glow, { opacity: 1, duration: 0.22 }, 0);
    tl.to(media, { scale: 1.02, duration: 0.32 }, 0);
    tl.to(scan, { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.06);
    tl.to(scan, { xPercent: 140, duration: 0.42, ease: "power2.out" }, 0.08);
    tl.to(scan, { opacity: 0, duration: 0.2 }, 0.32);
    tl.to(media, { scale: 1.0, duration: 0.5, ease: "power3.out" }, 0.18);
    tl.to(glow, { opacity: 0.55, duration: 0.6 }, 0.22);

    return () => {
      tl.kill();
    };
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

      if (!hero) return;

      gsap.set(hero, { opacity: 0, y: 24, scale: 1.02, filter: "blur(10px)" });
      gsap.set(railItems, { opacity: 0, x: 18, rotateY: -12, filter: "blur(8px)" });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.to(hero, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75 });
      tl.to({}, { duration: 0.25 });
      tl.to(
        railItems,
        { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.06 },
        "-=0.1"
      );

      ScrollTrigger.create({
        trigger: stage,
        start: "top 78%",
        once: true,
        onEnter: () => tl.play(),
      });

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

    return () => {
      ctx.revert();
    };
  }, [reducedMotion, items.length, cycleMs]);

  const autoplay: 0 | 1 = !reducedMotion && open ? 1 : 0;
  const embedSrc = active?.yt ? buildEmbedSrc(active.yt, autoplay) : null;

  const previewSrc = buildPreviewSrc(spotlight?.yt ?? null);
  const showDesktopPreview = Boolean(previewSrc) && !reducedMotion && !open;

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow={props?.eyebrow ?? "Visuals"}
          title={props?.title ?? "Watch the visuals."}
          desc={props?.desc ?? "Spotlight first — then the queue. Tap to play instantly, or open full screen."}
          right={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" href={channelHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                YouTube
              </Button>
              <Button variant="ghost" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                Videos
              </Button>
              <Button variant="ghost" href={playlistsHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                Playlists
              </Button>
            </div>
          }
        />

        <div ref={stageRef} className="mt-10">
          <div
            className={cx(
              "relative overflow-hidden bg-white/[0.03] ring-1 ring-white/10",
              "shadow-[0_24px_70px_rgba(0,0,0,0.55)]",
              "-mx-5 sm:mx-0",
              "rounded-[26px] sm:rounded-[32px] md:rounded-[36px]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            <div className="relative z-[2] p-3 sm:p-5 md:p-7">
              <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
                {/* HERO */}
                <button
                  type="button"
                  onClick={() => openPlayer(spotlight)}
                  className={cx(
                    "group relative overflow-hidden text-left",
                    "bg-white/[0.035] ring-1 ring-white/12",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    "rounded-[22px] sm:rounded-[26px] md:rounded-[28px]",
                    "lg:col-span-8 lg:h-full"
                  )}
                  data-hero="1"
                >
                  <div className="relative h-full">
                    <div
                      ref={heroMediaRef}
                      className={cx(
                        "relative overflow-hidden bg-black",
                        "aspect-[4/5] sm:aspect-video",
                        "lg:aspect-auto lg:h-full"
                      )}
                    >
                      {/* ✅ SmartThumb now fills perfectly */}
                      <SmartThumb
                        candidates={spotlight.thumbs}
                        fallback={spotlight.fallback}
                        alt={`Yarden — ${spotlight.title}`}
                        priority
                        onSettled={() => ScrollTrigger.refresh()}
                      />

                      {/* desktop premiere preview (muted) */}
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

                      <div
                        ref={heroScanRef}
                        className="pointer-events-none absolute inset-0 opacity-0"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.00) 70%)",
                          mixBlendMode: "screen",
                        }}
                      />
                      <div
                        ref={heroGlowRef}
                        className="pointer-events-none absolute inset-0 opacity-0"
                        style={{
                          background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), rgba(255,255,255,0.00) 60%)",
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-transparent" />

                      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
                        <Pill tone="brand" className="gap-2">
                          <IconPlay className="h-4 w-4" />
                          Watch
                        </Pill>
                        <Pill tone="muted">{spotlight.kind}</Pill>
                        <Pill tone="muted">{spotlight.year}</Pill>
                        {spotlight.tag ? <Pill tone="ghost">{spotlight.tag}</Pill> : null}
                      </div>

                      <div className="pointer-events-none absolute inset-0 grid place-items-center lg:hidden">
                        <div className="rounded-full bg-black/35 p-4 ring-1 ring-white/15 backdrop-blur-xl">
                          <IconPlay className="h-7 w-7 text-white/90" />
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                        <div className="rounded-2xl bg-black/38 px-4 py-3 ring-1 ring-white/12 backdrop-blur-xl">
                          <div className="text-[11px] uppercase tracking-widest text-white/60">@thisisyarden</div>
                          <div className="mt-1 truncate text-[18px] sm:text-[20px] font-semibold text-white">{spotlight.title}</div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                            <span>Tap to play</span>
                            <span className="opacity-50">•</span>
                            <span>Full screen inside</span>
                            <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* RIGHT COLUMN (desktop) */}
                <div className="hidden lg:block lg:col-span-4 lg:h-full">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Next up</div>
                    <div className="text-xs text-white/45">Rotates while in view</div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {upNext.slice(0, 5).map((v, i) => (
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
                          "group flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        <div className="relative h-16 w-24 overflow-hidden rounded-xl ring-1 ring-white/10 bg-black">
                          <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
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

                        <div className="shrink-0 text-white/40 group-hover:text-white/70 transition">
                          <IconArrowUpRight className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE QUEUE */}
              <div className="mt-5 lg:hidden">
                <div className="flex items-end justify-between px-1">
                  <div className="text-sm font-semibold text-white">Next up</div>
                  <div className="text-xs text-white/45">Auto rotation</div>
                </div>

                <div
                  className={cx(
                    "mt-3 flex gap-3 overflow-x-auto pb-2",
                    "snap-x snap-mandatory",
                    "[scrollbar-width:none] [-ms-overflow-style:none]"
                  )}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {upNext.slice(0, 8).map((v) => (
                    <button
                      key={`${v._key}-m`}
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
                        "snap-start shrink-0 w-[78%] sm:w-[58%]",
                        "rounded-2xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden text-left",
                        "hover:bg-white/[0.05] transition"
                      )}
                    >
                      <div className="relative aspect-video bg-black">
                        <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute left-3 top-3">
                          <Pill tone="muted" className="gap-2">
                            <IconPlay className="h-4 w-4" />
                            Queue
                          </Pill>
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
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/55">
                  <span className="text-white/80 font-semibold">{items.length}</span> visuals in rotation.
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Browse all videos
                  </Button>
                  <Button variant="secondary" href={channelHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Open channel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <WatchOverlay
          open={open}
          item={active}
          embedSrc={embedSrc}
          onClose={() => {
            setOpen(false);
            setActive(null);
          }}
        />
      </div>
    </section>
  );
}
