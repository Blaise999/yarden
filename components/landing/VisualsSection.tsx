// src/components/landing/VisualsSection.tsx
"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Badge,
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
    </defs>
    <rect width="1200" height="675" fill="url(#g)"/>
    <rect width="1200" height="675" fill="url(#r)"/>
    <g opacity=".85">
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

function isIOSLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = /Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1;
  return iOS || iPadOS;
}

function toYouTubeWatchUrl(item: { href: string; yt: YTTarget | null }) {
  if (item.yt?.kind === "video") return `https://www.youtube.com/watch?v=${item.yt.id}&autoplay=1`;
  if (item.yt?.kind === "playlist") return `https://www.youtube.com/playlist?list=${item.yt.id}`;
  return item.href;
}

function buildEmbedSrc(t: YTTarget, autoplay: 0 | 1) {
  // ✅ include fs=1 for fullscreen UI
  if (t.kind === "video") {
    return `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=${autoplay}&playsinline=1&rel=0&modestbranding=1&fs=1`;
  }
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${t.id}&autoplay=${autoplay}&playsinline=1&rel=0&modestbranding=1&fs=1`;
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

function useIsMobile(max = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`);
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, [max]);
  return isMobile;
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [locked]);
}

function IconExpand(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M9 4H5a1 1 0 0 0-1 1v4m0 6v4a1 1 0 0 0 1 1h4m6-16h4a1 1 0 0 1 1 1v4m0 6v4a1 1 0 0 1-1 1h-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmartThumb(props: {
  candidates: string[];
  fallback: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onSettled?: () => void;
  fit?: "cover" | "contain";
}) {
  const [idx, setIdx] = useState(0);
  const src = props.candidates[idx] ?? props.fallback;
  const fit = props.fit ?? "cover";

  return (
    <img
      src={src}
      alt={props.alt}
      className={cx(
        "h-full w-full",
        fit === "contain" ? "object-contain bg-black" : "object-cover",
        props.className
      )}
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

/**
 * ✅ Mobile “fit everything” hero thumb:
 * - background = blurred cover (fills the box)
 * - foreground = contain (shows full thumbnail, no crop)
 */
function SmartThumbFitStack(props: {
  candidates: string[];
  fallback: string;
  alt: string;
  priority?: boolean;
  onSettled?: () => void;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 scale-[1.08] blur-[18px] opacity-[0.55]">
        <SmartThumb
          candidates={props.candidates}
          fallback={props.fallback}
          alt={props.alt}
          priority={props.priority}
          fit="cover"
        />
      </div>
      <div className="absolute inset-0">
        <SmartThumb
          candidates={props.candidates}
          fallback={props.fallback}
          alt={props.alt}
          priority={props.priority}
          fit="contain"
          onSettled={props.onSettled}
        />
      </div>
    </div>
  );
}

type ResolvedItem = VisualItem & {
  _key: string;
  thumbs: string[];
  yt: YTTarget | null;
  fallback: string;
};

function WatchOverlay(props: {
  open: boolean;
  item: ResolvedItem | null;
  embedSrc: string | null;
  onClose: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile(1024);

  const [iframeReady, setIframeReady] = useState(false);
  const [showFsHint, setShowFsHint] = useState(true);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useLockBodyScroll(props.open);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  useEffect(() => {
    setIframeReady(false);
    setShowFsHint(true);
  }, [props.item?._key]);

  // fade hint after a moment
  useEffect(() => {
    if (!props.open || !isMobile) return;
    const t = window.setTimeout(() => setShowFsHint(false), 2600);
    return () => window.clearTimeout(t);
  }, [props.open, isMobile]);

  const enterFullscreen = async () => {
    if (!props.item) return;

    // iOS: reliable fullscreen is the YouTube watch page
    if (isIOSLike()) {
      window.open(toYouTubeWatchUrl(props.item), "_blank", "noreferrer");
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      const target: any = iframeRef.current || shellRef.current;
      if (!target) return;

      const req =
        target.requestFullscreen?.bind(target) ||
        target.webkitRequestFullscreen?.bind(target) ||
        target.mozRequestFullScreen?.bind(target) ||
        target.msRequestFullscreen?.bind(target);

      if (req) {
        await req();
        setShowFsHint(false);
        return;
      }

      window.open(toYouTubeWatchUrl(props.item), "_blank", "noreferrer");
    } catch {
      window.open(toYouTubeWatchUrl(props.item), "_blank", "noreferrer");
    }
  };

  if (!props.open || !props.item) return null;

  const autoplay: 0 | 1 = reducedMotion ? 0 : 1;

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
            isMobile ? "h-full" : "max-w-5xl rounded-[28px] shadow-[0_35px_110px_rgba(0,0,0,0.75)]"
          )}
        >
          {/* top bar */}
          <div className="relative z-[2] flex items-center justify-between gap-3 px-4 py-3 bg-black/35 ring-1 ring-white/10 backdrop-blur-xl">
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
                onClick={enterFullscreen}
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

          {/* video */}
          <div ref={shellRef} className={cx("relative w-full bg-black", isMobile ? "flex-1" : "")}>
            <div className={cx("relative w-full", isMobile ? "h-full" : "aspect-video")}>
              <div className={cx("absolute inset-0 transition-opacity", iframeReady ? "opacity-0" : "opacity-100")}>
                <SmartThumbFitStack candidates={props.item.thumbs} fallback={props.item.fallback} alt={props.item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              </div>

              {props.embedSrc ? (
                <iframe
                  ref={iframeRef}
                  src={
                    props.embedSrc.includes("?")
                      ? `${props.embedSrc}&autoplay=${autoplay}`
                      : `${props.embedSrc}?autoplay=${autoplay}`
                  }
                  title={props.item.title}
                  className={cx("absolute inset-0 h-full w-full transition-opacity", iframeReady ? "opacity-100" : "opacity-0")}
                  onLoad={() => setIframeReady(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full w-full place-items-center p-6 text-sm text-white/70">
                  This link can’t be embedded. Use “Open on YouTube”.
                </div>
              )}

              {/* subtle “ask for fullscreen” on mobile */}
              {isMobile && showFsHint ? (
                <div className="pointer-events-none absolute left-4 right-4 bottom-4">
                  <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs text-white/85 ring-1 ring-white/12 backdrop-blur-xl">
                    <span>Best view:</span>
                    <button
                      type="button"
                      onClick={enterFullscreen}
                      className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs text-white ring-1 ring-white/12 hover:bg-white/[0.12] transition"
                    >
                      <IconExpand className="h-4 w-4" />
                      Full screen
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* bottom actions (mobile sticky) */}
            <div
              className={cx(
                "relative z-[2] flex flex-wrap items-center gap-2 px-4 py-4",
                "bg-black/35 ring-1 ring-white/10 backdrop-blur-xl",
                isMobile ? "sticky bottom-0" : ""
              )}
            >
              <Button
                variant="secondary"
                href={toYouTubeWatchUrl(props.item)}
                target="_blank"
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
              >
                Open on YouTube
              </Button>

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

  // how often spotlight auto-switches (ms)
  cycleMs?: number;

  // limit how many items to show total
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

  const pauseAutoRef = useRef<(() => void) | null>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

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
    // ✅ iOS fullscreen reliability: open YouTube directly
    if (isMobile && isIOSLike()) {
      window.open(toYouTubeWatchUrl(item), "_blank", "noreferrer");
      return;
    }

    if (!item?.yt) {
      window.open(item.href, "_blank", "noreferrer");
      return;
    }

    setActive(item);
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
    tl.to(glow, { opacity: 1, duration: 0.22 }, 0);
    tl.to(media, { scale: 1.015, duration: 0.32 }, 0);
    tl.to(scan, { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.06);
    tl.to(scan, { xPercent: 140, duration: 0.42, ease: "power2.out" }, 0.08);
    tl.to(scan, { opacity: 0, duration: 0.2 }, 0.32);
    tl.to(media, { scale: 1.0, duration: 0.5, ease: "power3.out" }, 0.18);
    tl.to(glow, { opacity: 0.55, duration: 0.6 }, 0.22);

    return () => {
      tl.kill();
    };
  }, [spotIdx, reducedMotion]);

  // enter reveal + auto-cycle while in view (✅ TS-safe: no return inside gsap.context callback)
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    const hero = stage.querySelector<HTMLElement>("[data-hero='1']");
    const railItems = Array.from(stage.querySelectorAll<HTMLElement>("[data-rail-item='1']"));

    if (!hero) return;

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

    gsap.set(hero, { opacity: 0, y: 24, scale: 1.02, filter: "blur(10px)" });
    gsap.set(railItems, { opacity: 0, y: 14, filter: "blur(8px)" });

    tl.to(hero, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75 });
    tl.to({}, { duration: 0.25 });
    tl.to(railItems, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.06 }, "-=0.05");

    const reveal = ScrollTrigger.create({
      trigger: stage,
      start: "top 78%",
      once: true,
      onEnter: () => tl.play(),
    });

    let timer: number | null = null;
    let userPause: number | null = null;

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        if (openRef.current) return; // don't change while watching
        setSpotIdx((i) => (i + 1) % Math.max(1, items.length));
      }, cycleMs);
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

    const pauseAutoBriefly = () => {
      stop();
      if (userPause) window.clearTimeout(userPause);
      userPause = window.setTimeout(() => {
        if (!reducedMotion && !openRef.current) start();
      }, Math.max(2500, Math.floor(cycleMs * 0.65)));
    };

    pauseAutoRef.current = pauseAutoBriefly;

    return () => {
      pauseAutoRef.current = null;
      stop();
      if (userPause) window.clearTimeout(userPause);
      auto.kill();
      reveal.kill();
      tl.kill();
    };
  }, [reducedMotion, items.length, cycleMs]);

  const autoplay: 0 | 1 = reducedMotion ? 0 : 1;
  const embedSrc = active?.yt ? buildEmbedSrc(active.yt, autoplay) : null;

  const previewSrc = buildPreviewSrc(spotlight?.yt ?? null);
  const showDesktopPreview = Boolean(previewSrc) && !reducedMotion && !open;

  if (!items.length) return null;

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow={props?.eyebrow ?? "Visuals"}
          title={props?.title ?? "Watch the latest. Then let it rotate."}
          desc={props?.desc ?? "Spotlight at the top — queue underneath. Tap any card to play instantly."}
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

        {/* STAGE */}
        <div ref={stageRef} className="mt-10">
          <div
            className={cx(
              "relative overflow-hidden rounded-[34px] bg-white/[0.03] ring-1 ring-white/10",
              "shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />

            {/* ✅ smaller padding on mobile so the hero looks bigger */}
            <div className="relative z-[2] p-4 sm:p-5 md:p-7">
              <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
                {/* HERO */}
                <button
                  type="button"
                  onClick={() => openPlayer(spotlight)}
                  className={cx(
                    "group relative overflow-hidden rounded-[26px] bg-white/[0.035] ring-1 ring-white/12 text-left",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    "lg:col-span-8"
                  )}
                  data-hero="1"
                >
                  <div className="relative h-full">
                    {/* ✅ SQUARE spotlight (good size) */}
                    <div
                      ref={heroMediaRef}
                      className={cx(
                        "relative overflow-hidden bg-black",
                        "aspect-square",
                        // keep it from becoming *too* huge on wide desktops
                        "lg:mx-auto lg:max-w-[640px]"
                      )}
                    >
                      {/* ✅ Mobile: show full thumbnail (contain), Desktop: cover */}
                      {isMobile ? (
                        <SmartThumbFitStack
                          candidates={spotlight.thumbs}
                          fallback={spotlight.fallback}
                          alt={`Yarden — ${spotlight.title}`}
                          priority
                          onSettled={() => (ScrollTrigger as any)?.refresh?.()}
                        />
                      ) : (
                        <SmartThumb
                          candidates={spotlight.thumbs}
                          fallback={spotlight.fallback}
                          alt={`Yarden — ${spotlight.title}`}
                          priority
                          fit="cover"
                          onSettled={() => (ScrollTrigger as any)?.refresh?.()}
                        />
                      )}

                      {/* desktop premiere preview (muted autoplay, fades in over thumb) */}
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

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/18 to-transparent" />

                      {/* top pills */}
                      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                        <Pill tone="brand" className="gap-2">
                          <IconPlay className="h-4 w-4" />
                          Spotlight
                        </Pill>
                        <Pill tone="muted">{spotlight.kind}</Pill>
                        <Pill tone="muted">{spotlight.year}</Pill>
                        {spotlight.tag ? <Pill tone="ghost">{spotlight.tag}</Pill> : null}
                      </div>

                      {/* play affordance */}
                      <div className="absolute right-4 top-4">
                        <div className="rounded-full bg-black/45 px-3 py-2 text-xs text-white/80 ring-1 ring-white/12 backdrop-blur-xl">
                          Tap to watch
                        </div>
                      </div>
                    </div>

                    {/* meta BELOW the square (kept aligned to same width on desktop) */}
                    <div className="px-4 pb-4 pt-4">
                      <div className="lg:mx-auto lg:max-w-[640px]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-[18px] font-semibold text-white">{spotlight.title}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                              <span>{spotlight.kind}</span>
                              <span className="opacity-60">•</span>
                              <span>{spotlight.year}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-xs text-white/80 ring-1 ring-white/10">
                              Watch
                              <IconArrowUpRight className="h-4 w-4 opacity-80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* RIGHT COLUMN (desktop) */}
                <div className="hidden lg:block lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Up next</div>
                    <div className="text-xs text-white/45">Auto-rotates</div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {upNext.slice(0, 4).map((v, i) => (
                      <button
                        key={v._key}
                        type="button"
                        data-rail-item="1"
                        onClick={() => {
                          const idx = items.findIndex((x) => x._key === v._key);
                          if (idx !== -1) {
                            setSpotIdx(idx);
                            pauseAutoRef.current?.();
                          }
                        }}
                        className={cx(
                          "group flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        {/* ✅ square thumb */}
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-white/10 bg-black">
                          <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} fit="cover" />
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

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {items.slice(0, 4).map((v) => (
                      <button
                        key={`${v._key}-mini`}
                        type="button"
                        onClick={() => openPlayer(v)}
                        className={cx(
                          "relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        {/* ✅ square mini tiles */}
                        <div className="relative aspect-square bg-black">
                          <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} fit="cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute left-3 top-3">
                            <Pill tone="muted" className="gap-2">
                              <IconPlay className="h-4 w-4" />
                              Play
                            </Pill>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="truncate text-sm font-semibold text-white">{v.title}</div>
                            <div className="mt-1 text-xs text-white/55">
                              {v.kind} • {v.year}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ✅ MOBILE: Up next becomes horizontal scroll */}
                <div className="lg:hidden">
                  <div className="mt-2 flex items-center justify-between px-1">
                    <div className="text-sm font-semibold text-white">Up next</div>
                    <div className="text-xs text-white/45">On rotation</div>
                  </div>

                  <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                    {upNext.map((v) => (
                      <button
                        key={`${v._key}-m`}
                        type="button"
                        data-rail-item="1"
                        onClick={() => {
                          const idx = items.findIndex((x) => x._key === v._key);
                          if (idx !== -1) {
                            setSpotIdx(idx);
                            pauseAutoRef.current?.();
                          }
                        }}
                        className={cx(
                          "shrink-0 w-[220px] rounded-2xl bg-white/[0.03] ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        {/* ✅ square on mobile too */}
                        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-black">
                          <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} fit="cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute left-3 top-3">{v.tag ? <Badge>{v.tag}</Badge> : <Badge>Next</Badge>}</div>
                        </div>
                        <div className="p-3">
                          <div className="truncate text-sm font-semibold text-white">{v.title}</div>
                          <div className="mt-1 text-xs text-white/55">
                            {v.kind} • {v.year}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" href={videosHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                      Browse videos
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
      </div>

      {/* ✅ Full-screen watch overlay (better than a modal for mobile) */}
      <WatchOverlay
        open={open}
        item={active}
        embedSrc={embedSrc}
        onClose={() => {
          setOpen(false);
          setActive(null);
        }}
      />
    </section>
  );
}
