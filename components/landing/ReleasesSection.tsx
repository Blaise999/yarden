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
  label: string; // e.g. "Official smart link", "Apple Music album page"
  href: string; // where you got the link from
};

export type ReleaseItem = {
  title: string;
  subtitle?: string;
  year?: string;

  art: string; // local cover path

  // ✅ cover source (clickable)
  artSourceLabel?: string;
  artSourceHref?: string;

  // (back-compat if you already used it)
  artSource?: string;

  chips?: string[];

  links: PlatformLinks;
  primary?: PlatformKey;

  fanLink?: string;

  linkSource?: LinkSource;
  platformSources?: Partial<Record<PlatformKey, LinkSource>>;
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
              All platforms <span className="text-white/45">(smart link)</span>
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

      // ✅ “cool reveal” = clip-wipe + blur + lift
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

          // cover micro “dezoom”
          batch.forEach((el: any, i: number) => {
            const cover = (el as HTMLElement).querySelector<HTMLElement>("[data-release-cover='true']");
            if (!cover) return;
            gsap.fromTo(
              cover,
              { scale: 1.07 },
              { scale: 1, duration: 0.9, ease: "power3.out", delay: i * 0.04 }
            );
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
          title={props.title ?? "Pick a release. Open it anywhere."}
          desc={
            props.desc ??
            "Covers, context, and links that work — no wrong-app problem. Clean, fast, and sharable."
          }
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

            const coverLabel =
              r.artSourceLabel ||
              r.artSource ||
              `Asset: ${filenameFromPath(r.art)}`;

            const coverHref = r.artSourceHref;

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
              >
                <div className="grid md:grid-cols-[.92fr_1.08fr]">
                  {/* Cover */}
                  <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                    <div data-release-cover="true" className="absolute inset-0">
                      <Image
                        src={r.art}
                        alt={`${r.title} cover`}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/18 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-black/0" />

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

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      {r.year ? <Pill tone="brand">{r.year}</Pill> : null}
                      <Pill tone="muted">Release</Pill>
                    </div>

                    {/* ✅ clickable cover source */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-2xl bg-black/35 p-3 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/60">
                          Cover source
                        </div>

                        {coverHref ? (
                          <Link
                            href={coverHref}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition underline underline-offset-4"
                            title={coverLabel}
                          >
                            <span className="line-clamp-1">{coverLabel}</span>
                            <IconArrowUpRight className="h-3.5 w-3.5 opacity-80" />
                          </Link>
                        ) : (
                          <div className="mt-1 text-xs text-white/70">{coverLabel}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Copy + Links */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {(r.chips ?? []).slice(0, 4).map((c) => (
                        <Badge key={c}>{c}</Badge>
                      ))}
                    </div>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{r.title}</h3>
                    {r.subtitle ? <p className="mt-1 text-sm text-white/60">{r.subtitle}</p> : null}

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        href={primary?.href ?? "#"}
                        target="_blank"
                        iconRight={<IconArrowUpRight className="h-4 w-4" />}
                        disabled={!primary?.href}
                      >
                        {primary ? `Open on ${PLATFORM_LABEL[primary.key]}` : "Links soon"}
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

                    <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                      <div className="text-xs uppercase tracking-widest text-white/60">Quick note</div>
                      <div className="mt-2 text-sm text-white/70">
                        Covers first. One primary CTA. Links that always work.
                      </div>
                    </div>
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
                    <Pill tone="muted">Library</Pill>
                    <Pill tone="ghost">More releases</Pill>
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    {expanded ? "That’s the full list." : "Want the rest of the catalog?"}
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    {expanded
                      ? "Collapse it back to keep the page sharp."
                      : "Singles, features, era drops — same clean layout, same direct links."}
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
