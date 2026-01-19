"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HouseCard, SectionHeader } from "./atoms";

gsap.registerPlugin(ScrollTrigger);

export default function HousesSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 26,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
      });

      // Cards stagger
      gsap.from(".house-card", {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 28,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
      });

      // Extra details reveal
      gsap.from(detailsRef.current, {
        scrollTrigger: {
          trigger: detailsRef.current,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={(n) => {
        sectionRef.current = n;
      }}
      id="houses"
      className="space-y-6 sm:space-y-7 md:space-y-9"
    >
      {/* Section Header */}
      <div ref={headerRef}>
        <SectionHeader
          label="Choose Your House"
          title="Two houses. One Yard."
          description="Your house is your identity in the Yard — it shapes your pass, the rooms you enter, and how your profile is styled."
        />
      </div>

      {/* Cards Grid */}
      <div ref={cardsRef} className="grid gap-3 sm:gap-4 md:gap-5 md:grid-cols-2">
        <div className="house-card">
          <HouseCard
            title="♂ Descendants"
            badge="DESCENDANTS"
            desc="Legacy energy. Grounded. Loyal. Builders of The Yard."
          />
        </div>

        <div className="house-card">
          <HouseCard
            title="♀ Angels 🪽"
            badge="ANGELS"
            desc="Light energy. Elevation. Grace. Aura of The Yard."
          />
        </div>
      </div>

      {/* More info */}
      <div
        ref={detailsRef}
        className="grid gap-3 sm:gap-4 md:gap-5 md:grid-cols-[1.2fr_0.8fr]"
      >
        {/* Left: What it means */}
        <div className="card-frame relative overflow-hidden p-4 sm:p-5 md:p-6">
          <div className="absolute inset-0 micro-grid opacity-[0.05]" />
          <div className="absolute inset-0 grain opacity-[0.05]" />

          <div className="relative space-y-3 sm:space-y-4">
            <p className="label text-[10px] sm:text-xs">How houses work</p>

            <div className="space-y-2">
              <p className="text-sm sm:text-base font-bold text-black">
                This isn’t a “pick random” thing.
              </p>
              <p className="text-xs sm:text-sm font-medium text-black/60 leading-relaxed">
                Your house becomes a permanent part of your Yard Pass. It’s used to
                personalize your experience — badges, access pages, and members-only
                drops can be styled and grouped by house.
              </p>
            </div>

            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 pt-1">
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <p className="text-xs font-bold text-black">Identity</p>
                <p className="mt-1 text-[11px] sm:text-xs font-semibold text-black/55">
                  Your pass + profile carry your house badge.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <p className="text-xs font-bold text-black">Access</p>
                <p className="mt-1 text-[11px] sm:text-xs font-semibold text-black/55">
                  Some rooms & updates can be house-based.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <p className="text-xs font-bold text-black">Drops</p>
                <p className="mt-1 text-[11px] sm:text-xs font-semibold text-black/55">
                  Early snippets, codes, or links may land per house.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <p className="text-xs font-bold text-black">Style</p>
                <p className="mt-1 text-[11px] sm:text-xs font-semibold text-black/55">
                  Your UI accents can adapt to your house.
                </p>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-semibold text-black/45">
              You can change the copy later — this is the “professional explanation” that makes it feel real.
            </p>
          </div>

          <div className="shimmer absolute inset-0 pointer-events-none" />
        </div>

        {/* Right: Quick rules */}
        <div className="card-ink relative overflow-hidden p-4 sm:p-5 md:p-6 border-glow">
          <div className="absolute inset-0 grain opacity-[0.06]" />

          <div className="relative space-y-3 sm:space-y-4">
            <p className="label-light text-[10px] sm:text-xs">House rules</p>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                  1
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Pick once</p>
                  <p className="text-[11px] sm:text-xs font-semibold text-white/55">
                    Your first choice locks your identity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                  2
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Pass links to it</p>
                  <p className="text-[11px] sm:text-xs font-semibold text-white/55">
                    Your Yard Pass stores your house.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                  3
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Unlock next</p>
                  <p className="text-[11px] sm:text-xs font-semibold text-white/55">
                    After choosing, generate your pass to enter.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#pass"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/12 transition px-4 py-3 text-xs sm:text-sm font-extrabold text-white"
            >
              Generate Yard Pass <span className="text-base">☥</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
