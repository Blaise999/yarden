"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "yarden_cookie_consent_v1";
export type ConsentChoice = "all" | "essential";

/**
 * Read the stored consent choice (or null if none yet).
 * Other code can gate analytics/pixels on this:
 *   if (getConsent() === "all") loadAnalytics();
 */
export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

function AnkhMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <g
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      >
        <ellipse cx="32" cy="20.5" rx="8.4" ry="10" />
        <line x1="32" y1="30" x2="32" y2="55" />
        <line x1="20.5" y1="35.5" x2="43.5" y2="35.5" />
      </g>
    </svg>
  );
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show if no prior choice. Delay slightly so it doesn't fight the hero.
    if (getConsent() === null) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const choose = (choice: ConsentChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* storage blocked — proceed anyway */
    }
    window.dispatchEvent(
      new CustomEvent("yarden:consent", { detail: { choice } })
    );
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0a16]/90 shadow-[0_20px_80px_-20px_rgba(139,92,246,0.45)] backdrop-blur-xl">
            {/* violet accent hairline */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/30">
                  <AnkhMark className="h-4 w-4" />
                </span>
                <p className="text-sm leading-relaxed text-white/70">
                  We use a few cookies to keep the site running and to
                  understand what people play most. No noise — just the essentials
                  and some anonymous stats.{" "}
                  <a
                    href="/privacy"
                    className="text-white/90 underline decoration-white/30 underline-offset-2 transition hover:decoration-white"
                  >
                    Privacy
                  </a>
                  .
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                <button
                  onClick={() => choose("essential")}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white/90"
                >
                  Essential only
                </button>
                <button
                  onClick={() => choose("all")}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
