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
  status?: ShowStatus;
};

export type TourConfig = {
  headline?: string;
  description?: string;

  posterSrc: string;
  posterAlt?: string;

  ticketPortalHref?: string;

  // CTA labels
  notifyCtaLabel?: string; // e.g. "Get alerts"
  ticketPortalLabel?: string; // e.g. "Ticket portal"
  passCtaLabel?: string; // e.g. "Pass perks"

  providerHint?: "Bandsintown" | "Seated" | "Custom";

  // poster copy
  posterKicker?: string;
  posterTitle?: string;
  posterBody?: string;

  // empty state copy
  emptyKicker?: string;
  emptyTitle?: string;
  emptyBody?: string;

  // subtle footer line (optional)
  footerLine?: string; // e.g. "More cities soon."
};

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
  if (status === "soldout") return <Pill tone="muted">Sold out</Pill>;
  if (status === "announce") return <Pill tone="ghost">Announcing</Pill>;
  return <Pill tone="brand">Tickets</Pill>;
}

function statusTone(status?: ShowStatus) {
  if (status === "soldout") return "muted";
  if (status === "announce") return "ghost";
  return "brand";
}

function pickRowCta(status?: ShowStatus) {
  if (status === "soldout") return { label: "Sold out", disabled: true };
  if (status === "announce") return { label: "Notify", disabled: false };
  return { label: "Tickets", disabled: false };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const STORAGE_KEY = "yarden:tour:draft:v4";

const DEMO_SHOWS: Omit<ShowItem, "id">[] = [
  { dateISO: "2026-03-22", city: "Lagos", venue: "Eko Convention Centre", status: "tickets" },
  { dateISO: "2026-03-29", city: "Accra", venue: "AICC", status: "announce" },
  { dateISO: "2026-04-12", city: "London", venue: "O2 Academy Brixton", status: "tickets" },
  { dateISO: "2026-04-19", city: "Paris", venue: "L’Olympia", status: "soldout" },
  { dateISO: "2026-04-26", city: "Amsterdam", venue: "AFAS Live", status: "tickets" },
  { dateISO: "2026-05-10", city: "New York", venue: "Terminal 5", status: "announce" },
  { dateISO: "2026-05-17", city: "Toronto", venue: "HISTORY", status: "tickets" },
  { dateISO: "2026-05-31", city: "Dubai", venue: "Coca-Cola Arena", status: "tickets" },
];

function TourPreview(props: { config: TourConfig; shows: ShowItem[] }) {
  const cfg = props.config;
  const sorted = sortByDate(props.shows);
  const next = sorted[0];

  const posterKicker = cfg.posterKicker ?? "TOUR";
  const posterTitle = cfg.posterTitle ?? "Coming soon.";
  const posterBody =
    cfg.posterBody ??
    "Tour announcements will live here — dates, cities, and ticket links the moment they drop.";

  return (
    <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
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
            {next ? statusPill(next.status) : <Pill tone="ghost">Soon</Pill>}
          </div>
          <div className="mt-2 text-base font-semibold text-white">{posterTitle}</div>
          <p className="mt-1 text-sm text-white/60">{posterBody}</p>

          {next ? (
            <div className="mt-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-widest text-white/55">Next stop</div>
              <div className="mt-1 text-sm font-semibold text-white">
                {next.city} <span className="text-white/45">•</span> {next.venue}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs uppercase tracking-widest text-white/60">Preview list</div>
        <div className="mt-3 grid gap-2">
          {sorted.slice(0, 3).map((s) => {
            const d = formatShortDate(s);
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                    <div className="text-center">
                      <div className="text-[10px] font-semibold tracking-wide text-white/70">{d.month}</div>
                      <div className="text-sm font-semibold text-white">{d.day}</div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{s.city || "—"}</div>
                    <div className="truncate text-xs text-white/60">{s.venue || "Venue TBA"}</div>
                  </div>
                </div>
                <Pill tone={statusTone(s.status) as any}>{pickRowCta(s.status).label}</Pill>
              </div>
            );
          })}
          {!sorted.length ? (
            <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10 text-sm text-white/70">
              No dates yet — this is where they appear.
            </div>
          ) : null}
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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ShowStatus>("all");

  const [editOpen, setEditOpen] = useState(false);
  const [draftShows, setDraftShows] = useState<ShowItem[]>(props.shows);
  const [draftConfig, setDraftConfig] = useState<TourConfig>(props.config);
  const [saving, setSaving] = useState(false);

  // stable demo list (no random IDs on each render)
  const demoRef = useRef<ShowItem[] | null>(null);
  if (!demoRef.current) {
    demoRef.current = DEMO_SHOWS.map((s) => ({ ...s, id: safeUUID() }));
  }

  // choose what to render for visitors
  const effectiveShows = useMemo(() => {
    const incoming = props.shows ?? [];
    if (incoming.length) return incoming;
    if (props.editable) return demoRef.current ?? [];
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

  const moveShow = (id: string, dir: -1 | 1) => {
    const i = draftShows.findIndex((s) => s.id === id);
    if (i === -1) return;
    const j = clamp(i + dir, 0, draftShows.length - 1);
    if (i === j) return;
    const next = [...draftShows];
    const temp = next[i];
    next[i] = next[j];
    next[j] = temp;
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
          { y: 18, opacity: 0, filter: "blur(10px)" },
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
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
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
  const ticketsCount = sortedShows.filter((s) => (s.status ?? "tickets") === "tickets").length;
  const soldoutCount = sortedShows.filter((s) => (s.status ?? "tickets") === "soldout").length;
  const announceCount = sortedShows.filter((s) => (s.status ?? "tickets") === "announce").length;

  const nextShow = useMemo(() => {
    if (!sortedShows.length) return null;
    // prefer earliest dateISO; if none, just first row
    const dated = sortedShows.filter((s) => !!parseDateISO(s.dateISO));
    return (dated.length ? dated[0] : sortedShows[0]) ?? null;
  }, [sortedShows]);

  const posterKicker = cfg.posterKicker ?? "TOUR";
  const posterTitle = cfg.posterTitle ?? "Coming soon.";
  const posterBody =
    cfg.posterBody ??
    "Tour announcements will live here — dates, cities, and ticket links the moment they drop.";

  const emptyKicker = cfg.emptyKicker ?? "Coming soon";
  const emptyTitle = cfg.emptyTitle ?? "No dates announced yet.";
  const emptyBody =
    cfg.emptyBody ?? "When the calendar opens, it updates instantly — one place for every city.";

  const notifyLabel = cfg.notifyCtaLabel ?? "Get alerts";
  const ticketPortalLabel = cfg.ticketPortalLabel ?? "Ticket portal";
  const passLabel = cfg.passCtaLabel ?? "Pass perks";

  const hasPoster = Boolean((cfg.posterSrc ?? "").trim());
  const ticketPortalHref = (cfg.ticketPortalHref ?? "").trim();

  const onNotify = () => {
    if (props.onNotify) props.onNotify();
    // no noisy alerts by default
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
          title={cfg.headline ?? "Live, soon."}
          desc={cfg.description ?? "Dates, cities, and ticket links — the official tour board."}
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
              ) : (
                <Button variant="secondary" onClick={onNotify}>
                  {ticketPortalLabel}
                </Button>
              )}
            </div>
          }
        />

        {/* top metrics + search */}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.25fr]">
          <Stat
            label="Dates"
            value={String(total)}
            hint={props.shows.length ? "Official list" : props.editable ? "Preview mode" : "Coming soon"}
          />
          <Stat
            label="Breakdown"
            value={`${ticketsCount}/${soldoutCount}/${announceCount}`}
            hint="Tickets / Sold out / Announcing"
          />

          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/60">Find a show</div>
              {nextShow ? (
                <div className="text-xs text-white/55">
                  Next:{" "}
                  <span className="text-white/75">
                    {nextShow.city}
                    {nextShow.dateISO ? ` • ${nextShow.dateISO}` : ""}
                  </span>
                </div>
              ) : null}
            </div>

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
                  Announcing
                </option>
                <option value="soldout" className="bg-[#0B0B10]">
                  Sold out
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* shell */}
        <Card className="overflow-hidden" data-tour-shell="true">
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            {/* LEFT: list */}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Official tour board</Badge>
                {cfg.providerHint ? <Badge>{cfg.providerHint}</Badge> : <Badge>Updates here first</Badge>}
                {nextShow ? <Badge>Next: {nextShow.city}</Badge> : <Badge>Coming soon</Badge>}
              </div>

              <div className="mt-6 divide-y divide-white/10">
                {filtered.length ? (
                  filtered.map((s) => {
                    const d = formatShortDate(s);
                    const status = (s.status ?? "tickets") as ShowStatus;
                    const link = (s.href || ticketPortalHref || "").trim();
                    const hasLink = Boolean(link);
                    const cta = pickRowCta(status);

                    const primaryLabel =
                      status === "tickets" ? "Tickets" : status === "announce" ? "Notify" : "Sold out";

                    const rowPrimaryAction = () => {
                      if (status === "announce") onNotify();
                      // tickets opens link via href on Button below
                    };

                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-6 py-5"
                        data-show-row="true"
                      >
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
                          {statusPill(status)}

                          {status === "tickets" ? (
                            <Button
                              variant="primary"
                              href={hasLink ? link : "#"}
                              target={hasLink ? "_blank" : undefined}
                              iconRight={<IconArrowUpRight className="h-4 w-4" />}
                              className="px-4 py-2"
                              disabled={!hasLink}
                            >
                              {primaryLabel}
                            </Button>
                          ) : (
                            <Button
                              variant={status === "soldout" ? "secondary" : "primary"}
                              onClick={rowPrimaryAction}
                              className="px-4 py-2"
                              disabled={cta.disabled}
                              iconRight={status === "announce" ? <IconChevron className="h-4 w-4" /> : undefined}
                            >
                              {primaryLabel}
                            </Button>
                          )}

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
                  </div>
                )}
              </div>

              <Divider />

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Alerts</div>
                  <div className="mt-2 text-sm text-white/70">Get a ping when dates go live.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Cities</div>
                  <div className="mt-2 text-sm text-white/70">Search by city or venue.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-widest text-white/60">Official links</div>
                  <div className="mt-2 text-sm text-white/70">Tickets and details in one place.</div>
                </Card>
              </div>

              {cfg.footerLine ? (
                <div className="mt-5 text-xs text-white/45">{cfg.footerLine}</div>
              ) : null}
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
                    {nextShow ? statusPill(nextShow.status) : <Pill tone="ghost">Soon</Pill>}
                  </div>

                  <div className="mt-2 text-lg font-semibold text-white">{posterTitle}</div>
                  <p className="mt-2 text-sm text-white/60">{posterBody}</p>

                  {nextShow ? (
                    <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs uppercase tracking-widest text-white/55">Next stop</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {nextShow.city} <span className="text-white/45">•</span> {nextShow.venue}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                        {nextShow.dateISO ? <span>{nextShow.dateISO}</span> : null}
                        {nextShow.dateISO ? <span className="opacity-60">•</span> : null}
                        <span>{nextShow.status === "announce" ? "Announcement pending" : "Details live"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs uppercase tracking-widest text-white/55">Tour board</div>
                      <div className="mt-2 text-sm text-white/70">
                        {emptyBody}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {ticketPortalHref ? (
                      <Button
                        variant="primary"
                        href={ticketPortalHref}
                        target="_blank"
                        iconRight={<IconArrowUpRight className="h-4 w-4" />}
                      >
                        {ticketPortalLabel}
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={onNotify}>
                        {ticketPortalLabel}
                      </Button>
                    )}

                    <Button variant="secondary" onClick={() => props.onOpenPass?.()}>
                      {passLabel}
                    </Button>

                    <Button variant="ghost" onClick={onNotify} iconRight={<IconChevron className="h-4 w-4" />}>
                      {notifyLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ADMIN CMS */}
        <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Tour CMS">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            {/* Left: controls */}
            <div className="grid gap-6">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60">Section copy</div>
                    <div className="mt-1 text-sm text-white/70">Live preview updates as you type.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Draft</Badge>
                    <Badge>{draftShows.filter((s) => !isEmptyRow(s)).length} dates</Badge>
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
                      placeholder="Live, soon."
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
                      placeholder="Dates, cities, and ticket links — the official tour board."
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
                    <span className="text-xs uppercase tracking-widest text-white/60">Poster paragraph</span>
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
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-widest text-white/60">Dates</div>
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

                <div className="mt-4 grid gap-3">
                  {draftShows.map((s) => (
                    <div key={s.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Pill tone="muted">Show</Pill>
                          {statusPill(s.status)}
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
                              Announcing
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
                  Your edits update the preview instantly. Hit Save to publish via your backend.
                </div>

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

            {/* Right: LIVE PREVIEW */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/60">Live preview</div>
                <Badge>Updates instantly</Badge>
              </div>
              <TourPreview
                config={{
                  ...props.config,
                  ...draftConfig,
                }}
                shows={draftShows.filter((s) => !isEmptyRow(s))}
              />
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
