"use client";

import React from "react";
import IntroMorph from "@/components/landing/IntroMorph";
import HousesSection from "@/components/landing/HousesSection";
import LockedFeedSection from "@/components/landing/LockedFeedSection";
import YardPassSection from "@/components/landing/YardPassSection";
import OutroSection from "@/components/landing/OutroSection";

export default function LandingPage() {
  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      {/* Full-bleed intro (cover → dissolve → hero) */}
      <IntroMorph />

      {/* Main content container */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 space-y-10 sm:space-y-14 md:space-y-20 pb-10 sm:pb-14 md:pb-20">
        <HousesSection />
        <LockedFeedSection />
        <YardPassSection />
        <OutroSection />
      </div>
    </div>
  );
}
