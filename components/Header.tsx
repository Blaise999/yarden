// LandingHeader.tsx (FULL EDIT) — fixes:
// 1) "nav intertwines" → header will ALWAYS go glass once you're out of hero (even if scrollY isn't updating)
// 2) close (X) not working → component is only "controlled" if menuOpen + handlers are provided; otherwise it falls back to internal state
// 3) more reliable scrollY (window + documentElement/body fallback)

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
  const [info, setInfo] = useState<{ isSafari: boolean; isIOS: boolean }>({ isSafari: false, isIOS: false });
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

// Hero stage sync event
const HERO_STAGE_EVENT = "yarden:hero-stage";
type HeroStageDetail = { stage: "A" | "B"; progress: number; inHero: boolean };

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

// icon-only hamburger (no "Menu" word)
function MenuButton(props: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.open ? "Close menu" : "Open menu"}
      aria-expanded={props.open}
      className={cx(
        "inline-flex h-11 w-11 items-center justify-center rounded-full",
        "bg-white/10 text-white ring-1 ring-white/15",
        "hover:bg-white/14",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      )}
    >
      <span className="sr-only">{props.open ? "Close menu" : "Open menu"}</span>

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

  // optional "controlled" menu API
  menuOpen?: boolean;
  onOpenMenu?: () => void;
  onCloseMenu?: () => void;

  onNav?: (id: string) => void;
  onLogo?: () => void;

  tintSources?: Record<string, string>;
  heroBgSrc?: string;
  heroAltSrc?: string;

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

  // ✅ controlled only if menuOpen AND a handler exists (fixes "X not working" when parent forgot handlers)
  const hasMenuHandlers = !!(props.onOpenMenu || props.onCloseMenu);
  const isControlled = typeof props.menuOpen === "boolean" && hasMenuHandlers;

  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const menuOpen = isControlled ? props.menuOpen! : internalMenuOpen;

  const openMenu = () => {
    if (isControlled) props.onOpenMenu?.();
    else setInternalMenuOpen(true);
  };

  const closeMenu = () => {
    if (isControlled) props.onCloseMenu?.();
    else setInternalMenuOpen(false);
  };

  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  const onNav = props.onNav ?? (() => {});
  const onLogo = props.onLogo ?? (() => onNav("top"));

  // Header element (for syncing hero padding)
  const headerElRef = useRef<HTMLElement | null>(null);

  // Track if this header is used on the hero page
  const hasHero = !!(props.heroBgSrc || props.heroAltSrc);

  // Scroll progress (drives glass + shrink)
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let raf = 0;

    const readY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      (document.body ? document.body.scrollTop : 0) ||
      0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrollY(readY());
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

  // Hero stage sync (A/B while pinned)
  const [heroStage, setHeroStage] = useState<"A" | "B">("A");

  // ✅ start true if we have hero assets (prevents a top-of-page "glass flash" before the first hero event)
  const [heroIn, setHeroIn] = useState<boolean>(hasHero);

  useEffect(() => {
    const onHeroStage = (e: Event) => {
      const ce = e as CustomEvent<HeroStageDetail>;
      if (!ce.detail) return;
      setHeroStage(ce.detail.stage);
      setHeroIn(!!ce.detail.inHero);
    };
    window.addEventListener(HERO_STAGE_EVENT, onHeroStage as any);
    return () => window.removeEventListener(HERO_STAGE_EVENT, onHeroStage as any);
  }, []);

  // Shrink amount
  const t = clamp((scrollY - 10) / 240, 0, 1);

  // ✅ FIX "nav intertwines":
  // once we're OUT of hero, we ALWAYS show glass (so header never visually collides with section headings)
  const showGlass = menuOpen || scrollY > 10 || !heroIn;

  // ✅ shrink only when it makes sense (don’t shrink while menu open)
  const compact = !menuOpen && scrollY > 78;

  // ✅ Sync header height + set scroll-padding-top to prevent overlap when navigating/anchoring
  useEffect(() => {
    const el = headerElRef.current;
    if (!el) return;

    const setVar = () => {
      const h = Math.round(el.getBoundingClientRect().height);

      // used by hero/layout
      document.documentElement.style.setProperty("--header-h", `${h}px`);

      // prevents section headings from hiding under fixed header (when you nav/anchor)
      document.documentElement.style.scrollPaddingTop = `${h + 10}px`;
    };

    setVar();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => setVar());
      ro.observe(el);
    }

    window.addEventListener("resize", setVar, { passive: true });
    return () => {
      window.removeEventListener("resize", setVar);
      ro?.disconnect();
    };
  }, [compact, menuOpen]);

  // Tint
  const [tint, setTint] = useState({ r: 180, g: 180, b: 200 });
  const [raw, setRaw] = useState({ r: 180, g: 180, b: 200 });
  const cacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // Decide which image powers the header tint (NOT displayed, just sampled)
    const heroA = props.heroBgSrc ?? props.tintSources?.top;
    const heroB = props.heroAltSrc ?? heroA;

    const sectionSrc =
      props.tintSources?.[props.activeId] ??
      props.tintSources?.["top"] ??
      props.tintSources?.[props.nav?.[0]?.id ?? "top"];

    // While the hero pin is active, use the current stage image for tint
    const src = heroIn ? (heroStage === "B" ? heroB : heroA) : sectionSrc;

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
  }, [props.activeId, props.tintSources, props.nav, props.heroBgSrc, props.heroAltSrc, heroIn, heroStage]);

  const cssVars = useMemo(
    () =>
      ({
        ["--tint" as any]: `${tint.r} ${tint.g} ${tint.b}`,
      } as React.CSSProperties),
    [tint]
  );

  // Glass styling
  const scrim = showGlass ? 0.10 + 0.46 * t : 0;
  const blurPx = isSafari ? 0 : showGlass ? 10 + 10 * t : 0;
  const shadowA = showGlass ? 0.10 + 0.26 * t : 0;

  // logo selection (based on sampled luminance)
  const heroIsLight = luminance(raw) > 0.58;
  const heroZone = heroIn && scrollY < 110;
  const useLightLogo = heroZone && heroIsLight;
  const logoSrc = useLightLogo ? LOGO_LIGHT : LOGO_DARK;

  const [logoOk, setLogoOk] = useState(true);
  useEffect(() => setLogoOk(true), [logoSrc]);

  // Blend only when truly on-hero and before glass appears
  const useBlendInk = !isSafari && heroIn && !showGlass;
  const inkText = cx(
    "text-white",
    useBlendInk && "mix-blend-difference",
    "[text-shadow:0_1px_18px_rgba(0,0,0,.55)]"
  );

  // Hide the normal header logo while the mobile menu is open (prevents double logo)
  const showHeaderLogo = !menuOpen;

  const barH = compact ? "h-[66px] md:h-[70px]" : "h-[74px] md:h-[82px]";

  // reduced logo size (header stays the same)
  const logoH = compact ? "h-7 md:h-8" : "h-8 md:h-9";
  const logoSlotW = "w-[120px]";

  return (
    <>
      <header
        ref={headerElRef as any}
        className="fixed left-0 right-0 top-0 z-[2147483647] overflow-visible"
        style={{
          ...cssVars,
          borderBottom: "none",
          boxShadow: showGlass ? `0 10px 30px rgba(0,0,0,${shadowA})` : "none",
          transform: isSafari ? undefined : "translate3d(0,0,0)",
          willChange: isSafari ? undefined : "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* glass layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              opacity: scrim,
              background:
                "linear-gradient(to bottom, rgba(7,7,10,0.92), rgba(7,7,10,0.62) 55%, rgba(7,7,10,0.18))",
              ...(blurPx > 0
                ? {
                    backdropFilter: `blur(${blurPx}px) saturate(${1.05 + 0.15 * t})`,
                    WebkitBackdropFilter: `blur(${blurPx}px) saturate(${1.05 + 0.15 * t})`,
                  }
                : {}),
            }}
          />
          {showGlass ? (
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgb(var(--tint) / 0.65), transparent)" } as any}
            />
          ) : null}
        </div>

        <div className="relative z-10 pt-[env(safe-area-inset-top)]">
          <div
            className={cx(
              "mx-auto grid max-w-7xl items-center px-5 md:px-8",
              "grid-cols-[auto_1fr_auto]",
              barH,
              "transition-[height] duration-300"
            )}
          >
            {/* LEFT */}
            <div className="flex items-center">
              {showHeaderLogo ? (
                <button type="button" onClick={onLogo} aria-label="Go to top" className="block">
                  {logoOk ? (
                    <NextImage
                      src={logoSrc}
                      alt={`${brandName} logo`}
                      width={120}
                      height={48}
                      priority
                      draggable={false}
                      onError={() => setLogoOk(false)}
                      className={cx("w-auto object-contain transition-[height] duration-300", logoH)}
                    />
                  ) : (
                    <span className="text-lg font-semibold tracking-tight text-white [text-shadow:0_1px_18px_rgba(0,0,0,.55)]">
                      {brandName}
                    </span>
                  )}
                </button>
              ) : (
                <div className={cx(logoSlotW, logoH)} aria-hidden="true" />
              )}
            </div>

            {/* CENTER (Desktop Nav) */}
            <div className="hidden items-center justify-center md:flex">
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
                {!menuOpen && <MenuButton open={menuOpen} onClick={toggleMenu} />}
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
                    src={LOGO_DARK}
                    alt={`${brandName} logo`}
                    width={76}
                    height={76}
                    priority
                    onError={() => setLogoOk(false)}
                    className="h-[54px] w-auto object-contain"
                  />
                ) : (
                  <div className="text-lg font-semibold tracking-tight text-white">{brandName}</div>
                )}

                {/* ✅ X now always closes (uncontrolled or controlled) */}
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
                      className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.05]"
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
