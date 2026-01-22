// LandingHeader.tsx (FULL EDIT) — overlap-safe on scroll (more solid + border + shrink)
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

// Safari detect (same philosophy as hero)
function detectSafari() {
  if (typeof navigator === "undefined") return { isSafari: false, isIOS: false };
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isWebKit = /AppleWebKit/.test(ua);
  const isNotChrome = !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/.test(ua);
  const isSafari = isWebKit && isNotChrome;
  return { isSafari, isIOS };
}

function useSafariInfo() {
  const [info, setInfo] = useState<{ isSafari: boolean; isIOS: boolean }>({
    isSafari: false,
    isIOS: false,
  });
  useEffect(() => setInfo(detectSafari()), []);
  return info;
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

async function getTintFromSrc(
  src: string
): Promise<{ raw: { r: number; g: number; b: number }; tint: { r: number; g: number; b: number } }> {
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

// two logo assets
const LOGO_LIGHT = "/Pictures/yard.png";
const LOGO_DARK = "/Pictures/yard2.png";

export default function LandingHeader(props: LandingHeaderProps) {
  const { isSafari } = useSafariInfo();
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

  // Extra solid-ification once we’re actually into content
  const solid = clamp((scrollY - 110) / 220, 0, 1);

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

  // ✅ Make the header feel “separated” from content as you scroll:
  // - more opaque scrim
  // - subtle hairline border
  // - slightly stronger shadow
  // - shrink height a bit
  const blurPx = isSafari ? 0 : 8 + 12 * t;
  const shadowA = 0.14 + 0.26 * t + 0.16 * solid;

  // overlay opacity ramps up HARDER so you don't see text/images under it
  const scrim = clamp(0.18 + 0.62 * t + 0.22 * solid, 0, 0.98);

  // gradient endpoints also get darker (reduces “overlap” look)
  const topA = clamp(0.84 + 0.12 * t + 0.08 * solid, 0, 0.98);
  const midA = clamp(0.56 + 0.22 * t + 0.12 * solid, 0, 0.95);
  const botA = clamp(0.14 + 0.18 * t + 0.10 * solid, 0, 0.7);

  const borderA = clamp(0.06 + 0.10 * t + 0.08 * solid, 0, 0.22);

  // header height shrink (prevents “overlapping slab” feeling)
  const hMobile = Math.round(74 - 10 * t); // 74 → 64
  const hDesktop = Math.round(82 - 12 * t); // 82 → 70

  // logo selection
  const heroZone = t < 0.22;
  const heroIsLight = luminance(raw) > 0.58;
  const useLightLogo = heroZone && heroIsLight;
  const logoSrc = useLightLogo ? LOGO_LIGHT : LOGO_DARK;

  const [logoOk, setLogoOk] = useState(true);
  useEffect(() => setLogoOk(true), [logoSrc]);

  const topImg = props.heroBgSrc ?? props.tintSources?.top;
  // only allow blend-difference very near the top so it doesn’t “fight” content later
  const useBlendInk = t < 0.1 && !!topImg && solid < 0.15;

  const inkText = cx(
    "text-white",
    !isSafari && useBlendInk && "mix-blend-difference",
    "[text-shadow:0_1px_12px_rgba(0,0,0,.35)]"
  );

  // Hide the normal header logo while the mobile menu is open (prevents double logo)
  const showHeaderLogo = !menuOpen;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[2147483647] overflow-visible"
        style={{
          ...cssVars,
          borderBottom: `1px solid rgba(255,255,255,${borderA})`,
          boxShadow: `0 10px 30px rgba(0,0,0,${shadowA})`,
          transform: isSafari ? undefined : "translate3d(0,0,0)",
          willChange: isSafari ? undefined : "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              opacity: scrim,
              background: `linear-gradient(to bottom,
                rgba(7,7,10,${topA}),
                rgba(7,7,10,${midA}) 55%,
                rgba(7,7,10,${botA})
              )`,
              ...(blurPx > 0
                ? {
                    backdropFilter: `blur(${blurPx}px) saturate(${1.08 + 0.12 * t})`,
                    WebkitBackdropFilter: `blur(${blurPx}px) saturate(${1.08 + 0.12 * t})`,
                  }
                : {}),
            }}
          />

          {/* tiny tint line that helps separation without looking “boxy” */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[2px]"
            style={{
              opacity: 0.24 + 0.38 * t,
              background: "linear-gradient(90deg, transparent, rgb(var(--tint) / 0.65), transparent)",
            }}
          />
        </div>

        <div className="relative z-10 pt-[env(safe-area-inset-top)]">
          {/* ✅ 3-column layout: left logo, centered nav, right actions */}
          <div
            className={cx(
              "mx-auto grid max-w-7xl items-center px-5 md:px-8",
              "grid-cols-[auto_1fr_auto]"
            )}
            style={{ height: `${hMobile}px` } as any}
          >
            {/* LEFT */}
            <div className="flex items-center">
              {showHeaderLogo ? (
                <button type="button" onClick={onLogo} aria-label="Go to top" className="block">
                  {logoOk ? (
                    <NextImage
                      src={logoSrc}
                      alt={`${brandName} logo`}
                      width={128}
                      height={52}
                      priority
                      draggable={false}
                      onError={() => setLogoOk(false)}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-lg font-semibold tracking-tight text-white [text-shadow:0_1px_18px_rgba(0,0,0,.55)]">
                      {brandName}
                    </span>
                  )}
                </button>
              ) : (
                <div className="h-10 w-[128px]" aria-hidden="true" />
              )}
            </div>

            {/* CENTER (Desktop Nav) */}
            <div className="hidden md:flex items-center justify-center">
              <nav className={cx("flex items-center", inkText)}>
                <div className="flex items-center gap-7">
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

            {/* RIGHT */}
            <div className="flex items-center justify-end gap-3">
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

          {/* Desktop height override */}
          <style jsx>{`
            @media (min-width: 768px) {
              header > div.relative > div.mx-auto {
                height: ${hDesktop}px !important;
              }
            }
          `}</style>
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
                    src={LOGO_DARK}
                    alt={`${brandName} logo`}
                    width={88}
                    height={88}
                    priority
                    onError={() => setLogoOk(false)}
                    className="h-[64px] w-auto object-contain"
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
