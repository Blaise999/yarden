"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticLink } from "./atoms";

gsap.registerPlugin(ScrollTrigger);

type SpotlightCard = {
  title: string;
  tag: string;
  blurb: string;
  meta: string;
  icon: string;
  href?: string;
};

export default function LockedFeedSection() {
  // Keeping name + id="feed" so your nav anchors don’t break.
  // This is now a PUBLIC "Spotlight" section. Locked feed will be a separate page later.

  const prefersReduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const marqueeInnerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const scanRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const didLenisRef = useRef(false);

  const ticker = useMemo(
    () => [
      "New Music",
      "Official Video",
      "Tour Dates",
      "Behind The Scenes",
      "Live Sessions",
      "Merch Drops",
      "Press & Features",
      "Fan Moments",
    ],
    []
  );

  const cards = useMemo<SpotlightCard[]>(
    () => [
      {
        title: "New release",
        tag: "MUSIC",
        blurb:
          "Fresh records, official links, and the story behind the sound — all in one place.",
        meta: "Updated weekly • Official",
        icon: "🎧",
        href: "#music",
      },
      {
        title: "Video premiere",
        tag: "VISUALS",
        blurb:
          "Official visuals, teasers, and premiere announcements — clean, cinematic, no clutter.",
        meta: "Premieres • BTS • Clips",
        icon: "🎬",
        href: "#videos",
      },
      {
        title: "Tour / shows",
        tag: "LIVE",
        blurb:
          "City drops, ticket portals, and show-night info — so fans never miss a moment.",
        meta: "Dates • Venues • Tickets",
        icon: "🎟️",
        href: "#tickets",
      },
      {
        title: "Studio diary",
        tag: "PROCESS",
        blurb:
          "Short notes from the creative process — what’s coming, what changed, what’s next.",
        meta: "Notes • Demos • Mood",
        icon: "📝",
        href: "#story",
      },
      {
        title: "Merch & drops",
        tag: "MERCH",
        blurb:
          "Limited pieces, drop times, and official announcements — zero fake links.",
        meta: "Limited • Timed • Official",
        icon: "🧥",
        href: "#merch",
      },
      {
        title: "Press & features",
        tag: "MEDIA",
        blurb:
          "Interviews, performances, write-ups, and highlights — curated for fans & partners.",
        meta: "Articles • Interviews",
        icon: "🗞️",
        href: "#press",
      },
    ],
    []
  );

  useLayoutEffect(() => {
    if (prefersReduced) return;

    // Optional Lenis hookup (ONLY if you don’t already run Lenis globally)
    (async () => {
      try {
        if (didLenisRef.current) return;
        didLenisRef.current = true;

        const w = window as any;
        if (w.__yarden_lenis) return;

        const mod = await import("lenis");
        const Lenis = (mod as any).default;
        if (!Lenis) return;

        const lenis = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          smoothTouch: false,
          wheelMultiplier: 1,
        });

        w.__yarden_lenis = lenis;

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch {
        // Lenis not installed: fine.
      }
    })();

    const ctx = gsap.context(() => {
      // Section reveal
      gsap.fromTo(
        sectionRef.current,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Header reveal
      gsap.fromTo(
        headerRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Cards stagger
      gsap.fromTo(
        ".spot-card",
        { y: 28, opacity: 0, rotate: -0.35 },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Feature block
      gsap.fromTo(
        featureRef.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featureRef.current,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // CTA
      gsap.fromTo(
        ctaRef.current,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Marquee
      if (marqueeInnerRef.current && window.innerWidth >= 640) {
        gsap.set(marqueeInnerRef.current, { xPercent: 0 });
        gsap.to(marqueeInnerRef.current, {
          xPercent: -50,
          duration: 18,
          ease: "none",
          repeat: -1,
        });
      }

      // Scanline
      if (scanRef.current) {
        const tl = gsap.timeline({ repeat: -1 });
        tl.fromTo(
          scanRef.current,
          { yPercent: -140, opacity: 0 },
          { yPercent: 140, opacity: 0.35, duration: 2.8, ease: "none" }
        ).to(
          scanRef.current,
          { opacity: 0, duration: 0.25, ease: "power1.out" },
          "-=0.25"
        );
      }

      // Rotating ring
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotate: 360,
          duration: 20,
          ease: "none",
          repeat: -1,
        });
      }

      // Floating orbs
      gsap.utils.toArray<HTMLElement>(".spot-orb").forEach((orb, i) => {
        gsap.to(orb, {
          y: gsap.utils.random(-18, -34),
          x: gsap.utils.random(-10, 12),
          duration: gsap.utils.random(3.8, 6.2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.12,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  const setSpotlight = (x: number, y: number) => {
    const el = sectionRef.current as HTMLElement | null;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const onPointerMove: React.PointerEventHandler<HTMLElement> = (e) => {
    if (prefersReduced) return;
    if (window.innerWidth < 768) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSpotlight(e.clientX - r.left, e.clientY - r.top);
  };

  return (
    <section
      ref={(n) => {
        sectionRef.current = n;
      }}
      id="feed"
      onPointerMove={onPointerMove}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07090D] p-5 sm:p-6 md:p-8 lg:p-10 text-white"
      aria-label="Yarden spotlight"
    >
      {/* Base gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(255,210,0,0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.86))]" />

      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "radial-gradient(280px circle at var(--mx, 50%) var(--my, 30%), rgba(255,210,0,0.18), transparent 62%)",
          opacity: 0.95,
        }}
      />

      {/* Texture layers */}
      <div className="absolute inset-0 micro-grid opacity-[0.06]" />
      <div className="absolute inset-0 grain opacity-[0.06]" />
      <div className="absolute inset-0 vignette-dark opacity-[0.9]" />

      {/* Floating orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="spot-orb absolute left-[8%] top-[18%] h-44 w-44 rounded-full bg-[#FFD200]/[0.06] blur-2xl" />
        <div className="spot-orb absolute right-[10%] top-[22%] h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="spot-orb absolute left-[22%] bottom-[12%] h-64 w-64 rounded-full bg-[#FFD200]/[0.05] blur-3xl" />
      </div>

      {/* Scanline */}
      <div
        ref={scanRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-0"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,210,0,0.18), transparent)",
          filter: "blur(2px)",
          mixBlendMode: "screen",
          willChange: "transform, opacity",
        }}
      />

      {/* Watermark */}
      <div className="absolute -right-16 -top-16 text-[260px] sm:text-[320px] font-black text-white/[0.03] leading-none pointer-events-none">
        ☥
      </div>

      <div className="relative space-y-5 sm:space-y-6 md:space-y-8">
        {/* HEADER */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6"
        >
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/55">
              Spotlight
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.05]">
              Yarden — Official hub.
            </h2>
            <p className="text-sm sm:text-base font-semibold text-white/60 max-w-2xl leading-relaxed">
              The public stage: music, visuals, shows, and highlights — clean,
              premium, and always official.
            </p>
          </div>

          {/* NOW PLAYING box */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:px-5 sm:py-4 self-start shrink-0 w-full sm:w-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(255,210,0,0.12),transparent_60%)]" />
            <div className="absolute inset-0 grain opacity-[0.06]" />

            <div className="relative space-y-2">
              <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/55">
                Now playing
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-white">
                Latest highlight reel
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-white/55 max-w-[260px] leading-relaxed">
                Short previews + official links. The Yard (private) gets its own page next.
              </p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#FFD200]/20 bg-[#FFD200]/10 px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD200] shadow-[0_0_14px_rgba(255,210,0,0.55)] animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#FFD200]">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="absolute inset-0 micro-grid opacity-[0.05]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_50%,rgba(255,210,0,0.12),transparent_55%)]" />

          <div className="relative flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD200] shadow-[0_0_14px_rgba(255,210,0,0.5)]" />
              <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/70">
                STAGE LINE
              </span>
            </span>

            <div className="flex-1 overflow-hidden">
              <div ref={marqueeInnerRef} className="flex w-max items-center gap-6">
                {ticker.concat(ticker).map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-extrabold tracking-[0.18em] uppercase text-white/55"
                  >
                    <span className="text-[#FFD200]/80">☥</span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARDS GRID */}
        <div ref={cardsRef} className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="spot-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,210,0,0.14),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 micro-grid opacity-[0.05]" />
              <div className="absolute inset-0 grain opacity-[0.06]" />

              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-white/50">
                      {c.tag}
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-black text-white">
                      {c.title}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-lg">
                    {c.icon}
                  </div>
                </div>

                <p className="text-[11px] sm:text-sm font-semibold text-white/60 leading-relaxed">
                  {c.blurb}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.18em] uppercase text-white/40">
                    Info
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/55">
                    {c.meta}
                  </span>
                </div>

                {c.href ? (
                  <div className="pt-2">
                    <MagneticLink
                      href={c.href}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-[11px] sm:text-xs font-extrabold text-white hover:bg-white/[0.06] transition"
                    >
                      <span>Open</span>
                      <span className="text-base">↗</span>
                    </MagneticLink>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* FEATURE BLOCK */}
        <div ref={featureRef} className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:col-span-2">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_20%,rgba(255,210,0,0.12),transparent_60%)]" />
            <div className="absolute inset-0 micro-grid opacity-[0.05]" />
            <div className="absolute inset-0 grain opacity-[0.06]" />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/55">
                  Private experience
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-black text-white">
                  The Yard page becomes the members channel.
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white/55 max-w-xl leading-relaxed">
                  Private notes, unreleased previews, presale codes, hidden links —
                  that’s where the locked experience lives. This page stays clean + public.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["Private drops", "Codes & links", "Members-only room"].map((x) => (
                    <span
                      key={x}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] sm:text-xs font-extrabold text-white/70"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD200]/80" />
                      {x}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portal ring */}
              <div className="relative shrink-0 self-start">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                  <div className="absolute inset-0 rounded-full bg-[#FFD200]/10 blur-2xl" />
                  <div
                    ref={ringRef}
                    className="absolute inset-0 rounded-full border border-[#FFD200]/25"
                    style={{
                      background:
                        "conic-gradient(from 180deg, rgba(255,210,0,0.25), rgba(255,255,255,0.08), rgba(255,210,0,0.25))",
                      maskImage: "radial-gradient(circle, transparent 56%, black 58%)",
                      WebkitMaskImage:
                        "radial-gradient(circle, transparent 56%, black 58%)",
                    }}
                  />
                  <div className="absolute inset-[12px] rounded-full border border-white/10 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-[#FFD200]">☥</span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-white/45">
                    Portal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(255,210,0,0.12),transparent_60%)]" />
            <div className="absolute inset-0 grain opacity-[0.06]" />

            <div className="relative space-y-4">
              <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/55">
                Quick actions
              </p>

              <div className="space-y-3">
                {[
                  { n: "01", t: "Listen", d: "Open all platforms." },
                  { n: "02", t: "Watch", d: "Official visuals & premieres." },
                  { n: "03", t: "Join", d: "Enter the Yard (private)." },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-3"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD200]/12 border border-[#FFD200]/20 text-[10px] font-black text-[#FFD200]">
                      {s.n}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        {s.t}
                      </p>
                      <p className="text-[11px] sm:text-xs font-semibold text-white/55">
                        {s.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <MagneticLink
                href="#pass"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD200] text-black px-4 py-3 text-xs sm:text-sm font-extrabold hover:brightness-[0.98] transition"
              >
                <span>Generate Yard Pass</span>
                <span className="text-base">☥</span>
              </MagneticLink>

              <p className="text-[10px] sm:text-xs font-semibold text-white/45">
                Locked feed becomes its own page next.
              </p>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
          <MagneticLink
            href="#pass"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm sm:text-base font-extrabold bg-[#FFD200] text-black hover:brightness-[0.98] transition shadow-[0_30px_90px_rgba(255,210,0,0.18)]"
          >
            <span>Join the Yard</span>
            <span className="text-lg">☥</span>
          </MagneticLink>

          <MagneticLink
            href="#houses"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm sm:text-base font-extrabold border border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.06] transition"
          >
            <span>Pick a House</span>
            <span className="text-lg">↗</span>
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
