"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PassGenerator from "@/components/landing/pass/PassGenerator";

gsap.registerPlugin(ScrollTrigger);

export default function YardPassSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 35,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={(n) => { sectionRef.current = n; }}
      id="pass"
      className="relative"
    >
      {/* Main Pass Generator Card */}
      <div
        ref={contentRef}
        className="card-paper relative overflow-hidden p-5 sm:p-8 md:p-10 lg:p-12"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 micro-grid opacity-[0.06]" />
        <div className="absolute inset-0 vignette opacity-50" />

        {/* Decorative ankh */}
        <div className="absolute -right-16 -top-16 text-[250px] sm:text-[300px] font-black text-black/[0.02] leading-none pointer-events-none">
          ☥
        </div>

        <div className="relative">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 mb-4">
              <span className="text-lg">☥</span>
              <span className="text-xs font-bold tracking-wider uppercase text-black/60">Yard Pass</span>
            </div>
            <h2 className="title-section text-3xl sm:text-4xl md:text-5xl text-black">
              Generate Your ID
            </h2>
            <p className="mt-3 body-text text-sm sm:text-base max-w-xl mx-auto">
              Your pass is your entry to The Yard. Fill in your details, upload a photo, and get your personalized membership card.
            </p>
          </div>

          {/* Pass Generator Component */}
          <PassGenerator />

          {/* Bottom Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 sm:mt-10">
            <div className="p-5 rounded-2xl bg-black/5 border border-black/5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">♂</span>
                <span className="font-bold text-black">Descendants</span>
              </div>
              <p className="text-sm text-black/60">
                Male members join as Yarden&apos;s Descendants. Legacy energy, grounded and loyal.
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-black/5 border border-black/5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">♀</span>
                <span className="font-bold text-black">Angels</span>
              </div>
              <p className="text-sm text-black/60">
                Female members join as Yarden&apos;s Angels. Light energy, elevation and grace.
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-black/5 border border-black/5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📥</span>
                <span className="font-bold text-black">Download</span>
              </div>
              <p className="text-sm text-black/60">
                Your card exports as a crisp PNG. Save it, share it, flex it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
