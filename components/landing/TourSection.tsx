// src/components/landing/TourSection.tsx
"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Badge,
  Button,
  Card,
  Divider,
  IconAnkh,
  IconArrowUpRight,
  IconChevron,
  IconClose,
  Modal,
  Pill,
  SectionHeader,
  Stat,
  cx,
  usePrefersReducedMotion,
} from "./ui";

export type ShowStatus = "tickets" | "soldout" | "announce";

export type ShowItem = {
  id: string;

  // minimal show info
  dateISO?: string; // "2026-04-12"
  dateLabel?: string; // fallback like "APR 12"
  city: string; // location
  venue: string; // show/venue

  // per-show poster (✅ what you asked for)
  posterSrc?: string;
  posterAlt?: string;

  // optional link + status (kept for later, but UI stays simple)
  href?: string;
  status?: ShowStatus; // "announce" = coming soon
};

export type TourConfig = {
  headline?: string;
  description?: string;

  // ✅ fallback poster if a show doesn’t have one
  posterSrc?: string;
  posterAlt?: string;

  ticketPortalHref?: string;

  notifyCtaLabel?: string;
  ticketPortalLabel?: string;
  passCtaLabel?: string;

  // optional copy
  emptyTitle?: string;
  emptyBody?: string;
  footerLine?: string;
};

gsap.registerPlugin(ScrollTrigger);

function safeUUID() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `show_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `show_${Math.random().toString(16).slice(2)}`;
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function isEmptyRow(s: ShowItem) {
  const hasDate = Boolean((s.dateISO ?? "").trim() || (s.dateLabel ?? "").trim());
  const hasText = Boolean((s.city ?? "").trim() || (s.venue ?? "").trim());
  const hasMedia = Boolean((s.posterSrc ?? "").trim());
  const hasLink = Boolean((s.href ?? "").trim());
  return !hasDate && !hasText && !hasMedia && !hasLink;
}

function sortByDate(shows: ShowItem[]) {
  const clone = [...shows];
  clone.sort((a, b) => {
    const aT = a.dateISO ? Date.parse(a.dateISO + "T00:00:00") : Number.POSITIVE_INFINITY;
    const bT = b.dateISO ? Date.parse(b.dateISO + "T00:00:00") : Number.POSITIVE_INFINITY;
    if (aT !== bT) return aT - bT;
    const aK = `${a.city} ${a.venue}`.toLowerCase();
    const bK = `${b.city} ${b.venue}`.toLowerCase();
    return aK.localeCompare(bK);
  });
  return clone;
}

function formatShortDate(show: ShowItem) {
  if (show.dateISO) {
    const t = Date.parse(show.dateISO + "T00:00:00");
    if (Number.isFinite(t)) {
      const d = new Date(t);
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = String(d.getDate()).padStart(2, "0");
      return { month, day };
    }
  }

  if (show.dateLabel) {
    const parts = show.dateLabel.trim().split(/\s+/);
    const month = (parts[0] ?? "—").toUpperCase();
    const day = (parts[1] ?? "—").toUpperCase();
    return { month, day };
  }

  return { month: "—", day: "—" };
}

function hasLiveSignals(shows: ShowItem[]) {
  return shows.some((s) => {
    const st = (s.status ?? "announce") as ShowStatus;
    const hasLink = Boolean((s.href ?? "").trim());
    return st !== "announce" || hasLink;
  });
}

const STORAGE_KEY = "yarden:tour:draft:v7";

// demo shows (only when editable + nothing passed in)
const DEMO_SHOWS: Omit<ShowItem, "id">[] = [
  {
    dateISO: "2026-03-22",
    city: "Lagos",
    venue: "Eko Convention Centre",
    status: "announce",
    posterSrc: "/Pictures/tour/lagos.jpg",
  },
  {
    dateISO: "2026-03-29",
    city: "Accra",
    venue: "AICC",
    status: "announce",
    posterSrc: "/Pictures/tour/accra.jpg",
  },
  {
    dateISO: "2026-04-12",
    city: "London",
    venue: "O2 Academy Brixton",
    status: "announce",
    posterSrc: "/Pictures/tour/london.jpg",
  },
];

function StatusDot({ status }: { status?: ShowStatus }) {
  const s = (status ?? "announce") as ShowStatus;
  if (s === "tickets") return <Pill tone="brand">Tickets</Pill>;
  if (s === "soldout") return <Pill tone="muted">Sold out</Pill>;
  return <Pill tone="ghost">Soon</Pill>;
}

function ShowPosterCard(props: {
  show: ShowItem;
  fallbackPosterSrc?: string;
  fallbackPosterAlt?: string;
}) {
  const { show } = props;
  const d = formatShortDate(show);

  const src = (show.posterSrc || props.fallbackPosterSrc || "").trim();
  const alt = show.posterAlt || props.fallbackPosterAlt || `${show.city} show poster`;

  const href = (show.href ?? "").trim();
  const clickable = Boolean(href);

  const Wrapper: any = clickable ? "a" : "div";
  const wrapperProps = clickable
    ? { href, target: "_blank", rel: "noreferrer", "aria-label": `${show.city} details` }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      data-show-card="true"
      className={cx("group block", clickable ? "cursor-pointer" : "cursor-default")}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
        <div className="relative aspect-[4/5]">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* date chip */}
          <div className="absolute left-4 top-4 rounded-2xl bg-black/45 px-3 py-2 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/70">{d.month}</div>
            <div className="text-base font-semibold leading-none text-white">{d.day}</div>
          </div>

          {/* status (small) */}
          <div className="absolute right-4 top-4">{<StatusDot status={show.status} />}</div>

          {/* bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-xl">
              {/* “show” */}
              <div className="truncate text-sm font-semibold text-white">
                {show.venue?.trim() ? show.venue : "Venue TBA"}
              </div>
              {/* location */}
              <div className="mt-1 truncate text-xs text-white/65">
                {show.city?.trim() ? show.city : "—"}
              </div>

              {clickable ? (
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-white/70">
                  <span>Details</span>
                  <IconArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export function TourSection(props: {
  id?: string;
  shows: ShowItem[];
  config: TourConfig;

  onOpenPass?: () => void;
  onNotify?: () => void;

  editable?: boolean;
  onSave?: (payload: { shows: ShowItem[]; config: TourConfig }) => Promise<void> | void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const id = props.id ?? "shows";
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [draftShows, setDraftShows] = useState<ShowItem[]>(props.shows);
  const [draftConfig, setDraftConfig] = useState<TourConfig>(props.config);
  const [saving, setSaving] = useState(false);

  // stable demo list (no random IDs each render)
  const demoRef = useRef<ShowItem[] | null>(null);
  if (!demoRef.current) {
    demoRef.current = DEMO_SHOWS.map((s) => ({ ...s, id: safeUUID() }));
  }

  // pick what visitors see
  const effectiveShows = useMemo(() => {
    const incoming = props.shows ?? [];
    if (incoming.length) return incoming;
    if (props.editable) return demoRef.current ?? [];
    return [];
  }, [props.shows, props.editable]);

  const sortedShows = useMemo(() => sortByDate(effectiveShows), [effectiveShows]);

  // coming soon mode = no “live” signals yet (still shows posters + info)
  const comingSoonMode = useMemo(() => !hasLiveSignals(sortedShows), [sortedShows]);

  // sync draft when not editing
  useEffect(() => {
    if (editOpen) return;
    setDraftShows(effectiveShows);
    setDraftConfig(props.config);
  }, [effectiveShows, props.config, editOpen]);

  // load local draft (admin)
  useEffect(() => {
    if (!props.editable) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.shows && parsed?.config) {
        setDraftShows(parsed.shows);
        setDraftConfig(parsed.config);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editable]);

  const persistDraft = (shows: ShowItem[], config: TourConfig) => {
    if (!props.editable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ shows, config, updatedAt: Date.now() }));
    } catch {}
  };

  const addShow = () => {
    const next: ShowItem = {
      id: safeUUID(),
      dateISO: "",
      dateLabel: "",
      city: "",
      venue: "",
      posterSrc: "",
      posterAlt: "",
      href: "",
      status: "announce",
    };
    const updated = [next, ...draftShows];
    setDraftShows(updated);
    persistDraft(updated, draftConfig);
  };

  const removeShow = (rid: string) => {
    const updated = draftShows.filter((s) => s.id !== rid);
    setDraftShows(updated);
    persistDraft(updated, draftConfig);
  };

  const moveShow = (sid: string, dir: -1 | 1) => {
    const i = draftShows.findIndex((s) => s.id === sid);
    if (i === -1) return;
    const j = clamp(i + dir, 0, draftShows.length - 1);
    if (i === j) return;
    const next = [...draftShows];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    setDraftShows(next);
    persistDraft(next, draftConfig);
  };

  const updateShow = (uid: string, patch: Partial<ShowItem>) => {
    const updated = draftShows.map((s) => (s.id === uid ? { ...s, ...patch } : s));
    setDraftShows(updated);
    persistDraft(updated, draftConfig);
  };

  const saveNow = async () => {
    setSaving(true);
    try {
      const cleaned = sortByDate(
        draftShows
          .filter((s) => !isEmptyRow(s))
          .map((s) => ({
            ...s,
            status: (s.status ?? "announce") as ShowStatus,
            city: (s.city ?? "").trim(),
            venue: (s.venue ?? "").trim(),
            posterSrc: (s.posterSrc ?? "").trim(),
            href: (s.href ?? "").trim(),
          }))
      );

      const cfg: TourConfig = { ...draftConfig };
      persistDraft(cleaned, cfg);
      if (props.onSave) await props.onSave({ shows: cleaned, config: cfg });

      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const root = rootRef.current;
      if (!root) return;

      const shell = root.querySelector<HTMLElement>("[data-tour-shell='true']");
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-show-card='true']"));

      if (shell) {
        gsap.fromTo(
          shell,
          { y: 14, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      }

      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: root, start: "top 70%", once: true },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion, sortedShows.length]);

  const cfg = props.config;

  const notifyLabel = cfg.notifyCtaLabel ?? "Get alerts";
  const ticketPortalLabel = cfg.ticketPortalLabel ?? "Ticket portal";
  const passLabel = cfg.passCtaLabel ?? "Pass perks";
  const ticketPortalHref = (cfg.ticketPortalHref ?? "").trim();

  const totalStops = sortedShows.length;

  const emptyTitle = cfg.emptyTitle ?? "Tour dates aren’t announced yet.";
  const emptyBody =
    cfg.emptyBody ??
    "When dates go live, you’ll see the poster + show + location + date right here.";

  const onNotify = () => props.onNotify?.();

  const fallbackPosterSrc = (cfg.posterSrc ?? "").trim();
  const fallbackPosterAlt = cfg.posterAlt ?? "Tour poster";

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Tour"
          title={cfg.headline ?? "Tour board."}
          desc={cfg.description ?? "Posters + show + location + date."}
          right={
            <div className="flex flex-wrap gap-2">
              {props.editable ? (
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  Edit tour
                </Button>
              ) : null}

              <Button variant="ghost" onClick={onNotify} iconRight={<IconChevron className="h-4 w-4" />}>
                {notifyLabel}
              </Button>

              {ticketPortalHref ? (
                <Button
                  variant="secondary"
                  href={ticketPortalHref}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  {ticketPortalLabel}
                </Button>
              ) : null}
            </div>
          }
        />

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.25fr]">
          <Stat
            label="Mode"
            value={comingSoonMode ? "Coming soon" : "Live"}
            hint={comingSoonMode ? "Announcements pending" : "Links / tickets available"}
          />
          <Stat label="Stops" value={String(totalStops)} hint={totalStops ? "Listed" : "To be announced"} />
          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-white/60">Alerts</div>
            <div className="mt-2 text-sm text-white/70">Tour updates only — no spam.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" onClick={onNotify}>
                {notifyLabel}
              </Button>
              <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                {passLabel}
              </Button>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden" data-tour-shell="true">
          <div className="p-6 md:p-8">
            {sortedShows.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedShows.map((s) => (
                  <ShowPosterCard
                    key={s.id}
                    show={s}
                    fallbackPosterSrc={fallbackPosterSrc}
                    fallbackPosterAlt={fallbackPosterAlt}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/[0.03] p-7 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-white/70">
                  <IconAnkh className="h-5 w-5" />
                  <div className="text-xs uppercase tracking-widest">Coming soon</div>
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{emptyTitle}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{emptyBody}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={onNotify}>
                    {notifyLabel}
                  </Button>
                  <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                    {passLabel}
                  </Button>
                  {ticketPortalHref ? (
                    <Button
                      variant="ghost"
                      href={ticketPortalHref}
                      target="_blank"
                      iconRight={<IconArrowUpRight className="h-4 w-4" />}
                    >
                      {ticketPortalLabel}
                    </Button>
                  ) : null}
                </div>

                {cfg.footerLine ? <div className="mt-5 text-xs text-white/45">{cfg.footerLine}</div> : null}
              </div>
            )}
          </div>
        </Card>

        {/* ADMIN CMS */}
        <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Tour CMS">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            {/* LEFT */}
            <div className="grid gap-6">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60">Section copy</div>
                    <div className="mt-1 text-sm text-white/70">Keep it short.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Draft</Badge>
                    <Badge>{draftShows.filter((s) => !isEmptyRow(s)).length} shows</Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Headline</span>
                    <input
                      value={draftConfig.headline ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, headline: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="Tour board."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Description</span>
                    <input
                      value={draftConfig.description ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, description: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="Posters + show + location + date."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Notify label</span>
                      <input
                        value={draftConfig.notifyCtaLabel ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, notifyCtaLabel: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="Get alerts"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Pass label</span>
                      <input
                        value={draftConfig.passCtaLabel ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, passCtaLabel: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="Pass perks"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Portal label</span>
                      <input
                        value={draftConfig.ticketPortalLabel ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, ticketPortalLabel: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="Ticket portal"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Ticket portal link (optional)</span>
                    <input
                      value={draftConfig.ticketPortalHref ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, ticketPortalHref: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="https://..."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <Divider />

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      Default poster (fallback if a show has none)
                    </span>
                    <input
                      value={draftConfig.posterSrc ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, posterSrc: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="/Pictures/tour/default.jpg"
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-widest text-white/60">Shows</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={addShow}>
                      Add show
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        try {
                          localStorage.removeItem(STORAGE_KEY);
                        } catch {}
                        setDraftShows(effectiveShows);
                        setDraftConfig(props.config);
                      }}
                    >
                      Reset draft
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {draftShows.map((s) => {
                    const previewPoster = (s.posterSrc || draftConfig.posterSrc || "").trim();
                    return (
                      <div key={s.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Pill tone="muted">Show</Pill>
                            <StatusDot status={s.status} />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveShow(s.id, -1)}
                              className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                              aria-label="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveShow(s.id, 1)}
                              className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                              aria-label="Move down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeShow(s.id)}
                              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                              aria-label="Remove show"
                            >
                              <IconClose className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* simple: poster + date + location + venue */}
                        <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr]">
                          <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                            <div className="relative aspect-[4/5]">
                              {previewPoster ? (
                                <Image
                                  src={previewPoster}
                                  alt={s.posterAlt ?? "Poster preview"}
                                  fill
                                  sizes="140px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <label className="block">
                              <span className="text-xs uppercase tracking-widest text-white/60">Poster</span>
                              <input
                                value={s.posterSrc ?? ""}
                                onChange={(e) => updateShow(s.id, { posterSrc: e.target.value })}
                                placeholder="/Pictures/tour/lagos.jpg"
                                className={cx(
                                  "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                  "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                )}
                              />
                            </label>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Date (ISO)</span>
                                <input
                                  value={s.dateISO ?? ""}
                                  onChange={(e) => updateShow(s.id, { dateISO: e.target.value })}
                                  placeholder="2026-04-12"
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                />
                              </label>

                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Date label</span>
                                <input
                                  value={s.dateLabel ?? ""}
                                  onChange={(e) => updateShow(s.id, { dateLabel: e.target.value })}
                                  placeholder="APR 12"
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                />
                              </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Location (city)</span>
                                <input
                                  value={s.city}
                                  onChange={(e) => updateShow(s.id, { city: e.target.value })}
                                  placeholder="Lagos"
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                />
                              </label>

                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Show (venue)</span>
                                <input
                                  value={s.venue}
                                  onChange={(e) => updateShow(s.id, { venue: e.target.value })}
                                  placeholder="Eko Convention Centre"
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                />
                              </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Status</span>
                                <select
                                  value={(s.status ?? "announce") as ShowStatus}
                                  onChange={(e) => updateShow(s.id, { status: e.target.value as ShowStatus })}
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                >
                                  <option value="announce" className="bg-[#0B0B10]">
                                    Coming soon
                                  </option>
                                  <option value="tickets" className="bg-[#0B0B10]">
                                    Tickets
                                  </option>
                                  <option value="soldout" className="bg-[#0B0B10]">
                                    Sold out
                                  </option>
                                </select>
                              </label>

                              <label className="block">
                                <span className="text-xs uppercase tracking-widest text-white/60">Link (optional)</span>
                                <input
                                  value={s.href ?? ""}
                                  onChange={(e) => updateShow(s.id, { href: e.target.value })}
                                  placeholder="https://..."
                                  className={cx(
                                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                                  )}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-white/50">Save to publish.</div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveNow}
                    iconRight={
                      saving ? <span className="text-xs">Saving…</span> : <IconArrowUpRight className="h-4 w-4" />
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT: preview */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/60">Live preview</div>
                <Badge>Instant</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {sortByDate(draftShows.filter((s) => !isEmptyRow(s))).map((s) => (
                  <ShowPosterCard
                    key={s.id}
                    show={s}
                    fallbackPosterSrc={(draftConfig.posterSrc ?? "").trim()}
                    fallbackPosterAlt={draftConfig.posterAlt ?? "Tour poster"}
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
