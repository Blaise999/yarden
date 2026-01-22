// src/components/landing/ReleasesSection.tsx
"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Badge,
  Button,
  Card,
  IconArrowUpRight,
  IconSpark,
  Pill,
  SectionHeader,
  cx,
  usePrefersReducedMotion,
} from "./ui";

gsap.registerPlugin(ScrollTrigger);

type PlatformKey =
  | "spotify"
  | "apple"
  | "youtube"
  | "audiomack"
  | "boomplay"
  | "soundcloud"
  | "deezer"
  | "tidal";

export type PlatformLinks = Partial<Record<PlatformKey, string>>;

export type LinkSource = {
  label: string;
  href: string;
};

export type TrackItem = {
  title: string;
  meta?: string; // e.g. "feat. taves"
  duration?: string; // optional "2:53"
};

export type ReleaseItem = {
  title: string;
  subtitle?: string;
  year?: string;

  art: string;

  // artwork credit / source (clickable)
  artSourceLabel?: string;
  artSourceHref?: string;

  // (back-compat)
  artSource?: string;

  // display chips (e.g., "EP", "Afrobeats", "New")
  chips?: string[];

  links: PlatformLinks;
  primary?: PlatformKey;

  fanLink?: string;

  linkSource?: LinkSource;
  platformSources?: Partial<Record<PlatformKey, LinkSource>>;

  // ✅ optional: provide tracklist directly per release (preferred)
  tracklist?: TrackItem[];
  tracklistSource?: LinkSource;

  // optional: override type label ("EP", "Single", "Album")
  format?: string;
};

function filenameFromPath(p: string) {
  const parts = p.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p;
}

const PLATFORM_ORDER: PlatformKey[] = [
  "spotify",
  "apple",
  "youtube",
  "audiomack",
  "boomplay",
  "deezer",
  "soundcloud",
  "tidal",
];

const PLATFORM_LABEL: Record<PlatformKey, string> = {
  spotify: "Spotify",
  apple: "Apple Music",
  youtube: "YouTube Music",
  audiomack: "Audiomack",
  boomplay: "Boomplay",
  soundcloud: "SoundCloud",
  deezer: "Deezer",
  tidal: "TIDAL",
};

function pickPrimaryLink(links: PlatformLinks, primary?: PlatformKey) {
  if (primary && links[primary]) return { key: primary, href: links[primary]! };
  for (const k of PLATFORM_ORDER) if (links[k]) return { key: k, href: links[k]! };
  return null;
}

function normalizeTitleKey(t: string) {
  // "Muse - EP" -> "muse"
  // "The One Who Descends - EP" -> "theonewhodescends"
  return (t || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(ep|album|single|deluxe|edition)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function normalizeSourceLabel(label: string) {
  const raw = (label || "").trim();
  const l = raw.toLowerCase();
  if (!raw) return raw;
  if (l.includes("press kit")) return "Official press kit";
  if (l.includes("assets")) return "Official assets";
  if (l === "cover source") return "Artwork credit";
  return raw;
}

// ✅ Built-in tracklists (used only when your ReleaseItem doesn’t provide tracklist)
const TRACKLIST_DB: Record<
  string,
  { tracks: TrackItem[]; source?: LinkSource }
> = {
  muse: {
    tracks: [
      { title: "Julie" },
      { title: "Joanna" },
      { title: "Ifeoma", meta: "feat. taves" },
      { title: "Soul" },
      { title: "Busy Body" },
      { title: "ME & U", meta: "feat. Mellissa" },
    ],
    source: {
      label: "Muse – EP tracklist",
      href: "https://music.apple.com/ng/album/muse-ep/1837991942",
    },
  },
  theonewhodescends: {
    tracks: [
      { title: "Wait", duration: "2:53" },
      { title: "Divine", duration: "2:49" },
      { title: "Time", duration: "2:22" },
      { title: "So Cold", meta: "feat. Morien & Swayvee", duration: "3:57" },
      { title: "Pressure" },
    ],
    source: {
      label: "The One Who Descends – EP tracklist",
      href: "https://open.spotify.com/album/6y3G0lel5n8pd29aTR41d9",
    },
  },
};

function resolveTracklist(r: ReleaseItem): { tracks: TrackItem[]; source?: LinkSource } | null {
  if (r.tracklist?.length) return { tracks: r.tracklist, source: r.tracklistSource };
  const key = normalizeTitleKey(r.title);
  return TRACKLIST_DB[key] ? { tracks: TRACKLIST_DB[key].tracks, source: TRACKLIST_DB[key].source } : null;
}

function inferFormat(r: ReleaseItem) {
  if (r.format) return r.format;
  const chips = r.chips ?? [];
  const hit = chips.find((c) => /\b(ep|album|single|mixtape)\b/i.test(c));
  if (hit) return hit.toUpperCase() === "EP" ? "EP" : hit;
  // fallback: if it has multiple platform links, keep it neutral
  return undefined;
}

function availabilityLine(r: ReleaseItem) {
  const platformCount = PLATFORM_ORDER.filter((k) => !!r.links[k]).length;
  const hasSmart = !!r.fanLink;
  const bits: string[] = [];
  if (hasSmart) bits.push("Smart link");
  if (platformCount) bits.push(`${platformCount} platform${platformCount === 1 ? "" : "s"}`);
  return bits.length ? bits.join(" • ") : "Links updating";
}

function PlatformRow(props: {
  fanLink?: string;
  links: PlatformLinks;
  linkSource?: LinkSource;
  platformSources?: Partial<Record<PlatformKey, LinkSource>>;
}) {
  const items = useMemo(() => {
    return PLATFORM_ORDER.filter((k) => !!props.links[k]).map((k) => ({
      key: k,
      label: PLATFORM_LABEL[k],
      href: props.links[k]!,
      src: props.platformSources?.[k],
    }));
  }, [props.links, props.platformSources]);

  return (
    <div className="mt-4">
      {props.fanLink ? (
        <div className="flex flex-col gap-2">
          <Link
            href={props.fanLink}
            target="_blank"
            rel="noreferrer"
            className={cx(
              "group inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm",
              "bg-white/[0.045] ring-1 ring-white/10 backdrop-blur-xl",
              "hover:bg-white/[0.06] transition"
            )}
          >
            <span className="text-white/80">
              Smart link <span className="text-white/45">(all platforms)</span>
            </span>
            <IconArrowUpRight className="h-4 w-4 text-white/70 group-hover:text-white transition" />
          </Link>

          {props.linkSource ? (
            <div className="text-xs text-white/45">
              Source:{" "}
              <Link
                href={props.linkSource.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/65 hover:text-white transition underline underline-offset-4"
              >
                {props.linkSource.label}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {!!items.length ? (
        <div className={cx("mt-3 flex flex-wrap gap-2", !props.fanLink && "mt-0")}>
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className={cx(
                "group inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs",
                "bg-white/[0.04] text-white/80 ring-1 ring-white/10",
                "hover:bg-white/[0.06] hover:text-white transition"
              )}
              title={it.src ? `Source: ${it.src.label}` : undefined}
            >
              <span>{it.label}</span>
              <IconArrowUpRight className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition" />
              {it.src ? <span className="ml-1 text-[10px] text-white/45">src</span> : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TracklistOverlay(props: {
  open: boolean;
  title: string;
  tracks: TrackItem[];
  source?: LinkSource;
  onClose: () => void;
}) {
  if (!props.open) return null;

  return (
    <div className="absolute inset-0 z-[5]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),rgba(255,255,255,0.00)_55%)]" />
      <div className="relative h-full p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-white/60">Tracklist</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">{props.title}</div>
          </div>

          <button
            type="button"
            onClick={props.onClose}
            className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/[0.10] hover:text-white transition"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
          <ol className="max-h-[55vh] overflow-auto px-3 py-2 pr-2 md:max-h-[42vh]">
            {props.tracks.map((t, i) => (
              <li
                key={`${t.title}-${i}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-white/80 hover:bg-white/[0.04] transition"
              >
                <div className="w-7 text-xs tabular-nums text-white/45">{String(i + 1).padStart(2, "0")}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-white">{t.title}</div>
                  {t.meta ? <div className="mt-0.5 truncate text-xs text-white/55">{t.meta}</div> : null}
                </div>
                {t.duration ? <div className="text-xs tabular-nums text-white/45">{t.duration}</div> : null}
              </li>
            ))}
          </ol>
        </div>

        {props.source ? (
          <div className="mt-3 text-xs text-white/45">
            Source:{" "}
            <Link
              href={props.source.href}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white transition underline underline-offset-4"
            >
              {props.source.label}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ReleasesSection(props: {
  id?: string;
  releases: ReleaseItem[];
  onOpenPass: () => void;

  eyebrow?: string;
  title?: string;
  desc?: string;

  thisIsHref?: string;
  youtubeMusicHref?: string;

  initialCount?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const id = props.id ?? "releases";
  const initialCount = props.initialCount ?? 2;

  const [expanded, setExpanded] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevVisibleCount = useRef<number>(initialCount);

  // tracklist “hover” panel (click to open, auto-closes when you scroll away)
  const [openTrackKey, setOpenTrackKey] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (expanded) return props.releases;
    return props.releases.slice(0, initialCount);
  }, [expanded, initialCount, props.releases]);

  // Premium motion pass (wipe reveal + blur + micro parallax + tilt)
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const root = rootRef.current;
      if (!root) return;

      const bg = root.querySelector<HTMLElement>("[data-releases-bg='true']");
      if (bg) {
        gsap.fromTo(
          bg,
          { y: 18, opacity: 0.9 },
          {
            y: -18,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }

      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-release-card='true']"));

      ScrollTrigger.batch(cards, {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            {
              y: 26,
              opacity: 0,
              filter: "blur(12px)",
              clipPath: "inset(14% 10% 18% 10% round 26px)",
            },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              clipPath: "inset(0% 0% 0% 0% round 26px)",
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }
          );

          batch.forEach((el: any, i: number) => {
            const cover = (el as HTMLElement).querySelector<HTMLElement>("[data-release-cover='true']");
            if (!cover) return;
            gsap.fromTo(cover, { scale: 1.07 }, { scale: 1, duration: 0.9, ease: "power3.out", delay: i * 0.04 });
          });
        },
      });

      // Parallax cover + hover tilt/glow
      cards.forEach((card) => {
        const cover = card.querySelector<HTMLElement>("[data-release-cover='true']");
        const shine = card.querySelector<HTMLElement>("[data-release-shine='true']");
        const glow = card.querySelector<HTMLElement>("[data-release-glow='true']");

        if (cover) {
          gsap.fromTo(
            cover,
            { y: 10 },
            {
              y: -10,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }

        const setRX = gsap.quickTo(card, "rotateX", { duration: 0.35, ease: "power3.out" });
        const setRY = gsap.quickTo(card, "rotateY", { duration: 0.35, ease: "power3.out" });
        const setS = gsap.quickTo(card, "scale", { duration: 0.35, ease: "power3.out" });

        const setGlowX = glow ? gsap.quickTo(glow, "x", { duration: 0.25, ease: "power3.out" }) : null;
        const setGlowY = glow ? gsap.quickTo(glow, "y", { duration: 0.25, ease: "power3.out" }) : null;
        const setShine = shine ? gsap.quickTo(shine, "opacity", { duration: 0.25, ease: "power2.out" }) : null;

        function onMove(e: PointerEvent) {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;

          setRY(px * 6);
          setRX(-py * 6);

          if (setGlowX && setGlowY) {
            setGlowX(px * 26);
            setGlowY(py * 26);
          }
        }

        function onEnter() {
          setS(1.01);
          setShine?.(1);
          card.style.willChange = "transform";
        }

        function onLeave() {
          setS(1);
          setRX(0);
          setRY(0);
          setShine?.(0);
          if (setGlowX && setGlowY) {
            setGlowX(0);
            setGlowY(0);
          }
          card.style.willChange = "auto";
        }

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", onLeave);

        (card as any).__cleanup = () => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", onLeave);
        };
      });
    }, rootRef);

    return () => {
      const root = rootRef.current;
      if (root) {
        const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-release-card='true']"));
        cards.forEach((c) => (c as any).__cleanup?.());
      }
      ctx.revert();
    };
  }, [reducedMotion]);

  // Animate ONLY newly revealed cards when you expand
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-release-card='true']"));
    const prev = prevVisibleCount.current;
    const next = visible.length;

    if (next > prev) {
      const newly = cards.slice(prev, next);
      gsap.fromTo(
        newly,
        {
          y: 20,
          opacity: 0,
          filter: "blur(10px)",
          clipPath: "inset(12% 10% 16% 10% round 24px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.06,
        }
      );
    }

    prevVisibleCount.current = next;
  }, [visible.length, reducedMotion]);

  // ✅ Auto-close tracklist when you scroll past the card (down or up)
  useLayoutEffect(() => {
    if (reducedMotion) return;

    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-release-card='true']"));
    const triggers: ScrollTrigger[] = [];

    cards.forEach((card) => {
      const key = card.getAttribute("data-release-key") || "";
      if (!key) return;

      const t = ScrollTrigger.create({
        trigger: card,
        start: "top 15%",
        end: "bottom 15%",
        onLeave: () => setOpenTrackKey((cur) => (cur === key ? null : cur)),
        onLeaveBack: () => setOpenTrackKey((cur) => (cur === key ? null : cur)),
      });

      triggers.push(t);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [visible.length, reducedMotion]);

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(circle at 12% 35%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(circle at 88% 60%, rgba(255,255,255,0.05), transparent 55%)",
          }}
        />
      </div>

      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <div data-releases-bg="true" className="pointer-events-none absolute inset-0 -z-10 opacity-90" />

        <SectionHeader
          eyebrow={props.eyebrow ?? "Music"}
          title={props.title ?? "Releases"}
          desc={props.desc ?? "Curated drops with direct links across platforms — from the latest to the full archive."}
          right={
            <div className="flex flex-wrap gap-2">
              {props.thisIsHref ? (
                <Button
                  variant="secondary"
                  href={props.thisIsHref}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  This Is Yarden
                </Button>
              ) : null}
              {props.youtubeMusicHref ? (
                <Button
                  variant="ghost"
                  href={props.youtubeMusicHref}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  YouTube Music
                </Button>
              ) : null}
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {visible.map((r, idx) => {
            const primary = pickPrimaryLink(r.links, r.primary);
            const format = inferFormat(r);

            const coverLabelRaw =
              r.artSourceLabel ||
              r.artSource ||
              `Asset: ${filenameFromPath(r.art)}`;

            const coverLabel = normalizeSourceLabel(coverLabelRaw);
            const coverHref = r.artSourceHref;

            const trackResolved = resolveTracklist(r);
            const cardKey = normalizeTitleKey(`${r.title}-${idx}`);

            const trackOpen = openTrackKey === cardKey;

            return (
              <Card
                key={`${r.title}-${idx}`}
                className={cx(
                  "overflow-hidden",
                  "ring-1 ring-white/10 bg-white/[0.03]",
                  "shadow-[0_30px_90px_rgba(0,0,0,0.65)]",
                  "will-change-transform [transform-style:preserve-3d]"
                )}
                data-release-card="true"
                data-release-key={cardKey}
              >
                <div className="grid md:grid-cols-[.92fr_1.08fr]">
                  {/* Cover */}
                  <div className="relative">
                    <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
                      <div data-release-cover="true" className="absolute inset-0">
                        <Image
                          src={r.art}
                          alt={`${r.title} cover`}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="object-cover"
                          priority={idx < 2}
                        />
                      </div>

                      {/* cinematic overlays (light touch – keeps the artwork visible) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                      <div
                        data-release-shine="true"
                        className="pointer-events-none absolute inset-0 opacity-0"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.00) 55%)",
                        }}
                      />
                      <div
                        data-release-glow="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.35]"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,255,255,0.20), rgba(255,255,255,0.0) 70%)",
                          filter: "blur(10px)",
                        }}
                      />

                      {/* top meta */}
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        {r.year ? <Pill tone="muted">{r.year}</Pill> : null}
                        {format ? <Pill tone="ghost">{format}</Pill> : null}
                        {r.chips?.includes("New") ? <Pill tone="brand">New</Pill> : null}
                      </div>

                      {/* tracklist control (desktop hover, mobile always visible) */}
                      {trackResolved?.tracks?.length ? (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">
                                {r.title}
                              </div>
                              {r.subtitle ? <div className="truncate text-xs text-white/60">{r.subtitle}</div> : null}
                            </div>

                            <button
                              type="button"
                              onClick={() => setOpenTrackKey((cur) => (cur === cardKey ? null : cardKey))}
                              className={cx(
                                "shrink-0 rounded-full px-3 py-2 text-xs ring-1 transition",
                                "bg-black/35 text-white/85 ring-white/12 backdrop-blur-xl",
                                "hover:bg-black/50 hover:text-white"
                              )}
                            >
                              {trackOpen ? "Hide tracks" : "View tracks"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="rounded-2xl bg-black/20 px-3 py-2 ring-1 ring-white/10 backdrop-blur-xl">
                            <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                            {r.subtitle ? <div className="truncate text-xs text-white/60">{r.subtitle}</div> : null}
                          </div>
                        </div>
                      )}

                      {/* tracklist overlay */}
                      {trackResolved?.tracks?.length ? (
                        <TracklistOverlay
                          open={trackOpen}
                          title={r.title}
                          tracks={trackResolved.tracks}
                          source={trackResolved.source}
                          onClose={() => setOpenTrackKey(null)}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Copy + Links */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {(r.chips ?? []).filter((c) => c !== "New").slice(0, 4).map((c) => (
                        <Badge key={c}>{c}</Badge>
                      ))}
                    </div>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{r.title}</h3>
                    {r.subtitle ? <p className="mt-1 text-sm text-white/60">{r.subtitle}</p> : null}

                    {/* Availability + artwork credit (moved here so the cover stays clean) */}
                    <div className="mt-4 grid gap-2 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/55">Availability</div>
                        <div className="text-xs text-white/70">{availabilityLine(r)}</div>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/55">Artwork</div>
                        <div className="min-w-0 text-right text-xs text-white/70">
                          {coverHref ? (
                            <Link
                              href={coverHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 hover:text-white transition underline underline-offset-4"
                              title={coverLabel}
                            >
                              <span className="line-clamp-1">{coverLabel}</span>
                              <IconArrowUpRight className="h-3.5 w-3.5 opacity-80" />
                            </Link>
                          ) : (
                            <span className="line-clamp-1">{coverLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        href={primary?.href ?? "#"}
                        target="_blank"
                        iconRight={<IconArrowUpRight className="h-4 w-4" />}
                        disabled={!primary?.href}
                      >
                        {primary ? `Open on ${PLATFORM_LABEL[primary.key]}` : "Coming soon"}
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={props.onOpenPass}
                        iconLeft={<IconSpark className="h-4 w-4" />}
                      >
                        Join the Pass
                      </Button>
                    </div>

                    <PlatformRow
                      fanLink={r.fanLink}
                      links={r.links}
                      linkSource={r.linkSource}
                      platformSources={r.platformSources}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* “See more tier” */}
        {props.releases.length > initialCount ? (
          <div className="mt-8">
            <Card className="relative overflow-hidden ring-1 ring-white/10 bg-white/[0.03]">
              <div className="absolute inset-0 opacity-[0.22]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(255,255,255,0.10),transparent_55%)]" />
              </div>

              <div className="relative flex flex-col gap-4 p-7 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone="muted">Catalog</Pill>
                    <Pill tone="ghost">{expanded ? "Full view" : "Expand"}</Pill>
                  </div>

                  <div className="mt-3 text-lg font-semibold text-white">
                    {expanded ? "Full catalog loaded." : "Explore more releases."}
                  </div>

                  <div className="mt-1 text-sm text-white/60">
                    {expanded
                      ? "Collapse to return to the highlights."
                      : "Same layout, same direct links — just more records."}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={expanded ? "secondary" : "primary"}
                    onClick={() => setExpanded((v) => !v)}
                    iconRight={<IconArrowUpRight className="h-4 w-4" />}
                  >
                    {expanded ? "Show less" : "See more"}
                  </Button>

                  <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-4 w-4" />}>
                    Get the Pass
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
}
