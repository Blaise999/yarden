// src/components/landing/StoreSection.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  Modal,
  Pill,
  SectionHeader,
  cx,
  IconArrowUpRight,
  IconClose,
} from "./ui";

export type MerchLink = { label: string; href: string };

export type MerchItem = {
  id: string; // MUST be merch1..merch4 for this setup
  name: string;
  price?: string; // kept for later (not rendered)
  images: string[];
  tag?: string;
  href?: string;
  links?: MerchLink[];
  available?: boolean;
};

export type StoreConfig = {
  eyebrow?: string;
  title?: string;
  desc?: string;
  storeHref?: string;
};

// bump key so old “weird drafts” don’t keep loading
const STORAGE_KEY = "yarden:store:draft:v2";

const ALLOWED_IDS = ["merch1", "merch2", "merch3", "merch4"] as const;

const DEFAULT_MERCH: MerchItem[] = [
  {
    id: "merch1",
    name: "Yarden’s Angel Tee — Black",
    images: ["/Pictures/merch1.jpg"],
    tag: "Drop",
    available: true,
    href: "",
  },
  {
    id: "merch2",
    name: "WAIT LYRIC TOP — Black",
    images: ["/Pictures/merch2.jpg"],
    tag: "Drop",
    available: true,
    href: "",
  },
  {
    id: "merch3",
    name: "Yarden’s Angel Tee — White",
    images: ["/Pictures/merch3.jpg"],
    tag: "Drop",
    available: true,
    href: "",
  },
  {
    id: "merch4",
    name: "WAIT LYRIC TOP — White",
    images: ["/Pictures/merch4.jpg"],
    tag: "Drop",
    available: true,
    href: "",
  },
];

function normalizeImgSrc(src: string) {
  const s = (src || "").trim().replaceAll("\\", "/");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  return `/${s}`;
}

/** Force ONLY the 4 items, in the right order, with correct image paths */
function enforceFourOnly(list?: MerchItem[] | null): MerchItem[] {
  const src = Array.isArray(list) ? list : [];

  return ALLOWED_IDS.map((id) => {
    const found = src.find((x) => x?.id === id);
    const base = DEFAULT_MERCH.find((d) => d.id === id)!;

    const images =
      found?.images?.length
        ? found.images.map(normalizeImgSrc).filter(Boolean)
        : base.images.map(normalizeImgSrc);

    return {
      ...base,
      ...(found || {}),
      id, // force id
      images: images.length ? images : base.images,
    };
  });
}

/** tiny helper for safe external target/rel */
function linkProps(href: string) {
  const isExternal = /^https?:\/\//i.test(href);
  return isExternal ? { target: "_blank", rel: "noreferrer" as const } : {};
}

function ImgCover({
  src,
  alt,
  onError,
}: {
  src: string;
  alt: string;
  onError?: () => void;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full object-cover"
      onError={onError}
      draggable={false}
    />
  );
}

function MerchCard({ item }: { item: MerchItem }) {
  const safeImgs = useMemo(() => {
    const list = (item.images ?? []).map(normalizeImgSrc).filter(Boolean);
    return list.length ? list : ["/Pictures/merch1.jpg"];
  }, [item.images]);

  const [i, setI] = useState(0);

  useEffect(() => {
    setI((prev) => Math.min(prev, Math.max(0, safeImgs.length - 1)));
  }, [safeImgs.length]);

  // swipe inside image only
  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);

  const next = () => setI((v) => (v + 1) % safeImgs.length);
  const prev = () => setI((v) => (v - 1 + safeImgs.length) % safeImgs.length);

  const primaryHref = (item.href || item.links?.[0]?.href || "").trim();
  const canOpen = primaryHref.length > 0 && primaryHref !== "#";
  const primaryLabel = item.available === false ? "Notify me" : "View";

  return (
    <Card className="group overflow-hidden bg-white/[0.03] ring-1 ring-white/10">
      <div
        className="relative aspect-[4/5] select-none overflow-hidden"
        onPointerDown={(e) => {
          startX.current = e.clientX;
          lastX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (startX.current == null) return;
          lastX.current = e.clientX;
        }}
        onPointerUp={() => {
          if (startX.current == null || lastX.current == null) return;
          const dx = lastX.current - startX.current;
          startX.current = null;
          lastX.current = null;
          if (Math.abs(dx) < 28) return;
          if (dx < 0) next();
          else prev();
        }}
        onPointerCancel={() => {
          startX.current = null;
          lastX.current = null;
        }}
      >
        <ImgCover
          src={safeImgs[i]}
          alt={item.name}
          onError={() => {
            if (safeImgs.length > 1) next();
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {item.tag ? <Pill tone="brand">{item.tag}</Pill> : null}
          {item.available === false ? <Pill tone="muted">Coming soon</Pill> : null}
        </div>

        {safeImgs.length > 1 ? (
          <div className="absolute right-4 top-4 flex items-center gap-1">
            {safeImgs.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                className={cx(
                  "h-2 w-2 rounded-full ring-1 ring-white/20",
                  idx === i ? "bg-white/80" : "bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">{item.name}</div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-xs text-white/55">
                {item.available === false ? "Drop soon" : "Limited drop"}
              </div>

              {canOpen ? (
                <Link
                  href={primaryHref}
                  {...linkProps(primaryHref)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white"
                >
                  <span>{primaryLabel}</span>
                  <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-xs font-medium text-white/45">Details soon</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function StoreSection(props: {
  id?: string;
  merch: MerchItem[];
  config: StoreConfig;

  editable?: boolean;
  onSave?: (payload: { merch: MerchItem[]; config: StoreConfig }) => Promise<void> | void;
}) {
  const id = props.id ?? "store";

  // FORCE: only these 4, always
  const baseMerch = useMemo(() => enforceFourOnly(props.merch), [props.merch]);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftMerch, setDraftMerch] = useState<MerchItem[]>(baseMerch);
  const [draftConfig, setDraftConfig] = useState<StoreConfig>(props.config);

  // load draft when editable (but still enforce only 4)
  useEffect(() => {
    if (!props.editable) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.merch && parsed?.config) {
        setDraftMerch(enforceFourOnly(parsed.merch));
        setDraftConfig(parsed.config);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editable]);

  // when closing editor, reset drafts to base
  useEffect(() => {
    if (editOpen) return;
    setDraftMerch(baseMerch);
    setDraftConfig(props.config);
  }, [baseMerch, props.config, editOpen]);

  const persistDraft = (merch: MerchItem[], config: StoreConfig) => {
    if (!props.editable) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ merch: enforceFourOnly(merch), config, updatedAt: Date.now() })
      );
    } catch {}
  };

  const updateItem = (itemId: string, patch: Partial<MerchItem>) => {
    const updated = enforceFourOnly(
      draftMerch.map((m) => (m.id === itemId ? { ...m, ...patch } : m))
    );
    setDraftMerch(updated);
    persistDraft(updated, draftConfig);
  };

  const saveNow = async () => {
    setSaving(true);
    try {
      const clean = enforceFourOnly(draftMerch);
      persistDraft(clean, draftConfig);
      if (props.onSave) await props.onSave({ merch: clean, config: draftConfig });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // render from draft when editable, else base
  const merchToRender = props.editable ? draftMerch : baseMerch;
  const cfgToRender = props.editable ? draftConfig : props.config;

  // --- Ecommerce carousel rail ---
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const recalcRail = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    recalcRail();
    const onResize = () => recalcRail();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recalcRail]);

  const scrollByOneCard = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;

    const first = el.querySelector<HTMLElement>("[data-merch-card='1']");
    const gap = parseFloat(getComputedStyle(el).gap || "0");
    const step = (first?.offsetWidth || Math.min(420, el.clientWidth * 0.82)) + gap;

    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow={cfgToRender.eyebrow ?? "Store"}
          title={cfgToRender.title ?? "Merch that matches the era."}
          desc={cfgToRender.desc ?? "Swipe to browse — each slide is the next piece."}
          right={
            <div className="flex flex-wrap gap-2">
              {props.editable ? (
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
              ) : null}

              <Button
                variant="secondary"
                href={(cfgToRender.storeHref ?? "").trim() || "#"}
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
                target={cfgToRender.storeHref?.startsWith("http") ? "_blank" : undefined}
              >
                Open store
              </Button>
            </div>
          }
        />

        <div className="relative mt-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/40 to-transparent" />

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden md:flex items-center">
            <button
              type="button"
              onClick={() => scrollByOneCard(-1)}
              disabled={!canLeft}
              className={cx(
                "pointer-events-auto ml-2 rounded-full p-2 ring-1 ring-white/10 backdrop-blur-xl",
                "bg-white/[0.06] text-white/80 hover:bg-white/[0.10] hover:text-white",
                !canLeft && "opacity-40 cursor-not-allowed"
              )}
              aria-label="Previous product"
            >
              <IconArrowUpRight className="h-5 w-5 rotate-180" />
            </button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center justify-end">
            <button
              type="button"
              onClick={() => scrollByOneCard(1)}
              disabled={!canRight}
              className={cx(
                "pointer-events-auto mr-2 rounded-full p-2 ring-1 ring-white/10 backdrop-blur-xl",
                "bg-white/[0.06] text-white/80 hover:bg-white/[0.10] hover:text-white",
                !canRight && "opacity-40 cursor-not-allowed"
              )}
              aria-label="Next product"
            >
              <IconArrowUpRight className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={railRef}
            onScroll={recalcRail}
            className={cx(
              "-mx-5 px-5 md:-mx-8 md:px-8",
              "flex gap-6 overflow-x-auto pb-4 pt-2",
              "snap-x snap-mandatory scroll-smooth",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {merchToRender.map((m, idx) => (
              <div
                key={m.id}
                data-merch-card={idx === 0 ? "1" : undefined}
                className={cx("shrink-0 snap-start", "w-[82vw] max-w-[420px]", "sm:w-[420px]")}
              >
                <MerchCard item={m} />
              </div>
            ))}
            <div className="shrink-0 w-4 md:w-8" aria-hidden />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-white/45">
            <span className="hidden sm:inline">Swipe / scroll to the next product</span>
            <span className="sm:hidden">Swipe for next</span>
            <span className="hidden md:inline">{canRight ? "More →" : "End"}</span>
          </div>
        </div>

        <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Edit store">
          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Title</span>
                <input
                  value={draftConfig.title ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, title: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftMerch, next);
                  }}
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-widest text-white/60">Store link</span>
                <input
                  value={draftConfig.storeHref ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, storeHref: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftMerch, next);
                  }}
                  className={cx(
                    "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-xs uppercase tracking-widest text-white/60">Description</span>
                <textarea
                  rows={3}
                  value={draftConfig.desc ?? ""}
                  onChange={(e) => {
                    const next = { ...draftConfig, desc: e.target.value };
                    setDraftConfig(next);
                    persistDraft(draftMerch, next);
                  }}
                  className={cx(
                    "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </label>
            </div>

            <div className="grid gap-3">
              {draftMerch.map((m) => (
                <div key={m.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {m.tag ? <Pill tone="brand">{m.tag}</Pill> : <Pill tone="muted">Item</Pill>}
                      {m.available === false ? <Pill tone="muted">Coming soon</Pill> : <Pill tone="brand">Live</Pill>}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem(STORAGE_KEY);
                        } catch {}
                        setDraftMerch(baseMerch);
                        setDraftConfig(props.config);
                      }}
                      className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      aria-label="Reset draft"
                      title="Reset"
                    >
                      <IconClose className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="text-xs uppercase tracking-widest text-white/60">Name</span>
                      <input
                        value={m.name}
                        onChange={(e) => updateItem(m.id, { name: e.target.value })}
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Tag</span>
                      <input
                        value={m.tag ?? ""}
                        onChange={(e) => updateItem(m.id, { tag: e.target.value })}
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-white/60">Available</span>
                      <select
                        value={m.available === false ? "no" : "yes"}
                        onChange={(e) => updateItem(m.id, { available: e.target.value === "yes" })}
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      >
                        <option value="yes" className="bg-[#0B0B10]">
                          Yes
                        </option>
                        <option value="no" className="bg-[#0B0B10]">
                          Coming soon
                        </option>
                      </select>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-xs uppercase tracking-widest text-white/60">Images (comma separated)</span>
                      <input
                        value={(m.images ?? []).join(", ")}
                        onChange={(e) =>
                          updateItem(m.id, {
                            images: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="/Pictures/merch1.jpg"
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-xs uppercase tracking-widest text-white/60">Primary link</span>
                      <input
                        value={m.href ?? ""}
                        onChange={(e) => updateItem(m.id, { href: e.target.value })}
                        className={cx(
                          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
                          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                        )}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/50">{saving ? "Saving…" : "Ready"}</div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveNow} disabled={saving}>
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
