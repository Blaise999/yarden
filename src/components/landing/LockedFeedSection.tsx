"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeedCard, MagneticLink, SectionHeader } from "@/components/landing/atoms";

gsap.registerPlugin(ScrollTrigger);

export default function LockedFeedSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 25,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".feed-card", {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 95%",
          toggleActions: "play none none reverse",
        },
        y: 15,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={(n) => { sectionRef.current = n; }}
      id="feed"
      className="card-paper relative overflow-hidden p-5 sm:p-6 md:p-8 lg:p-10"
    >
      <div className="absolute inset-0 micro-grid opacity-[0.08]" />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 grain opacity-[0.08]" />

      <div className="absolute -right-12 sm:-right-16 md:-right-20 -top-12 sm:-top-16 md:-top-20 text-[200px] sm:text-[250px] md:text-[300px] font-black text-black/[0.015] leading-none pointer-events-none">
        ☥
      </div>

      <div className="relative space-y-5 sm:space-y-6 md:space-y-8">
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <SectionHeader
            label="Updates Feed"
            title="Members-only updates."
            description="Tour announcements, unreleased previews, drop alerts, private notes — locked behind your Yard Pass."
          />

          <div className="card-ink px-4 py-3 sm:px-5 sm:py-4 border-glow self-start shrink-0">
            <p className="label-light text-[10px] sm:text-xs">🔒 Locked</p>
            <p className="text-xs sm:text-sm font-bold mt-1">Generate pass to view</p>
          </div>
        </div>

        <div ref={cardsRef} className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="feed-card">
            <FeedCard title="Tour update" />
          </div>
          <div className="feed-card">
            <FeedCard title="Drop alert" />
          </div>
          <div className="feed-card">
            <FeedCard title="Private note" />
          </div>
        </div>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
          <MagneticLink href="#pass" className="btn-primary text-sm sm:text-base justify-center">
            <span>Create my Yard Pass</span>
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
