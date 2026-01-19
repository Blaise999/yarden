"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";

/**
 * components/landing/ui.tsx
 * -----------------------------------------------------------------------------
 * Premium landing UI kit: shared atoms + helpers for the Yarden landing system.
 * Designed to keep section components tiny and consistent.
 * -----------------------------------------------------------------------------
 */

/* -----------------------------------------------------------------------------
 * Utils
 * -------------------------------------------------------------------------- */

export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** Locks body scroll when a modal/menu is open */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/** `prefers-reduced-motion` hook */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/** Smooth scroll with header offset (sticky header ~80px) */
export function smoothScrollTo(id: string, offset = 80) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y - offset, behavior: "smooth" });
}

/* -----------------------------------------------------------------------------
 * Icons (minimal, consistent stroke)
 * -------------------------------------------------------------------------- */

export function IconAnkh(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className} fill="none">
      <path
        d="M12 2c2.2 0 4 1.8 4 4 0 1.8-1.2 3.3-2.8 3.8V12h3.2c.6 0 1 .4 1 1s-.4 1-1 1h-3.2v7c0 .6-.4 1-1 1s-1-.4-1-1v-7H8.8c-.6 0-1-.4-1-1s.4-1 1-1H12V9.8C10.2 9.3 9 7.8 9 6c0-2.2 1.8-4 3-4Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlay(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path d="M9 7.5v9l8-4.5-8-4.5Z" className="fill-current" />
    </svg>
  );
}

export function IconChevron(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconClose(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconArrowUpRight(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path
        d="M7 17 17 7M10 7h7v7"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSpark(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 6.1L20 10l-6.6 1.9L12 18l-1.4-6.1L4 10l6.6-1.9L12 2Z"
        className="fill-current"
        opacity="0.9"
      />
    </svg>
  );
}

/* -----------------------------------------------------------------------------
 * Primitives
 * -------------------------------------------------------------------------- */

export function Pill(props: {
  children: React.ReactNode;
  tone?: "brand" | "muted" | "ghost";
  className?: string;
}) {
  const tone = props.tone ?? "muted";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-wide",
        tone === "brand" && "bg-white/10 text-white ring-1 ring-white/15",
        tone === "muted" && "bg-white/5 text-white/80 ring-1 ring-white/10",
        tone === "ghost" && "bg-transparent text-white/70 ring-1 ring-white/10",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

export function Badge(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white ring-1 ring-white/15",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

export function Button(props: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: "_blank";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const v = props.variant ?? "secondary";
  const cls = cx(
    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    "disabled:opacity-50 disabled:pointer-events-none",
    v === "primary" && "bg-white text-black hover:bg-white/90",
    v === "secondary" && "bg-white/10 text-white hover:bg-white/14 ring-1 ring-white/15",
    v === "ghost" && "bg-transparent text-white/80 hover:bg-white/8 ring-1 ring-white/12",
    props.className
  );

  const content = (
    <>
      {props.iconLeft}
      <span>{props.children}</span>
      {props.iconRight ? (
        <span className="ml-1 inline-flex items-center transition-transform group-hover:translate-x-0.5">
          {props.iconRight}
        </span>
      ) : null}
    </>
  );

  if (props.href) {
    const rel = props.target === "_blank" ? "noreferrer" : undefined;
    return (
      <Link href={props.href} target={props.target} rel={rel} className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={cls} disabled={props.disabled}>
      {content}
    </button>
  );
}

export function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "rounded-3xl bg-white/[0.04] ring-1 ring-white/10",
        "shadow-[0_30px_80px_rgba(0,0,0,0.55)]",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function Divider(props: { className?: string }) {
  return <div className={cx("my-12 h-px w-full bg-white/10", props.className)} />;
}

export function Stat(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
      <div className="text-xs uppercase tracking-widest text-white/60">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{props.value}</div>
      {props.hint ? <div className="mt-1 text-sm text-white/60">{props.hint}</div> : null}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * Inputs
 * -------------------------------------------------------------------------- */

export function MiniInput(props: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/60">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        className={cx(
          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
        )}
      />
    </label>
  );
}

export function MiniSelect(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/60">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={cx(
          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white",
          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
        )}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0B0B10]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -----------------------------------------------------------------------------
 * Layout helpers
 * -------------------------------------------------------------------------- */

export function SectionHeader(props: { eyebrow: string; title: string; desc: string; right?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Pill tone="ghost" className="uppercase">
            <IconAnkh className="h-4 w-4" />
            <span className="opacity-90">{props.eyebrow}</span>
          </Pill>
        </div>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {props.title}
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-white/70">{props.desc}</p>
      </div>
      {props.right ? <div className="md:ml-8">{props.right}</div> : null}
    </div>
  );
}

export function LargeLinkRow(props: { label: string; desc: string; href: string }) {
  return (
    <Link
      href={props.href}
      target="_blank"
      rel="noreferrer"
      className={cx(
        "group flex items-center justify-between gap-6 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10",
        "hover:bg-white/[0.05] transition"
      )}
    >
      <div>
        <div className="text-base font-semibold text-white">{props.label}</div>
        <div className="mt-1 text-sm text-white/60">{props.desc}</div>
      </div>
      <div className="flex items-center gap-2 text-white/70">
        <span className="hidden text-sm md:inline">Open</span>
        <IconArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/* -----------------------------------------------------------------------------
 * Background / FX helpers
 * -------------------------------------------------------------------------- */

export function NoiseOverlay(props: { className?: string; opacity?: number }) {
  const opacity = props.opacity ?? 0.1;
  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0", props.className)}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px",
      }}
    />
  );
}

export function RadialGlow(props: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute rounded-full blur-3xl", props.className)}
      style={props.style}
    />
  );
}

export function AnchorGrid(props: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 overflow-hidden", props.className)}>
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "68px 68px",
          maskImage: "radial-gradient(circle at 50% 20%, black 0%, black 35%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-24 top-10 rotate-6 text-white/10"
        style={{ fontSize: 180, letterSpacing: 20, fontWeight: 700, userSelect: "none" }}
      >
        ☥ ☥ ☥
      </div>
      <div
        className="absolute -right-24 bottom-20 -rotate-6 text-white/10"
        style={{ fontSize: 160, letterSpacing: 16, fontWeight: 700, userSelect: "none" }}
      >
        ☥ ☥
      </div>
    </div>
  );
}

export function FloatingCursorSpotlight(props: { disabled?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 120, damping: 22 });
  const ys = useSpring(y, { stiffness: 120, damping: 22 });

  useEffect(() => {
    if (props.disabled) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [props.disabled, x, y]);

  return (
    <div ref={ref} className={cx("absolute inset-0", props.className)}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          left: xs,
          top: ys,
          width: 360,
          height: 360,
          background: "radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 70%)",
          opacity: 0.9,
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * Modal (accessible-ish: ESC, backdrop click, body lock, focus ring)
 * -------------------------------------------------------------------------- */

export function Modal(props: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useLockBody(props.open);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  return (
    <AnimatePresence>
      {props.open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={props.onClose} />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#0B0B10] ring-1 ring-white/12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="flex items-center gap-2 text-white/70">
                  <IconAnkh className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">Yarden Pass</span>
                </div>
                <h3 className="mt-1 text-xl font-semibold text-white">{props.title}</h3>
              </div>
              <button
                onClick={props.onClose}
                className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Close modal"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{props.children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* -----------------------------------------------------------------------------
 * Image helpers (optional): consistent wrappers
 * -------------------------------------------------------------------------- */

export function MediaCover(props: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  overlay?: boolean;
  overlayClassName?: string;
}) {
  return (
    <div className={cx("relative", props.className)}>
      <Image
        src={props.src}
        alt={props.alt}
        fill
        priority={props.priority}
        sizes={props.sizes}
        className="object-cover"
      />
      {props.overlay ? (
        <div className={cx("absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent", props.overlayClassName)} />
      ) : null}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * Tiny “toast” helper (optional)
 * -------------------------------------------------------------------------- */

export function useTimeoutFlag(ms = 1200) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [on, ms]);
  return { on, setOn };
}
