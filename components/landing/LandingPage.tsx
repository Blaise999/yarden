"use client";

import React from "react";
import IntroMorph from "./IntroMorph";
import HousesSection from "./HousesSection";
import LockedFeedSection from "./LockedFeedSection";
import YardPassSection from "./YardPassSection";
import OutroSection from "./OutroSection";

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
