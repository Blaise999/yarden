"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import {
  Badge,
  Button,
  Card,
  MiniInput,
  MiniSelect,
  Modal,
  Pill,
  SectionHeader,
  cx,
  IconArrowUpRight,
  IconAnkh,
  IconPlay,
  IconClose,
} from "./ui";

export type PressItem = {
  id?: string;
  title: string;
  outlet: string;
  date: string;
  href: string;
  image: string;
  tag?: string;
  excerpt?: string;
};

export type EmbedVideo = {
  id?: string;
  title: string;
  meta?: string;
  youtubeId: string;
  href?: string;
};

export type NewsletterPayload = {
  email: string;
  city?: string;
  interest?: string;
};

const STORAGE_KEY = "yarden:newsletter:draft:v1";

const DEFAULT_PRESS: PressItem[] = [
  {
    id: "wonderland-interview",
    title: 'Yarden talks debut EP “The One Who Descends”',
    outlet: "Wonderland Magazine",
    date: "Dec 1, 2023",
    href: "https://www.wonderlandmagazine.com/2023/12/01/yarden/",
    image: "https://media.wonderlandmagazine.com/uploads/2023/12/LEAD-yard6-scaled.jpg",
    tag: "Interview",
    excerpt: "A quick window into the EP’s mood, meaning, and process.",
  },
  {
    id: "culturecustodian-news",
    title: "Yarden shares debut EP “The One Who Descends”",
    outlet: "Culture Custodian",
    date: "Dec 2023",
    href: "https://culturecustodian.com/yarden-shares-debut-ep-the-one-who-descends/",
    image:
      "https://i0.wp.com/culturecustodian.com/wp-content/uploads/2023/12/yard2-scaled.jpg?fit=819%2C1024&ssl=1",
    tag: "News",
    excerpt: "A tight write-up on the debut project and the story behind it.",
  },
  {
    id: "turntable-feature",
    title: "Best of New Music: debut EP + new single “TIME”",
    outlet: "TurnTable Charts",
    date: "Dec 5, 2023",
    href: "https://www.turntablecharts.com/news/1175",
    image: "https://ttcfilestorage.blob.core.windows.net/files-2022/TTC_638373737052040596.jpeg",
    tag: "Feature",
    excerpt: "A clean intro for new listeners — what to play first.",
  },
  {
    id: "pulse-press",
    title: "EP drops alongside the single “Time”",
    outlet: "Pulse Nigeria",
    date: "Dec 4, 2023",
    href: "https://www.pulse.ng/story/yarden-drops-the-one-who-descends-ep-alongside-the-new-single-time-2024072621214515034",
    image:
      "https://image.api.sportal365.com/process/smp-images-production/pulse.ng/26072024/8fbde703-9a86-4aca-aff0-49d90c576d96",
    tag: "Press",
    excerpt: "Quick coverage that’s easy to share when people ask “who’s that?”",
  },
  {
    id: "youtube-channel",
    title: "Official YouTube channel (videos + releases)",
    outlet: "YouTube",
    date: "Official",
    href: "https://www.youtube.com/@thisisyarden",
    image:
      "https://www.gstatic.com/marketing-cms/assets/images/08/25/fffdc76145f28be3a1ca63859c4a/external-logo-core-1.png=n-w1860-h1047-fcrop64=1,00000000ffffffff-rw",
    tag: "Watch",
    excerpt: "All official videos in one place.",
  },
];

const DEFAULT_VIDEOS: EmbedVideo[] = [
  {
    id: "wetin",
    title: "Wetin (Official Video)",
    meta: "Watch here",
    youtubeId: "9lT3tKmYLO8",
    href: "https://www.youtube.com/watch?v=9lT3tKmYLO8",
  },
  {
    id: "time",
    title: "Time (Visual / Film)",
    meta: "Watch here",
    youtubeId: "pNcM1elCxTA",
    href: "https://www.youtube.com/watch?v=pNcM1elCxTA",
  },
];

function uid(prefix: string) {
  try {
    // @ts-ignore
    const u = crypto?.randomUUID?.();
    return u ? `${prefix}_${u}` : `${prefix}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `${prefix}_${Math.random().toString(16).slice(2)}`;
  }
}

function normalizePress(items: PressItem[]) {
  return items.map((p) => ({ ...p, id: p.id ?? uid("press") }));
}

function normalizeVideos(items: EmbedVideo[]) {
  return items.map((v) => ({ ...v, id: v.id ?? uid("vid") }));
}

function CoverImage(props: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={props.src}
      alt={props.alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cx("absolute inset-0 h-full w-full object-cover", props.className)}
    />
  );
}

function SpotlightWrap({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const x = useSpring(mx, { stiffness: 160, damping: 26, mass: 0.25 });
  const y = useSpring(my, { stiffness: 160, damping: 26, mass: 0.25 });

  const a = useMotionValue(0);
  const alpha = useSpring(a, { stiffness: 220, damping: 30, mass: 0.3 });

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(255,255,255,0.11), transparent 62%)`;

  return (
    <motion.div
      onPointerEnter={() => {
        if (disabled) return;
        a.set(1);
      }}
      onPointerLeave={() => {
        if (disabled) return;
        a.set(0);
      }}
      onPointerMove={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLDivElement;
        const r = el.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className="relative"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: spotlight as any,
          opacity: disabled ? 0 : (alpha as any),
        }}
      />
      {children}
    </motion.div>
  );
}

export function NewsletterSection(props: {
  pressItems?: PressItem[];
  videos?: EmbedVideo[];
  backgroundImage?: string;
  onSubmit?: (payload: NewsletterPayload) => Promise<void> | void;

  editable?: boolean;
  onSave?: (payload: {
    pressItems: PressItem[];
    videos: EmbedVideo[];
    backgroundImage: string;
  }) => Promise<void> | void;
}) {
  // ✅ FIX: normalize boolean|null -> boolean
  const reduced = useReducedMotion() ?? false;

  const rootRef = useRef<HTMLElement | null>(null);

  const basePress = useMemo(
    () => normalizePress(props.pressItems ?? DEFAULT_PRESS),
    [props.pressItems]
  );
  const baseVideos = useMemo(
    () => normalizeVideos(props.videos ?? DEFAULT_VIDEOS),
    [props.videos]
  );
  const baseBg = props.backgroundImage ?? DEFAULT_PRESS[0].image;

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftPress, setDraftPress] = useState<PressItem[]>(basePress);
  const [draftVideos, setDraftVideos] = useState<EmbedVideo[]>(baseVideos);
  const [draftBg, setDraftBg] = useState<string>(baseBg);

  const pressItems = props.editable ? draftPress : basePress;
  const videos = props.editable ? draftVideos : baseVideos;
  const bg = props.editable ? draftBg : baseBg;

  useEffect(() => {
    if (!props.editable) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.pressItems && parsed?.videos && parsed?.backgroundImage) {
        setDraftPress(normalizePress(parsed.pressItems));
        setDraftVideos(normalizeVideos(parsed.videos));
        setDraftBg(String(parsed.backgroundImage));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editable]);

  useEffect(() => {
    if (!props.editable) return;
    if (editOpen) return;
    setDraftPress(basePress);
    setDraftVideos(baseVideos);
    setDraftBg(baseBg);
  }, [props.editable, editOpen, basePress, baseVideos, baseBg]);

  const persistDraft = (nextPress: PressItem[], nextVideos: EmbedVideo[], nextBg: string) => {
    if (!props.editable) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pressItems: nextPress,
          videos: nextVideos,
          backgroundImage: nextBg,
          updatedAt: Date.now(),
        })
      );
    } catch {}
  };

  const updatePress = (id: string, patch: Partial<PressItem>) => {
    const next = draftPress.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setDraftPress(next);
    persistDraft(next, draftVideos, draftBg);
  };

  const addPress = () => {
    const nextItem: PressItem = {
      id: uid("press"),
      title: "New link",
      outlet: "Outlet",
      date: "—",
      href: "https://",
      image: DEFAULT_PRESS[0].image,
      tag: "Link",
      excerpt: "",
    };
    const next = [nextItem, ...draftPress];
    setDraftPress(next);
    persistDraft(next, draftVideos, draftBg);
  };

  const removePress = (id: string) => {
    const next = draftPress.filter((p) => p.id !== id);
    setDraftPress(next);
    persistDraft(next, draftVideos, draftBg);
  };

  const updateVideo = (id: string, patch: Partial<EmbedVideo>) => {
    const next = draftVideos.map((v) => (v.id === id ? { ...v, ...patch } : v));
    setDraftVideos(next);
    persistDraft(draftPress, next, draftBg);
  };

  const addVideo = () => {
    const nextItem: EmbedVideo = {
      id: uid("vid"),
      title: "New video",
      meta: "Video",
      youtubeId: "",
      href: "https://www.youtube.com/watch?v=",
    };
    const next = [nextItem, ...draftVideos];
    setDraftVideos(next);
    persistDraft(draftPress, next, draftBg);
  };

  const removeVideo = (id: string) => {
    const next = draftVideos.filter((v) => v.id !== id);
    setDraftVideos(next);
    persistDraft(draftPress, next, draftBg);
  };

  const resetDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setDraftPress(basePress);
    setDraftVideos(baseVideos);
    setDraftBg(baseBg);
  };

  const saveNow = async () => {
    setSaving(true);
    try {
      persistDraft(draftPress, draftVideos, draftBg);
      if (props.onSave) {
        await props.onSave({
          pressItems: draftPress,
          videos: draftVideos,
          backgroundImage: draftBg,
        });
      }
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState("Music + Visuals");

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (reduced) return;
    let ctx: any;

    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;

        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-press-card]");
          if (!cards.length) return;

          gsap.set(cards, { y: 18, opacity: 0 });

          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: "[data-press-grid]",
              start: "top 80%",
              end: "bottom 60%",
              toggleActions: "play none none reverse",
            },
          });
        }, rootRef);
      } catch {}
    })();

    return () => {
      try {
        ctx?.revert?.();
      } catch {}
    };
  }, [reduced]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const em = email.trim();
    if (!em || !em.includes("@") || em.length < 5) {
      setStatus("err");
      setMsg("Enter a real email address.");
      return;
    }

    setStatus("loading");
    try {
      await props.onSubmit?.({ email: em, city: city.trim() || undefined, interest });
      if (!props.onSubmit) await new Promise((r) => setTimeout(r, 450));

      setStatus("ok");
      setMsg("You’re in.");
      setEmail("");
      setCity("");
      setInterest("Music + Visuals");
    } catch {
      setStatus("err");
      setMsg("Couldn’t submit right now. Try again.");
    }
  }

  return (
    <section id="newsletter" ref={rootRef as any} className="relative py-20 md:py-24">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.09),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SpotlightWrap disabled={reduced}>
          <SectionHeader
            eyebrow="Sign up"
            title="Get the next drop first."
            desc="Links, visuals, and show notes — sent when it matters."
            right={
              <div className="flex flex-wrap gap-2">
                {props.editable ? (
                  <Button variant="secondary" onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                ) : null}

                <Button
                  variant="secondary"
                  href="https://www.youtube.com/@thisisyarden"
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  YouTube
                </Button>
                <Button
                  variant="ghost"
                  href="https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd"
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  Spotify
                </Button>
              </div>
            }
          />

          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconAnkh className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Press & News</div>
                  </div>
                  <Pill tone="muted">{pressItems.length} links</Pill>
                </div>

                <div data-press-grid className="mt-6 grid gap-4 sm:grid-cols-2">
                  {pressItems.map((p, idx) => {
                    const key = p.id ?? p.href ?? String(idx);
                    return (
                      <Link
                        key={key}
                        href={p.href}
                        target="_blank"
                        rel="noreferrer"
                        data-press-card
                        className={cx(
                          "group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10",
                          "hover:bg-white/[0.05] transition"
                        )}
                        aria-label={`Open: ${p.title}`}
                      >
                        <div className="relative aspect-[16/10]">
                          <CoverImage
                            src={p.image}
                            alt={`${p.outlet} cover`}
                            className={cx(!reduced && "transition-transform duration-500 group-hover:scale-[1.03]")}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                          {!reduced ? (
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                              <div
                                className={cx(
                                  "absolute -left-[70%] top-[-20%] h-[140%] w-[45%] rotate-[18deg]",
                                  "bg-gradient-to-r from-transparent via-white/18 to-transparent",
                                  "blur-[2px] opacity-0 transition-all duration-700 ease-out",
                                  "group-hover:opacity-100 group-hover:translate-x-[260%]"
                                )}
                              />
                            </div>
                          ) : null}

                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            {p.tag ? <Pill tone="brand">{p.tag}</Pill> : null}
                            <Pill tone="muted">{p.outlet}</Pill>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4">
                            <div className="text-xs uppercase tracking-[0.28em] text-white/60">{p.date}</div>
                            <div className="mt-1 text-base font-semibold text-white">{p.title}</div>
                          </div>
                        </div>

                        <div className="p-5">
                          {p.excerpt ? <div className="text-sm text-white/60">{p.excerpt}</div> : null}
                          <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                            <span>Read</span>
                            <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge>Curated</Badge>
                  <Badge>Shareable</Badge>
                  <Badge>Fast</Badge>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconPlay className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Watch here</div>
                  </div>
                  <Button
                    variant="ghost"
                    href="https://www.youtube.com/@thisisyarden"
                    target="_blank"
                    className="px-4 py-2"
                    iconRight={<IconArrowUpRight className="h-4 w-4" />}
                  >
                    Channel
                  </Button>
                </div>

                <div className="mt-6 grid gap-4">
                  {videos.slice(0, 2).map((v, idx) => {
                    const key = v.id ?? v.youtubeId ?? String(idx);
                    return (
                      <div
                        key={key}
                        className={cx(
                          "group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10",
                          "hover:bg-white/[0.05] transition"
                        )}
                      >
                        <div className="relative aspect-video">
                          <iframe
                            className="absolute inset-0 h-full w-full"
                            src={`https://www.youtube.com/embed/${v.youtubeId}?rel=0&modestbranding=1`}
                            title={v.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                          {!reduced ? (
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                              <div
                                className={cx(
                                  "absolute -left-[70%] top-[-20%] h-[140%] w-[45%] rotate-[18deg]",
                                  "bg-gradient-to-r from-transparent via-white/14 to-transparent",
                                  "blur-[2px] opacity-0 transition-all duration-700 ease-out",
                                  "group-hover:opacity-100 group-hover:translate-x-[260%]"
                                )}
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className="p-5">
                          <div className="text-xs uppercase tracking-widest text-white/60">{v.meta ?? "Video"}</div>
                          <div className="mt-2 text-base font-semibold text-white">{v.title}</div>
                          {v.href ? (
                            <div className="mt-3">
                              <Button
                                variant="secondary"
                                href={v.href}
                                target="_blank"
                                className="px-4 py-2"
                                iconRight={<IconArrowUpRight className="h-4 w-4" />}
                              >
                                Open on YouTube
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconAnkh className="h-4 w-4" />
                    <div className="text-xs uppercase tracking-widest">Stay longer</div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    When the video is right here, people stick around.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                <div className="p-7 md:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Early links</Badge>
                    <Badge>Show alerts</Badge>
                    <Badge>Merch drops</Badge>
                  </div>

                  <form className="mt-8 grid gap-4" onSubmit={submit}>
                    <MiniInput
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={setEmail}
                      type="email"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <MiniInput label="City" placeholder="Lagos" value={city} onChange={setCity} />
                      <MiniSelect
                        label="Interest"
                        value={interest}
                        onChange={setInterest}
                        options={[
                          { label: "Music + Visuals", value: "Music + Visuals" },
                          { label: "Tour alerts", value: "Tour alerts" },
                          { label: "Merch drops", value: "Merch drops" },
                          { label: "All updates", value: "All updates" },
                        ]}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Button variant="primary" type="submit">
                        {status === "loading" ? "Joining..." : "Join list"}
                      </Button>
                      <span className="text-xs text-white/50">No spam.</span>
                    </div>

                    {msg ? (
                      <div
                        className={cx(
                          "mt-2 rounded-2xl p-4 ring-1",
                          status === "ok" && "bg-emerald-500/10 ring-emerald-300/20 text-emerald-50",
                          status === "err" && "bg-rose-500/10 ring-rose-300/20 text-rose-50",
                          status !== "ok" && status !== "err" && "bg-white/[0.04] ring-white/10 text-white/80"
                        )}
                      >
                        <div className="text-sm">{msg}</div>
                      </div>
                    ) : null}
                  </form>
                </div>

                <div className="relative min-h-[320px]">
                  <CoverImage src={bg} alt="Newsletter background" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {!reduced ? (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div
                        className={cx(
                          "absolute -left-[70%] top-[-25%] h-[150%] w-[50%] rotate-[18deg]",
                          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                          "blur-[3px] opacity-0 transition-all duration-700 ease-out",
                          "hover:opacity-100 hover:translate-x-[260%]"
                        )}
                      />
                    </div>
                  ) : null}

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="rounded-3xl bg-black/45 p-6 ring-1 ring-white/10 backdrop-blur-xl">
                      <div className="text-xs uppercase tracking-[0.28em] text-white/60">Next drop</div>
                      <div className="mt-2 text-lg font-semibold">Stay in the loop.</div>
                      <p className="mt-2 text-sm text-white/60">Drops, moments, tickets.</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          href="https://www.instagram.com/thisisyarden/"
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-4 w-4" />}
                        >
                          Instagram
                        </Button>
                        <Button
                          variant="ghost"
                          href="https://x.com/thisisyarden"
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-4 w-4" />}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Modal open={!!props.editable && editOpen} onClose={() => setEditOpen(false)} title="Edit newsletter">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-widest text-white/60">Background image</div>
                  <Button variant="ghost" onClick={resetDraft} className="px-4 py-2">
                    Reset
                  </Button>
                </div>

                <input
                  value={draftBg}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDraftBg(next);
                    persistDraft(draftPress, draftVideos, next);
                  }}
                  placeholder="https://..."
                  className={cx(
                    "w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                    "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Pill tone="muted">Press</Pill>
                  <Badge>{draftPress.length}</Badge>
                </div>
                <Button variant="secondary" onClick={addPress}>
                  Add
                </Button>
              </div>

              <div className="grid gap-3">
                {draftPress.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.tag ? <Pill tone="brand">{p.tag}</Pill> : <Pill tone="muted">Press</Pill>}
                        <Pill tone="muted">{p.outlet || "Outlet"}</Pill>
                      </div>
                      <button
                        onClick={() => removePress(String(p.id))}
                        className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                        aria-label="Remove"
                      >
                        <IconClose className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Title</span>
                        <input
                          value={p.title}
                          onChange={(e) => updatePress(String(p.id), { title: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs uppercase tracking-widest text-white/60">Outlet</span>
                        <input
                          value={p.outlet}
                          onChange={(e) => updatePress(String(p.id), { outlet: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs uppercase tracking-widest text-white/60">Date</span>
                        <input
                          value={p.date}
                          onChange={(e) => updatePress(String(p.id), { date: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Link</span>
                        <input
                          value={p.href}
                          onChange={(e) => updatePress(String(p.id), { href: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Image URL</span>
                        <input
                          value={p.image}
                          onChange={(e) => updatePress(String(p.id), { image: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs uppercase tracking-widest text-white/60">Tag</span>
                        <input
                          value={p.tag ?? ""}
                          onChange={(e) => updatePress(String(p.id), { tag: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Excerpt</span>
                        <textarea
                          value={p.excerpt ?? ""}
                          onChange={(e) => updatePress(String(p.id), { excerpt: e.target.value })}
                          rows={3}
                          className={cx(
                            "mt-2 w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Pill tone="muted">Videos</Pill>
                  <Badge>{draftVideos.length}</Badge>
                </div>
                <Button variant="secondary" onClick={addVideo}>
                  Add
                </Button>
              </div>

              <div className="grid gap-3">
                {draftVideos.map((v) => (
                  <div key={v.id} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="muted">Video</Pill>
                        <Pill tone="muted">{v.youtubeId || "YouTube ID"}</Pill>
                      </div>
                      <button
                        onClick={() => removeVideo(String(v.id))}
                        className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                        aria-label="Remove"
                      >
                        <IconClose className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Title</span>
                        <input
                          value={v.title}
                          onChange={(e) => updateVideo(String(v.id), { title: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs uppercase tracking-widest text-white/60">Meta</span>
                        <input
                          value={v.meta ?? ""}
                          onChange={(e) => updateVideo(String(v.id), { meta: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs uppercase tracking-widest text-white/60">YouTube ID</span>
                        <input
                          value={v.youtubeId}
                          onChange={(e) => updateVideo(String(v.id), { youtubeId: e.target.value })}
                          placeholder="9lT3tKmYLO8"
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
                            "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
                          )}
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="text-xs uppercase tracking-widest text-white/60">Link (optional)</span>
                        <input
                          value={v.href ?? ""}
                          onChange={(e) => updateVideo(String(v.id), { href: e.target.value })}
                          className={cx(
                            "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
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

                <div className="flex flex-wrap gap-2">
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
        </SpotlightWrap>
      </div>
    </section>
  );
}
