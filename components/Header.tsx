"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = { id: string; label: string };
type SocialItem = { label: string; href: string };

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// Tint sampling
function mixToReadable(r: number, g: number, b: number) {
  const lift = 0.22;
  const nr = Math.round(r + (255 - r) * lift);
  const ng = Math.round(g + (255 - g) * lift);
  const nb = Math.round(b + (255 - b) * lift);
  return { r: clamp(nr, 70, 235), g: clamp(ng, 70, 235), b: clamp(nb, 70, 235) };
}

function sampleAverageRGBBoth(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    return {
      raw: { r: 180, g: 180, b: 200 },
      tint: { r: 180, g: 180, b: 200 },
    };

  const w = 32;
  const h = 32;
  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  let r = 0,
    g = 0,
    b = 0,
    count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  if (!count)
    return {
      raw: { r: 180, g: 180, b: 200 },
      tint: { r: 180, g: 180, b: 200 },
    };

  const rr = Math.round(r / count);
  const gg = Math.round(g / count);
  const bb = Math.round(b / count);

  return {
    raw: { r: rr, g: gg, b: bb },
    tint: mixToReadable(rr, gg, bb),
  };
}

async function getTintFromSrc(src: string): Promise<{ raw: { r: number; g: number; b: number }; tint: { r: number; g: number; b: number } }> {
  return new Promise((resolve) => {
    const ImgCtor = (globalThis as any).Image as typeof Image | undefined;
    if (!ImgCtor) {
      resolve({ raw: { r: 180, g: 180, b: 200 }, tint: { r: 180, g: 180, b: 200 } });
      return;
    }

    const img = new ImgCtor();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = src;

    const done = () => {
      try {
        resolve(sampleAverageRGBBoth(img));
      } catch {
        resolve({ raw: { r: 180, g: 180, b: 200 }, tint: { r: 180, g: 180, b: 200 } });
      }
    };

    img.onload = done;
    img.onerror = () => resolve({ raw: { r: 180, g: 180, b: 200 }, tint: { r: 180, g: 180, b: 200 } });
  });
}

function luminance(rgb: { r: number; g: number; b: number }) {
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

// Icons
function IconClose(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
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

function MenuButton(props: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.open ? "Close menu" : "Open menu"}
      aria-expanded={props.open}
      className={cx(
        "inline-flex h-11 items-center gap-3 rounded-full px-4",
        "bg-white/10 text-white ring-1 ring-white/15",
        "hover:bg-white/14",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      )}
    >
      <span className="text-sm font-semibold tracking-tight">Menu</span>

      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <motion.span
          className="absolute block h-[2px] w-5 rounded-full bg-white"
          animate={props.open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
        <motion.span
          className="absolute block h-[2px] w-5 rounded-full bg-white/80"
          animate={props.open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.12 }}
        />
        <motion.span
          className="absolute block h-[2px] w-5 rounded-full bg-white/70"
          animate={props.open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
      </span>
    </button>
  );
}

function ActionButton(props: {
  children: React.ReactNode;
  href?: string;
  target?: "_blank";
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  iconRight?: React.ReactNode;
}) {
  const v = props.variant ?? "secondary";
  const cls = cx(
    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
    v === "primary" && "bg-white text-black hover:bg-white/90",
    v === "secondary" && "bg-white/10 text-white hover:bg-white/14 ring-1 ring-white/15",
    props.className
  );

  const content = (
    <>
      <span>{props.children}</span>
      {props.iconRight && (
        <span className="ml-1 inline-flex items-center transition-transform group-hover:translate-x-0.5">
          {props.iconRight}
        </span>
      )}
    </>
  );

  if (props.href) {
    return (
      <Link href={props.href} target={props.target} rel="noreferrer" className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={cls}>
      {content}
    </button>
  );
}

type LandingHeaderProps = {
  nav: NavItem[];
  activeId: string;

  menuOpen?: boolean;
  onOpenMenu?: () => void;
  onCloseMenu?: () => void;
  onNav?: (id: string) => void;
  onLogo?: () => void;

  tintSources?: Record<string, string>;
  heroBgSrc?: string;

  socials?: SocialItem[];
  brandName?: string;

  onOpenPass: () => void;
  listenHref?: string;
};

const LOGO_SRC = "/Pictures/yard.png";

export default function LandingHeader(props: LandingHeaderProps) {
  const brandName = props.brandName ?? "Yarden";

  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isControlled = typeof props.menuOpen === "boolean";
  const menuOpen = isControlled ? props.menuOpen! : internalMenuOpen;

  const openMenu = props.onOpenMenu ?? (() => setInternalMenuOpen(true));
  const closeMenu = props.onCloseMenu ?? (() => setInternalMenuOpen(false));
  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  const onNav = props.onNav ?? (() => {});
  const onLogo = props.onLogo ?? (() => onNav("top"));

  // Scroll progress
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const t = clamp((scrollY - 24) / 520, 0, 1);

  // Tint
  const [tint, setTint] = useState({ r: 180, g: 180, b: 200 });
  const [raw, setRaw] = useState({ r: 180, g: 180, b: 200 });
  const cacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!props.tintSources) return;

    const src =
      props.tintSources[props.activeId] ??
      props.tintSources["top"] ??
      props.tintSources[props.nav?.[0]?.id ?? "top"];

    if (!src) return;

    const cached = cacheRef.current.get(src);
    if (cached) {
      setTint(cached.tint);
      setRaw(cached.raw);
      return;
    }

    let alive = true;
    getTintFromSrc(src).then((res) => {
      if (!alive) return;
      cacheRef.current.set(src, res);
      setTint(res.tint);
      setRaw(res.raw);
    });

    return () => {
      alive = false;
    };
  }, [props.activeId, props.tintSources, props.nav]);

  const cssVars = useMemo(
    () =>
      ({
        ["--tint" as any]: `${tint.r} ${tint.g} ${tint.b}`,
      } as React.CSSProperties),
    [tint]
  );

  const scrim = 0.14 + 0.56 * t;
  const blurPx = 8 + 12 * t;
  const shadowA = 0.10 + 0.24 * t;

  // ✅ Logo rule you want:
  // - light hero: keep logo NORMAL (no matte filter)
  // - dark hero: make logo WHITE
  const heroZone = t < 0.22;
  const heroIsLight = luminance(raw) > 0.58;
  const logoUseNormal = heroZone && heroIsLight;

  const logoFilter = logoUseNormal
    ? "none"
    : "brightness(0) invert(1) drop-shadow(0 14px 28px rgba(0,0,0,.55))";

  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(LOGO_SRC, { method: "HEAD" })
      .then((r) => {
        if (alive && !r.ok) setLogoOk(false);
      })
      .catch(() => {
        if (alive) setLogoOk(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const topImg = props.heroBgSrc ?? props.tintSources?.top;
  const useBlendInk = t < 0.16 && !!topImg;
  const inkText = cx(
    "text-white",
    useBlendInk && "mix-blend-difference",
    "[text-shadow:0_1px_12px_rgba(0,0,0,.35)]"
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[2147483647] overflow-visible"
        style={{
          ...cssVars,
          borderBottom: "none",
          boxShadow: `0 10px 30px rgba(0,0,0,${shadowA})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              opacity: scrim,
              background:
                "linear-gradient(to bottom, rgba(7,7,10,0.90), rgba(7,7,10,0.56) 55%, rgba(7,7,10,0.16))",
              backdropFilter: `blur(${blurPx}px) saturate(${1.05 + 0.15 * t})`,
              WebkitBackdropFilter: `blur(${blurPx}px) saturate(${1.05 + 0.15 * t})`,
            }}
          />
        </div>

        <div className="relative z-10 pt-[env(safe-area-inset-top)]">
          {/* ✅ Layout changed: LEFT GROUP (logo + nav) / RIGHT GROUP (actions) */}
          <div className={cx("mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8", "h-[74px] md:h-[82px]")}>
            {/* LEFT GROUP */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <button type="button" onClick={onLogo} aria-label="Go to top" className="block">
                {logoOk ? (
                  <NextImage
                    src={LOGO_SRC}
                    alt={`${brandName} logo`}
                    width={120}
                    height={56}
                    priority
                    draggable={false}
                    onError={() => setLogoOk(false)}
                    className="h-11 w-auto object-contain"
                    style={{ filter: logoFilter }}
                  />
                ) : (
                  <span
                    className={cx(
                      "text-lg font-semibold tracking-tight",
                      logoUseNormal ? "text-black" : "text-white"
                    )}
                  >
                    {brandName}
                  </span>
                )}
              </button>

              {/* Desktop Nav (NOW on logo side) */}
              <nav className={cx("hidden md:flex items-center", inkText)}>
                <div className="flex items-center gap-6">
                  {props.nav.slice(1).map((n) => {
                    const active = props.activeId === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => onNav(n.id)}
                        className={cx(
                          "relative text-sm font-medium transition-opacity",
                          active ? "opacity-100" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {n.label}
                        {active && (
                          <span
                            className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full"
                            style={{ background: "rgb(var(--tint) / 0.85)" } as any}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* RIGHT GROUP */}
            <div className="flex items-center gap-3">
              {props.listenHref && (
                <div className={cx("hidden md:block", inkText)}>
                  <Link
                    href={props.listenHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100"
                  >
                    Listen <IconArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <div className="hidden md:block">
                <ActionButton variant="primary" onClick={props.onOpenPass}>
                  Generate Pass
                </ActionButton>
              </div>

              <div className="md:hidden">
                <MenuButton open={menuOpen} onClick={toggleMenu} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[2147483646]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" onClick={closeMenu} />

            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="absolute left-4 right-4 top-4 overflow-hidden rounded-3xl bg-[#07070A] ring-1 ring-white/12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                {logoOk ? (
                  <NextImage
                    src={LOGO_SRC}
                    alt={`${brandName} logo`}
                    width={84}
                    height={84}
                    priority
                    onError={() => setLogoOk(false)}
                    className="h-[72px] w-auto object-contain"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                ) : (
                  <div className="text-lg font-semibold tracking-tight text-white">{brandName}</div>
                )}

                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="grid gap-2">
                  {props.nav.slice(1).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        closeMenu();
                        setTimeout(() => onNav(n.id), 40);
                      }}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.05] transition"
                    >
                      <span className="text-sm font-medium text-white">{n.label}</span>
                      <IconArrowUpRight className="h-5 w-5 text-white/60" />
                    </button>
                  ))}
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="grid gap-3">
                  <ActionButton
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      closeMenu();
                      props.onOpenPass();
                    }}
                  >
                    Generate Pass
                  </ActionButton>

                  {props.listenHref && (
                    <ActionButton variant="secondary" className="w-full" href={props.listenHref} target="_blank">
                      Listen
                    </ActionButton>
                  )}
                </div>

                {props.socials?.length ? (
                  <>
                    <div className="my-7 h-px bg-white/10" />
                    <div className="grid gap-2">
                      <div className="text-xs uppercase tracking-widest text-white/60">Social</div>
                      <div className="flex flex-wrap gap-2">
                        {props.socials.map((s) => (
                          <Link
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
