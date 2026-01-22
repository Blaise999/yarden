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
  Stat,
  Badge,
  RadialGlow,
  AnchorGrid,
  FloatingCursorSpotlight,
  IconAnkh,
  IconSpark,
  IconArrowUpRight,
  IconPlay,
} from "./ui";

gsap.registerPlugin(ScrollTrigger);

type HeroImage = { src: string; alt: string; focus?: string };
type NowPlaying = {
  title: string;
  hint?: string;
  href: string;
  official?: { spotify?: string; apple?: string; youtube?: string };
  hintB?: string;
};

type SocialLink = { label: string; href: string };
type NextShow = { dateLabel: string; city: string; venue: string; href?: string };

export function HeroSection(props: {
  heroA: HeroImage;
  heroB: HeroImage;
  listenHref: string;
  followHref: string;
  onOpenPass: () => void;
  nowPlaying: NowPlaying;

  pinDistance?: number;
  headerOffset?: number;
  fullBleed?: boolean;

  headlineA?: string;
  subheadA?: string;
  headlineB?: string;
  subheadB?: string;

  badgesA?: string[];
  badgesB?: string[];
  statsA?: Array<{ label: string; value: string; hint?: string }>;
  statsB?: Array<{ label: string; value: string; hint?: string }>;

  eraLabel?: string;

  tourHref?: string;
  shopHref?: string;
  videosHref?: string;
  socials?: SocialLink[];
  press?: string[];
  nextShow?: NextShow;
  onJoinNewsletter?: (payload: { email: string }) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const headerOffset = props.headerOffset ?? 0;
  const fullBleed = props.fullBleed ?? true;

  const [pinDistance, setPinDistance] = useState<number>(() => {
    if (typeof props.pinDistance === "number") return props.pinDistance;
    if (typeof window === "undefined") return 1400;
    return window.innerWidth < 768 ? 980 : 1600;
  });

  useEffect(() => {
    if (typeof props.pinDistance === "number") {
      setPinDistance(props.pinDistance);
      return;
    }
    let raf = 0;
    const onResize = () => {
      const next = window.innerWidth < 768 ? 980 : 1600;
      if (pinDistance !== next) {
        setPinDistance(next);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [props.pinDistance, pinDistance]);

  // Scene copy
  const headlineA = props.headlineA ?? "Yarden";
  const subheadA =
    props.subheadA ??
    "Official home for releases, premieres, tour updates, and member access — all in one place.";

  const headlineB = props.headlineB ?? "Visual Archive";
  const subheadB =
    props.subheadB ??
    "Explore the world: official videos, live moments, behind-the-scenes, and the full catalog.";

  const badgesA = useMemo(() => props.badgesA ?? [], [props.badgesA]);
  const badgesB = useMemo(() => props.badgesB ?? [], [props.badgesB]);
  const statsA = useMemo(() => props.statsA ?? [], [props.statsA]);
  const statsB = useMemo(() => props.statsB ?? [], [props.statsB]);

  const socials = useMemo(() => props.socials ?? [], [props.socials]);
  const press = useMemo(() => props.press ?? [], [props.press]);

  const nextShow: NextShow =
    props.nextShow ??
    ({
      dateLabel: "DATES SOON",
      city: "Tour",
      venue: "City drops + ticket links",
      href: props.tourHref,
    } as NextShow);

  const eraLabel = props.eraLabel?.trim();

  // newsletter (optional)
  const [email, setEmail] = useState("");
  const [joinState, setJoinState] = useState<"idle" | "ok">("idle");
  const joinNewsletter = () => {
    const e = email.trim();
    if (!e) return;
    props.onJoinNewsletter?.({ email: e });
    setJoinState("ok");
    window.setTimeout(() => setJoinState("idle"), 1400);
    setEmail("");
  };

  // Refs
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);

  const mediaRef = useRef<HTMLDivElement | null>(null);
  const artARef = useRef<HTMLDivElement | null>(null);
  const artBRef = useRef<HTMLDivElement | null>(null);
  const patternRef = useRef<HTMLDivElement | null>(null);
  const glowFxRef = useRef<HTMLDivElement | null>(null);

  const nowARef = useRef<HTMLDivElement | null>(null);
  const nowBRef = useRef<HTMLDivElement | null>(null);

  const sceneARef = useRef<HTMLDivElement | null>(null);
  const sceneBRef = useRef<HTMLDivElement | null>(null);
  const railARef = useRef<HTMLDivElement | null>(null);
  const railBRef = useRef<HTMLDivElement | null>(null);

  // load tracking
  const [loadedCount, setLoadedCount] = useState(0);
  const loadedAOnce = useRef(false);
  const loadedBOnce = useRef(false);

  const prevProgressRef = useRef(0);

  // ✅ crucial: only build ScrollTrigger AFTER images are loaded (prevents “refresh pop”)
  const mediaReady = reducedMotion || loadedCount >= 2;

  useGSAP(
    () => {
      if (reducedMotion) return;
      if (!mediaReady) return;

      ScrollTrigger.config({ ignoreMobileResize: true });

      const section = sectionRef.current;
      const pinEl = pinRef.current;
      const media = mediaRef.current;
      const artA = artARef.current;
      const artB = artBRef.current;

      const pattern = patternRef.current;
      const glowFx = glowFxRef.current;

      const sceneA = sceneARef.current;
      const sceneB = sceneBRef.current;
      const railA = railARef.current;
      const railB = railBRef.current;

      const nowA = nowARef.current;
      const nowB = nowBRef.current;

      if (
        !section ||
        !pinEl ||
        !media ||
        !artA ||
        !artB ||
        !sceneA ||
        !sceneB ||
        !railA ||
        !railB ||
        !nowA ||
        !nowB
      ) {
        return;
      }

      // Kill prior instance
      ScrollTrigger.getById("hero-pin")?.kill(true);

      // --- anti-flicker / anti-shimmer ---
      gsap.set([media, artA, artB, pattern, glowFx].filter(Boolean), {
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      });

      gsap.set(pinEl, { willChange: "transform", force3D: true });

      // Keep container stable (avoid animating borderRadius — repaints & stutters)
      gsap.set(media, {
        borderRadius: 0,
        scale: 1,
        y: 0,
        x: 0,
        willChange: "transform, opacity",
        force3D: true,
        transformOrigin: "50% 50%",
      });

      // Images
      gsap.set(artA, {
        opacity: 1,
        visibility: "visible",
        scale: 1,
        y: 0,
        x: 0,
        force3D: true,
      });
      gsap.set(artB, {
        opacity: 0,
        visibility: "visible",
        scale: 1.12,
        y: 60,
        x: 0,
        force3D: true,
      });

      if (pattern) gsap.set(pattern, { opacity: 0.18, scale: 1, force3D: true });
      if (glowFx) gsap.set(glowFx, { opacity: 0, scale: 0.92, force3D: true });

      // foreground initial scene A
      gsap.set(sceneA, { opacity: 1, y: 0 });
      gsap.set(sceneB, { opacity: 0, y: 14 });

      gsap.set(railA, { opacity: 1, y: 0 });
      gsap.set(railB, { opacity: 0, y: 14 });

      gsap.set(nowA, { opacity: 1, y: 0 });
      gsap.set(nowB, { opacity: 0, y: 10 });

      // Pointer events (only flip when crossing midpoint — no per-frame gsap.set)
      let inB = false;
      const setInB = (next: boolean) => {
        if (inB === next) return;
        inB = next;
        sceneA.style.pointerEvents = next ? "none" : "auto";
        railA.style.pointerEvents = next ? "none" : "auto";
        sceneB.style.pointerEvents = next ? "auto" : "none";
        railB.style.pointerEvents = next ? "auto" : "none";
      };
      setInB(false);

      // Master timeline (ScrollTrigger drives it directly)
      const masterTL = gsap.timeline({ defaults: { overwrite: "auto" } });

      const transitionStart = 0.45;
      const transitionDuration = 0.25;
      const sf = transitionDuration;

      // Tiny “breathe” (transform only)
      masterTL.to(media, { scale: 0.995, duration: 1, ease: "none" }, 0);

      // Image morph
      masterTL.to(
        artA,
        { opacity: 0, scale: 1.2, y: -60, duration: transitionDuration, ease: "expo.inOut" },
        transitionStart
      );
      masterTL.to(
        artB,
        { opacity: 1, scale: 1, y: 0, duration: transitionDuration, ease: "expo.inOut" },
        transitionStart
      );

      // Pattern
      if (pattern) {
        masterTL.to(
          pattern,
          { opacity: 0.34, scale: 1.1, duration: 0.85 * sf, ease: "expo.out" },
          transitionStart + 0.05 * sf
        );
      }

      // Foreground / rail / now-playing switch
      const switchDur = 0.6 * sf;
      const switchAStart = transitionStart + 0.08 * sf;
      const switchBStart = transitionStart + 0.16 * sf;

      masterTL.to(sceneA, { opacity: 0, y: -12, duration: switchDur, ease: "expo.out" }, switchAStart);
      masterTL.to(sceneB, { opacity: 1, y: 0, duration: switchDur, ease: "expo.out" }, switchBStart);
      masterTL.to(railA, { opacity: 0, y: -12, duration: switchDur, ease: "expo.out" }, switchAStart);
      masterTL.to(railB, { opacity: 1, y: 0, duration: switchDur, ease: "expo.out" }, switchBStart);

      const nowDur = 0.45 * sf;
      const nowAStart = transitionStart + 0.12 * sf;
      const nowBStart = transitionStart + 0.18 * sf;

      masterTL.to(nowA, { opacity: 0, y: -8, duration: nowDur, ease: "power2.out" }, nowAStart);
      masterTL.to(nowB, { opacity: 1, y: 0, duration: nowDur, ease: "power2.out" }, nowBStart);

      const midTransition = transitionStart + transitionDuration / 2;

      // Glow flash (only on crossing midpoint)
      const flash = () => {
        if (!glowFx) return;
        gsap.killTweensOf(glowFx);
        gsap.fromTo(
          glowFx,
          { opacity: 0, scale: 0.92 },
          { opacity: 0.24, scale: 1.12, duration: 0.22, ease: "power2.out" }
        );
        gsap.to(glowFx, { opacity: 0, duration: 0.35, ease: "power2.in", delay: 0.08 });
      };

      ScrollTrigger.create({
        id: "hero-pin",
        trigger: section,

        // ✅ respect sticky header (prevents pin “snap”)
        start: () => `top top+=${headerOffset}`,

        end: () => `+=${pinDistance}`,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        // ✅ smoother + less “hang”
        scrub: 0.7,

        // ✅ let ScrollTrigger drive the timeline
        animation: masterTL,

        // ✅ helps on fast scroll/trackpad
        fastScrollEnd: true,

        // ✅ do NOT force transform pin unless you’re using scrollerProxy/Lenis
        // pinType: "transform",

        // no reparenting (often causes jitter)
        pinReparent: false,

        onUpdate: (self) => {
          const p = self.progress;
          const next = p >= midTransition;

          // pointerEvents only flip on change
          setInB(next);

          // glow only on cross
          if (glowFx) {
            const crossedUp = prevProgressRef.current < midTransition && p >= midTransition;
            const crossedDown = prevProgressRef.current >= midTransition && p < midTransition;
            if (crossedUp || crossedDown) flash();
          }

          prevProgressRef.current = p;
        },

        // ✅ keep UI consistent after refresh (resize/orientation change)
        onRefresh: (self) => {
          const next = self.progress >= midTransition;
          setInB(next);
          prevProgressRef.current = self.progress;
        },

        onRefreshInit: () => {
          gsap.set([media, artA, artB], { x: 0 });
        },
      });

      return () => {
        masterTL.kill();
        ScrollTrigger.getById("hero-pin")?.kill(true);
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, pinDistance, mediaReady, headerOffset] }
  );

  const topPad = Math.max(0, headerOffset) + 24;

  const imageFilter = "contrast(1.14) saturate(1.22) brightness(1.06)";

  return (
    <div ref={rootRef}>
      <section
        ref={sectionRef as any}
        className={cx(
          "relative overflow-hidden",
          // ✅ full-bleed WITHOUT transform (prevents pin jitter)
          fullBleed && "w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]"
        )}
        style={{ isolation: "isolate" }}
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <RadialGlow className="left-[-120px] top-[-120px] h-[520px] w-[520px] bg-white/10 md:h-[620px] md:w-[620px]" />
          <RadialGlow className="right-[-140px] top-[40px] h-[560px] w-[560px] bg-white/8 md:h-[660px] md:w-[660px]" />
          <AnchorGrid />
        </div>

        <div ref={pinRef} className={cx("relative mx-auto w-full", "min-h-[100svh] md:min-h-[860px]")}>
          {/* MEDIA */}
          <div
            ref={mediaRef}
            className={cx(
              "absolute inset-0 overflow-hidden",
              "shadow-[0_40px_100px_rgba(0,0,0,0.75)]",
              "ring-1 ring-white/10"
            )}
          >
            <FloatingCursorSpotlight disabled={reducedMotion} />

            <div
              ref={glowFxRef}
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 48%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 22%, rgba(255,255,255,0.04) 48%, transparent 72%)",
                mixBlendMode: "screen",
              }}
            />

            <div
              ref={patternRef}
              className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18) 0%, transparent 38%),
                  radial-gradient(circle at 85% 25%, rgba(255,255,255,0.14) 0%, transparent 44%),
                  repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 18px),
                  repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 24px)
                `,
                WebkitMaskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 74%)",
                maskImage: "radial-gradient(circle at 50% 35%, black 0%, transparent 74%)",
              }}
            />

            {/* HERO A */}
            <div ref={artARef} className="absolute inset-0">
              <Image
                src={props.heroA.src}
                alt={props.heroA.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{
                  objectPosition: props.heroA.focus ?? "50% 35%",
                  filter: imageFilter,
                }}
                onLoadingComplete={() => {
                  if (!loadedAOnce.current) {
                    loadedAOnce.current = true;
                    setLoadedCount((c) => c + 1);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-black/6" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/08 to-transparent" />
            </div>

            {/* HERO B */}
            <div ref={artBRef} className="absolute inset-0">
              <Image
                src={props.heroB.src}
                alt={props.heroB.alt}
                fill
                sizes="100vw"
                className="object-cover"
                style={{
                  objectPosition: props.heroB.focus ?? "50% 35%",
                  filter: imageFilter,
                }}
                onLoadingComplete={() => {
                  if (!loadedBOnce.current) {
                    loadedBOnce.current = true;
                    setLoadedCount((c) => c + 1);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/28 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/14 to-transparent" />
            </div>

            {/* Bottom “Now / Featured” */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 md:bottom-8 md:left-8 md:right-8">
              <div className="rounded-3xl bg-black/38 p-5 ring-1 ring-white/10 backdrop-blur-xl">
                <div className="relative">
                  <div ref={nowARef}>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/70">Now playing</div>
                    <div className="mt-1.5 truncate text-xl font-semibold text-white md:text-2xl">
                      {props.nowPlaying.title}
                    </div>
                    <div className="mt-1 text-sm text-white/65">{props.nowPlaying.hint ?? "Streaming everywhere"}</div>
                  </div>

                  <div ref={nowBRef} className="absolute inset-0" aria-hidden>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/70">Featured visual</div>
                    <div className="mt-1.5 truncate text-xl font-semibold text-white md:text-2xl">
                      {props.nowPlaying.title}
                    </div>
                    <div className="mt-1 text-sm text-white/65">
                      {props.nowPlaying.hintB ?? "Official video / live moment"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {props.nowPlaying.official?.spotify && (
                      <Button variant="ghost" href={props.nowPlaying.official.spotify} target="_blank">
                        Spotify
                      </Button>
                    )}
                    {props.nowPlaying.official?.apple && (
                      <Button variant="ghost" href={props.nowPlaying.official.apple} target="_blank">
                        Apple Music
                      </Button>
                    )}
                    {props.nowPlaying.official?.youtube && (
                      <Button variant="ghost" href={props.nowPlaying.official.youtube} target="_blank">
                        YouTube
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    href={props.nowPlaying.href}
                    target="_blank"
                    iconLeft={<IconPlay className="h-5 w-5" />}
                  >
                    Play Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FOREGROUND */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-5 md:px-8" style={{ paddingTop: topPad }}>
            <div className="pb-44">
              <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
                {/* LEFT */}
                <div>
                  <Pill tone="brand" className="uppercase tracking-wider">
                    <IconAnkh className="h-4 w-4" />
                    <span>Yarden</span>

                    {eraLabel ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-normal text-white/75 ring-1 ring-white/10">
                        {eraLabel}
                      </span>
                    ) : null}
                  </Pill>

                  <div className="relative mt-8 min-h-[360px]">
                    {/* Scene A */}
                    <div ref={sceneARef}>
                      <h1 className="text-balance text-5xl font-semibold tracking-tighter text-white md:text-7xl">
                        {headlineA}
                      </h1>
                      <p className="mt-6 text-pretty text-lg leading-relaxed text-white/75 md:text-xl">
                        {subheadA}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Button
                          variant="primary"
                          href={props.listenHref}
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Listen
                        </Button>
                        <Button
                          variant="secondary"
                          href={props.followHref}
                          target="_blank"
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Follow
                        </Button>
                        <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-5 w-5" />}>
                          Generate Pass
                        </Button>
                        {props.videosHref && (
                          <Button
                            variant="ghost"
                            href={props.videosHref}
                            iconRight={<IconArrowUpRight className="h-5 w-5" />}
                          >
                            Watch Visuals
                          </Button>
                        )}
                      </div>

                      {(badgesA.length > 0 || statsA.length > 0) && (
                        <div className="mt-10 space-y-4">
                          {badgesA.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {badgesA.map((b) => (
                                <Badge key={b}>{b}</Badge>
                              ))}
                            </div>
                          )}
                          {statsA.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {statsA.map((s) => (
                                <Stat key={s.label} label={s.label} value={s.value} hint={s.hint} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FeatureCard
                          label="Member access"
                          title="Pass perks"
                          body="Early drops, private updates, and limited moments."
                          cta="Generate"
                          onClick={props.onOpenPass}
                        />
                        <FeatureCard
                          label="Premieres"
                          title="Official visuals"
                          body="Cinematic releases, live sessions, and edits."
                          href={props.videosHref ?? props.followHref}
                          cta="Explore"
                        />
                      </div>
                    </div>

                    {/* Scene B */}
                    <div ref={sceneBRef} className="absolute inset-0" aria-hidden>
                      <h2 className="text-balance text-5xl font-semibold tracking-tighter text-white md:text-7xl">
                        {headlineB}
                      </h2>
                      <p className="mt-6 text-pretty text-lg leading-relaxed text-white/75 md:text-xl">
                        {subheadB}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Button
                          variant="primary"
                          href={props.videosHref ?? props.followHref}
                          target={props.videosHref ? undefined : "_blank"}
                          iconRight={<IconArrowUpRight className="h-5 w-5" />}
                        >
                          Enter Archive
                        </Button>
                        {props.tourHref && (
                          <Button
                            variant="secondary"
                            href={props.tourHref}
                            iconRight={<IconArrowUpRight className="h-5 w-5" />}
                          >
                            Tour Feed
                          </Button>
                        )}
                        <Button variant="ghost" onClick={props.onOpenPass} iconLeft={<IconSpark className="h-5 w-5" />}>
                          Unlock Pass
                        </Button>
                      </div>

                      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FeaturePill title="Official videos" body="Music videos, visualizers, live takes, edits." />
                        <FeaturePill title="Catalog" body="Releases with credits, highlights, and context." />
                        <FeaturePill title="Tour moments" body="Live clips, backstage, city drops, updates." />
                        <FeaturePill title="Community" body="Drop alerts + early links straight to you." />
                      </div>

                      <div className="mt-8 rounded-3xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/65">Drop alerts</div>
                        <div className="mt-1 text-[14px] font-semibold text-white">Releases, visuals & tour dates — first.</div>
                        <div className="mt-3 flex w-full gap-2">
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="h-11 w-full rounded-2xl bg-white/10 px-4 text-[13px] text-white placeholder:text-white/45 ring-1 ring-white/10 outline-none focus:ring-white/25"
                          />
                          <button
                            type="button"
                            onClick={joinNewsletter}
                            className={cx(
                              "h-11 shrink-0 rounded-2xl px-4 text-[13px] font-semibold ring-1 transition",
                              // ✅ never go full-white (keeps it readable + not weird)
                              joinState === "ok"
                                ? "bg-white/18 text-white ring-white/25"
                                : "bg-white/12 text-white ring-white/12 hover:bg-white/16"
                            )}
                          >
                            {joinState === "ok" ? "Joined" : "Join"}
                          </button>
                        </div>
                      </div>

                      {(badgesB.length > 0 || statsB.length > 0) && (
                        <div className="mt-10 space-y-4">
                          {badgesB.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {badgesB.map((b) => (
                                <Badge key={b}>{b}</Badge>
                              ))}
                            </div>
                          )}
                          {statsB.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {statsB.map((s) => (
                                <Stat key={s.label} label={s.label} value={s.value} hint={s.hint} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT RAIL */}
                <div className="relative">
                  {/* Rail A */}
                  <div ref={railARef}>
                    <RailCard
                      label="Next show"
                      title={`${nextShow.dateLabel} · ${nextShow.city}`}
                      body={nextShow.venue}
                      href={nextShow.href ?? props.tourHref}
                      cta={nextShow.href || props.tourHref ? "Tickets" : undefined}
                    />
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <RailCard
                        label="Member pass"
                        title="Access perks"
                        body="Drops, private updates, and exclusives."
                        onClick={props.onOpenPass}
                        cta="Generate"
                      />
                      <RailCard
                        label="Merch"
                        title="Official shop"
                        body="Limited pieces and vault items."
                        href={props.shopHref}
                        cta={props.shopHref ? "Shop" : undefined}
                      />
                      <RailCard
                        label="Press kit"
                        title="Bookings + media"
                        body="Press highlights, photos, and contact."
                        href={props.followHref}
                        cta="Open"
                      />
                    </div>

                    {(socials.length > 0 || press.length > 0) && (
                      <div className="mt-4 rounded-3xl bg-black/26 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                        {socials.length > 0 && (
                          <>
                            <div className="text-[11px] uppercase tracking-[0.28em] text-white/65">Socials</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {socials.map((s) => (
                                <Button
                                  key={s.href}
                                  variant="ghost"
                                  href={s.href}
                                  target="_blank"
                                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                                >
                                  {s.label}
                                </Button>
                              ))}
                            </div>
                          </>
                        )}

                        {press.length > 0 && (
                          <>
                            <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/65">Featured in</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {press.map((p) => (
                                <span
                                  key={p}
                                  className="rounded-full bg-white/8 px-3 py-1.5 text-[12px] font-semibold text-white/70 ring-1 ring-white/10"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rail B */}
                  <div ref={railBRef} className="absolute inset-0" aria-hidden>
                    <RailCard
                      label="Archive"
                      title="Visual world"
                      body="Official videos, live moments, and story layers."
                      href={props.videosHref ?? props.followHref}
                      cta="Enter"
                    />
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <RailCard
                        label="Catalog"
                        title="Releases + credits"
                        body="Tracklists, producers, features, highlights."
                        href={props.listenHref}
                        cta="Explore"
                      />
                      <RailCard
                        label="Tour feed"
                        title="Dates + updates"
                        body="Ticket links and city announcements."
                        href={props.tourHref}
                        cta={props.tourHref ? "View" : undefined}
                      />
                      <RailCard
                        label="Join list"
                        title="Drop alerts"
                        body="Premieres, merch drops, private moments."
                        onClick={() => {
                          const el = rootRef.current?.querySelector(
                            "input[placeholder='Email address']"
                          ) as HTMLInputElement | null;
                          el?.focus();
                        }}
                        cta="Join"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RailCard({
  label,
  title,
  body,
  href,
  cta,
  onClick,
}: {
  label: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="rounded-3xl bg-black/26 p-4 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-white">{title}</div>
      <div className="mt-1 text-[12px] leading-relaxed text-white/70">{body}</div>
      {cta ? (
        <div className="mt-3">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/12">
            {cta}
            <IconArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      ) : null}
    </div>
  );

  if (href)
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  return inner;
}

function FeaturePill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-black/26 p-4 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-[13px] font-semibold text-white">{title}</div>
      <div className="mt-1 text-[12px] leading-relaxed text-white/70">{body}</div>
    </div>
  );
}

function FeatureCard({
  label,
  title,
  body,
  cta,
  href,
  onClick,
}: {
  label: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  onClick?: () => void;
}) {
  const card = (
    <div className="relative overflow-hidden rounded-3xl bg-black/30 p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(700px 280px at 12% 18%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(700px 280px at 88% 24%, rgba(255,255,255,0.06), transparent 55%)",
        }}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">{label}</div>
        <div className="mt-1 text-[14px] font-semibold text-white">{title}</div>
        <div className="mt-1 text-[12px] leading-relaxed text-white/70">{body}</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/12">
          {cta}
          <IconArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  if (href)
    return (
      <a href={href} className="block">
        {card}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {card}
      </button>
    );
  return card;
}
