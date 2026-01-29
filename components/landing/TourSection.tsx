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

  // per-show poster
  posterSrc?: string;
  posterAlt?: string;

  // tickets link + status
  href?: string;
  status?: ShowStatus; // announce = coming soon
};

export type TourConfig = {
  headline?: string;
  description?: string;

  // fallback poster if a show doesn’t have one (used for admin preview only)
  posterSrc?: string;
  posterAlt?: string;

  notifyCtaLabel?: string;
  passCtaLabel?: string;

  // optional ticket portal (not per-show)
  ticketPortalHref?: string;
  ticketPortalLabel?: string;

  // copy for locked/coming soon mode
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

function hasDate(s: ShowItem) {
  return Boolean((s.dateISO ?? "").trim() || (s.dateLabel ?? "").trim());
}

function isEmptyRow(s: ShowItem) {
  const hasText = Boolean((s.city ?? "").trim() || (s.venue ?? "").trim());
  const hasMedia = Boolean((s.posterSrc ?? "").trim());
  const hasLink = Boolean((s.href ?? "").trim());
  return !hasDate(s) && !hasText && !hasMedia && !hasLink;
}

// ✅ what “live” means for YOU:
// show only becomes public when admin adds: poster + date + location + link
function isPublishable(s: ShowItem) {
  const poster = (s.posterSrc ?? "").trim();
  const link = (s.href ?? "").trim();
  const city = (s.city ?? "").trim();
  return Boolean(poster && hasDate(s) && city && link);
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

const STORAGE_KEY = "yarden:tour:draft:v8";

// demo shows (admin only; intentionally NOT publishable until you add links)
const DEMO_SHOWS: Omit<ShowItem, "id">[] = [
  {
    dateISO: "2026-03-22",
    city: "Lagos",
    venue: "Eko Convention Centre",
    status: "announce",
    posterSrc: "/Pictures/tour/lagos.jpg",
    href: "",
  },
  {
    dateISO: "2026-03-29",
    city: "Accra",
    venue: "AICC",
    status: "announce",
    posterSrc: "/Pictures/tour/accra.jpg",
    href: "",
  },
  {
    dateISO: "2026-04-12",
    city: "London",
    venue: "O2 Academy Brixton",
    status: "announce",
    posterSrc: "/Pictures/tour/london.jpg",
    href: "",
  },
];

function StatusPill({ status }: { status?: ShowStatus }) {
  const s = (status ?? "announce") as ShowStatus;
  if (s === "tickets") return <Pill tone="brand">Tickets</Pill>;
  if (s === "soldout") return <Pill tone="muted">Sold out</Pill>;
  return <Pill tone="ghost">Soon</Pill>;
}

function TicketLinkLine({ href }: { href: string }) {
  const pretty = href.replace(/^https?:\/\//, "");
  return (
    <div className="mt-2 text-[11px] text-white/55">
      <span className="text-white/40">Link:</span>{" "}
      <span className="truncate inline-block max-w-[24ch] align-bottom">{pretty}</span>
    </div>
  );
}

function ShowPosterCard(props: {
  show: ShowItem;
  variant?: "grid" | "hero";
}) {
  const { show, variant = "grid" } = props;

  const d = formatShortDate(show);
  const src = (show.posterSrc ?? "").trim();
  const alt = show.posterAlt ?? `${show.city || "Tour"} poster`;
  const href = (show.href ?? "").trim();

  const canGo = Boolean(href);
  const status = (show.status ?? "announce") as ShowStatus;

  // “hero” = big single show
  const posterAspect = variant === "hero" ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-[4/5]";
  const pad = variant === "hero" ? "p-6 md:p-8" : "p-4";
  const titleSize = variant === "hero" ? "text-xl md:text-2xl" : "text-sm";
  const citySize = variant === "hero" ? "text-sm md:text-base" : "text-xs";

  return (
    <div data-show-card="true" className="group">
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
        <div className={cx("relative", posterAspect)}>
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={variant === "hero" ? "(max-width: 1024px) 100vw, 70vw" : "(max-width: 1024px) 100vw, 33vw"}
              className={cx(
                "object-cover transition-transform duration-500",
                "group-hover:scale-[1.02]"
              )}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
          )}

          {/* overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.10),transparent_55%)]" />

          {/* date chip */}
          <div className="absolute left-4 top-4 rounded-2xl bg-black/45 px-3 py-2 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/70">{d.month}</div>
            <div className="text-base font-semibold leading-none text-white">{d.day}</div>
          </div>

          {/* status */}
          <div className="absolute right-4 top-4">
            <StatusPill status={status} />
          </div>

          {/* bottom info */}
          <div className={cx("absolute bottom-0 left-0 right-0", pad)}>
            <div className="rounded-3xl bg-black/38 p-4 ring-1 ring-white/10 backdrop-blur-xl">
              <div className={cx("font-semibold text-white truncate", titleSize)}>
                {show.venue?.trim() ? show.venue : "Show details coming soon"}
              </div>

              <div className={cx("mt-1 text-white/65 truncate", citySize)}>
                {show.city?.trim() ? show.city : "—"}
              </div>

              {/* Get tickets */}
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="primary"
                  href={canGo ? href : "#"}
                  target={canGo ? "_blank" : undefined}
                  disabled={!canGo || status === "announce"}
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                  className={variant === "hero" ? "px-5 py-3" : "px-4 py-2"}
                >
                  Get tickets
                </Button>

                {!canGo ? (
                  <span className="text-xs text-white/45">Add link in admin.</span>
                ) : status === "announce" ? (
                  <span className="text-xs text-white/45">Set status to “Tickets”.</span>
                ) : null}
              </div>

              {canGo ? <TicketLinkLine href={href} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
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

  // ✅ PUBLIC OUTPUT: only publishable shows show up
  const publicShows = useMemo(() => {
    return sortByDate((effectiveShows ?? []).filter((s) => !isEmptyRow(s) && isPublishable(s)));
  }, [effectiveShows]);

  // “Coming soon” until at least one show is publishable
  const comingSoonMode = publicShows.length === 0;

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
  }, [reducedMotion, publicShows.length]);

  const cfg = props.config;

  const notifyLabel = cfg.notifyCtaLabel ?? "Get alerts";
  const passLabel = cfg.passCtaLabel ?? "Pass perks";

  const ticketPortalHref = (cfg.ticketPortalHref ?? "").trim();
  const ticketPortalLabel = cfg.ticketPortalLabel ?? "Ticket portal";

  const totalStops = publicShows.length;

  const emptyTitle = cfg.emptyTitle ?? "Coming soon.";
  const emptyBody =
    cfg.emptyBody ??
    "Tour posters and ticket links appear here the moment they’re confirmed.";

  const onNotify = () => props.onNotify?.();

  // single-show huge layout
  const single = publicShows.length === 1 ? publicShows[0] : null;

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
          desc={cfg.description ?? "Posters + show + location + date + tickets."}
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

              <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                {passLabel}
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
            hint={comingSoonMode ? "Waiting for confirmed poster + link" : "Tickets available"}
          />
          <Stat label="Shows" value={String(totalStops)} hint={totalStops ? "Listed" : "None live yet"} />
          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-white/60">Alerts</div>
            <div className="mt-2 text-sm text-white/70">Tour updates only — posters and ticket links.</div>
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
            {comingSoonMode ? (
              <div className="rounded-3xl bg-white/[0.03] p-7 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-white/70">
                  <IconAnkh className="h-5 w-5" />
                  <div className="text-xs uppercase tracking-widest">Coming soon</div>
                  <Badge>Locked</Badge>
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
                </div>

                {cfg.footerLine ? <div className="mt-5 text-xs text-white/45">{cfg.footerLine}</div> : null}
              </div>
            ) : single ? (
              // ✅ one show = huge
              <ShowPosterCard show={single} variant="hero" />
            ) : (
              // ✅ multiple shows = poster grid
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publicShows.map((s) => (
                  <ShowPosterCard key={s.id} show={s} variant="grid" />
                ))}
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
                      placeholder="Posters + show + location + date + tickets."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
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
                  </div>

                  <Divider />

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Locked mode copy</span>
                    <input
                      value={draftConfig.emptyTitle ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, emptyTitle: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="Coming soon."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Locked body</span>
                    <textarea
                      value={draftConfig.emptyBody ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, emptyBody: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      rows={3}
                      placeholder="Tour posters and ticket links appear here the moment they’re confirmed."
                      className={cx(
                        "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Footer line (optional)</span>
                    <input
                      value={draftConfig.footerLine ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, footerLine: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      placeholder="More cities soon."
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
                    const missing = {
                      poster: !(s.posterSrc ?? "").trim(),
                      date: !hasDate(s),
                      city: !(s.city ?? "").trim(),
                      link: !(s.href ?? "").trim(),
                    };
                    const isReady = isPublishable(s);

                    return (
                      <div key={s.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="muted">Show</Pill>
                            <StatusPill status={s.status} />
                            {isReady ? <Badge>Publishable</Badge> : <Badge>Locked</Badge>}
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

                        {/* simple: poster + date + location + show + tickets link */}
                        <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr]">
                          <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                            <div className="relative aspect-[4/5]">
                              {(s.posterSrc ?? "").trim() ? (
                                <Image
                                  src={(s.posterSrc ?? "").trim()}
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
                            <div className="flex flex-wrap gap-2 text-xs text-white/45">
                              {missing.poster ? <span>• add poster</span> : null}
                              {missing.date ? <span>• add date</span> : null}
                              {missing.city ? <span>• add location</span> : null}
                              {missing.link ? <span>• add tickets link</span> : null}
                            </div>

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
                                <span className="text-xs uppercase tracking-widest text-white/60">Tickets link</span>
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
                    iconRight={saving ? <span className="text-xs">Saving…</span> : <IconArrowUpRight className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT: preview (draft preview shows everything, even if locked) */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/60">Live preview</div>
                <Badge>Instant</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {sortByDate(draftShows.filter((s) => !isEmptyRow(s))).map((s) => (
                  <ShowPosterCard key={s.id} show={s} variant="grid" />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
