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
  dateISO?: string; // "2026-04-12"
  dateLabel?: string; // fallback like "APR 12"
  city: string;
  venue: string;
  href?: string;
  status?: ShowStatus; // "announce" for coming soon
};

export type TourConfig = {
  headline?: string;
  description?: string;

  posterSrc: string;
  posterAlt?: string;

  ticketPortalHref?: string;

  notifyCtaLabel?: string; // e.g. "Get alerts"
  ticketPortalLabel?: string; // e.g. "Ticket portal"
  passCtaLabel?: string; // e.g. "Pass perks"

  // poster copy
  posterKicker?: string;
  posterTitle?: string;
  posterBody?: string;

  // empty state copy (coming soon)
  emptyKicker?: string;
  emptyTitle?: string;
  emptyBody?: string;

  footerLine?: string; // small line under list (optional)
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

function parseDateISO(dateISO?: string) {
  if (!dateISO) return null;
  const t = Date.parse(dateISO + "T00:00:00");
  return Number.isFinite(t) ? new Date(t) : null;
}

function formatShortDate(show: ShowItem) {
  const d = parseDateISO(show.dateISO);
  if (d) {
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
  const s = (status ?? "announce") as ShowStatus;
  if (s === "soldout") return <Pill tone="muted">Sold out</Pill>;
  if (s === "tickets") return <Pill tone="brand">Tickets</Pill>;
  return <Pill tone="ghost">Coming soon</Pill>;
}

function hasLiveSignals(shows: ShowItem[]) {
  return shows.some((s) => {
    const st = (s.status ?? "announce") as ShowStatus;
    const hasLink = Boolean((s.href ?? "").trim());
    return st !== "announce" || hasLink;
  });
}

function uniqCities(shows: ShowItem[]) {
  const set = new Set<string>();
  const out: string[] = [];
  shows.forEach((s) => {
    const c = (s.city ?? "").trim();
    if (!c) return;
    const key = c.toLowerCase();
    if (set.has(key)) return;
    set.add(key);
    out.push(c);
  });
  return out;
}

const STORAGE_KEY = "yarden:tour:draft:v5";

// Demo data used ONLY when editable and there is no incoming list.
// All announce (coming soon), as requested.
const DEMO_SHOWS: Omit<ShowItem, "id">[] = [
  { dateISO: "2026-03-22", city: "Lagos", venue: "Eko Convention Centre", status: "announce" },
  { dateISO: "2026-03-29", city: "Accra", venue: "AICC", status: "announce" },
  { dateISO: "2026-04-12", city: "London", venue: "O2 Academy Brixton", status: "announce" },
  { dateISO: "2026-04-19", city: "Paris", venue: "L’Olympia", status: "announce" },
  { dateISO: "2026-04-26", city: "Amsterdam", venue: "AFAS Live", status: "announce" },
];

function LivePreviewCard(props: { config: TourConfig; shows: ShowItem[] }) {
  const cfg = props.config;
  const sorted = sortByDate(props.shows);

  const posterKicker = cfg.posterKicker ?? "TOUR";
  const posterTitle = cfg.posterTitle ?? "Coming soon.";
  const posterBody =
    cfg.posterBody ??
    "Tour announcements will live here — dates, cities, and ticket links the moment they drop.";

  const emptyKicker = cfg.emptyKicker ?? "Coming soon";
  const emptyTitle = cfg.emptyTitle ?? "No dates announced yet.";
  const emptyBody =
    cfg.emptyBody ?? "Join alerts to catch the first drop — cities, venues, and tickets.";

  const cities = uniqCities(sorted).slice(0, 8);

  return (
    <div className="overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
      <div className="relative aspect-[16/10]">
        {cfg.posterSrc?.trim() ? (
          <Image
            src={cfg.posterSrc}
            alt={cfg.posterAlt ?? "Tour poster"}
            fill
            sizes="40vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">{posterKicker}</div>
            <Pill tone="ghost">Coming soon</Pill>
          </div>
          <div className="mt-2 text-base font-semibold text-white">{posterTitle}</div>
          <p className="mt-1 text-sm text-white/60">{posterBody}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <IconAnkh className="h-4 w-4 text-white/70" />
          <div className="text-xs uppercase tracking-widest text-white/60">{emptyKicker}</div>
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{emptyTitle}</div>
        <p className="mt-1 text-sm text-white/60">{emptyBody}</p>

        {cities.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-widest text-white/55">Cities in rotation</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 ring-1 ring-white/10"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : null}
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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ShowStatus>("all");

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

  // coming soon mode = no “live” signals yet
  const comingSoonMode = useMemo(() => !hasLiveSignals(sortedShows), [sortedShows]);

  // only used if/when it goes live later
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedShows.filter((s) => {
      const matchesQuery = !q || `${s.city} ${s.venue}`.toLowerCase().includes(q);
      const st = (s.status ?? "announce") as ShowStatus;
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
          .map((s) => ({ ...s, status: (s.status ?? "announce") as ShowStatus }))
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
      const poster = root.querySelector<HTMLElement>("[data-tour-poster='true']");
      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-show-row='true']"));

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

      if (poster) {
        gsap.fromTo(
          poster,
          { y: 16, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      }

      if (rows.length) {
        gsap.fromTo(
          rows,
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
  }, [reducedMotion, filtered.length]);

  const cfg = props.config;

  const total = sortedShows.length;
  const cities = uniqCities(sortedShows);
  const notifyLabel = cfg.notifyCtaLabel ?? "Get alerts";
  const ticketPortalLabel = cfg.ticketPortalLabel ?? "Ticket portal";
  const passLabel = cfg.passCtaLabel ?? "Pass perks";
  const ticketPortalHref = (cfg.ticketPortalHref ?? "").trim();

  const posterKicker = cfg.posterKicker ?? "TOUR";
  const posterTitle = cfg.posterTitle ?? "Coming soon.";
  const posterBody =
    cfg.posterBody ??
    "Tour announcements will live here — dates, cities, and ticket links the moment they drop.";

  const emptyKicker = cfg.emptyKicker ?? "Coming soon";
  const emptyTitle = cfg.emptyTitle ?? "Tour dates aren’t announced yet.";
  const emptyBody =
    cfg.emptyBody ??
    "Join alerts for the first drop. Cities, venues, and tickets will post here as soon as they’re live.";

  const hasPoster = Boolean((cfg.posterSrc ?? "").trim());

  const onNotify = () => {
    props.onNotify?.();
  };

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      <div ref={rootRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Tour"
          title={cfg.headline ?? "Coming soon."}
          desc={cfg.description ?? "The official tour board — announcements post here first."}
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

              {/* Keep portal CTA available for later (admin can set link), but coming soon stays primary */}
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
            label="Status"
            value={comingSoonMode ? "Coming soon" : "Live"}
            hint={comingSoonMode ? "Announcements pending" : "Tickets / sold-out"}
          />
          <Stat
            label="Cities"
            value={String(cities.length)}
            hint={cities.length ? "In rotation" : "To be announced"}
          />

          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-white/60">Stay updated</div>
            <div className="mt-2 text-sm text-white/70">
              Get notified when dates drop. No noise — only tour updates.
            </div>
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
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            {/* LEFT */}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Official tour board</Badge>
                <Badge>{comingSoonMode ? "Coming soon" : "Live"}</Badge>
                {cities.length ? <Badge>{cities[0]}{cities.length > 1 ? ` +${cities.length - 1}` : ""}</Badge> : null}
              </div>

              {/* COMING SOON LAYOUT (your request) */}
              {comingSoonMode ? (
                <div className="mt-6">
                  <div className="rounded-3xl bg-white/[0.03] p-7 ring-1 ring-white/10">
                    <div className="flex items-center gap-2 text-white/70">
                      <IconAnkh className="h-5 w-5" />
                      <div className="text-xs uppercase tracking-widest">{emptyKicker}</div>
                    </div>

                    <div className="mt-4 text-lg font-semibold text-white">{emptyTitle}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{emptyBody}</p>

                    {cities.length ? (
                      <div className="mt-5">
                        <div className="text-xs uppercase tracking-widest text-white/55">Cities in rotation</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {cities.slice(0, 10).map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center rounded-full bg-white/[0.04] px-3 py-2 text-xs text-white/75 ring-1 ring-white/10"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

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
                  </div>

                  <Divider />

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-5">
                      <div className="text-xs uppercase tracking-widest text-white/60">Announcements</div>
                      <div className="mt-2 text-sm text-white/70">Dates post here first.</div>
                    </Card>
                    <Card className="p-5">
                      <div className="text-xs uppercase tracking-widest text-white/60">Alerts</div>
                      <div className="mt-2 text-sm text-white/70">Join once. Get tour-only updates.</div>
                    </Card>
                    <Card className="p-5">
                      <div className="text-xs uppercase tracking-widest text-white/60">Tickets</div>
                      <div className="mt-2 text-sm text-white/70">Links go live when confirmed.</div>
                    </Card>
                  </div>

                  {cfg.footerLine ? <div className="mt-5 text-xs text-white/45">{cfg.footerLine}</div> : null}
                </div>
              ) : (
                /* LIVE LAYOUT (kept for later: admin edits status/links and it automatically becomes live) */
                <div className="mt-6">
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search city or venue…"
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
                        Coming soon
                      </option>
                      <option value="soldout" className="bg-[#0B0B10]">
                        Sold out
                      </option>
                    </select>
                  </div>

                  <div className="divide-y divide-white/10">
                    {filtered.map((s) => {
                      const d = formatShortDate(s);
                      const st = (s.status ?? "announce") as ShowStatus;
                      const link = (s.href || ticketPortalHref || "").trim();
                      const hasLink = Boolean(link);

                      return (
                        <div key={s.id} className="flex items-center justify-between gap-6 py-5" data-show-row="true">
                          <div className="flex items-center gap-5 min-w-0">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                              <div className="text-center">
                                <div className="text-xs font-semibold tracking-wide text-white/80">{d.month}</div>
                                <div className="text-base font-semibold tracking-tight text-white">{d.day}</div>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold text-white">{s.city || "—"}</div>
                              <div className="mt-0.5 truncate text-sm text-white/60">{s.venue || "Venue TBA"}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {statusPill(st)}
                            <Button
                              variant="ghost"
                              href={hasLink ? link : "#"}
                              target={hasLink ? "_blank" : undefined}
                              iconRight={<IconArrowUpRight className="h-4 w-4" />}
                              className="px-4 py-2"
                              disabled={!hasLink}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: poster */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                </>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-3xl bg-black/40 p-5 ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">{posterKicker}</div>
                    <Pill tone="ghost">Coming soon</Pill>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{posterTitle}</div>
                  <p className="mt-2 text-sm text-white/60">{posterBody}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={onNotify} iconRight={<IconChevron className="h-4 w-4" />}>
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
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ADMIN CMS (kept + strong; edits instantly reflect in preview) */}
        <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Tour CMS">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            {/* LEFT: controls */}
            <div className="grid gap-6">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60">Section copy</div>
                    <div className="mt-1 text-sm text-white/70">Preview updates as you type.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Draft</Badge>
                    <Badge>{draftShows.filter((s) => !isEmptyRow(s)).length} items</Badge>
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
                      placeholder="Coming soon."
                      className={cx(
                        "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Description</span>
                    <textarea
                      value={draftConfig.description ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, description: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      rows={3}
                      placeholder="The official tour board — announcements post here first."
                      className={cx(
                        "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
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
                <div className="text-xs uppercase tracking-widest text-white/60">Poster</div>

                <div className="mt-4 grid gap-4">
                  <label className="block">
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

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Poster kicker</span>
                      <input
                        value={draftConfig.posterKicker ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, posterKicker: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="TOUR"
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
                        placeholder="Coming soon."
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-white/60">Poster body</span>
                    <textarea
                      value={draftConfig.posterBody ?? ""}
                      onChange={(e) => {
                        const next = { ...draftConfig, posterBody: e.target.value };
                        setDraftConfig(next);
                        persistDraft(draftShows, next);
                      }}
                      rows={3}
                      placeholder="Tour announcements will live here — dates, cities, and ticket links the moment they drop."
                      className={cx(
                        "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                      )}
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block md:col-span-1">
                      <span className="text-xs uppercase tracking-widest text-white/60">Empty kicker</span>
                      <input
                        value={draftConfig.emptyKicker ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, emptyKicker: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="Coming soon"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-xs uppercase tracking-widest text-white/60">Empty title</span>
                      <input
                        value={draftConfig.emptyTitle ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, emptyTitle: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        placeholder="Tour dates aren’t announced yet."
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block md:col-span-3">
                      <span className="text-xs uppercase tracking-widest text-white/60">Empty body</span>
                      <textarea
                        value={draftConfig.emptyBody ?? ""}
                        onChange={(e) => {
                          const next = { ...draftConfig, emptyBody: e.target.value };
                          setDraftConfig(next);
                          persistDraft(draftShows, next);
                        }}
                        rows={3}
                        placeholder="Join alerts for the first drop. Cities, venues, and tickets will post here as soon as they’re live."
                        className={cx(
                          "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-widest text-white/60">Shows (still “Coming soon”)</div>
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
                  {draftShows.map((s) => (
                    <div key={s.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Pill tone="ghost">Coming soon</Pill>
                          <Pill tone="muted">Show</Pill>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveShow(s.id, -1)}
                            className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveShow(s.id, 1)}
                            className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
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
                          <span className="text-xs uppercase tracking-widest text-white/60">
                            Ticket link (leave blank for “Coming soon”)
                          </span>
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

                        {/* keep status for later, but default announce */}
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
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-white/50">
                  Draft saves locally. Wire <span className="text-white/70">onSave()</span> to publish from your admin backend.
                </div>

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

            {/* RIGHT: live preview */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/60">Live preview</div>
                <Badge>Updates instantly</Badge>
              </div>

              <LivePreviewCard
                config={{ ...props.config, ...draftConfig }}
                shows={draftShows.filter((s) => !isEmptyRow(s))}
              />
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
