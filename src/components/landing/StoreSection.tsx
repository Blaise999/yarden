"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/components/landing/ui";

export type MerchLink = { label: string; href: string };

export type MerchItem = {
  id: string;
  name: string;
  price?: string;
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

const STORAGE_KEY = "yarden:store:draft:v1";

function uid(prefix: string) {
  try {
    // @ts-ignore
    const u = crypto?.randomUUID?.();
    return u ? `${prefix}_${u}` : `${prefix}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `${prefix}_${Math.random().toString(16).slice(2)}`;
  }
}

function ImgCover({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function MerchCard({ item }: { item: MerchItem }) {
  const imgs = item.images?.length ? item.images : ["/media/yarden/merch-tee.jpg"];
  const [i, setI] = useState(0);

  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);

  const next = () => setI((v) => (v + 1) % imgs.length);
  const prev = () => setI((v) => (v - 1 + imgs.length) % imgs.length);

  const primaryHref = item.href || item.links?.[0]?.href || "#";
  const canOpen = primaryHref && primaryHref !== "#";
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
        <ImgCover src={imgs[i]} alt={item.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {item.tag ? <Pill tone="brand">{item.tag}</Pill> : null}
          {item.available === false ? <Pill tone="muted">Coming soon</Pill> : null}
        </div>

        {imgs.length > 1 ? (
          <div className="absolute right-4 top-4 flex items-center gap-1">
            {imgs.map((_, idx) => (
              <button
                key={idx}
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
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-sm text-white/60">{item.price || "—"}</div>

              {canOpen ? (
                <Link
                  href={primaryHref}
                  target={primaryHref.startsWith("http") ? "_blank" : undefined}
                  rel={primaryHref.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
                >
                  <span>{primaryLabel}</span>
                  <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-sm font-medium text-white/35">No link</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {item.links?.length ? (
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {item.links.slice(0, 3).map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                className={cx(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                  "bg-white/5 text-white/75 ring-1 ring-white/10 hover:bg-white/8 hover:text-white"
                )}
              >
                <span>{l.label}</span>
                <IconArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
            {item.links.length > 3 ? <Badge>+{item.links.length - 3} more</Badge> : null}
          </div>
        </div>
      ) : null}
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

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftMerch, setDraftMerch] = useState<MerchItem[]>(props.merch);
  const [draftConfig, setDraftConfig] = useState<StoreConfig>(props.config);

  useEffect(() => {
    if (!props.editable) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.merch && parsed?.config) {
        setDraftMerch(parsed.merch);
        setDraftConfig(parsed.config);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editable]);

  useEffect(() => {
    if (editOpen) return;
    setDraftMerch(props.merch);
    setDraftConfig(props.config);
  }, [props.merch, props.config, editOpen]);

  const persistDraft = (merch: MerchItem[], config: StoreConfig) => {
    if (!props.editable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ merch, config, updatedAt: Date.now() }));
    } catch {}
  };

  const addItem = () => {
    const next: MerchItem = {
      id: uid("merch"),
      name: "New item",
      price: "₦ —",
      images: ["/media/yarden/merch-tee.jpg"],
      tag: "Drop soon",
      available: false,
      links: [{ label: "Notify me", href: "#" }],
    };
    const updated = [next, ...draftMerch];
    setDraftMerch(updated);
    persistDraft(updated, draftConfig);
  };

  const removeItem = (id: string) => {
    const updated = draftMerch.filter((m) => m.id !== id);
    setDraftMerch(updated);
    persistDraft(updated, draftConfig);
  };

  const updateItem = (id: string, patch: Partial<MerchItem>) => {
    const updated = draftMerch.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setDraftMerch(updated);
    persistDraft(updated, draftConfig);
  };

  const saveNow = async () => {
    setSaving(true);
    try {
      persistDraft(draftMerch, draftConfig);
      if (props.onSave) await props.onSave({ merch: draftMerch, config: draftConfig });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const cfg = props.config;

  return (
    <section id={id} className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow={cfg.eyebrow ?? "Store"}
          title={cfg.title ?? "Merch that matches the era."}
          desc={cfg.desc ?? "Official drops and limited pieces."}
          right={
            <div className="flex flex-wrap gap-2">
              {props.editable ? (
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
              ) : null}
              <Button
                variant="secondary"
                href={cfg.storeHref ?? "#"}
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
              >
                Open store
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {props.merch.map((m) => (
            <MerchCard key={m.id} item={m} />
          ))}
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

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge>Items</Badge>
                <Badge>{draftMerch.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={addItem}>
                  Add item
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                    } catch {}
                    setDraftMerch(props.merch);
                    setDraftConfig(props.config);
                  }}
                >
                  Reset draft
                </Button>
              </div>
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
                      onClick={() => removeItem(m.id)}
                      className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      aria-label="Remove"
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
                      <span className="text-xs uppercase tracking-widest text-white/60">Price</span>
                      <input
                        value={m.price ?? ""}
                        onChange={(e) => updateItem(m.id, { price: e.target.value })}
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
