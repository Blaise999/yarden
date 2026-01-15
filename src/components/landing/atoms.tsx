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
        <p className="mt-1 text-lg sm:text-xl md:text-2xl font-black text-black">{value}</p>
        
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
    <TiltCard
      className={[
        "group card-frame overflow-hidden",
        wide ? "h-36 sm:h-44 md:h-52 lg:h-60" : "h-28 sm:h-32 md:h-40 lg:h-44",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={label}
          fill
          priority={priority}
          sizes={wide ? "(min-width: 768px) 520px, 100vw" : "(min-width: 768px) 260px, 50vw"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_20%,rgba(255,255,255,0.15),transparent)] mix-blend-overlay" />
      <div className="absolute inset-0 grain opacity-[0.1]" />

      <div className="pointer-events-none absolute right-2 sm:right-3 top-2 sm:top-3 text-lg sm:text-xl md:text-2xl font-black text-white/12 drop-shadow-lg">
        ☥
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
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
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-white/60">{desc}</p>
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
      <h2 className="title-section text-2xl sm:text-3xl md:text-4xl text-black">{title}</h2>
      {description && (
        <p className="body-text text-sm sm:text-base max-w-xl">{description}</p>
      )}
    </div>
  );
}

export function AnkhPattern() {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.02]">
      <defs>
        <pattern id="ankh-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <text x="10" y="65" fontSize="48" fontWeight="900" fill="currentColor">
            ☥
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ankh-pattern)" />
    </svg>
  );
}
