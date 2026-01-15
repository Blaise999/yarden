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

  const heroRevealRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  const didRefreshRef = useRef(false);

  useLayoutEffect(() => {
    if (!sectionRef.current || !overlayRef.current || !overlayImgRef.current || !heroRevealRef.current) return;

    // Reduced motion: skip the morph entirely
    if (prefersReduced) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      gsap.set(heroRevealRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      // Initial states (Revolut-style: subtle, no pin, no jank)
      gsap.set(heroRevealRef.current!, {
        opacity: 0,
        y: 10,
        scale: 0.995,
        willChange: "transform, opacity",
      });

      gsap.set(overlayRef.current!, {
        opacity: 1,
        willChange: "opacity",
      });

      gsap.set(overlayImgRef.current!, {
        scale: 1,
        willChange: "transform",
      });

      gsap.set(overlayCopyRef.current!, {
        opacity: 1,
        y: 0,
        willChange: "transform, opacity",
      });

      gsap.set(navRef.current!, { opacity: 1, willChange: "opacity" });

      // ✅ Key change: NO pinning (so a slight scroll immediately reveals the next section)
      // Keep the morph distance SHORT + smooth.
      const endDist = isMobile ? 240 : 320; // px worth of scroll for the whole morph

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${endDist}`,
          scrub: 0.35, // buttery, not cracky
          pin: false, // ✅ revolut-like "glide" reveal
          invalidateOnRefresh: true,
        },
      });

      // Tiny image zoom (no filters/blur animation)
      tl.to(
        overlayImgRef.current!,
        {
          scale: isMobile ? 1.015 : 1.03,
        },
        0
      );

      // Copy fades out quickly
      tl.to(
        overlayCopyRef.current!,
        {
          opacity: 0,
          y: -10,
        },
        0
      );

      // Overlay dissolves quickly (lets HeroStage show immediately)
      tl.to(
        overlayRef.current!,
        {
          opacity: 0,
          // When overlay is gone, prevent it from intercepting clicks
          onUpdate: () => {
            const o = overlayRef.current;
            if (!o) return;
            o.style.pointerEvents = "none";
          },
        },
        0.12
      );

      // Underlayer emerges
      tl.to(
        heroRevealRef.current!,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power2.out",
        },
        0.05
      );

      // Optional: once overlay is essentially gone, fully disable it
      ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: "top top",
        end: `+=${endDist}`,
        onUpdate: (self) => {
          const o = overlayRef.current;
          if (!o) return;
          if (self.progress > 0.95) {
            o.style.pointerEvents = "none";
          } else {
            o.style.pointerEvents = "auto";
          }
        },
      });
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
      className="introPin relative overflow-hidden bg-[#FFD200] min-h-[100svh]"
      aria-label="Intro reveal"
    >
      {/* HERO UNDERLAYER (this is what you see immediately after a slight scroll) */}
      <div ref={heroRevealRef} className="relative">
        <HeroStage />
      </div>

      {/* INTRO OVERLAY (glides away quickly on slight scroll) */}
      <div
        ref={(n) => {
          overlayRef.current = n;
        }}
        className="introOverlay absolute inset-0"
      >
        {/* Background Image */}
        <div
          ref={(n) => {
            overlayImgRef.current = n;
          }}
          className="absolute inset-0"
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

          {/* warm yellow atmosphere (transparent so image stays visible) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_25%_20%,rgba(255,255,255,0.28),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_80%_30%,rgba(255,210,0,0.22),transparent_58%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,245,205,0.12)] via-[rgba(255,226,135,0.30)] to-[rgba(255,210,0,0.52)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,0.10))]" />

          {/* keep grain subtle + off on small screens */}
          <div className="absolute inset-0 grain opacity-[0.04] hidden sm:block" />
        </div>

        {/* NAV (no auth buttons) */}
        <div ref={navRef} className="fixed left-0 right-0 top-0 z-30">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <span className="text-xl sm:text-2xl font-black text-black transition-transform duration-200 group-hover:scale-110">
                ☥
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.18em] text-black/75">
                THE YARD
              </span>
            </Link>

            <button className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-black/5 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden items-center gap-6 lg:gap-8 md:flex">
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
          </nav>
        </div>

        {/* HERO COPY */}
        <div
          ref={overlayCopyRef}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-end px-4 pb-10 sm:px-6 sm:pb-14 md:px-10 md:pb-20"
        >
          <div className="max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Enter the Yard</span>
              <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">Members-only</span>
            </div>

            <h1 className="title-hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black leading-[0.95]">
              Enter the Yard.
            </h1>

            <p className="max-w-xl text-sm sm:text-base md:text-lg font-medium text-black/65 leading-relaxed">
              Not a public page. Not a regular sign-up.
              <span className="font-bold text-black"> Your ID is your entry.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a href="#pass" className="btn-gold text-sm sm:text-base justify-center">
                Generate my Yard Pass
                <span className="text-base sm:text-lg">☥</span>
              </a>
              <a href="#houses" className="btn-secondary text-sm sm:text-base justify-center">
                Choose a house
              </a>
            </div>

            {/* subtle hint; no “scroll to reveal” shout */}
            <p className="hidden sm:block pt-2 text-[10px] sm:text-xs font-bold tracking-[0.18em] text-black/35 uppercase">
              Scroll
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
