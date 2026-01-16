"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="caption text-[10px] sm:text-xs">
      <span className="caption-dot" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="card-frame p-3 sm:p-4 md:p-5 hover-lift"
    >
      <div className="absolute inset-0 micro-grid opacity-[0.06]" />
      <div className="absolute inset-0 grain opacity-[0.04]" />

      <div className="relative">
        <p className="label text-[9px] sm:text-[10px] md:text-[11px]">{label}</p>
        <p className="mt-1 text-lg sm:text-xl md:text-2xl font-black text-black">
          {value}
        </p>

        <div className="relative mt-2 sm:mt-3 h-1 w-full overflow-hidden rounded-full bg-black/8">
          <motion.div
            className="h-full w-3/5 rounded-full bg-black/12"
            whileHover={prefersReduced ? undefined : { width: "70%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function MagneticLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.4 });

  const isAnchor = href.startsWith("#");

  return (
    <motion.div
      style={prefersReduced ? undefined : { x: sx, y: sy }}
      onMouseMove={(e) => {
        if (prefersReduced) return;
        if (window.innerWidth < 768) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x.set(dx * 0.06);
        y.set(dy * 0.06);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-flex w-full sm:w-auto"
    >
      {isAnchor ? (
        <a href={href} className={`${className} w-full sm:w-auto`}>
          {children}
        </a>
      ) : (
        <Link href={href} className={`${className} w-full sm:w-auto`}>
          {children}
        </Link>
      )}
    </motion.div>
  );
}

export function TiltCard({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const srx = useSpring(rx, { stiffness: 150, damping: 25, mass: 0.4 });
  const sry = useSpring(ry, { stiffness: 150, damping: 25, mass: 0.4 });

  return (
    <motion.div
      className={className}
      style={
        prefersReduced
          ? undefined
          : {
              transformStyle: "preserve-3d",
              rotateX: srx,
              rotateY: sry,
            }
      }
      onMouseMove={(e) => {
        if (prefersReduced) return;
        if (window.innerWidth < 768) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 5);
        rx.set(-(py - 0.5) * 4);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <div
        className="relative h-full w-full"
        style={prefersReduced ? undefined : { transform: "translateZ(8px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Poster component v2 - INTELLIGENT MOBILE-FIRST RESPONSIVE
 * 
 * PROBLEM SOLVED: On small phones (< 380px), the 2-col grid with tall aspect ratios
 * creates cramped posters. The old object-contain approach left wasted letterbox space.
 * 
 * SOLUTION:
 * 1. object-cover fills frames completely (no wasted space)
 * 2. Smart object-position keeps faces/subjects visible during cropping
 * 3. Viewport-relative minHeight via clamp() ensures visibility on all phones
 * 4. CSS custom properties (--poster-portrait-ratio, --poster-wide-ratio) 
 *    defined in globals.css adapt ratios based on screen width
 * 5. Tighter inset padding on small screens, growing proportionally
 * 
 * RESULT: Images fill their frames beautifully at every screen size,
 * subjects stay centered, and the grid remains balanced.
 */
export function Poster({
  src,
  label,
  wide,
  priority,
}: {
  src: string;
  label: string;
  wide?: boolean;
  priority?: boolean;
}) {
  return (
    <TiltCard className="group card-frame overflow-hidden relative bg-white/40 w-full">
      {/* 
        Responsive container using CSS custom properties:
        - --poster-portrait-ratio and --poster-wide-ratio are defined in globals.css
        - They automatically adjust based on screen width via media queries
        - minHeight uses clamp() for fluid scaling across all devices
      */}
      <div
        className="poster-frame relative w-full"
        style={{
          aspectRatio: wide 
            ? "var(--poster-wide-ratio, 16 / 10)" 
            : "var(--poster-portrait-ratio, 4 / 5)",
          minHeight: wide 
            ? "clamp(80px, 18vw, 140px)" 
            : "clamp(90px, 25vw, 180px)",
        }}
      >
        {/* Backdrop: Blurred cover fills gaps seamlessly */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            priority={false}
            sizes={wide ? "100vw" : "50vw"}
            className="object-cover scale-125 blur-2xl opacity-35"
          />
        </div>

        {/* 
          Main image container with elegant frame padding:
          - Inset creates frame effect that scales with screen size
          - Rounded corners for softer aesthetic
          - Overflow hidden clips image cleanly
        */}
        <div className="absolute inset-[2px] sm:inset-1 md:inset-1.5 rounded-md sm:rounded-lg overflow-hidden bg-black/5">
          <Image
            src={src}
            alt={label}
            fill
            priority={priority}
            sizes={
              wide
                ? "(max-width: 380px) 100vw, (max-width: 640px) 100vw, (max-width: 1024px) 60vw, 520px"
                : "(max-width: 380px) 50vw, (max-width: 640px) 50vw, (max-width: 1024px) 30vw, 260px"
            }
            /* 
              KEY FIX: object-cover + object-position
              - object-cover: Fills frame completely, crops excess (no letterboxing!)
              - object-[center_25%]: Focus on upper portion where faces typically are
              - This ensures portraits show faces prominently, not feet
            */
            className="object-cover object-[center_25%] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>

        {/* Subtle gradient overlays for depth and polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(255,255,255,0.1),transparent)] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 grain opacity-[0.06] pointer-events-none" />

        {/* Corner ankh badge - scales with container */}
        <div className="pointer-events-none absolute right-1 sm:right-2 md:right-3 top-1 sm:top-2 md:top-3 text-xs sm:text-base md:text-lg font-black text-white/20 drop-shadow-md">
          ☥
        </div>

        {/* Hover shine effect - desktop only */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 ease-out" />
        </div>
      </div>
    </TiltCard>
  );
}

export function HouseCard({
  title,
  badge,
  desc,
}: {
  title: string;
  badge: string;
  desc: string;
}) {
  return (
    <TiltCard className="card-ink relative overflow-hidden p-5 sm:p-6 md:p-8 hover-lift border-glow">
      <div className="absolute -right-6 sm:-right-8 -top-6 sm:-top-8 text-[120px] sm:text-[150px] md:text-[180px] font-black text-[rgb(var(--yard-gold))]/[0.05] leading-none pointer-events-none">
        ☥
      </div>
      <div className="absolute inset-0 grain opacity-[0.06]" />

      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-lg sm:text-xl font-black">{title}</p>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-white/60">
            {desc}
          </p>
        </div>

        <span className="status-badge whitespace-nowrap text-[10px] sm:text-xs self-start">
          {badge}
        </span>
      </div>

      <div className="relative mt-4 sm:mt-6 rounded-lg sm:rounded-xl border border-[rgb(var(--yard-gold))]/12 bg-black/25 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold">
          <span className="text-white/55">Access</span>
          <span className="text-white/75">Members-only</span>
        </div>
      </div>
    </TiltCard>
  );
}

export function FeedCard({ title }: { title: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="card-frame p-4 sm:p-5 md:p-6 hover-lift"
    >
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="absolute inset-0 micro-grid opacity-[0.05]" />
      <div className="absolute inset-0 grain opacity-[0.05]" />

      <div className="relative space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-bold text-black">{title}</p>
          <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-xs sm:text-sm">
            🔒
          </span>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="h-1.5 sm:h-2 w-4/5 rounded-full bg-black/8" />
          <div className="h-1.5 sm:h-2 w-3/5 rounded-full bg-black/6" />
          <div className="h-1.5 sm:h-2 w-2/5 rounded-full bg-black/5" />
        </div>

        <p className="text-[10px] sm:text-xs font-semibold text-black/45">
          Generate pass to view this update.
        </p>
      </div>

      <div className="shimmer absolute inset-0 pointer-events-none" />
    </motion.div>
  );
}

export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <p className="label text-[10px] sm:text-xs">{label}</p>
      <h2 className="title-section text-2xl sm:text-3xl md:text-4xl text-black">
        {title}
      </h2>
      {description && (
        <p className="body-text text-sm sm:text-base max-w-xl">{description}</p>
      )}
    </div>
  );
}

export function AnkhPattern() {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-[0.02]"
    >
      <defs>
        <pattern
          id="ankh-pattern"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <text
            x="10"
            y="65"
            fontSize="48"
            fontWeight="900"
            fill="currentColor"
          >
            ☥
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ankh-pattern)" />
    </svg>
  );
}
