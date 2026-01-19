"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/* -------------------------------------------------------
   Premium dark theme atoms for Yarden Experience
   - Dark-first styling (no reliance on globals)
   - Cleaner motion curves + accessibility
   - Adds reusable artist info components & metadata
-------------------------------------------------------- */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const YARDEN_META = {
  stageName: "Yarden",
  birthName: "Okereke Blessed Jordan",
  origin: "Nigeria (raised in Lagos)",
  breakout: { title: "Wetin", year: "2022" },
  debutEP: {
    title: "The One Who Descends",
    releaseDate: "Dec 1, 2023",
    note: "Etins Records / 0207 Def Jam (0207 Records release; licensed to Universal Music Operations)",
  },
  spotify: {
    monthlyListenersText: "≈ 775K+",
    topTrack: { title: "Wetin", streamsText: "81M+ (Spotify)" },
  },
} as const;

/* -------------------------------------------------------
   Small utilities
-------------------------------------------------------- */

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

/* -------------------------------------------------------
   Core UI atoms
-------------------------------------------------------- */

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs text-white/60">
      <span className="h-1.5 w-1.5 rounded-full bg-[#FFD200]/80 shadow-[0_0_16px_rgba(255,210,0,0.45)]" />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function SectionHeader({
  label,
  title,
  description,
  rightSlot,
}: {
  label: string;
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="space-y-2 sm:space-y-3">
        <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.28em] uppercase text-[#FFD200]/85">
          {label}
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.02em] text-white">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-white/65 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {rightSlot ? <div className="hidden sm:block">{rightSlot}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "neutral" | "danger";
}) {
  const styles =
    tone === "gold"
      ? "border-[#FFD200]/20 bg-[#FFD200]/10 text-[#FFD200]"
      : tone === "danger"
        ? "border-red-400/20 bg-red-400/10 text-red-200"
        : "border-white/10 bg-white/[0.04] text-white/70";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] sm:text-xs font-bold ${styles}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  progress = 0.62,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number; // 0..1
  icon?: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(255,210,0,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] uppercase text-white/55">
            {label}
          </p>

          {icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/80">
              {icon}
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-black text-white tracking-[-0.02em]">
          {value}
        </p>

        {hint ? (
          <p className="mt-1 text-xs sm:text-sm font-semibold text-white/55">
            {hint}
          </p>
        ) : null}

        <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06] border border-white/10">
          <motion.div
            className="h-full rounded-full bg-[#FFD200]/25"
            initial={false}
            animate={prefersReduced ? undefined : { width: `${clamped * 100}%` }}
            style={{ width: `${clamped * 100}%` }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_140%_at_0%_50%,rgba(255,210,0,0.22),transparent_55%)]" />
        </div>
      </div>
    </motion.div>
  );
}

export function MagneticLink({
  href,
  className,
  children,
  target,
  rel,
  ariaLabel,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}) {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.4 });

  const isAnchor = href.startsWith("#");
  const external = isExternalHref(href);

  const shared = {
    className: `${className} w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black`,
    "aria-label": ariaLabel,
  } as const;

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
        <a href={href} {...shared}>
          {children}
        </a>
      ) : external ? (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          {...shared}
        >
          {children}
        </a>
      ) : (
        <Link href={href} {...shared}>
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
              willChange: "transform",
            }
      }
      onMouseMove={(e) => {
        if (prefersReduced) return;
        if (window.innerWidth < 768) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 6);
        rx.set(-(py - 0.5) * 5);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <div
        className="relative h-full w-full"
        style={prefersReduced ? undefined : { transform: "translateZ(10px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Poster v3 — Dark, premium, mobile-safe
 * - Always fills frame (object-cover)
 * - Better overlays + label chip + focus ring
 * - No dependency on globals; ratios use inline style + safe defaults
 */
export function Poster({
  src,
  label,
  wide,
  priority,
  href,
  meta,
}: {
  src: string;
  label: string;
  wide?: boolean;
  priority?: boolean;
  href?: string; // optional click-through
  meta?: string; // small secondary text (e.g. year / "Official Video")
}) {
  const prefersReduced = useReducedMotion();

  const frame = (
    <TiltCard className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_110px_rgba(0,0,0,0.6)]">
      <div
        className="relative w-full"
        style={{
          aspectRatio: wide ? "16 / 10" : "4 / 5",
          minHeight: wide ? "clamp(88px, 18vw, 160px)" : "clamp(110px, 25vw, 220px)",
        }}
      >
        {/* Backdrop blur layer */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            priority={false}
            sizes={wide ? "100vw" : "50vw"}
            className="object-cover scale-125 blur-2xl opacity-30"
          />
        </div>

        {/* Main image */}
        <div className="absolute inset-[2px] sm:inset-1 rounded-xl overflow-hidden bg-black/40">
          <Image
            src={src}
            alt={label}
            fill
            priority={priority}
            sizes={
              wide
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 560px"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            }
            className="object-cover object-[center_20%] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>

        {/* Depth overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,210,0,0.18),transparent_60%)]" />

        {/* Label chip */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] sm:text-xs font-extrabold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD200] shadow-[0_0_14px_rgba(255,210,0,0.5)]" />
            {label}
          </span>
          {meta ? (
            <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] sm:text-xs font-bold text-white/70">
              {meta}
            </span>
          ) : null}
        </div>

        {/* Corner ankh */}
        <div className="pointer-events-none absolute right-3 top-3 text-base sm:text-lg font-black text-white/18 drop-shadow">
          ☥
        </div>

        {/* Shine (desktop) */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-out" />
        </div>

        {/* Focus ring helper */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-2 group-focus-within:ring-[#FFD200]/60" />
      </div>

      {/* Tiny footer line (optional) */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-[10px] sm:text-xs text-white/55 font-semibold">
          Tap to explore —{" "}
          <span className="text-white/75">photos, videos, shows, merch</span>
        </p>
      </div>
    </TiltCard>
  );

  if (!href) return frame;

  return (
    <a
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
      target={isExternalHref(href) ? "_blank" : undefined}
      rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
    >
      {frame}
    </a>
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
    <TiltCard className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(255,210,0,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-8 -top-10 text-[150px] sm:text-[190px] font-black text-[#FFD200]/[0.05] leading-none">
        ☥
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-lg sm:text-xl font-black text-white tracking-[-0.02em]">
            {title}
          </p>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-white/60 leading-relaxed">
            {desc}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD200]/18 bg-[#FFD200]/10 px-3 py-1 text-[10px] sm:text-xs font-extrabold text-[#FFD200] whitespace-nowrap self-start">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD200]" />
          {badge}
        </span>
      </div>

      <div className="relative mt-4 sm:mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold tracking-[0.18em] uppercase">
          <span className="text-white/45">Access</span>
          <span className="text-white/70">Members-only</span>
        </div>
      </div>
    </TiltCard>
  );
}

export function FeedCard({
  title,
  subtitle = "Generate a pass to view this update.",
}: {
  title: string;
  subtitle?: string;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 md:p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(255,210,0,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-extrabold text-white">{title}</p>
          <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 bg-black/30 text-sm">
            🔒
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-4/5 rounded-full bg-white/[0.08]" />
          <div className="h-2 w-3/5 rounded-full bg-white/[0.06]" />
          <div className="h-2 w-2/5 rounded-full bg-white/[0.05]" />
        </div>

        <p className="text-[10px] sm:text-xs font-semibold text-white/55">
          {subtitle}
        </p>
      </div>

      {/* subtle shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] translate-x-[-120%] animate-[shimmer_2.6s_infinite]" />
      <style>{`
        @keyframes shimmer { to { transform: translateX(120%); } }
      `}</style>
    </motion.div>
  );
}

/* -------------------------------------------------------
   New: “More information here” — Artist info blocks
-------------------------------------------------------- */

export function ArtistQuickFacts({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,210,0,0.16),transparent_60%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.28em] uppercase text-[#FFD200]/85">
              Artist Profile
            </p>
            <p className="mt-2 text-lg sm:text-xl font-black text-white tracking-[-0.02em]">
              {YARDEN_META.stageName}
              <span className="ml-2 text-xs sm:text-sm font-semibold text-white/55">
                ({YARDEN_META.birthName})
              </span>
            </p>
          </div>
          <Pill tone="gold">☥ VERIFIED INFO</Pill>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow k="Origin" v={YARDEN_META.origin} />
          <InfoRow k="Breakout" v={`${YARDEN_META.breakout.title} • ${YARDEN_META.breakout.year}`} />
          <InfoRow k="Debut EP" v={`${YARDEN_META.debutEP.title} • ${YARDEN_META.debutEP.releaseDate}`} />
          <InfoRow k="Label" v="Etins Records / 0207 Def Jam" />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="Monthly listeners" value={YARDEN_META.spotify.monthlyListenersText} hint="Spotify audience" progress={0.78} />
          <Stat label="Top track" value={YARDEN_META.spotify.topTrack.title} hint={YARDEN_META.spotify.topTrack.streamsText} progress={0.86} />
          <Stat label="Catalog vibe" value="Dark • soulful" hint="Afrobeats / R&B edge" progress={0.62} />
        </div>

        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          {YARDEN_META.stageName} blends mellow, soulful melodies with darker grooves —
          a “music has a soul” kind of signature. This block is reusable on Home, Music, or Press pages.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase text-white/45">
        {k}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-white/75 text-right">
        {v}
      </span>
    </div>
  );
}

export function PlatformButtons({
  spotify,
  apple,
  audiomack,
  youtube,
}: {
  spotify?: string;
  apple?: string;
  audiomack?: string;
  youtube?: string;
}) {
  const items = [
    spotify ? { name: "Spotify", href: spotify, tone: "spotify" as const } : null,
    apple ? { name: "Apple", href: apple, tone: "apple" as const } : null,
    audiomack ? { name: "Audiomack", href: audiomack, tone: "neutral" as const } : null,
    youtube ? { name: "YouTube", href: youtube, tone: "youtube" as const } : null,
  ].filter(Boolean) as Array<{ name: string; href: string; tone: "spotify" | "apple" | "youtube" | "neutral" }>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <a
          key={it.name}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold border transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            it.tone === "spotify"
              ? "bg-[#1DB954] text-white border-white/0 hover:opacity-95"
              : it.tone === "apple"
                ? "bg-white/10 text-white border-white/10 hover:bg-white/14"
                : it.tone === "youtube"
                  ? "bg-red-500/90 text-white border-white/0 hover:opacity-95"
                  : "bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.06]",
          ].join(" ")}
        >
          {it.name}
          <span className="text-white/70">↗</span>
        </a>
      ))}
    </div>
  );
}

export function AnkhPattern() {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-[0.025]"
    >
      <defs>
        <pattern
          id="ankh-pattern"
          x="0"
          y="0"
          width="110"
          height="110"
          patternUnits="userSpaceOnUse"
        >
          <text x="10" y="74" fontSize="54" fontWeight="900" fill="currentColor">
            ☥
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ankh-pattern)" />
    </svg>
  );
}
