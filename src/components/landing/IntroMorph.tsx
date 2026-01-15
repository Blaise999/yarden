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

  const heroLayerRef = useRef<HTMLDivElement | null>(null);

  const didRefreshRef = useRef(false);

  useLayoutEffect(() => {
    if (
      !sectionRef.current ||
      !overlayRef.current ||
      !overlayImgRef.current ||
      !overlayCopyRef.current ||
      !heroLayerRef.current
    )
      return;

    if (prefersReduced) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });
      gsap.set(heroLayerRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const endDist = isMobile ? 260 : 320;

    const ctx = gsap.context(() => {
      // Initial states (no design tweaks — just visibility)
      gsap.set(heroLayerRef.current!, {
        opacity: 0,
        y: 10,
        scale: 0.995,
        willChange: "transform, opacity",
      });

      gsap.set(overlayRef.current!, {
        opacity: 1,
        pointerEvents: "auto",
        willChange: "opacity",
      });

      gsap.set(overlayImgRef.current!, { scale: 1, willChange: "transform" });
      gsap.set(overlayCopyRef.current!, {
        opacity: 1,
        y: 0,
        willChange: "transform, opacity",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${endDist}`,
          scrub: 0.32,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const o = overlayRef.current;
            if (!o) return;
            o.style.pointerEvents = self.progress >= 0.92 ? "none" : "auto";
          },
        },
      });

      // Tiny zoom on the overlay image
      tl.to(
        overlayImgRef.current!,
        { scale: isMobile ? 1.015 : 1.03, ease: "none" },
        0
      );

      // Copy fades fast
      tl.to(
        overlayCopyRef.current!,
        { opacity: 0, y: -10, ease: "none" },
        0
      );

      // Hero appears behind
      tl.to(
        heroLayerRef.current!,
        { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1 },
        0.08
      );

      // Overlay dissolves
      tl.to(overlayRef.current!, { opacity: 0, ease: "none" }, 0.12);
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
      className="introPin relative overflow-hidden bg-[#FFD200]"
      aria-label="Intro reveal"
    >
      {/* Give just enough scroll room for the morph without changing layout vibe */}
      <div className="relative min-h-[calc(100svh+360px)]">
        {/* Sticky viewport: both layers share the SAME screen */}
        <div className="sticky top-0 h-[100svh]">
          {/* HERO UNDERLAYER */}
          <div
            ref={(n) => {
              heroLayerRef.current = n;
            }}
            className="absolute inset-0 z-10"
          >
            <HeroStage />
          </div>

          {/* INTRO OVERLAY */}
          <div
            ref={(n) => {
              overlayRef.current = n;
            }}
            className="absolute inset-0 z-20"
          >
            {/* Background Image */}
            <div
              ref={(n) => {
                overlayImgRef.current = n;
              }}
              className="absolute inset-0 will-change-transform"
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

              <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_25%_20%,rgba(255,255,255,0.28),transparent_62%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_80%_30%,rgba(255,210,0,0.22),transparent_58%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,245,205,0.12)] via-[rgba(255,226,135,0.30)] to-[rgba(255,210,0,0.52)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,0.10))]" />
              <div className="absolute inset-0 grain opacity-[0.04] hidden sm:block" />
            </div>

            {/* NAV (your original, stays consistent) */}
            <div className="fixed left-0 right-0 top-0 z-30">
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
                  <a href="#houses" className="nav-link">Houses</a>
                  <a href="#feed" className="nav-link">Feed</a>
                  <a href="#pass" className="nav-link">Yard Pass</a>
                </div>
              </nav>
            </div>

            {/* HERO COPY (your original layout) */}
            <div
              ref={(n) => {
                overlayCopyRef.current = n;
              }}
              className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-end px-4 pb-10 sm:px-6 sm:pb-14 md:px-10 md:pb-20"
            >
              <div className="max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">
                    Enter the Yard
                  </span>
                  <span className="chip text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3">
                    Members-only
                  </span>
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

                <p className="hidden sm:block pt-2 text-[10px] sm:text-xs font-bold tracking-[0.18em] text-black/35 uppercase">
                  Scroll
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* small tail so the sticky has somewhere to “unstick” after morph */}
        <div className="h-[360px]" aria-hidden />
      </div>
    </section>
  );
}
