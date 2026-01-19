"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import {
  cx,
  usePrefersReducedMotion,
  Pill,
  Button,
  Badge,
  Stat,
  RadialGlow,
  AnchorGrid,
  FloatingCursorSpotlight,
  IconAnkh,
  IconSpark,
  IconArrowUpRight,
  IconPlay,
} from "./ui";

gsap.registerPlugin(ScrollTrigger);

type HeroImage = {
  src: string;
  alt: string;
  focus?: string; // "50% 25%"
};

type NowPlaying = {
  title: string;
  hint?: string;
  href: string;

  official?: {
    spotify?: string;
    apple?: string;
    youtube?: string;
  };

  hintB?: string;
};

export function HeroSection(props: {
  heroA: HeroImage;
  heroB: HeroImage;
  listenHref: string;
  followHref: string;
  onOpenPass: () => void;
  nowPlaying: NowPlaying;

  pinDistance?: number;
  eraLabel?: string;
  headerOffset?: number;
  fullBleed?: boolean;

  headlineA?: string;
  subheadA?: string;
  headlineB?: string;
  subheadB?: string;

  chipsA?: string[];
  chipsB?: string[];

  badgesA?: string[];
  badgesB?: string[];
  statsA?: Array<{ label: string; value: string; hint?: string }>;
  statsB?: Array<{ label: string; value: string; hint?: string }>;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const eraLabel = props.eraLabel ?? "Muse";
  const headerOffset = props.headerOffset ?? 0;
  const fullBleed = props.fullBleed ?? true;

  const [pinDistance, setPinDistance] = useState<number>(() => {
    if (typeof props.pinDistance === "number") return props.pinDistance;
    if (typeof window === "undefined") return 980;
    return window.innerWidth < 768 ? 620 : 980;
  });

  useEffect(() => {
    if (typeof props.pinDistance === "number") {
      setPinDistance(props.pinDistance);
      return;
    }
    const onResize = () => {
      const next = window.innerWidth < 768 ? 620 : 980;
      setPinDistance(next);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [props.pinDistance]);

  // -------- A/B copy --------
  const headlineA = props.headlineA ?? "A clean front door for every drop.";
  const subheadA =
    props.subheadA ??
    "Releases, visuals, show nights, and the pass — built like a world, not a link tree.";

  const headlineB = props.headlineB ?? "Scroll in. The visuals take over.";
  const subheadB =
    props.subheadB ??
    "A richer layer: official videos, moments, and the full catalog — stitched into one home.";

  const chipsA = useMemo(
    () => props.chipsA ?? ["☥ ankh-coded", `${eraLabel} / clean`, "listen first"],
    [props.chipsA, eraLabel]
  );

  const chipsB = useMemo(
    () => props.chipsB ?? ["cinema mode", `${eraLabel} / live`, "members pass"],
    [props.chipsB, eraLabel]
  );

  const badgesA = useMemo(
    () => props.badgesA ?? ["Afrobeats", "Visual-led", "No-noise hub", "Fast + clean"],
    [props.badgesA]
  );

  const badgesB = useMemo(
    () => props.badgesB ?? ["Cinematic drops", "Tour nights", "Full catalog", "Pass access"],
    [props.badgesB]
  );

  const statsA = useMemo(
    () =>
      props.statsA ?? [
        { label: "Era", value: eraLabel, hint: "Current" },
        { label: "Symbol", value: "☥ Ankh", hint: "Signature" },
        { label: "Mode", value: "Clean", hint: "Hero A" },
      ],
    [props.statsA, eraLabel]
  );

  const statsB = useMemo(
    () =>
      props.statsB ?? [
        { label: "Era", value: eraLabel, hint: "Current" },
        { label: "Mode", value: "Cinema", hint: "Hero B" },
        { label: "Access", value: "Pass", hint: "Members" },
      ],
    [props.statsB, eraLabel]
  );

  // -------- refs --------
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const artARef = useRef<HTMLDivElement | null>(null);
  const artBRef = useRef<HTMLDivElement | null>(null);
  const patternRef = useRef<HTMLDivElement | null>(null);

  const revealFxRef = useRef<HTMLDivElement | null>(null);

  const copyARef = useRef<HTMLDivElement | null>(null);
  const copyBRef = useRef<HTMLDivElement | null>(null);
  const chipsARef = useRef<HTMLDivElement | null>(null);
  const chipsBRef = useRef<HTMLDivElement | null>(null);
  const badgesARef = useRef<HTMLDivElement | null>(null);
  const badgesBRef = useRef<HTMLDivElement | null>(null);
  const statsARef = useRef<HTMLDivElement | null>(null);
  const statsBRef = useRef<HTMLDivElement | null>(null);
  const nowARef = useRef<HTMLDivElement | null>(null);
  const nowBRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  // refresh ScrollTrigger when images load
  const [loadedCount, setLoadedCount] = useState(0);
  const loadedAOnce = useRef(false);
  const loadedBOnce = useRef(false);

  useGSAP(
    () => {
      if (reducedMotion) return;

      ScrollTrigger.config({ ignoreMobileResize: true });

      const section = sectionRef.current;
      const pinEl = pinRef.current;
      const media = mediaRef.current;
      const artA = artARef.current;
      const artB = artBRef.current;
      const fx = revealFxRef.current;

      if (!section || !pinEl || !media || !artA || !artB) return;

      ScrollTrigger.getById("hero-pin")?.kill(true);

      const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      const scrub = isMobile ? 0.18 : 0.12;

      // ✅ CHANGE 1: start has NO headerOffset now (keeps hero image behind header perfectly)
      const startStr = "top top";

      // --- initial ---
      gsap.set(pinEl, { willChange: "transform" });

      gsap.set(media, {
        borderRadius: 0,
        scale: 1,
        y: 0,
        transformOrigin: "50% 50%",
        willChange: "transform, border-radius",
      });

      gsap.set(artA, {
        autoAlpha: 1,
        scale: 1.02,
        y: 0,
        force3D: true,
        willChange: "transform, opacity",
      });

      gsap.set(artB, {
        autoAlpha: 1,
        scale: 1.06,
        y: 10,
        force3D: true,
        willChange: "transform, opacity, clip-path",
        clipPath: "circle(0% at 50% 50%)",
        WebkitClipPath: "circle(0% at 50% 50%)",
        backfaceVisibility: "hidden",
      });

      if (patternRef.current) {
        gsap.set(patternRef.current, {
          autoAlpha: 0.08,
          scale: 1,
          rotate: 0,
          transformOrigin: "50% 50%",
          willChange: "transform, opacity",
        });
      }

      if (fx) {
        gsap.set(fx, {
          autoAlpha: 0,
          scale: 1,
          willChange: "transform, opacity, clip-path",
          clipPath: "circle(0% at 50% 50%)",
          WebkitClipPath: "circle(0% at 50% 50%)",
        });
      }

      gsap.set(copyARef.current, { autoAlpha: 1, y: 0 });
      gsap.set(copyBRef.current, { autoAlpha: 0, y: 10 });

      gsap.set(chipsARef.current, { autoAlpha: 1 });
      gsap.set(chipsBRef.current, { autoAlpha: 0 });

      gsap.set(badgesARef.current, { autoAlpha: 1, y: 0 });
      gsap.set(badgesBRef.current, { autoAlpha: 0, y: 10 });

      gsap.set(statsARef.current, { autoAlpha: 1, y: 0 });
      gsap.set(statsBRef.current, { autoAlpha: 0, y: 10 });

      gsap.set(nowARef.current, { autoAlpha: 1, y: 0 });
      gsap.set(nowBRef.current, { autoAlpha: 0, y: 10 });

      gsap.set(rightRef.current, { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        scrollTrigger: {
          id: "hero-pin",
          trigger: section,
          start: startStr,
          end: `+=${pinDistance}`,
          pin: pinEl,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scrub,
          fastScrollEnd: true,
          pinReparent: true,
          ...(isMobile
            ? {}
            : {
                snap: {
                  snapTo: (p: number) => (p < 0.5 ? 0 : 1),
                  duration: { min: 0.08, max: 0.26 },
                  delay: 0.01,
                  ease: "power2.out",
                },
              }),
        },
      });

      const HOLD_A = 0.10;
      const FRAME = 0.14;
      const REVEAL = 0.22;
      const HOLD_B = 0.16;

      tl.to({}, { duration: HOLD_A });

      tl.to(
        media,
        {
          borderRadius: 28,
          scale: 0.986,
          duration: FRAME,
          ease: "power2.out",
          force3D: true,
        },
        ">"
      );

      if (patternRef.current) {
        tl.to(
          patternRef.current,
          { autoAlpha: 0.38, scale: 1.06, rotate: 1.8, duration: FRAME, ease: "power2.out" },
          "<"
        );
      }

      tl.to(
        artA,
        {
          scale: 0.995,
          y: -6,
          duration: REVEAL,
          ease: "power2.out",
        },
        ">"
      );

      tl.to(
        artB,
        {
          clipPath: "circle(165% at 50% 50%)",
          WebkitClipPath: "circle(165% at 50% 50%)",
          scale: 1.0,
          y: 0,
          duration: REVEAL,
          ease: "power2.out",
        },
        "<"
      );

      if (fx) {
        tl.to(
          fx,
          {
            autoAlpha: 1,
            clipPath: "circle(165% at 50% 50%)",
            WebkitClipPath: "circle(165% at 50% 50%)",
            duration: REVEAL * 0.75,
            ease: "power2.out",
          },
          "<+0.02"
        );
        tl.to(
          fx,
          {
            autoAlpha: 0,
            duration: REVEAL * 0.55,
            ease: "power1.out",
          },
          "<+0.14"
        );
      }

      tl.to(copyARef.current, { autoAlpha: 0, y: -12, duration: REVEAL * 0.55, ease: "power2.out" }, "<+0.08");
      tl.to(copyBRef.current, { autoAlpha: 1, y: 0, duration: REVEAL * 0.55, ease: "power2.out" }, "<+0.14");

      tl.to(chipsARef.current, { autoAlpha: 0, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.08");
      tl.to(chipsBRef.current, { autoAlpha: 1, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.14");

      tl.to(badgesARef.current, { autoAlpha: 0, y: -10, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.08");
      tl.to(badgesBRef.current, { autoAlpha: 1, y: 0, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.14");

      tl.to(statsARef.current, { autoAlpha: 0, y: -10, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.08");
      tl.to(statsBRef.current, { autoAlpha: 1, y: 0, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.14");

      tl.to(nowARef.current, { autoAlpha: 0, y: -10, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.08");
      tl.to(nowBRef.current, { autoAlpha: 1, y: 0, duration: REVEAL * 0.45, ease: "power2.out" }, "<+0.14");

      tl.to(
        media,
        {
          scale: 0.992,
          duration: 0.18,
          ease: "power2.out",
        },
        ">"
      );

      if (patternRef.current) {
        tl.to(patternRef.current, { rotate: 2.4, autoAlpha: 0.5, duration: 0.18, ease: "power2.out" }, "<");
      }

      tl.to({}, { duration: HOLD_B });
    },
    { scope: rootRef, dependencies: [reducedMotion, pinDistance] }
  );

  useEffect(() => {
    if (reducedMotion) return;
    if (loadedCount < 2) return;

    const raf = requestAnimationFrame(() => {
      setTimeout(() => ScrollTrigger.refresh(), 40);
    });

    return () => cancelAnimationFrame(raf);
  }, [loadedCount, reducedMotion]);

  // ✅ CHANGE 2: keep headerOffset ONLY for foreground text
  const topPad = Math.max(0, headerOffset) + 22;

  return (
    <div ref={rootRef}>
      <section
        ref={sectionRef as any}
        id="hero-pin"
        className={cx("relative overflow-hidden", fullBleed && "w-screen left-1/2 -translate-x-1/2")}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <RadialGlow className="left-[-120px] top-[-120px] h-[520px] w-[520px] bg-white/10 md:h-[620px] md:w-[620px]" />
          <RadialGlow className="right-[-140px] top-[40px] h-[560px] w-[560px] bg-white/8 md:h-[660px] md:w-[660px]" />
          <AnchorGrid />
        </div>

        <div ref={pinRef} className={cx("relative mx-auto w-full", "min-h-[100svh] md:min-h-[820px]")}>
          {/* Media */}
          <div
            ref={mediaRef}
            className={cx(
              "absolute inset-0 overflow-hidden",
              "shadow-[0_50px_140px_rgba(0,0,0,0.78)]",
              "ring-1 ring-white/10"
            )}
          >
            <FloatingCursorSpotlight disabled={reducedMotion} />

            {/* Pattern */}
            <div
              ref={patternRef}
              className={cx("pointer-events-none absolute inset-0 mix-blend-overlay opacity-0")}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 18% 18%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 40%),
                  radial-gradient(circle at 82% 28%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 46%),
                  repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 16px),
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 22px)
                `,
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 72%)",
                maskImage:
                  "radial-gradient(circle at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 72%)",
              }}
            />

            {/* A (bottom) */}
            <div ref={artARef} className="absolute inset-0">
              <Image
                src={props.heroA.src}
                alt={props.heroA.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: props.heroA.focus ?? "50% 35%" }}
                onLoadingComplete={() => {
                  if (loadedAOnce.current) return;
                  loadedAOnce.current = true;
                  setLoadedCount((c) => c + 1);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/22 to-black/8" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
            </div>

            {/* B (top) — revealed via clip-path circle */}
            <div
              ref={artBRef}
              className="absolute inset-0"
              style={{
                clipPath: reducedMotion ? undefined : "circle(0% at 50% 50%)",
                WebkitClipPath: reducedMotion ? undefined : "circle(0% at 50% 50%)",
              }}
            >
              <Image
                src={props.heroB.src}
                alt={props.heroB.alt}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: props.heroB.focus ?? "50% 35%" }}
                onLoadingComplete={() => {
                  if (loadedBOnce.current) return;
                  loadedBOnce.current = true;
                  setLoadedCount((c) => c + 1);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-black/8" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/12 to-transparent" />
            </div>

            {/* Reveal FX */}
            <div
              ref={revealFxRef}
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                clipPath: reducedMotion ? undefined : "circle(0% at 50% 50%)",
                WebkitClipPath: reducedMotion ? undefined : "circle(0% at 50% 50%)",
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 18%, rgba(255,255,255,0.06) 34%, rgba(255,255,255,0) 62%)",
                mixBlendMode: "screen",
                backdropFilter: "blur(10px)",
              }}
            />

            {/* Chips */}
            <div className="pointer-events-none absolute left-4 top-4 right-4 sm:left-5 sm:top-5 md:left-8 md:top-7 md:right-8">
              <div className="relative">
                <div ref={chipsARef} className="flex flex-wrap items-center gap-2">
                  {chipsA.map((t) => (
                    <Pill key={t} tone="muted">
                      {t}
                    </Pill>
                  ))}
                </div>

                <div ref={chipsBRef} className="absolute inset-0 flex flex-wrap items-center gap-2 opacity-0" aria-hidden>
                  {chipsB.map((t) => (
                    <Pill key={t} tone="muted">
                      {t}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>

            {/* Now Playing */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 md:bottom-7 md:left-8 md:right-8">
              <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/12 backdrop-blur-xl">
                <div className="relative">
                  <div ref={nowARef}>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/65">Now playing</div>
                    <div className="mt-1 truncate text-lg font-semibold text-white">{props.nowPlaying.title}</div>
                    <div className="mt-0.5 text-sm text-white/60">{props.nowPlaying.hint ?? "Listen right now"}</div>
                  </div>

                  <div ref={nowBRef} className="absolute inset-0 opacity-0" aria-hidden>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/65">Now watching</div>
                    <div className="mt-1 truncate text-lg font-semibold text-white">{props.nowPlaying.title}</div>
                    <div className="mt-0.5 text-sm text-white/60">
                      {props.nowPlaying.hintB ?? "Watch the official visual"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {props.nowPlaying.official?.spotify ? (
                      <Button variant="ghost" href={props.nowPlaying.official.spotify} target="_blank">
                        Spotify
                      </Button>
                    ) : null}
                    {props.nowPlaying.official?.apple ? (
                      <Button variant="ghost" href={props.nowPlaying.official.apple} target="_blank">
                        Apple Music
                      </Button>
                    ) : null}
                    {props.nowPlaying.official?.youtube ? (
                      <Button variant="ghost" href={props.nowPlaying.official.youtube} target="_blank">
                        YouTube
                      </Button>
                    ) : null}
                  </div>

                  <Button variant="primary" href={props.nowPlaying.href} target="_blank" iconLeft={<IconPlay className="h-5 w-5" />}>
                    Play
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Foreground */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-5 md:px-8" style={{ paddingTop: topPad }}>
            <div className="grid gap-10 pb-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
              {/* Left */}
              <div className="relative">
                <Pill tone="brand" className="uppercase">
                  <IconAnkh className="h-4 w-4" />
                  <span>the yard</span>
                </Pill>

                <div className="relative mt-5 max-w-xl min-h-[180px] md:min-h-[240px]">
                  <div ref={copyARef}>
                    <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
                      {headlineA}
                    </h1>
                    <p className="mt-5 text-pretty text-base leading-relaxed text-white/70 md:text-lg">{subheadA}</p>
                  </div>

                  <div ref={copyBRef} className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>
                    <h2 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
                      {headlineB}
                    </h2>
                    <p className="mt-5 text-pretty text-base leading-relaxed text-white/70 md:text-lg">{subheadB}</p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button variant="primary" href={props.listenHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Listen
                  </Button>

                  <Button variant="secondary" href={props.followHref} target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Follow
                  </Button>

                  <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-4 w-4" />}>
                    Generate Pass
                  </Button>
                </div>

                <div className="mt-10 relative">
                  <div ref={statsARef} className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {statsA.map((s) => (
                      <Stat key={s.label} label={s.label} value={s.value} hint={s.hint} />
                    ))}
                  </div>

                  <div ref={statsBRef} className="absolute inset-0 grid grid-cols-2 gap-3 opacity-0 md:grid-cols-3" aria-hidden>
                    {statsB.map((s) => (
                      <Stat key={s.label} label={s.label} value={s.value} hint={s.hint} />
                    ))}
                  </div>
                </div>

                <div className="mt-10 relative">
                  <div ref={badgesARef} className="flex flex-wrap gap-2">
                    {badgesA.map((b) => (
                      <Badge key={b}>{b}</Badge>
                    ))}
                  </div>

                  <div ref={badgesBRef} className="absolute inset-0 flex flex-wrap gap-2 opacity-0" aria-hidden>
                    {badgesB.map((b) => (
                      <Badge key={b}>{b}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div ref={rightRef} className="relative lg:pt-6">
                <div className="rounded-[28px] bg-white/[0.04] p-5 ring-1 ring-white/12 backdrop-blur-xl">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/60">Inside the hub</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/70">
                    Official drops, videos, show updates — plus the pass. Clean, fast, no noise.
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Pill tone="muted">Releases</Pill>
                    <Pill tone="muted">Videos</Pill>
                    <Pill tone="muted">Tour</Pill>
                    <Pill tone="muted">Pass</Pill>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs text-white/50">
                    <span>Scroll to dissolve</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span>Live</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 hidden text-xs text-white/45 lg:block">
                  Tip: use <span className="text-white/70">heroA.focus</span> /{" "}
                  <span className="text-white/70">heroB.focus</span> to align faces.
                </div>
              </div>
            </div>

            <div className="h-24 md:h-28" />
          </div>
        </div>
      </section>
    </div>
  );
}
