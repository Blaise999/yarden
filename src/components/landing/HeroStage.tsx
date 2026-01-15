"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Caption, MagneticLink, Poster, Stat } from "@/components/landing/atoms";

gsap.registerPlugin(ScrollTrigger);

export type HeroPoster = {
  src: string;
  label: string;
  wide?: boolean;
};

function PhonePosterTile({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/10 ring-1 ring-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.10)] aspect-[4/5]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, 33vw"
        className="object-cover"
      />
      {/* subtle top gloss like your vibe */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)]" />
    </div>
  );
}

export default function HeroStage() {
  const prefersReduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Smooth cursor glow for desktop
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const gx = useSpring(mx, { stiffness: 120, damping: 25, mass: 0.4 });
  const gy = useSpring(my, { stiffness: 120, damping: 25, mass: 0.4 });

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Subtle fade-in for content when it becomes visible
      gsap.from(copyRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });

      gsap.from(visualsRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.from(".stat-item", {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.4,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  const posters = useMemo<HeroPoster[]>(
    () => [
      { src: "/Pictures/yarden1.png", label: "Yarden • Portrait 01" },
      { src: "/Pictures/yarden2.png", label: "Yarden • Portrait 02" },
      { src: "/Pictures/yarden3.png", label: "Yarden • Portrait 03" },
      { src: "/Pictures/yarden4.png", label: "Studio / Wide Cover", wide: true },
    ],
    []
  );

  return (
    <section
      ref={(n) => {
        sectionRef.current = n;
      }}
      onPointerMove={(e) => {
        if (prefersReduced) return;
        if (window.innerWidth < 768) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className="heroStage relative min-h-[100svh] overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, rgba(255, 225, 60, 0.15) 0%, rgba(255, 210, 0, 0.1) 100%)",
      }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 micro-grid opacity-[0.12]" />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 grain opacity-[0.08]" />

      {/* Cursor spotlight - desktop only */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 opacity-50 hidden md:block"
        style={prefersReduced ? undefined : { left: gx, top: gy }}
      >
        <div className="h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(255,210,0,0.18),rgba(255,210,0,0.04)_40%,transparent_70%)] blur-xl" />
      </motion.div>

      {/* Watermark ankh */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-8 sm:-left-12 md:-left-16 top-0 select-none text-[180px] sm:text-[240px] md:text-[300px] font-black text-black/[0.02] leading-none"
      >
        ☥
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-10 md:py-16">
        {/* Top header bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl font-black text-black">☥</span>
            <span className="text-xs sm:text-sm font-bold tracking-[0.15em] text-black/60">
              THE YARD
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#houses" className="nav-link">
              Houses
            </a>
            <a href="#feed" className="nav-link">
              Feed
            </a>
            <a href="#pass" className="nav-link">
              Yard Pass
            </a>
          </div>
        </div>

        {/* Main grid layout */}
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left: Copy */}
          <div ref={copyRef} className="space-y-5 sm:space-y-6 md:space-y-7">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="chip text-[10px] sm:text-xs">THE YARD</span>
              <span className="chip text-[10px] sm:text-xs">Members-only</span>
            </div>

            {/* Headline */}
            <h1 className="title-hero text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black">
              The Yard is a doorway.
              <span className="block text-black/65 mt-1 sm:mt-2">
                Not a feed. Not noise.
              </span>
              <span className="block mt-1 sm:mt-2 relative inline-block">
                First access.
                <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-[2px] sm:h-[3px] bg-black/10 rounded-full" />
              </span>
            </h1>

            {/* Description */}
            <p className="body-text text-sm sm:text-base md:text-lg max-w-lg">
              Pick a house. Generate your Yard Pass. Unlock private updates.
              <span className="font-bold text-black"> Your ID is your entry.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <MagneticLink
                href="#pass"
                className="btn-primary text-sm sm:text-base justify-center"
              >
                <span>Generate Yard Pass</span>
                <span className="text-base sm:text-lg">☥</span>
              </MagneticLink>
              <MagneticLink
                href="#houses"
                className="btn-secondary text-sm sm:text-base justify-center"
              >
                <span>Explore Houses</span>
              </MagneticLink>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4"
            >
              <div className="stat-item">
                <Stat label="ACCESS" value="PRIVATE" />
              </div>
              <div className="stat-item">
                <Stat label="HOUSE" value="CHOSEN" />
              </div>
              <div className="stat-item">
                <Stat label="PASS" value="GENERATED" />
              </div>
            </div>
          </div>

          {/* Right: Visuals */}
          <div ref={visualsRef} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Posters */}
            <div>
              {/* ✅ Phones: guaranteed visible + filled (no collapsing) */}
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                <PhonePosterTile
                  src={posters[0].src}
                  alt={posters[0].label}
                  priority
                />
                <PhonePosterTile src={posters[1].src} alt={posters[1].label} />
                <PhonePosterTile src={posters[2].src} alt={posters[2].label} />
                <PhonePosterTile src={posters[3].src} alt={posters[3].label} />
              </div>

              {/* ✅ sm+ : keep your exact original Poster layout */}
              <div className="hidden sm:grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <Poster src={posters[0].src} label={posters[0].label} priority />
                <Poster src={posters[1].src} label={posters[1].label} />
                <Poster src={posters[2].src} label={posters[2].label} />
                <div className="col-span-2">
                  <Poster src={posters[3].src} label={posters[3].label} wide />
                </div>
              </div>
            </div>

            {/* Captions - desktop only */}
            <div className="hidden sm:grid grid-cols-2 gap-3 md:gap-4">
              <Caption>{posters[0].label}</Caption>
              <Caption>{posters[1].label}</Caption>
              <Caption>{posters[2].label}</Caption>
              <div className="col-span-2">
                <Caption>{posters[3].label}</Caption>
              </div>
            </div>

            {/* Preview Card */}
            <div className="card-ink relative overflow-hidden p-4 sm:p-5 md:p-6 border-glow">
              {/* Decorative ankh */}
              <div className="absolute -right-6 sm:-right-8 -top-6 sm:-top-8 text-[100px] sm:text-[120px] md:text-[140px] font-black text-[rgb(var(--yard-gold))]/[0.06] leading-none pointer-events-none">
                ☥
              </div>

              <div className="relative flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                <div>
                  <p className="label-light text-[10px] sm:text-xs">
                    Yard Pass (Preview)
                  </p>
                  <h3 className="mt-1.5 sm:mt-2 text-base sm:text-lg md:text-xl font-bold">
                    Members-only access.
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-white/55">
                    Generate your ID below.
                  </p>
                </div>

                <div className="status-badge text-[10px] sm:text-xs py-1 px-2 sm:py-1.5 sm:px-3">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-black/30 animate-pulse" />
                  <span>Active</span>
                </div>
              </div>

              {/* ID Preview Bar */}
              <div className="relative mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-[rgb(var(--yard-gold))]/20 bg-black/30 px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-white/55">
                    ID
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider text-white/75">
                    YARD-25-XXXXXXXX
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative mt-2.5 sm:mt-3 h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--yard-gold))]/10">
                  <motion.div
                    className="h-full rounded-full bg-[rgb(var(--yard-gold))]/50"
                    initial={prefersReduced ? { width: "60%" } : { width: "15%" }}
                    animate={{ width: "60%" }}
                    transition={{
                      duration: 1.5,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.5,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
