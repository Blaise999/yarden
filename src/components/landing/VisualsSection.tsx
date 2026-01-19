// src/components/landing/VisualsSection.tsx
"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Badge,
  Button,
  Card,
  IconArrowUpRight,
  IconClose,
  IconPlay,
  Modal,
  Pill,
  SectionHeader,
  cx,
  usePrefersReducedMotion,
} from "@/components/landing/ui";

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

// ✅ Real titles from your exact links (arranged newest-ish first)
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

  // how often spotlight auto-switches (ms)
  cycleMs?: number;

  // ✅ add back: limit how many items to show total
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

  const spotlight = items[Math.min(spotIdx, Math.max(0, items.length - 1))] ?? items[0];
  const upNext = items.filter((_, i) => i !== spotIdx);

  const openPlayer = (item: ResolvedItem) => {
    if (!item?.yt) {
      window.open(item.href, "_blank", "noreferrer");
      return;
    }
    setActive(item);
    setIframeReady(false);
    setOpen(true);
  };

  // spotlight transition (scan + punchy but clean)
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const media = heroMediaRef.current;
    const scan = heroScanRef.current;
    const glow = heroGlowRef.current;
    if (!media || !scan || !glow) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.set(scan, { opacity: 0, xPercent: -140 });
    tl.to(glow, { opacity: 1, duration: 0.25 }, 0);
    tl.to(media, { scale: 1.02, duration: 0.32 }, 0);

    tl.to(scan, { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.06);
    tl.to(scan, { xPercent: 140, duration: 0.42, ease: "power2.out" }, 0.08);
    tl.to(scan, { opacity: 0, duration: 0.2 }, 0.32);

    tl.to(media, { scale: 1.0, duration: 0.5, ease: "power3.out" }, 0.18);
    tl.to(glow, { opacity: 0.55, duration: 0.6 }, 0.22);

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
      const miniCards = Array.from(stage.querySelectorAll<HTMLElement>("[data-mini='1']"));

      if (!hero) return;

      gsap.set(hero, { opacity: 0, y: 24, scale: 1.02, filter: "blur(10px)" });
      gsap.set(railItems, { opacity: 0, x: 18, rotateY: -12, filter: "blur(8px)" });
      gsap.set(miniCards, { opacity: 0, y: 18, filter: "blur(8px)" });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

      // HERO first (spotlight)
      tl.to(hero, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75 });

      // pause beat (so it FEELS like spotlight)
      tl.to({}, { duration: 0.35 });

      // then the “crazy” comes in (rail + minis)
      tl.to(railItems, { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.06 }, "-=0.15");
      tl.to(miniCards, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, stagger: 0.07 }, "-=0.35");

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

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow={props?.eyebrow ?? "Visuals"}
          title={props?.title ?? "One visual. Full spotlight."}
          desc={props?.desc ?? "Starts huge, then the wall comes alive. Click any video to watch inside the site."}
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
              "relative overflow-hidden rounded-[36px] bg-white/[0.03] ring-1 ring-white/10",
              "shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/45" />

            <div className="relative z-[2] p-5 md:p-7">
              <div className="grid gap-6 lg:grid-cols-12">
                {/* HERO */}
                <button
                  type="button"
                  onClick={() => openPlayer(spotlight)}
                  className={cx(
                    "group relative overflow-hidden rounded-[28px] bg-white/[0.035] ring-1 ring-white/12 text-left",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    "lg:col-span-8"
                  )}
                  data-hero="1"
                >
                  <div className="relative">
                    <div ref={heroMediaRef} className="relative aspect-video overflow-hidden">
                      <SmartThumb
                        candidates={spotlight.thumbs}
                        fallback={spotlight.fallback}
                        alt={`Yarden — ${spotlight.title}`}
                        priority
                        onSettled={() => (ScrollTrigger as any)?.refresh?.()}
                      />

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
                          background:
                            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), rgba(255,255,255,0.00) 60%)",
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/22 to-transparent" />

                      <div className="absolute left-5 top-5 flex items-center gap-2">
                        <Pill tone="brand" className="gap-2">
                          <IconPlay className="h-4 w-4" />
                          Spotlight
                        </Pill>
                        <Pill tone="muted">{spotlight.kind}</Pill>
                        <Pill tone="muted">{spotlight.year}</Pill>
                      </div>

                      <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-black/45 p-5 ring-1 ring-white/12 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-widest text-white/60">@thisisyarden</div>
                        <div className="mt-2 text-[20px] md:text-[22px] font-semibold text-white">{spotlight.title}</div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                          <span>Play here</span>
                          <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* UP NEXT */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Up next</div>
                    <div className="text-xs text-white/50">Auto-cycles</div>
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
                            (rootRef.current as any)?.__pauseAuto?.();
                          }
                        }}
                        className={cx(
                          "group flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        <div className="relative h-16 w-24 overflow-hidden rounded-xl ring-1 ring-white/10">
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

                  {/* mini grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {items.slice(0, 4).map((v) => (
                      <button
                        key={`${v._key}-mini`}
                        type="button"
                        data-mini="1"
                        onClick={() => {
                          const idx = items.findIndex((x) => x._key === v._key);
                          if (idx !== -1) {
                            setSpotIdx(idx);
                            (rootRef.current as any)?.__pauseAuto?.();
                          }
                        }}
                        className={cx(
                          "relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 text-left",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        <div className="relative aspect-[16/10]">
                          <SmartThumb candidates={v.thumbs} fallback={v.fallback} alt={`Yarden — ${v.title}`} />
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
              </div>

              {/* info cards */}
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <Card className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Spotlight</Badge>
                    <Badge>Auto-cycle</Badge>
                  </div>
                  <div className="mt-4 text-lg font-semibold">One main visual, on purpose.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    It leads with a hero so the section feels like a premiere, not a random grid.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Clean rail</Badge>
                    <Badge>Up Next</Badge>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Arranged properly.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Real song titles, clear type (video/visualizer), year, and click-to-spotlight.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>No local thumbs</Badge>
                    <Badge>Always works</Badge>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Thumbnails handled.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Pulls maxres/hq from YouTube. If anything fails, it falls back to an inline placeholder.
                  </p>
                </Card>
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
        title={active ? `${active.title} — ${active.kind}` : "Watch"}
      >
        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <div className="aspect-video">
              <div className={cx("absolute inset-0 transition-opacity", iframeReady ? "opacity-0" : "opacity-100")}>
                {active ? (
                  <SmartThumb candidates={active.thumbs} fallback={active.fallback} alt={active.title} className="opacity-90" priority />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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

            <button
              onClick={() => {
                setOpen(false);
                setActive(null);
                setIframeReady(false);
              }}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white/80 ring-1 ring-white/10 hover:bg-black/75 hover:text-white"
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
