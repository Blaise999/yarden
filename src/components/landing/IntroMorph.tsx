"use client";

import React, { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroStage from "@/components/landing/HeroStage";

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
    if (!sectionRef.current || !overlayRef.current || !overlayImgRef.current || !heroContainerRef.current) return;

    // Reduced motion: skip animation, show hero directly
    if (prefersReduced) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      // The key insight: 
      // - HeroStage stays in place (visible from the start, just covered)
      // - Overlay slides UP and fades, revealing hero from TOP to BOTTOM
      // - This way user sees the top of HeroStage first!

      gsap.set(overlayRef.current!, {
        opacity: 1,
        y: 0,
      });

      gsap.set(overlayImgRef.current!, {
        scale: 1,
      });

      gsap.set(overlayCopyRef.current!, {
        opacity: 1,
        y: 0,
      });

      // Scroll distance for the morph effect
      const scrollDist = isMobile ? 300 : 400;

      // Main timeline - overlay slides UP and fades
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${scrollDist}`,
          scrub: isMobile ? 0.3 : 0.5,
          pin: true, // Pin the section so hero stays visible
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Disable pointer events on overlay once mostly gone
            if (overlayRef.current) {
              overlayRef.current.style.pointerEvents = self.progress > 0.5 ? "none" : "auto";
            }
          },
        },
      });

      // Overlay slides UP (reveals hero from top)
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

      // Slight zoom on image for parallax feel
      tl.to(
        overlayImgRef.current!,
        {
          scale: 1.05,
          duration: 1,
        },
        0
      );

      // Copy fades out and moves up faster
      tl.to(
        overlayCopyRef.current!,
        {
          opacity: 0,
          y: "-50px",
          duration: 0.6,
        },
        0
      );

      // Nav fades out
      tl.to(
        navRef.current!,
        {
          opacity: 0,
          duration: 0.4,
        },
        0
      );

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
      ref={(n) => { sectionRef.current = n; }}
      className="introPin relative overflow-hidden bg-[#FFD200]"
      style={{ minHeight: "100svh" }}
      aria-label="Intro reveal"
    >
      {/* HERO UNDERLAYER - Always visible, sits behind overlay */}
      <div 
        ref={heroContainerRef} 
        className="absolute inset-0 z-0"
      >
        <HeroStage />
      </div>

      {/* INTRO OVERLAY - Slides UP to reveal hero */}
      <div
        ref={(n) => { overlayRef.current = n; }}
        className="introOverlay absolute inset-0 z-10"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Background Image */}
        <div
          ref={(n) => { overlayImgRef.current = n; }}
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/Pictures/yarden3.jpg"
            alt="The Yard"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[1.08] contrast-[0.95] saturate-[0.95]"
            onLoadingComplete={refreshST}
          />

          {/* Warm yellow atmosphere overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_25%_20%,rgba(255,255,255,0.28),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_80%_30%,rgba(255,210,0,0.22),transparent_58%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,245,205,0.12)] via-[rgba(255,226,135,0.30)] to-[rgba(255,210,0,0.52)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,0.10))]" />
          
          {/* Subtle grain texture */}
          <div className="absolute inset-0 grain opacity-[0.04] hidden sm:block" />
        </div>

        {/* NAV */}
        <div ref={navRef} className="absolute left-0 right-0 top-0 z-30">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <span className="text-xl sm:text-2xl font-black text-black transition-transform duration-200 group-hover:scale-110">
                ☥
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.18em] text-black/75">
                THE YARD
              </span>
            </Link>

            {/* Mobile menu button */}
            <button className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-6 lg:gap-8 md:flex">
              <a href="#houses" className="nav-link">Houses</a>
              <a href="#feed" className="nav-link">Feed</a>
              <a href="#pass" className="nav-link">Yard Pass</a>
            </div>
          </nav>
        </div>

        {/* HERO COPY */}
        <div
          ref={overlayCopyRef}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-end px-4 pb-10 sm:px-6 sm:pb-14 md:px-10 md:pb-20"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Enter the Yard</span>
              <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Members-only</span>
            </div>

            {/* Main headline */}
            <h1 className="title-hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black leading-[0.95]">
              Enter the Yard.
            </h1>

            {/* Subtext */}
            <p className="max-w-xl text-sm sm:text-base md:text-lg font-medium text-black/65 leading-relaxed">
              Not a public page. Not a regular sign-up.
              <span className="font-bold text-black"> Your ID is your entry.</span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a href="#pass" className="btn-gold text-sm sm:text-base justify-center">
                Generate my Yard Pass
                <span className="text-base sm:text-lg">☥</span>
              </a>
              <a href="#houses" className="btn-secondary text-sm sm:text-base justify-center">
                Choose a house
              </a>
            </div>

            {/* Scroll hint */}
            <div className="hidden sm:flex items-center gap-3 pt-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-10 rounded-full border-2 border-black/20 flex justify-center pt-2">
                  <div className="w-1.5 h-3 bg-black/30 rounded-full animate-bounce" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-black/35 uppercase">
                Scroll to reveal
              </p>
            </div>
          </div>
        </div>

        {/* Bottom gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFD200] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
