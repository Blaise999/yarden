"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// GSAP is optional but gives this page the “premium” feel.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// -----------------------------
// Landing Page (single file)
// Next.js App Router: app/page.tsx
// Tailwind CSS required
// Dependencies: framer-motion, gsap
// -----------------------------

type NavItem = {
  id: string;
  label: string;
};

type Release = {
  title: string;
  subtitle: string;
  year: string;
  art: string;
  href: string;
  chips: string[];
};

type VideoItem = {
  title: string;
  meta: string;
  thumb: string;
  href: string;
};

type ShowItem = {
  date: string;
  city: string;
  venue: string;
  href: string;
  status?: "tickets" | "soldout" | "announce";
};

type Quote = {
  quote: string;
  by: string;
  outlet: string;
};

type MerchItem = {
  name: string;
  price: string;
  image: string;
  href: string;
  tag?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function usePrefersReducedMotion() {
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

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y - 80, behavior: "smooth" });
}

function IconAnkh(props: { className?: string }) {
  // Minimal “ankh-like” glyph (original vector, not copyrighted).
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={props.className}
      fill="none"
    >
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

function IconPlay(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path
        d="M9 7.5v9l8-4.5-8-4.5Z"
        className="fill-current"
      />
    </svg>
  );
}

function IconChevron(props: { className?: string }) {
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

function IconClose(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrowUpRight(props: { className?: string }) {
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

function IconSpark(props: { className?: string }) {
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

function Pill(props: { children: React.ReactNode; tone?: "brand" | "muted" | "ghost"; className?: string }) {
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

function Button(props: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: "_blank";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  type?: "button" | "submit";
}) {
  const v = props.variant ?? "secondary";
  const cls = cx(
    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
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
    return (
      <Link href={props.href} target={props.target} className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={cls}>
      {content}
    </button>
  );
}

function SectionHeader(props: { eyebrow: string; title: string; desc: string; right?: React.ReactNode }) {
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
        <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-white/70">
          {props.desc}
        </p>
      </div>
      {props.right ? <div className="md:ml-8">{props.right}</div> : null}
    </div>
  );
}

function Card(props: { children: React.ReactNode; className?: string }) {
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

function Divider() {
  return <div className="my-12 h-px w-full bg-white/10" />;
}

function NoiseOverlay() {
  // Lightweight noise using CSS gradients (no external assets).
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.10]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px",
      }}
    />
  );
}

function RadialGlow(props: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute rounded-full blur-3xl", props.className)}
      style={props.style}
    />
  );
}

function AnchorGrid() {
  // Subtle grid + “glyph” pattern background, gives premium depth.
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
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
        style={{
          fontSize: 180,
          letterSpacing: 20,
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        ☥ ☥ ☥
      </div>
      <div
        className="absolute -right-24 bottom-20 -rotate-6 text-white/10"
        style={{
          fontSize: 160,
          letterSpacing: 16,
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        ☥ ☥
      </div>
    </div>
  );
}

function FloatingCursorSpotlight(props: { disabled?: boolean }) {
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
    <div ref={ref} className="absolute inset-0">
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

function Modal(props: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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

function Stat(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
      <div className="text-xs uppercase tracking-widest text-white/60">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{props.value}</div>
      {props.hint ? <div className="mt-1 text-sm text-white/60">{props.hint}</div> : null}
    </div>
  );
}

function MiniInput(props: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/60">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={cx(
          "mt-2 w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35",
          "ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
        )}
      />
    </label>
  );
}

function MiniSelect(props: {
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

function Badge(props: { children: React.ReactNode; className?: string }) {
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

function LargeLinkRow(props: { label: string; desc: string; href: string }) {
  return (
    <Link
      href={props.href}
      target="_blank"
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

// ----------------------------------
// Main Page
// ----------------------------------

export default function Page() {
  const reducedMotion = usePrefersReducedMotion();

  const nav: NavItem[] = useMemo(
    () => [
      { id: "top", label: "Home" },
      { id: "releases", label: "Music" },
      { id: "visuals", label: "Visuals" },
      { id: "shows", label: "Tour" },
      { id: "pass", label: "Yarden Pass" },
      { id: "store", label: "Store" },
      { id: "newsletter", label: "Sign up" },
    ],
    []
  );

  // Factual-ish “world” copy based on public vibe: Ankh / new nostalgia / TOWD / Muse.
  // Keep this editable for your final brand voice.
  const releases: Release[] = useMemo(
    () => [
      {
        title: "The One Who Descends",
        subtitle: "Debut EP (T.O.W.D.)",
        year: "2023",
        art: "/media/yarden/era-towd.jpg",
        href: "https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd",
        chips: ["Afrobeats", "New nostalgia", "World-building"],
      },
      {
        title: "Muse",
        subtitle: "EP",
        year: "2025",
        art: "/media/yarden/era-muse.jpg",
        href: "https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd",
        chips: ["Aesthetic era", "Ankh code", "Visual first"],
      },
    ],
    []
  );

  const videos: VideoItem[] = useMemo(
    () => [
      {
        title: "Wetin (Official Video)",
        meta: "Music video • YouTube",
        thumb: "/media/yarden/video-wetin.jpg",
        href: "https://www.youtube.com/watch?v=9lT3tKmYLO8",
      },
      {
        title: "Time (Visualiser)",
        meta: "Visualiser • YouTube",
        thumb: "/media/yarden/video-time.jpg",
        href: "https://www.youtube.com/watch?v=pNcM1elCxTA",
      },
      {
        title: "Live Session (Placeholder)",
        meta: "Performance • Add later",
        thumb: "/media/yarden/video-live.jpg",
        href: "https://www.youtube.com/",
      },
      {
        title: "Behind The Era (Placeholder)",
        meta: "BTS • Add later",
        thumb: "/media/yarden/video-bts.jpg",
        href: "https://www.youtube.com/",
      },
    ],
    []
  );

  const shows: ShowItem[] = useMemo(
    () => [
      { date: "APR 12", city: "Lagos", venue: "— Venue TBA", href: "#", status: "announce" },
      { date: "MAY 03", city: "Abuja", venue: "— Venue TBA", href: "#", status: "announce" },
      { date: "JUN 21", city: "London", venue: "— Venue TBA", href: "#", status: "announce" },
      { date: "JUL 09", city: "Berlin", venue: "— Venue TBA", href: "#", status: "announce" },
    ],
    []
  );

  const quotes: Quote[] = useMemo(
    () => [
      {
        quote: "A new voice carving worlds—sound, symbol, and feeling in one direction.",
        by: "Editor’s Note",
        outlet: "Press Placeholder",
      },
      {
        quote: "The era concept is intentional. Every detail points to a bigger story.",
        by: "Culture Writer",
        outlet: "Press Placeholder",
      },
      {
        quote: "He isn’t just releasing songs—he’s building a visual language.",
        by: "Playlist Curator",
        outlet: "Press Placeholder",
      },
    ],
    []
  );

  const merch: MerchItem[] = useMemo(
    () => [
      { name: "Ankh Tee (Black)", price: "₦ —", image: "/media/yarden/merch-tee.jpg", href: "#", tag: "Drop soon" },
      { name: "Era Poster (A2)", price: "₦ —", image: "/media/yarden/merch-poster.jpg", href: "#", tag: "Limited" },
      { name: "Ankh Cap", price: "₦ —", image: "/media/yarden/merch-cap.jpg", href: "#", tag: "New" },
      { name: "Pass Holder Lanyard", price: "₦ —", image: "/media/yarden/merch-lanyard.jpg", href: "#", tag: "Exclusive" },
    ],
    []
  );

  const [active, setActive] = useState("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  // Pass generator fields (placeholder; later you’ll swap in your real generator flow)
  const [passName, setPassName] = useState("");
  const [passCity, setPassCity] = useState("");
  const [passTier, setPassTier] = useState("Ankh");
  const [passColor, setPassColor] = useState("Obsidian");
  const [passResult, setPassResult] = useState<string | null>(null);

  useLockBody(menuOpen);

  // Scroll spy
  useEffect(() => {
    const ids = nav.map((n) => n.id).filter((id) => id !== "top");
    const observers: IntersectionObserver[] = [];

    const setFromId = (id: string) => {
      setActive(id);
    };

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setFromId(id);
          });
        },
        { threshold: 0.22 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [nav]);

  // GSAP hero pin + morph (lightweight, optional)
  useEffect(() => {
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>("#hero-pin");
      const frame = document.querySelector<HTMLElement>("#hero-frame");
      const artA = document.querySelector<HTMLElement>("#hero-art-a");
      const artB = document.querySelector<HTMLElement>("#hero-art-b");
      if (!hero || !frame || !artA || !artB) return;

      // Pin for a premium “Revolut-like” moment
      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "+=700",
        pin: true,
        pinSpacing: true,
        scrub: false,
      });

      gsap.fromTo(
        frame,
        { borderRadius: 36, scale: 0.98 },
        {
          borderRadius: 22,
          scale: 1,
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=700",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        artA,
        { opacity: 1, filter: "blur(0px)" },
        {
          opacity: 0,
          filter: "blur(10px)",
          scrollTrigger: { trigger: hero, start: "top top", end: "+=700", scrub: 1 },
        }
      );

      gsap.fromTo(
        artB,
        { opacity: 0, filter: "blur(12px)", scale: 1.06 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          scrollTrigger: { trigger: hero, start: "top top", end: "+=700", scrub: 1 },
        }
      );
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  const socials = useMemo(
    () => [
      { label: "Instagram", href: "https://www.instagram.com/thisisyarden/" },
      { label: "X (Twitter)", href: "https://x.com/thisisyarden" },
      { label: "YouTube", href: "https://www.youtube.com/" },
      { label: "Spotify", href: "https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd" },
    ],
    []
  );

  const tiers = useMemo(
    () => [
      { label: "Ankh", value: "Ankh" },
      { label: "Muse", value: "Muse" },
      { label: "Descend", value: "Descend" },
    ],
    []
  );

  const colors = useMemo(
    () => [
      { label: "Obsidian", value: "Obsidian" },
      { label: "Ivory", value: "Ivory" },
      { label: "Aurum", value: "Aurum" },
      { label: "Saffron", value: "Saffron" },
    ],
    []
  );

  const onGeneratePass = () => {
    const name = passName.trim();
    if (!name) {
      setPassResult("Enter a name to generate your pass.");
      return;
    }
    const city = passCity.trim() || "—";
    const code = `${passTier.toUpperCase()}-${name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPassResult(`Pass created • ${code} • ${city} • ${passColor}`);
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      {/* Global background */}
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.06),transparent_60%)]" />
          <NoiseOverlay />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-[120] border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
            <button
              onClick={() => smoothScrollTo("top")}
              className="group flex items-center gap-3"
              aria-label="Go to top"
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <IconAnkh className="h-5 w-5 text-white/90" />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Yarden</div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/60">new nostalgia</div>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-2 md:flex">
              {nav.slice(1).map((n) => (
                <button
                  key={n.id}
                  onClick={() => smoothScrollTo(n.id)}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm transition",
                    active === n.id ? "bg-white/10 text-white ring-1 ring-white/15" : "text-white/70 hover:bg-white/8 hover:text-white"
                  )}
                >
                  {n.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden md:inline-flex"
                href="https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd"
                target="_blank"
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
              >
                Listen
              </Button>
              <Button
                variant="primary"
                onClick={() => setPassOpen(true)}
                iconLeft={<IconSpark className="h-4 w-4" />}
              >
                Generate Pass
              </Button>
              <button
                className="ml-1 inline-flex rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10 md:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <span className="block h-4 w-5">
                  <span className="block h-0.5 w-5 rounded-full bg-white/80" />
                  <span className="mt-1.5 block h-0.5 w-5 rounded-full bg-white/60" />
                  <span className="mt-1.5 block h-0.5 w-5 rounded-full bg-white/40" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              className="fixed inset-0 z-[180]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ y: 14, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 14, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="absolute left-4 right-4 top-4 overflow-hidden rounded-3xl bg-[#0B0B10] ring-1 ring-white/12"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <IconAnkh className="h-5 w-5 text-white/90" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">Yarden</div>
                      <div className="text-xs uppercase tracking-[0.24em] text-white/60">new nostalgia</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                    aria-label="Close menu"
                  >
                    <IconClose className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="grid gap-2">
                    {nav.slice(1).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setMenuOpen(false);
                          setTimeout(() => smoothScrollTo(n.id), 50);
                        }}
                        className={cx(
                          "flex items-center justify-between rounded-2xl px-4 py-3 text-left transition",
                          "bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.05]"
                        )}
                      >
                        <span className="text-sm font-medium text-white">{n.label}</span>
                        <IconChevron className="h-5 w-5 text-white/60" />
                      </button>
                    ))}
                  </div>

                  <Divider />

                  <div className="grid gap-2">
                    {socials.map((s) => (
                      <LargeLinkRow
                        key={s.label}
                        label={s.label}
                        desc="Official profile"
                        href={s.href}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Hero (Pinned) */}
        <main id="top">
          <section id="hero-pin" className="relative">
            <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-14">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
                {/* Left: Copy */}
                <div className="relative">
                  <Pill tone="brand" className="uppercase">
                    <IconAnkh className="h-4 w-4" />
                    <span>☥ ankh-coded world</span>
                  </Pill>

                  <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                    Where sound becomes symbol.
                  </h1>

                  <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 md:text-lg">
                    Yarden’s universe is built on “new nostalgia” — music, visuals, and moments that feel ancient and futuristic at the same time.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      href="https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd"
                      target="_blank"
                      iconRight={<IconArrowUpRight className="h-4 w-4" />}
                    >
                      Listen on Spotify
                    </Button>
                    <Button
                      variant="secondary"
                      href="https://www.instagram.com/thisisyarden/"
                      target="_blank"
                      iconRight={<IconArrowUpRight className="h-4 w-4" />}
                    >
                      Follow on Instagram
                    </Button>
                    <Button variant="ghost" onClick={() => setPassOpen(true)} iconLeft={<IconSpark className="h-4 w-4" />}>
                      Generate Yarden Pass
                    </Button>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-3 md:max-w-xl md:grid-cols-3">
                    <Stat label="Era" value="Muse" hint="Current aesthetic" />
                    <Stat label="Symbol" value="☥ Ankh" hint="Soul • life • purity" />
                    <Stat label="Mood" value="Nostalgia+" hint="Warm • cinematic" />
                  </div>

                  <div className="mt-10 flex flex-wrap gap-2">
                    <Badge>Afrobeats</Badge>
                    <Badge>Alt-R&B touch</Badge>
                    <Badge>Visual-first rollouts</Badge>
                    <Badge>World-building</Badge>
                  </div>
                </div>

                {/* Right: Hero Frame */}
                <div className="relative">
                  <div className="absolute inset-0 -z-10">
                    <RadialGlow
                      className="left-10 top-6 h-72 w-72 bg-white/10"
                      style={{ transform: "translate3d(0,0,0)" }}
                    />
                    <RadialGlow className="right-0 top-24 h-80 w-80 bg-white/8" />
                    <AnchorGrid />
                  </div>

                  <div
                    id="hero-frame"
                    className={cx(
                      "relative overflow-hidden rounded-[36px] bg-white/[0.03] ring-1 ring-white/12",
                      "shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
                    )}
                  >
                    <FloatingCursorSpotlight disabled={reducedMotion} />

                    {/* Primary hero art (A) */}
                    <div id="hero-art-a" className="relative aspect-[4/5] w-full">
                      <Image
                        src="/media/yarden/hero.jpg"
                        alt="Yarden hero image"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                          <div>
                            <div className="text-xs uppercase tracking-[0.28em] text-white/70">Now playing</div>
                            <div className="mt-1 text-base font-semibold">Wetin</div>
                            <div className="mt-0.5 text-sm text-white/60">Tap to open the full hub</div>
                          </div>
                          <Button
                            variant="primary"
                            href="https://www.youtube.com/watch?v=9lT3tKmYLO8"
                            target="_blank"
                            iconLeft={<IconPlay className="h-5 w-5" />}
                          >
                            Watch
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Secondary hero art (B) used for morph */}
                    <div
                      id="hero-art-b"
                      className="pointer-events-none absolute inset-0 opacity-0"
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src="/media/yarden/hero-b.jpg"
                          alt="Yarden alternate hero"
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                        <div className="absolute top-5 left-5 right-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="muted">☥ new nostalgia</Pill>
                            <Pill tone="muted">Muse era</Pill>
                            <Pill tone="muted">Visual language</Pill>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom edge */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-white/12" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                    <span>Scroll to enter the world</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span>Live</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero footer spacer (helps the pin feel natural) */}
            <div className="h-20 md:h-24" />
          </section>

          {/* Releases */}
          <section id="releases" className="relative py-20 md:py-24">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Music"
                title="Pick an era. Press play."
                desc="Two entry points to the sound: the descent (T.O.W.D.) and the muse. Later we’ll swap these links to your smart-link hub."
                right={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      href="https://open.spotify.com/playlist/37i9dQZF1DZ06evO0L96Ci"
                      target="_blank"
                      iconRight={<IconArrowUpRight className="h-4 w-4" />}
                    >
                      This Is Yarden
                    </Button>
                    <Button
                      variant="ghost"
                      href="https://music.youtube.com/channel/UCzuDODFcf4rDKOtN6Dmfcbg"
                      target="_blank"
                      iconRight={<IconArrowUpRight className="h-4 w-4" />}
                    >
                      YouTube Music
                    </Button>
                  </div>
                }
              />

              <div className="grid gap-6 md:grid-cols-2">
                {releases.map((r) => (
                  <Card key={r.title} className="overflow-hidden">
                    <div className="grid md:grid-cols-[.9fr_1.1fr]">
                      <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                        <Image
                          src={r.art}
                          alt={`${r.title} cover`}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                        <div className="absolute left-4 top-4">
                          <Pill tone="brand">{r.year}</Pill>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {r.chips.map((c) => (
                            <Badge key={c}>{c}</Badge>
                          ))}
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{r.title}</h3>
                        <p className="mt-1 text-sm text-white/60">{r.subtitle}</p>

                        <div className="mt-6 flex flex-wrap gap-2">
                          <Button
                            variant="primary"
                            href={r.href}
                            target="_blank"
                            iconRight={<IconArrowUpRight className="h-4 w-4" />}
                          >
                            Open on Spotify
                          </Button>
                          <Button variant="ghost" onClick={() => setPassOpen(true)} iconLeft={<IconSpark className="h-4 w-4" />}>
                            Join the Pass
                          </Button>
                        </div>

                        <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                          <div className="text-xs uppercase tracking-widest text-white/60">Ankh note</div>
                          <div className="mt-2 text-sm text-white/70">
                            Build the rollout like a film: teaser → single → visual → live moment → community unlock.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Visuals */}
          <section id="visuals" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Visuals"
                title="Cinematic drops, not random posts."
                desc="This section is designed as a premium video gallery: clean cards, soft hover motion, and a consistent visual rhythm."
                right={
                  <Button
                    variant="secondary"
                    href="https://www.youtube.com/watch?v=9lT3tKmYLO8"
                    target="_blank"
                    iconRight={<IconArrowUpRight className="h-4 w-4" />}
                  >
                    Featured video
                  </Button>
                }
              />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {videos.map((v) => (
                  <Link
                    key={v.title}
                    href={v.href}
                    target="_blank"
                    className={cx(
                      "group relative overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10",
                      "shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
                    )}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={v.thumb}
                        alt={v.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <Pill tone="muted">
                          <IconPlay className="h-4 w-4" />
                          Watch
                        </Pill>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="text-xs uppercase tracking-widest text-white/60">{v.meta}</div>
                      <div className="mt-2 text-base font-semibold text-white">{v.title}</div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                        <span>Open</span>
                        <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconAnkh className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Visual system</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Consistency beats complexity.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    A clean system (type scale, spacing, cover ratios, shadow level) makes every drop look expensive.
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconSpark className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Rollout format</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">One story per era.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Don’t mix aesthetics. Each era gets a palette, motif, and poster style. That’s how “worlds” happen.
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconArrowUpRight className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Conversion</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Every card leads somewhere.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    No dead ends: videos → hub, tour → tickets, pass → sign-up, merch → checkout.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Tour */}
          <section id="shows" className="relative py-20 md:py-24">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Tour"
                title="Shows that feel like chapters."
                desc="This is styled to support a tour widget later (Bandsintown/Seated) while still looking professional today."
                right={
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => alert("Later: connect Bandsintown/Seated API")}>
                      Connect tour widget
                    </Button>
                    <Button variant="ghost" onClick={() => alert("Later: enable show alerts via email/SMS")}>
                      Notify me
                    </Button>
                  </div>
                }
              />

              <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-[1.2fr_.8fr]">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Near you</Badge>
                      <Badge>City filters</Badge>
                      <Badge>Ticket CTA</Badge>
                    </div>

                    <div className="mt-6 divide-y divide-white/10">
                      {shows.map((s, idx) => (
                        <div
                          key={`${s.city}-${idx}`}
                          className="flex items-center justify-between gap-6 py-5"
                        >
                          <div className="flex items-center gap-5">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                              <div className="text-center">
                                <div className="text-xs font-semibold tracking-wide text-white/80">{s.date.split(" ")[0]}</div>
                                <div className="text-base font-semibold tracking-tight">{s.date.split(" ")[1]}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-white">{s.city}</div>
                              <div className="mt-0.5 text-sm text-white/60">{s.venue}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {s.status === "soldout" ? (
                              <Pill tone="muted">Sold out</Pill>
                            ) : s.status === "announce" ? (
                              <Pill tone="muted">Announcing soon</Pill>
                            ) : (
                              <Pill tone="brand">Tickets</Pill>
                            )}

                            <Button
                              variant="ghost"
                              href={s.href === "#" ? "https://www.heisrema.com/tour/" : s.href}
                              target="_blank"
                              iconRight={<IconArrowUpRight className="h-4 w-4" />}
                              className="px-4 py-2"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative min-h-[320px]">
                    <Image
                      src="/media/yarden/tour-poster.jpg"
                      alt="Tour poster"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="rounded-3xl bg-black/40 p-5 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-[0.28em] text-white/60">Tour mode</div>
                        <div className="mt-2 text-lg font-semibold">Bring the world to life.</div>
                        <p className="mt-2 text-sm text-white/60">
                          Use a tour widget later, but keep this poster space for headline announcements and city runs.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => alert("Later: open ticket platform")}>
                            Ticket portal
                          </Button>
                          <Button variant="secondary" onClick={() => setPassOpen(true)}>
                            Pass perks
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Yarden Pass */}
          <section id="pass" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Community"
                title="Yarden Pass — a fan identity system."
                desc="This is the “professional secret”: a community mechanic. It turns visitors into members and makes every rollout easier."
                right={
                  <Button variant="primary" onClick={() => setPassOpen(true)} iconLeft={<IconSpark className="h-4 w-4" />}>
                    Generate yours
                  </Button>
                }
              />

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-7">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconAnkh className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Identity</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Not a “newsletter”. A key.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    People don’t like signing up. They *do* like joining a world. A pass makes it feel special.
                  </p>
                </Card>

                <Card className="p-7">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconSpark className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Perks</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Unlocks, early access, drops.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Pass holders get early links, merch access, show alerts, and hidden pages for each era.
                  </p>
                </Card>

                <Card className="p-7">
                  <div className="flex items-center gap-2 text-white/70">
                    <IconArrowUpRight className="h-5 w-5" />
                    <div className="text-xs uppercase tracking-widest">Growth</div>
                  </div>
                  <div className="mt-4 text-lg font-semibold">Every share becomes a funnel.</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Pass cards are shareable. Fans post them. The site grows without ads.
                  </p>
                </Card>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                <Card className="overflow-hidden">
                  <div className="relative h-full p-7">
                    <div className="absolute inset-0 opacity-[0.18]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_55%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.10),transparent_55%)]" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <IconAnkh className="h-5 w-5" />
                          <div className="text-xs uppercase tracking-widest">Preview</div>
                        </div>
                        <Pill tone="muted">Tap “Generate Pass” to open</Pill>
                      </div>

                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 backdrop-blur-xl">
                          <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-[0.28em] text-white/60">Yarden Pass</div>
                            <IconAnkh className="h-5 w-5 text-white/70" />
                          </div>
                          <div className="mt-4 text-xl font-semibold tracking-tight">
                            {passName.trim() ? passName : "Your Name"}
                          </div>
                          <div className="mt-2 text-sm text-white/60">
                            Tier: <span className="text-white/80">{passTier}</span>
                          </div>
                          <div className="mt-1 text-sm text-white/60">
                            City: <span className="text-white/80">{passCity.trim() ? passCity : "—"}</span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <Badge>{passColor}</Badge>
                            <Badge>☥</Badge>
                            <Badge>Member</Badge>
                          </div>

                          <div className="mt-6 h-px bg-white/10" />
                          <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                            <span>Code: ANKH-XXX-0000</span>
                            <span>thisisyarden.com</span>
                          </div>
                        </div>

                        <div className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10">
                          <div className="text-xs uppercase tracking-widest text-white/60">What this unlocks</div>
                          <ul className="mt-3 space-y-3 text-sm text-white/70">
                            <li className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                              Early links to new music + visuals
                            </li>
                            <li className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                              Merch access (limited drops)
                            </li>
                            <li className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                              Show alerts (city-based)
                            </li>
                            <li className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                              Hidden “era pages” (behind the scenes)
                            </li>
                          </ul>

                          <div className="mt-6">
                            <Button variant="primary" onClick={() => setPassOpen(true)} className="w-full">
                              Generate your pass
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="relative h-full">
                    <Image
                      src="/media/yarden/pass-wall.jpg"
                      alt="Pass wall"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="rounded-3xl bg-black/45 p-6 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-[0.28em] text-white/60">Ankh mantra</div>
                        <div className="mt-2 text-lg font-semibold">Soul. Purity. Life.</div>
                        <p className="mt-2 text-sm text-white/60">
                          Keep the symbol present, but elegant — not loud. Like a signature.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="secondary" onClick={() => smoothScrollTo("newsletter")}>
                            Join mailing list
                          </Button>
                          <Button variant="ghost" href="https://x.com/thisisyarden" target="_blank" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                            See updates
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Store */}
          <section id="store" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Store"
                title="Merch that matches the era."
                desc="Even if the real store is Shopify later, this preview grid makes the page feel like a major artist hub."
                right={
                  <Button variant="secondary" href="#" iconRight={<IconArrowUpRight className="h-4 w-4" />}>
                    Open store
                  </Button>
                }
              />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {merch.map((m) => (
                  <Link
                    key={m.name}
                    href={m.href}
                    className={cx(
                      "group overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10",
                      "hover:bg-white/[0.05] transition"
                    )}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {m.tag ? (
                        <div className="absolute left-4 top-4">
                          <Pill tone="brand">{m.tag}</Pill>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-5">
                      <div className="text-base font-semibold">{m.name}</div>
                      <div className="mt-1 text-sm text-white/60">{m.price}</div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                        <span>View</span>
                        <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {quotes.map((q, i) => (
                  <Card key={i} className="p-7">
                    <div className="text-xs uppercase tracking-widest text-white/60">{q.outlet}</div>
                    <div className="mt-4 text-lg font-semibold leading-snug text-white">
                      “{q.quote}”
                    </div>
                    <div className="mt-4 text-sm text-white/60">{q.by}</div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section id="newsletter" className="relative py-20 md:py-24">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.09),transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <SectionHeader
                eyebrow="Sign up"
                title="Get drops first."
                desc="This is where you connect Resend/Mailchimp later. For now it’s a polished form with validation-ready structure."
              />

              <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                  <div className="p-7 md:p-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Early links</Badge>
                      <Badge>Show alerts</Badge>
                      <Badge>Merch drops</Badge>
                    </div>

                    <form
                      className="mt-8 grid gap-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert("Later: connect to email provider (Resend/Mailchimp).");
                      }}
                    >
                      <MiniInput label="Email" placeholder="you@example.com" value={""} onChange={() => {}} type="email" />
                      <div className="grid gap-4 md:grid-cols-2">
                        <MiniInput label="City" placeholder="Lagos" value={""} onChange={() => {}} />
                        <MiniSelect label="Interest" value={"Music + Visuals"} onChange={() => {}} options={[
                          { label: "Music + Visuals", value: "Music + Visuals" },
                          { label: "Tour alerts", value: "Tour alerts" },
                          { label: "Merch drops", value: "Merch drops" },
                          { label: "All updates", value: "All updates" },
                        ]} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <Button variant="primary" type="submit">
                          Join list
                        </Button>
                        <Button variant="ghost" onClick={() => setPassOpen(true)} iconLeft={<IconSpark className="h-4 w-4" />}>
                          Or generate pass
                        </Button>
                        <span className="text-xs text-white/50">
                          No spam. Only drops, moments, and tickets.
                        </span>
                      </div>
                    </form>
                  </div>

                  <div className="relative min-h-[320px]">
                    <Image
                      src="/media/yarden/newsletter.jpg"
                      alt="Newsletter background"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="rounded-3xl bg-black/45 p-6 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-[0.28em] text-white/60">Next drop</div>
                        <div className="mt-2 text-lg font-semibold">Make the rollout a ritual.</div>
                        <p className="mt-2 text-sm text-white/60">
                          Tease → reveal → release → visual → live moment → community unlock.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Footer */}
              <footer className="mt-16 border-t border-white/10 pt-10">
                <div className="grid gap-8 md:grid-cols-3 md:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                        <IconAnkh className="h-5 w-5 text-white/90" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold">Yarden</div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/60">new nostalgia</div>
                      </div>
                    </div>
                    <p className="mt-4 max-w-sm text-sm text-white/60">
                      A premium artist hub built for rollouts, visuals, and community — designed to scale with new eras.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-xs uppercase tracking-widest text-white/60">Explore</div>
                    {nav.slice(1).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => smoothScrollTo(n.id)}
                        className="text-left text-sm text-white/70 hover:text-white"
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-2">
                    <div className="text-xs uppercase tracking-widest text-white/60">Social</div>
                    {socials.map((s) => (
                      <Link key={s.label} href={s.href} target="_blank" className="text-sm text-white/70 hover:text-white">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
                  <span>© {new Date().getFullYear()} Yarden • All rights reserved</span>
                  <span className="inline-flex items-center gap-2">
                    <IconAnkh className="h-4 w-4" />
                    Built for eras
                  </span>
                </div>
              </footer>
            </div>
          </section>
        </main>

        {/* Pass Generator Modal */}
        <Modal open={passOpen} onClose={() => setPassOpen(false)} title="Generate your Yarden Pass">
          <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <div className="grid gap-4">
              <MiniInput
                label="Name on pass"
                placeholder="Your name"
                value={passName}
                onChange={setPassName}
              />
              <MiniInput
                label="City"
                placeholder="Lagos"
                value={passCity}
                onChange={setPassCity}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <MiniSelect label="Tier" value={passTier} onChange={setPassTier} options={tiers} />
                <MiniSelect label="Colorway" value={passColor} onChange={setPassColor} options={colors} />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="primary" onClick={onGeneratePass} iconLeft={<IconSpark className="h-4 w-4" />}>
                  Generate
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPassName("");
                    setPassCity("");
                    setPassTier("Ankh");
                    setPassColor("Obsidian");
                    setPassResult(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  href="https://www.instagram.com/thisisyarden/"
                  target="_blank"
                  iconRight={<IconArrowUpRight className="h-4 w-4" />}
                >
                  Follow
                </Button>
              </div>

              <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-widest text-white/60">Note</div>
                <div className="mt-2 text-sm text-white/70">
                  This is a placeholder generator UI. Next step: we’ll connect it to your real pass system (save to DB, generate image/PDF, unique QR, share link).
                </div>
              </div>

              {passResult ? (
                <div className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/12">
                  <div className="text-xs uppercase tracking-widest text-white/60">Result</div>
                  <div className="mt-2 text-sm text-white/80">{passResult}</div>
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.10),transparent_55%)]" />
                <NoiseOverlay />
              </div>

              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60">Yarden Pass</div>
                  <IconAnkh className="h-6 w-6 text-white/75" />
                </div>

                <div className="mt-5 text-2xl font-semibold tracking-tight">
                  {passName.trim() ? passName : "Your Name"}
                </div>

                <div className="mt-2 text-sm text-white/60">
                  Tier: <span className="text-white/80">{passTier}</span>
                </div>
                <div className="mt-1 text-sm text-white/60">
                  City: <span className="text-white/80">{passCity.trim() ? passCity : "—"}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>{passColor}</Badge>
                  <Badge>☥</Badge>
                  <Badge>Member</Badge>
                </div>

                <div className="mt-8 rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-widest text-white/60">Share</div>
                  <div className="mt-2 text-sm text-white/70">
                    Next we’ll generate a shareable card image + public URL (e.g. <span className="text-white/85">/pass/ANKH-ABC-1234</span>).
                  </div>
                </div>

                <div className="mt-6 h-px bg-white/10" />

                <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                  <span>thisisyarden.com</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
