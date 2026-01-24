// src/components/landing/ReleasesSection.tsx
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
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
  IconClose,
  IconChevron,
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
  const parts = (p || "").split("/").filter(Boolean);
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
const TRACKLIST_DB: Record<string, { tracks: TrackItem[]; source?: LinkSource }> = {
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

function resolveTracklist(
  r: ReleaseItem
): { tracks: TrackItem[]; source?: LinkSource } | null {
  if (r.tracklist?.length) return { tracks: r.tracklist, source: r.tracklistSource };
  const key = normalizeTitleKey(r.title);
  return TRACKLIST_DB[key]
    ? { tracks: TRACKLIST_DB[key].tracks, source: TRACKLIST_DB[key].source }
    : null;
}

function inferFormat(r: ReleaseItem) {
  if (r.format) return r.format;
  const chips = r.chips ?? [];
  const hit = chips.find((c) => /\b(ep|album|single|mixtape)\b/i.test(c));
  if (hit) return hit.toUpperCase() === "EP" ? "EP" : hit;
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

function parseYear(r: ReleaseItem) {
  const y = Number(String(r.year || "").replace(/[^\d]/g, ""));
  return Number.isFinite(y) && y > 1900 ? y : 0;
}

function hasChip(r: ReleaseItem, value: string) {
  const v = value.toLowerCase();
  return (r.chips || []).some((c) => String(c).toLowerCase() === v);
}

function isType(r: ReleaseItem, t: "ep" | "single" | "album") {
  const fmt = String(inferFormat(r) || "").toLowerCase();
  if (!fmt) return false;
  if (t === "ep") return fmt.includes("ep");
  if (t === "single") return fmt.includes("single");
  if (t === "album") return fmt.includes("album");
  return false;
}

function countPlatforms(links: PlatformLinks) {
  return PLATFORM_ORDER.filter((k) => !!links[k]).length;
}

function useLockBody(locked: boolean) {
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

/**
 * Clean “More platforms” dropdown: keeps cards readable.
 */
function MorePlatformsDropdown(props: {
  links: PlatformLinks;
  excludeKey?: PlatformKey;
  platformSources?: Partial<Record<PlatformKey, LinkSource>>;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    return PLATFORM_ORDER.filter((k) => !!props.links[k])
      .filter((k) => (props.excludeKey ? k !== props.excludeKey : true))
      .map((k) => ({
        key: k,
        label: PLATFORM_LABEL[k],
        href: props.links[k]!,
        src: props.platformSources?.[k],
      }));
  }, [props.links, props.excludeKey, props.platformSources]);

  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!items.length) return null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ring-1 transition",
          "bg-white/[0.04] text-white/80 ring-white/10 hover:bg-white/[0.06] hover:text-white"
        )}
      >
        More platforms
        <span className="text-[10px] text-white/45">({items.length})</span>
      </button>

      {open ? (
        <div
          ref={popRef}
          className={cx(
            "absolute right-0 z-[30] mt-2 w-[240px] overflow-hidden rounded-2xl",
            "bg-black/70 backdrop-blur-2xl ring-1 ring-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
          )}
        >
          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
            Platforms
          </div>
          <div className="h-px bg-white/10" />
          <div className="max-h-[260px] overflow-auto p-2">
            {items.map((it) => (
              <Link
                key={it.key}
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  "group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
                  "text-white/80 hover:bg-white/[0.06] hover:text-white transition"
                )}
                title={it.src ? `Source: ${it.src.label}` : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="truncate">{it.label}</span>
                <span className="inline-flex items-center gap-2">
                  {it.src ? <span className="text-[10px] text-white/45">src</span> : null}
                  <IconArrowUpRight className="h-4 w-4 opacity-80 group-hover:opacity-100 transition" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatChip(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/10">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">{props.label}</div>
      <div className="mt-0.5 text-sm font-semibold text-white/85">{props.value}</div>
    </div>
  );
}

/**
 * 🔥 Upgraded “Details Sheet”
 * - Has a visible chevron-down control (mobile)
 * - Has a proper X icon button
 * - Smooth open/close animation
 * - Sticky bottom action bar (Listen / Smart / Pass)
 * - Cleaner layout hierarchy + stats row + verified sources
 */
function ReleaseDetailsSheet(props: {
  open: boolean;
  release: ReleaseItem | null;
  onClose: () => void;
  onOpenPass: () => void;
}) {
  const r = props.release;

  // mount/animate (so you get a real slide-in + fade and not a hard pop)
  const [present, setPresent] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (props.open) {
      setPresent(true);
      // next frame -> activate transitions
      const t = window.setTimeout(() => setActive(true), 10);
      return () => window.clearTimeout(t);
    } else {
      setActive(false);
      const t = window.setTimeout(() => setPresent(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [props.open]);

  useLockBody(props.open);

  useEffect(() => {
    if (!props.open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") props.onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!present || !r) return null;

  const trackResolved = resolveTracklist(r);
  const primary = pickPrimaryLink(r.links, r.primary);
  const format = inferFormat(r);

  const coverLabelRaw = r.artSourceLabel || r.artSource || `Asset: ${filenameFromPath(r.art)}`;
  const coverLabel = normalizeSourceLabel(coverLabelRaw);
  const coverHref = r.artSourceHref;

  const platformItems = PLATFORM_ORDER.filter((k) => !!r.links[k]).map((k) => ({
    key: k,
    label: PLATFORM_LABEL[k],
    href: r.links[k]!,
    src: r.platformSources?.[k],
  }));

  const platformCount = countPlatforms(r.links);
  const trackCount = trackResolved?.tracks?.length ?? 0;
  const verifiedTracklist = !!trackResolved?.source;
  const verifiedLinks = !!r.linkSource;

  function stop(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className={cx(
        "fixed inset-0 z-[90] transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`${r.title} details`}
      onMouseDown={(e) => {
        // clicking anywhere outside panel closes
        props.onClose();
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* panel */}
      <div
        onMouseDown={stop}
        className={cx(
          "absolute left-0 right-0 mx-auto w-full",
          // Mobile bottom sheet
          "bottom-0 rounded-t-[28px] border-t border-white/10 bg-black/70 backdrop-blur-2xl",
          // Desktop drawer
          "md:bottom-0 md:right-0 md:left-auto md:top-0 md:h-full md:w-[480px] md:rounded-none md:border-l md:border-t-0",
          // transition
          "transition-transform duration-200 will-change-transform",
          active
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-6 md:translate-y-0 md:translate-x-6"
        )}
      >
        {/* Top glow + texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.75]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_30%)]" />
        </div>

        {/* Header */}
        <div className="relative">
          {/* grab handle + chevron down (mobile) */}
          <div className="mx-auto pt-3 md:hidden">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-white/15" />
            <button
              type="button"
              onClick={props.onClose}
              className="mx-auto mt-2 flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/[0.10] hover:text-white transition"
              aria-label="Close"
            >
              <IconChevron className="h-4 w-4 rotate-180 opacity-90" />
              <span>Swipe down</span>
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-4 md:px-6 md:pt-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {r.year ? <Pill tone="muted">{r.year}</Pill> : null}
                {format ? <Pill tone="ghost">{format}</Pill> : null}
                {hasChip(r, "New") ? <Pill tone="brand">New</Pill> : null}
                {verifiedTracklist ? <Pill tone="ghost">Tracklist verified</Pill> : null}
                {verifiedLinks ? <Pill tone="ghost">Links sourced</Pill> : null}
              </div>

              <div className="mt-3 truncate text-xl font-semibold text-white">{r.title}</div>
              {r.subtitle ? (
                <div className="mt-1 line-clamp-2 text-sm text-white/60">{r.subtitle}</div>
              ) : null}
            </div>

            {/* X icon */}
            <button
              type="button"
              onClick={props.onClose}
              className={cx(
                "shrink-0 rounded-full bg-white/[0.06] p-2 ring-1 ring-white/10 transition",
                "hover:bg-white/[0.10] hover:text-white text-white/85"
              )}
              aria-label="Close details"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-5 pb-24 md:px-6 md:pb-28">
          {/* cover + meta block */}
          <div className="grid gap-4 md:grid-cols-[140px_1fr] md:items-start">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
              <div className="relative aspect-square">
                <Image src={r.art} alt={`${r.title} cover`} fill sizes="200px" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div
                className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full opacity-[0.22]"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.0) 70%)",
                  filter: "blur(12px)",
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                {(r.chips ?? []).slice(0, 8).map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>

              {/* stats row */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatChip label="Platforms" value={String(platformCount)} />
                <StatChip label="Tracks" value={trackCount ? String(trackCount) : "—"} />
                <StatChip label="Smart link" value={r.fanLink ? "Yes" : "No"} />
              </div>

              {/* credits */}
              <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.22em] text-white/55">Credits</div>

                <div className="mt-2 text-xs text-white/70">
                  Artwork:{" "}
                  {coverHref ? (
                    <Link
                      href={coverHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/85 hover:text-white transition underline underline-offset-4"
                    >
                      {coverLabel}
                    </Link>
                  ) : (
                    <span className="text-white/85">{coverLabel}</span>
                  )}
                </div>

                {r.linkSource ? (
                  <div className="mt-2 text-xs text-white/70">
                    Links source:{" "}
                    <Link
                      href={r.linkSource.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/85 hover:text-white transition underline underline-offset-4"
                    >
                      {r.linkSource.label}
                    </Link>
                  </div>
                ) : null}

                {trackResolved?.source ? (
                  <div className="mt-2 text-xs text-white/70">
                    Tracklist source:{" "}
                    <Link
                      href={trackResolved.source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/85 hover:text-white transition underline underline-offset-4"
                    >
                      {trackResolved.source.label}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* tracklist */}
          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/55">Tracklist</div>
                <div className="mt-1 text-sm text-white/70">
                  {trackResolved?.tracks?.length
                    ? `${trackResolved.tracks.length} track${trackResolved.tracks.length === 1 ? "" : "s"}`
                    : "Tracklist not available yet"}
                </div>
              </div>

              {trackResolved?.tracks?.length ? (
                <Pill tone="ghost">Scroll</Pill>
              ) : null}
            </div>

            {trackResolved?.tracks?.length ? (
              <div className="mt-3 rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
                <ol className="max-h-[38vh] overflow-auto px-3 py-2 pr-2 md:max-h-[44vh]">
                  {trackResolved.tracks.map((t, i) => (
                    <li
                      key={`${t.title}-${i}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-white/80 hover:bg-white/[0.04] transition"
                    >
                      <div className="w-7 text-xs tabular-nums text-white/45">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-white">{t.title}</div>
                        {t.meta ? <div className="mt-0.5 truncate text-xs text-white/55">{t.meta}</div> : null}
                      </div>
                      {t.duration ? <div className="text-xs tabular-nums text-white/45">{t.duration}</div> : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/10">
                <div className="text-sm text-white/60">
                  Add a <span className="text-white/85">tracklist</span> to the release item (or it will fall back to the
                  internal DB when available).
                </div>
              </div>
            )}
          </div>

          {/* all platforms */}
          {platformItems.length ? (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.22em] text-white/55">All platforms</div>

              <div className="mt-3 grid gap-2">
                {platformItems.map((it) => (
                  <Link
                    key={it.key}
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cx(
                      "group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm",
                      "bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06] transition"
                    )}
                    title={it.src ? `Source: ${it.src.label}` : undefined}
                  >
                    <span className="text-white/85">{it.label}</span>
                    <span className="inline-flex items-center gap-2">
                      {it.src ? <span className="text-[10px] text-white/45">src</span> : null}
                      <IconArrowUpRight className="h-4 w-4 text-white/70 group-hover:text-white transition" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sticky action bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/55 backdrop-blur-2xl">
          <div className="px-5 py-4 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                href={primary?.href ?? "#"}
                target="_blank"
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
                disabled={!primary?.href}
              >
                {primary ? `Listen (${PLATFORM_LABEL[primary.key]})` : "Coming soon"}
              </Button>

              {r.fanLink ? (
                <Button
                  variant="secondary"
                  href={r.fanLink}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  Smart link
                </Button>
              ) : null}

              <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-4 w-4" />}>
                Join the Pass
              </Button>

              <button
                type="button"
                onClick={props.onClose}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2 text-xs text-white/75 ring-1 ring-white/10 hover:bg-white/[0.06] hover:text-white transition"
              >
                <IconChevron className="h-4 w-4 rotate-180 opacity-90" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type FilterKey = "all" | "ep" | "single" | "album";
type SortKey = "newest" | "oldest";

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
  const initialCount = props.initialCount ?? 4;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevVisibleCount = useRef<number>(initialCount);

  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [openDetailsKey, setOpenDetailsKey] = useState<string | null>(null);

  const baseList = props.releases ?? [];

  const filteredSorted = useMemo(() => {
    let list = [...baseList];

    if (filter !== "all") {
      list = list.filter((r) => isType(r, filter));
    }

    list.sort((a, b) => {
      const ay = parseYear(a);
      const by = parseYear(b);

      if (sort === "newest") {
        if (hasChip(b, "New") && !hasChip(a, "New")) return 1;
        if (hasChip(a, "New") && !hasChip(b, "New")) return -1;
        return by - ay || normalizeTitleKey(b.title).localeCompare(normalizeTitleKey(a.title));
      } else {
        return ay - by || normalizeTitleKey(a.title).localeCompare(normalizeTitleKey(b.title));
      }
    });

    if (sort === "newest") {
      const idx = list.findIndex((r) => hasChip(r, "New"));
      if (idx > 0) {
        const [hit] = list.splice(idx, 1);
        list.unshift(hit);
      }
    }

    return list;
  }, [baseList, filter, sort]);

  const featured = filteredSorted[0] ?? null;
  const featuredKey = featured ? normalizeTitleKey(`featured-${featured.title}`) : null;

  const catalog = useMemo(() => {
    const rest = featured ? filteredSorted.slice(1) : filteredSorted;
    if (expanded) return rest;
    return rest.slice(0, initialCount);
  }, [featured, filteredSorted, expanded, initialCount]);

  // robust lookup map so details always resolve
  const keyToRelease = useMemo(() => {
    const map = new Map<string, ReleaseItem>();
    if (featured && featuredKey) map.set(featuredKey, featured);
    filteredSorted.forEach((r, i) => {
      map.set(normalizeTitleKey(`${r.title}-${i}`), r);
      map.set(normalizeTitleKey(r.title), r);
    });
    return map;
  }, [filteredSorted, featured, featuredKey]);

  const activeDetails = useMemo(() => {
    if (!openDetailsKey) return null;
    return keyToRelease.get(openDetailsKey) ?? null;
  }, [openDetailsKey, keyToRelease]);

  const openDetails = useCallback((key: string) => setOpenDetailsKey(key), []);
  const closeDetails = useCallback(() => setOpenDetailsKey(null), []);

  // Premium motion pass: background parallax + reveal animation + hover tilt
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

      const featuredCard = root.querySelector<HTMLElement>("[data-featured-card='true']");
      if (featuredCard) {
        gsap.fromTo(
          featuredCard,
          { y: 24, opacity: 0, filter: "blur(10px)", clipPath: "inset(10% 8% 14% 8% round 28px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: featuredCard, start: "top 80%", once: true },
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
            { y: 22, opacity: 0, filter: "blur(10px)", clipPath: "inset(12% 10% 16% 10% round 26px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              clipPath: "inset(0% 0% 0% 0% round 26px)",
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }
          );
        },
      });

      // Hover tilt (pointer devices)
      const tiltTargets = [
        ...(featuredCard ? [featuredCard] : []),
        ...cards,
      ];

      tiltTargets.forEach((card) => {
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
        const featuredCard = root.querySelector<HTMLElement>("[data-featured-card='true']");
        (featuredCard as any)?.__cleanup?.();
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
    const next = catalog.length;

    if (next > prev) {
      const newly = cards.slice(prev, next);
      gsap.fromTo(
        newly,
        { y: 18, opacity: 0, filter: "blur(8px)", clipPath: "inset(10% 10% 14% 10% round 24px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 0.6, ease: "power3.out", stagger: 0.06 }
      );
    }

    prevVisibleCount.current = next;
  }, [catalog.length, reducedMotion]);

  const renderFilters = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/10">
        {(
          [
            { k: "all", label: "All" },
            { k: "ep", label: "EPs" },
            { k: "single", label: "Singles" },
            { k: "album", label: "Albums" },
          ] as Array<{ k: FilterKey; label: string }>
        ).map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => {
              setFilter(t.k);
              setExpanded(false);
              prevVisibleCount.current = initialCount;
            }}
            className={cx(
              "rounded-full px-3 py-2 text-xs ring-1 transition",
              filter === t.k
                ? "bg-white/[0.08] text-white ring-white/15"
                : "bg-transparent text-white/70 ring-transparent hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Pill tone="ghost">Sort</Pill>

        <div className="flex rounded-full bg-white/[0.03] p-1 ring-1 ring-white/10">
          {(
            [
              { k: "newest", label: "Newest" },
              { k: "oldest", label: "Oldest" },
            ] as Array<{ k: SortKey; label: string }>
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => {
                setSort(t.k);
                setExpanded(false);
                prevVisibleCount.current = initialCount;
              }}
              className={cx(
                "rounded-full px-3 py-2 text-xs transition",
                sort === t.k ? "bg-white/[0.08] text-white" : "text-white/70 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!baseList.length) {
    return (
      <section id={id} className="relative py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeader
            eyebrow={props.eyebrow ?? "Music"}
            title={props.title ?? "Releases"}
            desc={props.desc ?? "Curated drops with direct links across platforms — from the latest to the full archive."}
          />
          <Card className="mt-6 ring-1 ring-white/10 bg-white/[0.03] p-6">
            <div className="text-white/70">No releases yet.</div>
          </Card>
        </div>
      </section>
    );
  }

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
          desc={
            props.desc ??
            "Start with the latest drop, then explore the full catalog — clean links, verified tracklists, and credits."
          }
          right={
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Filters */}
        <div className="mt-6">{renderFilters}</div>

        {/* Featured */}
        {featured ? (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill tone="muted">Featured</Pill>
                <Pill tone="ghost">{sort === "newest" ? "Latest drop" : "Spotlight"}</Pill>
              </div>

              <button
                type="button"
                onClick={() => featuredKey && openDetails(featuredKey)}
                className="text-xs text-white/65 hover:text-white transition underline underline-offset-4"
              >
                View details
              </button>
            </div>

            <Card
              className={cx(
                "overflow-hidden ring-1 ring-white/10 bg-white/[0.03]",
                "shadow-[0_30px_90px_rgba(0,0,0,0.65)]",
                "will-change-transform [transform-style:preserve-3d]"
              )}
              data-featured-card="true"
            >
              <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                {/* cover */}
                <div className="relative">
                  <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
                    <div data-release-cover="true" className="absolute inset-0">
                      <Image
                        src={featured.art}
                        alt={`${featured.title} cover`}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                        priority
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

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
                      className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.32]"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.20), rgba(255,255,255,0.0) 70%)",
                        filter: "blur(12px)",
                      }}
                    />

                    <div className="absolute left-5 top-5 flex items-center gap-2">
                      {featured.year ? <Pill tone="muted">{featured.year}</Pill> : null}
                      {inferFormat(featured) ? <Pill tone="ghost">{inferFormat(featured)}</Pill> : null}
                      {hasChip(featured, "New") ? <Pill tone="brand">New</Pill> : null}
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="max-w-[520px]">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/60">Featured release</div>
                        <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{featured.title}</div>
                        {featured.subtitle ? (
                          <div className="mt-1 text-sm text-white/65">{featured.subtitle}</div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="primary"
                            href={pickPrimaryLink(featured.links, featured.primary)?.href ?? "#"}
                            target="_blank"
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                            disabled={!pickPrimaryLink(featured.links, featured.primary)?.href}
                          >
                            {pickPrimaryLink(featured.links, featured.primary)
                              ? `Open on ${PLATFORM_LABEL[pickPrimaryLink(featured.links, featured.primary)!.key]}`
                              : "Coming soon"}
                          </Button>

                          {featured.fanLink ? (
                            <Button
                              variant="secondary"
                              href={featured.fanLink}
                              target="_blank"
                              iconRight={<IconArrowUpRight className="h-4 w-4" />}
                            >
                              Smart link
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            onClick={() => featuredKey && openDetails(featuredKey)}
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                          >
                            View details
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={props.onOpenPass}
                            iconLeft={<IconSpark className="h-4 w-4" />}
                          >
                            Join the Pass
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* side content */}
                <div className="p-6 md:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    {(featured.chips ?? []).filter((c) => c !== "New").slice(0, 5).map((c) => (
                      <Badge key={c}>{c}</Badge>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-white/55">Availability</div>
                      <div className="text-xs text-white/70">{availabilityLine(featured)}</div>
                    </div>

                    <div className="mt-3 h-px bg-white/10" />

                    {/* Track preview: first 3 */}
                    {resolveTracklist(featured)?.tracks?.length ? (
                      <div className="mt-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/55">Track preview</div>

                        <ol className="mt-2 space-y-2">
                          {resolveTracklist(featured)!.tracks.slice(0, 3).map((t, i) => (
                            <li
                              key={`${t.title}-${i}`}
                              className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2 ring-1 ring-white/10"
                            >
                              <div className="w-6 text-xs tabular-nums text-white/45">
                                {String(i + 1).padStart(2, "0")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm text-white">{t.title}</div>
                                {t.meta ? <div className="mt-0.5 truncate text-xs text-white/55">{t.meta}</div> : null}
                              </div>
                              {t.duration ? <div className="text-xs tabular-nums text-white/45">{t.duration}</div> : null}
                            </li>
                          ))}
                        </ol>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-white/60">
                            {resolveTracklist(featured)!.tracks.length} tracks total
                          </div>
                          <button
                            type="button"
                            onClick={() => featuredKey && openDetails(featuredKey)}
                            className="text-xs text-white/70 hover:text-white transition underline underline-offset-4"
                          >
                            View full tracklist
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-white/60">Tracklist available in details.</div>
                    )}
                  </div>

                  {/* Clean platform dropdown */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <MorePlatformsDropdown
                      links={featured.links}
                      excludeKey={pickPrimaryLink(featured.links, featured.primary)?.key}
                      platformSources={featured.platformSources}
                    />
                    <Pill tone="ghost">Clean links</Pill>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Catalog grid */}
        {catalog.length ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill tone="muted">Catalog</Pill>
                <Pill tone="ghost">{expanded ? "Full view" : "Highlights"}</Pill>
              </div>

              <div className="text-xs text-white/60">
                {expanded
                  ? `${filteredSorted.length - (featured ? 1 : 0)} release${
                      filteredSorted.length - (featured ? 1 : 0) === 1 ? "" : "s"
                    }`
                  : `Showing ${Math.min(initialCount, filteredSorted.length - (featured ? 1 : 0))}`}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {catalog.map((r, idx) => {
                const primary = pickPrimaryLink(r.links, r.primary);
                const format = inferFormat(r);
                const cardKey = normalizeTitleKey(`${r.title}-${idx}`);

                const coverLabelRaw = r.artSourceLabel || r.artSource || `Asset: ${filenameFromPath(r.art)}`;
                const coverLabel = normalizeSourceLabel(coverLabelRaw);
                const coverHref = r.artSourceHref;

                const trackResolved = resolveTracklist(r);

                // Check if this is Muse or The One Who Descends for special yellow gradient
                const titleLower = r.title.toLowerCase();
                const isSpecialRelease = titleLower.includes("muse") || titleLower.includes("the one who descends") || titleLower.includes("towd");

                return (
                  <Card
                    key={`${r.title}-${idx}`}
                    className={cx(
                      "group/card overflow-hidden ring-1 ring-white/10 bg-white/[0.03]",
                      "shadow-[0_30px_90px_rgba(0,0,0,0.65)]",
                      "will-change-transform [transform-style:preserve-3d]",
                      "relative transition-all duration-300",
                      isSpecialRelease && "hover:ring-amber-500/30"
                    )}
                    data-release-card="true"
                  >
                    {/* Yellow/Gold gradient hover overlay for special releases */}
                    {isSpecialRelease && (
                      <div 
                        className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: "radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 35%, transparent 70%)",
                        }}
                      />
                    )}
                    <div className="grid md:grid-cols-[.92fr_1.08fr] relative z-10">
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
                              priority={idx < 2 && !featured}
                            />
                          </div>

                          {/* cinematic overlays */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                          {/* Yellow glow on hover for special releases */}
                          {isSpecialRelease && (
                            <div
                              className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                              style={{
                                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, transparent 50%)",
                              }}
                            />
                          )}

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
                            className={cx(
                              "pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.32]",
                              "group-hover/card:opacity-[0.45] transition-opacity duration-300"
                            )}
                            style={{
                              background: isSpecialRelease
                                ? "radial-gradient(circle, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.0) 70%)"
                                : "radial-gradient(circle, rgba(255,255,255,0.20), rgba(255,255,255,0.0) 70%)",
                              filter: "blur(10px)",
                            }}
                          />

                          {/* top meta */}
                          <div className="absolute left-4 top-4 flex items-center gap-2">
                            {r.year ? <Pill tone="muted">{r.year}</Pill> : null}
                            {format ? <Pill tone="ghost">{format}</Pill> : null}
                            {hasChip(r, "New") ? <Pill tone="brand">New</Pill> : null}
                          </div>

                          {/* title strip */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="rounded-2xl bg-black/20 px-3 py-2 ring-1 ring-white/10 backdrop-blur-xl">
                              <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                              {r.subtitle ? <div className="truncate text-xs text-white/60">{r.subtitle}</div> : null}
                            </div>
                          </div>
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

                        {/* Availability + artwork credit */}
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

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                          <Button
                            variant="primary"
                            href={primary?.href ?? "#"}
                            target="_blank"
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                            disabled={!primary?.href}
                          >
                            {primary ? `Open on ${PLATFORM_LABEL[primary.key]}` : "Coming soon"}
                          </Button>

                          {r.fanLink ? (
                            <Button
                              variant="secondary"
                              href={r.fanLink}
                              target="_blank"
                              iconRight={<IconArrowUpRight className="h-4 w-4" />}
                            >
                              Smart link
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            onClick={() => openDetails(cardKey)}
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                          >
                            {trackResolved?.tracks?.length ? "View tracks" : "View details"}
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={props.onOpenPass}
                            iconLeft={<IconSpark className="h-4 w-4" />}
                          >
                            Join the Pass
                          </Button>

                          <MorePlatformsDropdown links={r.links} excludeKey={primary?.key} platformSources={r.platformSources} />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Expand / collapse */}
            {(filteredSorted.length - (featured ? 1 : 0)) > initialCount ? (
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
                        onClick={() => {
                          setExpanded((v) => !v);
                          prevVisibleCount.current = expanded ? initialCount : prevVisibleCount.current;
                        }}
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
        ) : (
          <div className="mt-8">
            <Card className="ring-1 ring-white/10 bg-white/[0.03] p-6">
              <div className="text-white/70">Nothing matches this filter yet.</div>
            </Card>
          </div>
        )}

        {/* Details sheet */}
        <ReleaseDetailsSheet open={!!openDetailsKey} release={activeDetails} onClose={closeDetails} onOpenPass={props.onOpenPass} />
      </div>
    </section>
  );
}
