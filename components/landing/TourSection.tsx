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
  dateISO?: string; // e.g. "2026-04-12"
  dateLabel?: string; // fallback like "APR 12"
  city: string;
  venue: string;
  href?: string;
  status?: ShowStatus;
};

export type TourConfig = {
  headline?: string;
  description?: string;

  posterSrc: string;
  posterAlt?: string;

  ticketPortalHref?: string;
  notifyCtaLabel?: string;

  providerHint?: "Bandsintown" | "Seated" | "Custom";

  // poster copy (admin-editable)
  posterKicker?: string; // small label
  posterTitle?: string; // heading
  posterBody?: string; // paragraph

  // empty state copy (admin-editable)
  emptyKicker?: string;
  emptyTitle?: string;
  emptyBody?: string;
};

function formatShortDate(show: ShowItem) {
  if (show.dateISO) {
    const d = new Date(show.dateISO + "T00:00:00");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = String(d.getDate()).padStart(2, "0");
    return { month, day };
  }

  if (show.dateLabel) {
    const parts = show.dateLabel.trim().split(/\s+/);
    const month = (parts[0] || "—").toUpperCase();
    const day = (parts[1] || "—").toUpperCase();
    return { month, day };
  }

  return { month: "—", day: "—" };
}

function statusPill(status?: ShowStatus) {
  if (status === "soldout") return <Pill tone="muted">Sold out</Pill>;
  if (status === "announce") return <Pill tone="muted">Announcing soon</Pill>;
  return <Pill tone="brand">Tickets</Pill>;
}

function safeUUID() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `show_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `show_${Math.random().toString(16).slice(2)}`;
  }
}

function isEmptyRow(s: ShowItem) {
  const hasDate = Boolean((s.dateISO ?? "").trim() || (s.dateLabel ?? "").trim());
  const hasText = Boolean((s.city ?? "").trim() || (s.venue ?? "").trim() || (s.href ?? "").trim());
  return !hasDate && !hasText;
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

const STORAGE_KEY = "yarden:tour:draft:v3";

// Used only when admin editing is enabled AND there are no incoming shows,
// so you can see how it looks immediately.
const DEMO_SHOWS: ShowItem[] = [
  {
    id: "demo_1",
    dateISO: "2026-03-22",
    city: "Lagos",
    venue: "Eko Convention Centre (Eko Hotels & Suites)",
    status: "tickets",
  },
  {
    id: "demo_2",
    dateISO: "2026-03-29",
    city: "Accra",
    venue: "Accra International Conference Centre",
    status: "announce",
  },
  {
    id: "demo_3",
    dateISO: "2026-04-12",
    city: "London",
    venue: "O2 Academy Brixton",
    status: "tickets",
  },
  {
    id: "demo_4",
    dateISO: "2026-04-19",
    city: "Paris",
    venue: "L’Olympia",
    status: "soldout",
  },
  {
    id: "demo_5",
    dateISO: "2026-04-26",
    city: "Amsterdam",
    venue: "AFAS Live",
    status: "tickets",
  },
  {
    id: "demo_6",
    dateISO: "2026-05-10",
    city: "New York",
    venue: "Terminal 5",
    status: "announce",
  },
  {
    id: "demo_7",
    dateISO: "2026-05-17",
    city: "Toronto",
    venue: "HISTORY",
    status: "tickets",
  },
  {
    id: "demo_8",
    dateISO: "2026-05-31",
    city: "Dubai",
    venue: "Coca-Cola Arena",
    status: "tickets",
  },
];

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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ShowStatus>("all");

  const [editOpen, setEditOpen] = useState(false);
  const [draftShows, setDraftShows] = useState<ShowItem[]>(props.shows);
  const [draftConfig, setDraftConfig] = useState<TourConfig>(props.config);
  const [saving, setSaving] = useState(false);

  // choose what to render (demo list only for admin + empty incoming list)
  const effectiveShows = useMemo(() => {
    const incoming = props.shows ?? [];
    if (incoming.length) return incoming;
    if (props.editable) return DEMO_SHOWS.map((s) => ({ ...s, id: safeUUID() }));
    return [];
  }, [props.shows, props.editable]);

  const sortedShows = useMemo(() => sortByDate(effectiveShows), [effectiveShows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedShows.filter((s) => {
      const matchesQuery = !q || `${s.city} ${s.venue}`.toLowerCase().includes(q);
      const st = (s.status ?? "tickets") as ShowStatus;
      const matchesStatus = statusFilter === "all" || st === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [sortedShows, query, statusFilter]);

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
          .map((s) => ({ ...s, status: (s.status ?? "tickets") as ShowStatus }))
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

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const root = rootRef.current;
      if (!root) return;

      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-show-row='true']"));
      const poster = root.querySelector<HTMLElement>("[data-tour-poster='true']");
      const shell = root.querySelector<HTMLElement>("[data-tour-shell='true']");

      if (shell) {
        gsap.fromTo(
          shell,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      }

      if (poster) {
        gsap.fromTo(
          poster,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      }

      if (rows.length) {
        gsap.fromTo(
          rows,
          { y: 12, opacity: 0 },
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
  }, [reducedMotion, filtered.length]);

  const cfg = props.config;

  const total = sortedShows.length;
  const announced = sortedShows.filter((s) => (s.status ?? "tickets") !== "announce").length;

  const posterKicker = cfg.posterKicker ?? "Tour mode";
  const posterTitle = cfg.posterTitle ?? "Make it official here.";
  const posterBody =
    cfg.posterBody ?? "This stays consistent. Only the dates, cities and links get updated.";

  const emptyKicker = cfg.emptyKicker ?? "Coming soon";
  const emptyTitle = cfg.emptyTitle ?? "Nothing announced right now.";
  const emptyBody =
    cfg.emptyBody ?? "When dates drop, update the data and the section updates automatically.";

  const hasPoster = Boolean((cfg.posterSrc ?? "").trim());

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Tour"
          title={cfg.headline ?? "Shows that feel like chapters."}
          desc={cfg.description ?? "Dates update from data. The section stays clean."}
          right={
            <div className="flex flex-wrap gap-2">
              {props.editable ? (
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  Edit tour
                </Button>
              ) : null}

              <Button
                variant="ghost"
                onClick={() => (props.onNotify ? props.onNotify() : alert("Later: enable show alerts via email/SMS"))}
                iconRight={<IconChevron className="h-4 w-4" />}
              >
                {cfg.notifyCtaLabel ?? "Get alerts"}
              </Button>

              {cfg.ticketPortalHref ? (
                <Button
                  variant="secondary"
                  href={cfg.ticketPortalHref}
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  Ticket portal
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => alert("Later: connect your ticket platform")}>
                  Ticket portal
                </Button>
              )}
            </div>
          }
        />

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <Stat label="Dates" value={String(total)} hint={props.shows.length ? "Loaded from data" : "Preview list"} />
          <Stat label="Announced" value={String(announced)} hint="Tickets / sold-out" />

          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-white/60">Search</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City or venue…"
                className={cx(
                  "w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                  "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                )}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={cx(
                  "w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                  "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                )}
              >
                <option value="all" className="bg-[#0B0B10]">
                  All statuses
                </option>
                <option value="tickets" className="bg-[#0B0B10]">
                  Tickets
                </option>
                <option value="announce" className="bg-[#0B0B10]">
                  Announcing soon
                </option>
                <option value="soldout" className="bg-[#0B0B10]">
                  Sold out
                </option>
              </select>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden" data-tour-shell="true">
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Data-driven</Badge>
                <Badge>Admin-updatable</Badge>
                <Badge>{cfg.providerHint ? `Widget later: ${cfg.providerHint}` : "Widget ready"}</Badge>
              </div>

              <div className="mt-6 divide-y divide-white/10">
                {filtered.length ? (
                  filtered.map((s) => {
                    const d = formatShortDate(s);
                    const link = (s.href || cfg.ticketPortalHref || "").trim();
                    const hasRealLink = Boolean(link);

                    return (
                      <div key={s.id} className="flex items-center justify-between gap-6 py-5" data-show-row="true">
                        <div className="flex items-center gap-5">
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                            <div className="text-center">
                              <div className="text-xs font-semibold tracking-wide text-white/80">{d.month}</div>
                              <div className="text-base font-semibold tracking-tight text-white">{d.day}</div>
                            </div>
                          </div>

                          <div>
                            <div className="text-base font-semibold text-white">{s.city || "—"}</div>
                            <div className="mt-0.5 text-sm text-white/60">{s.venue || "Venue TBA"}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {statusPill(s.status)}

                          <Button
                            variant="ghost"
                            href={hasRealLink ? link : "#"}
                            target={hasRealLink ? "_blank" : undefined}
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                            className="px-4 py-2"
                            disabled={!hasRealLink}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10">
                    <div className="rounded-3xl bg-white/[0.03] p-7 ring-1 ring-white/10">
                      <div className="flex items-center gap-2 text-white/70">
                        <IconAnkh className="h-5 w-5" />
                        <div className="text-xs uppercase tracking-widest">{emptyKicker}</div>
                      </div>

                      <div className="mt-4 text-lg font-semibold text-white">{emptyTitle}</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{emptyBody}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          variant="primary"
                          onClick={() => (props.onNotify ? props.onNotify() : alert("Later: enable show alerts"))}
                        >
                          Get alerts
                        </Button>
                        <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                          Pass perks
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Admin-ready</div>
                  <div className="mt-2 text-sm text-white/70">Dates come from data.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Instant updates</div>
                  <div className="mt-2 text-sm text-white/70">Update the list without redesign.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Widget later</div>
                  <div className="mt-2 text-sm text-white/70">Swap in a provider when ready.</div>
                </Card>
              </div>
            </div>

            <div className="relative min-h-[360px]" data-tour-poster="true">
              {hasPoster ? (
                <>
                  <Image
                    src={cfg.posterSrc}
                    alt={cfg.posterAlt ?? "Tour poster"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                </>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-3xl bg-black/40 p-5 ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60">{posterKicker}</div>
                  <div className="mt-2 text-lg font-semibold text-white">{posterTitle}</div>
                  <p className="mt-2 text-sm text-white/60">{posterBody}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {cfg.ticketPortalHref ? (
                      <Button
                        variant="primary"
                        href={cfg.ticketPortalHref}
                        target="_blank"
                        iconRight={<IconArrowUpRight className="h-4 w-4" />}
                      >
                        Ticket portal
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => alert("Later: open ticket platform")}>
                        Ticket portal
                      </Button>
                    )}

                    <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                      Pass perks
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => (props.onNotify ? props.onNotify() : alert("Later: enable show alerts"))}
                    >
                      Get alerts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Edit tour dates">
          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Headline</span>
                <input
                  value={draftConfig.headline ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, headline: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Ticket portal link</span>
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

              <label className="block lg:col-span-2">
                <span className="text-xs uppercase tracking-widest text-white/60">Section description</span>
                <textarea
                  value={draftConfig.description ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, description: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  rows={3}
                  className={cx(
                    "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-xs uppercase tracking-widest text-white/60">Poster image</span>
                <input
                  value={draftConfig.posterSrc ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, posterSrc: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  placeholder="/images/tour-poster.jpg"
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Poster kicker</span>
                <input
                  value={draftConfig.posterKicker ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, posterKicker: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  placeholder="Tour mode"
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Poster title</span>
                <input
                  value={draftConfig.posterTitle ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, posterTitle: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  placeholder="Make it official here."
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-xs uppercase tracking-widest text-white/60">Poster paragraph</span>
                <textarea
                  value={draftConfig.posterBody ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, posterBody: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftShows, next);
                  }}
                  rows={2}
                  className={cx(
                    "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Dates</Badge>
                <Badge>{draftShows.filter((s) => !isEmptyRow(s)).length}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={addShow}>
                  Add date
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

            <div className="grid gap-3">
              {draftShows.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Pill tone="muted">Show</Pill>
                      {statusPill(s.status)}
                    </div>
                    <button
                      onClick={() => removeShow(s.id)}
                      className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      aria-label="Remove show"
                    >
                      <IconClose className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                      <span className="text-xs uppercase tracking-widest text-white/60">Date label (fallback)</span>
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

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">City</span>
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
                      <span className="text-xs uppercase tracking-widest text-white/60">Venue</span>
                      <input
                        value={s.venue}
                        onChange={(e) => updateShow(s.id, { venue: e.target.value })}
                        placeholder="Venue"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-xs uppercase tracking-widest text-white/60">Details / ticket link</span>
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

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Status</span>
                      <select
                        value={(s.status ?? "tickets") as ShowStatus}
                        onChange={(e) => updateShow(s.id, { status: e.target.value as ShowStatus })}
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      >
                        <option value="tickets" className="bg-[#0B0B10]">
                          Tickets
                        </option>
                        <option value="announce" className="bg-[#0B0B10]">
                          Announcing soon
                        </option>
                        <option value="soldout" className="bg-[#0B0B10]">
                          Sold out
                        </option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/50">Draft saves locally. Wire onSave() to your admin backend later.</div>

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
        </Modal>
      </div>
    </section>
  );
}
