"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HouseCard, SectionHeader } from "@/components/landing/atoms";

gsap.registerPlugin(ScrollTrigger);

export default function HousesSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal - faster
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Cards stagger - faster
      gsap.from(".house-card", {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 35,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={(n) => { sectionRef.current = n; }}
      id="houses"
      className="space-y-5 sm:space-y-6 md:space-y-8"
    >
      {/* Section Header */}
      <div ref={headerRef}>
        <SectionHeader
          label="Choose Your House"
          title="Two houses. One Yard."
          description="Your house defines your energy. Pick wisely — it stays with you."
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
    </section>
  );
}
