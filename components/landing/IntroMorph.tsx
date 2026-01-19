"use client";

import React, { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroSection as HeroStage } from "./HeroStage";


gsap.registerPlugin(ScrollTrigger);

export default function IntroMorph() {
  const prefersReduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayImgRef = useRef<HTMLDivElement | null>(null);
  const overlayCopyRef = useRef<HTMLDivElement | null>(null);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const didRefreshRef = useRef(false);

  useLayoutEffect(() => {
    if (!sectionRef.current || !overlayRef.current || !overlayImgRef.current) return;

    if (prefersReduced) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current!, { opacity: 1, y: 0, pointerEvents: "auto" });
      gsap.set(overlayImgRef.current!, { scale: 1 });
      if (overlayCopyRef.current) gsap.set(overlayCopyRef.current, { opacity: 1, y: 0 });
      if (navRef.current) gsap.set(navRef.current, { opacity: 1 });

      const scrollDist = isMobile ? 320 : 430;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${scrollDist}`,
          scrub: isMobile ? 0.3 : 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (overlayRef.current) {
              overlayRef.current.style.pointerEvents = self.progress > 0.45 ? "none" : "auto";
            }
          },
        },
      });

      // Overlay slides UP to reveal hero (TOP -> BOTTOM reveal)
      tl.to(
        overlayRef.current!,
        {
          y: "-100%",
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      // Cinematic zoom on the overlay image
      tl.to(
        overlayImgRef.current!,
        {
          scale: 1.06,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      // Copy fades out quickly
      if (overlayCopyRef.current) {
        tl.to(
          overlayCopyRef.current,
          {
            opacity: 0,
            y: "-60px",
            duration: 0.6,
            ease: "power2.out",
          },
          0
        );
      }

      // Nav fades
      if (navRef.current) {
        tl.to(
          navRef.current,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          0
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  const refreshST = () => {
    if (prefersReduced) return;
    if (didRefreshRef.current) return;
    didRefreshRef.current = true;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <section
      ref={(n) => {
        sectionRef.current = n;
      }}
      className="introPin relative overflow-hidden bg-[#07080C]"
      style={{ minHeight: "100svh" }}
      aria-label="Intro reveal"
    >
      {/* HERO UNDERLAYER - Always visible behind overlay */}
      <div ref={heroContainerRef} className="absolute inset-0 z-0">
        <HeroStage />
      </div>

      {/* INTRO OVERLAY */}
      <div
        ref={(n) => {
          overlayRef.current = n;
        }}
        className="introOverlay absolute inset-0 z-10"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Background Image */}
        <div
          ref={(n) => {
            overlayImgRef.current = n;
          }}
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/Pictures/yarden3.png"
            alt="Yarden"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[0.88] contrast-[1.08] saturate-[1.05]"
            onLoadingComplete={refreshST}
          />

          {/* Dark cinematic grade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_30%_18%,rgba(255,210,0,0.18),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.42))]" />

          {/* Subtle grid texture (self-contained) */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Grain (uses your existing .grain class) */}
          <div className="absolute inset-0 grain opacity-[0.06] hidden sm:block" />
        </div>

        {/* NAV (minimal so it doesn't duplicate HeroStage) */}
        <div ref={navRef} className="absolute left-0 right-0 top-0 z-30">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <span className="text-xl sm:text-2xl font-black text-white transition-transform duration-200 group-hover:scale-110">
                ☥
              </span>
              <span className="text-xs sm:text-sm font-extrabold tracking-[0.18em] text-white/80">
                YARDEN
              </span>
            </Link>

            {/* Optional: a clean “Skip” that doesn't fight the morph */}
            <a
              href="#top"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-extrabold tracking-[0.18em] text-white/70 hover:bg-white/7 hover:text-white transition"
            >
              SKIP INTRO <span className="text-white/50">↗</span>
            </a>

            <button
              type="button"
              className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full bg-white/5 text-white/90 border border-white/10"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>

        {/* HERO COPY (minimal teaser; NOT repeating HeroStage info) */}
        <div
          ref={overlayCopyRef}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-end px-4 pb-10 sm:px-6 sm:pb-14 md:px-10 md:pb-20"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
            {/* Chips: short + iconic */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="rounded-full bg-white/5 border border-white/10 text-white/85 text-[10px] sm:text-xs font-bold px-3 py-2">
                Official
              </span>
              <span className="rounded-full bg-[#FFD200]/10 border border-[#FFD200]/20 text-[#FFD200] text-[10px] sm:text-xs font-bold px-3 py-2">
                The One Who Descends
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] sm:text-xs font-bold px-3 py-2">
                Lagos • Afrobeats
              </span>
            </div>

            {/* Superstar headline */}
            <h1 className="title-hero text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-[-0.05em] font-black">
              Yarden
            </h1>

            {/* One clean line — entrance instruction */}
            <p className="max-w-xl text-sm sm:text-base md:text-lg font-medium text-white/65 leading-relaxed">
              Enter the official experience.
              <span className="font-extrabold text-white"> Scroll.</span>
            </p>

            {/* Micro CTA row: doesn’t copy HeroStage’s button set */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href="#pass"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD200] text-black px-6 py-3 text-sm sm:text-base font-extrabold hover:brightness-[0.98] transition"
              >
                VIP Pass <span className="text-base sm:text-lg">☥</span>
              </a>
              <a
                href="#music"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-white px-6 py-3 text-sm sm:text-base font-extrabold hover:bg-white/7 transition"
              >
                Listen <span className="text-base sm:text-lg">↗</span>
              </a>
            </div>

            {/* Scroll hint */}
            <div className="hidden sm:flex items-center gap-3 pt-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-10 rounded-full border-2 border-white/15 flex justify-center pt-2">
                  <div className="w-1.5 h-3 bg-white/30 rounded-full animate-bounce" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.18em] text-white/35 uppercase">
                Scroll to reveal
              </p>
            </div>
          </div>
        </div>

        {/* Bottom gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
