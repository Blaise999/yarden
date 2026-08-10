"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function OutroSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={(n) => { sectionRef.current = n; }}
      className="card-paper relative overflow-hidden p-5 sm:p-6 md:p-8 lg:p-10"
    >
      {/* Background effects */}
      <div className="absolute inset-0 micro-grid opacity-[0.08]" />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 grain opacity-[0.06]" />

      {/* Content */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="label text-[10px] sm:text-xs">THE YARD</p>
          <h3 className="title-section text-2xl sm:text-3xl md:text-4xl">You're early.</h3>
          <p className="body-text text-sm sm:text-base">
            Generate your pass — then sign in anytime.
          </p>
        </div>

        <a
          href="#pass"
          className="btn-gold text-sm sm:text-base shadow-lg justify-center self-start sm:self-auto"
        >
          Generate Yard Pass
          <span className="text-base sm:text-lg">☥</span>
        </a>
      </div>
    </section>
  );
}
