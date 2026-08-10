// app/page.client.tsx — Yarden 2026 redesign (v3)
// Scoped under `.yd` (redesign.css). Fixes: now-playing cycles singles,
// catalogue spotlights ONLY projects (EPs) with correct links, lyrics rotate,
// video autoplays + advances, tour poster from CMS, cleaner merch, working Pass.
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./redesign.css";

import type { ReleaseItem } from "../components/landing/ReleasesSection";
import type { VisualItem } from "../components/landing/VisualsSection";
import type { ShowItem, TourConfig } from "../components/landing/TourSection";
import type { MerchItem, StoreConfig } from "../components/landing/StoreSection";
import { PassModal } from "../components/landing/PassModal";

/* ---------- real links ---------- */
const SOCIAL = {
  instagram: "https://www.instagram.com/thisisyarden/",
  tiktok: "https://www.tiktok.com/@thisisyarden",
  x: "https://x.com/thisisyarden",
  youtube: "https://www.youtube.com/@thisisyarden",
  audiomack: "https://audiomack.com/thisisyarden",
};

/* ---------- lyrics (rotates) ----------
   ⚠️ EDIT ME: line 1 is confirmed (ME & U). Replace/extend with Yarden's own
   deepest lines — keep each short. This array is all that drives the rotation. */
const LYRICS: Array<{ line: string; song: string }> = [
  { line: "You know I\u2019m the only one that you need in your life", song: "ME & U" },
  { line: "Even when the pressure comes, I don\u2019t break", song: "Pressure" },
  { line: "Time waits for no one \u2014 so I move", song: "Time" },
  { line: "Cold world, but the soul still burns", song: "Soul" },
];

/* ---------- icons ---------- */
const Ankh = ({ s = 18 }: { s?: number }) => (
  <svg width={(s * 26) / 40} height={s} viewBox="0 0 26 40" fill="none" aria-hidden>
    <g stroke="currentColor" strokeWidth={3} strokeLinecap="round"><ellipse cx="13" cy="10" rx="7" ry="8.2" /><line x1="13" y1="18" x2="13" y2="35" /><line x1="5.5" y1="23" x2="20.5" y2="23" /></g>
  </svg>
);
const Play = ({ s = 13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);
const Arrow = ({ s = 16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M7 17L17 7M17 7H8M17 7v9" /></svg>);
const IG = () => (<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>);
const TT = () => (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 3c.3 2.3 1.8 4 4 4.2v3c-1.5.1-2.9-.4-4-1.2v6.5A6.5 6.5 0 1 1 9.5 9v3.1a3.4 3.4 0 1 0 3.5 3.4V3H16z" /></svg>);
const XI = () => (<svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.5L5.5 22H2.4l7.8-8.9L1.5 2h6.9l4.5 6 5.9-6zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" /></svg>);
const YTIcon = () => (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12zM9.8 15V9l5.2 3-5.2 3z" /></svg>);

/* ---------- helpers ---------- */
const PLAT_ORDER: Array<[string, string]> = [
  ["spotify", "Spotify"], ["apple", "Apple Music"], ["audiomack", "Audiomack"],
  ["youtube", "YouTube"], ["tidal", "Tidal"], ["boomplay", "Boomplay"], ["deezer", "Deezer"],
];
const FALLBACK_ART = "/Pictures/hero3.jpg";
const artOf = (s?: string) => (s && s.length ? s : FALLBACK_ART);
const ytId = (url?: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
// robust: is this release a PROJECT (EP/album), not a single?
const isProject = (r: any) => {
  const blob = `${r?.format ?? ""} ${r?.subtitle ?? ""} ${(r?.chips ?? []).join(" ")}`.toLowerCase();
  if (/\b(ep|album|mixtape|lp)\b/.test(blob)) return true;
  if (/\bsingle\b/.test(blob)) return false;
  return Array.isArray(r?.tracklist) && r.tracklist.length >= 2;
};
const listenOf = (r: any) => r?.links?.[r?.primary ?? "spotify"] ?? r?.fanLink ?? r?.links?.spotify ?? r?.links?.audiomack ?? "#";

type NavItem = { id: string; label: string };
type PressItem = { id: string; title: string; outlet: string; date: string; href: string; image?: string; tag?: string; excerpt?: string };

export type PageClientProps = {
  headerOffset?: number; links?: any; nav?: NavItem[];
  heroA?: { src: string; alt?: string }; heroB?: { src: string; alt?: string };
  releases: ReleaseItem[]; visuals: VisualItem[];
  tourConfig?: TourConfig; shows: ShowItem[];
  storeConfig?: StoreConfig; merch: MerchItem[];
  press?: PressItem[]; isAdmin?: boolean;
};

declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void; } }

export default function PageClient(props: PageClientProps) {
  const { heroA, heroB, releases = [], visuals = [], shows = [], merch = [], press = [], tourConfig, links } = props;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [reduce, setReduce] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const openPass = useCallback(() => { setMenuOpen(false); setPassOpen(true); }, []);

  useEffect(() => { setReduce(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    if (reduce) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [reduce]);

  /* ---------- projects vs singles ---------- */
  const projects = useMemo(() => {
    const p = releases.filter(isProject);
    return p.length ? p : releases.slice(0, 1);
  }, [releases]);
  const singles = useMemo(() => {
    const s = releases.filter((r) => !projects.includes(r));
    return s.length ? s : releases;
  }, [releases, projects]);

  /* ---------- catalogue spotlight (projects only, rotates) ---------- */
  const [epIdx, setEpIdx] = useState(0);
  useEffect(() => {
    if (reduce || projects.length < 2) return;
    const t = setInterval(() => setEpIdx((i) => (i + 1) % projects.length), 6500);
    return () => clearInterval(t);
  }, [reduce, projects.length]);
  const ep: any = projects[epIdx] ?? projects[0] ?? {};
  const epLinks = ep?.links ?? {};
  const epPrimary = ep?.primary ?? "spotify";
  const epPlatforms = PLAT_ORDER.filter(([k]) => epLinks[k]);
  const epListen = listenOf(ep);

  /* ---------- now playing (singles, rotates) ---------- */
  const [npIdx, setNpIdx] = useState(0);
  useEffect(() => {
    if (reduce || singles.length < 2) return;
    const t = setInterval(() => setNpIdx((i) => (i + 1) % singles.length), 3800);
    return () => clearInterval(t);
  }, [reduce, singles.length]);
  const np: any = singles[npIdx] ?? singles[0] ?? {};

  /* ---------- lyrics (rotates) ---------- */
  const [lyIdx, setLyIdx] = useState(0);
  useEffect(() => {
    if (reduce || LYRICS.length < 2) return;
    const t = setInterval(() => setLyIdx((i) => (i + 1) % LYRICS.length), 5600);
    return () => clearInterval(t);
  }, [reduce]);
  const ly = LYRICS[lyIdx];

  /* ---------- hero crossfade ---------- */
  const heroImgs = [heroA, heroB].filter((h): h is { src: string; alt?: string } => !!h?.src);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (reduce || heroImgs.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroImgs.length), 5500);
    return () => clearInterval(t);
  }, [reduce, heroImgs.length]);

  /* ---------- live video wall ---------- */
  const vids = useMemo(() => visuals.map((v: any) => ({ ...v, yid: ytId(v.href) })).filter((v) => v.yid), [visuals]);
  const [vIdx, setVIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [apiTick, setApiTick] = useState(0);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!vids.length) return;
    if (window.YT?.Player) { setApiTick((t) => t + 1); return; }
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api"; tag.id = "yt-iframe-api";
      document.head.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); setApiTick((t) => t + 1); };
  }, [vids.length]);

  useEffect(() => {
    if (!vids.length || !window.YT?.Player || playerRef.current) return;
    playerRef.current = new window.YT.Player("yt-slot", {
      videoId: vids[0].yid,
      playerVars: { autoplay: 1, mute: 1, rel: 0, modestbranding: 1, playsinline: 1, controls: 1 },
      events: {
        onReady: (e: any) => { try { e.target.mute(); e.target.playVideo(); } catch {} setTimeout(() => setPlaying(true), 900); },
        onStateChange: (e: any) => {
          const YT = window.YT;
          if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
          if (e.data === YT.PlayerState.ENDED) setVIdx((i) => (i + 1) % vids.length);
        },
      },
    });
  }, [apiTick, vids]);

  useEffect(() => {
    const p = playerRef.current;
    if (p?.loadVideoById && vids[vIdx]) { try { p.loadVideoById(vids[vIdx].yid); muted ? p.mute?.() : p.unMute?.(); } catch {} }
  }, [vIdx, vids]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current; if (!p) return;
    try { if (muted) { p.unMute?.(); p.setVolume?.(100); setMuted(false); } else { p.mute?.(); setMuted(true); } } catch {}
  }, [muted]);

  /* ---------- tour poster (admin-editable via posterSrc) ---------- */
  const tourPoster =
    (shows.find((s: any) => s?.posterSrc)?.posterSrc as string) ??
    (tourConfig as any)?.posterSrc ?? "/Pictures/yard.jpg";

  const NAV = [["#music", "Music"], ["#visuals", "Visuals"], ["#tour", "Live"], ["#store", "Store"], ["#press", "Press"], ["#join", "The List"]];

  return (
    <div className="yd" ref={rootRef}>
      <div className="grain" aria-hidden="true" />

      {/* NAV */}
      <header className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="wrap nav__in">
          <a className="brand" href="#top"><span className="ankh gold"><Ankh s={26} /></span>Yarden</a>
          <nav className="nav__links">{NAV.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <div className="nav__cta">
            <a className="btn btn--ghost" href={epListen} target="_blank" rel="noreferrer" style={{ padding: "8px 4px" }}>Listen <span className="arw"><Arrow s={14} /></span></a>
            <button className="btn btn--gold" onClick={openPass}>Get the Pass</button>
            <button className="nav__burger" aria-label="Menu" onClick={() => setMenuOpen(true)}><svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18M3 12h18M3 18h18" /></svg></button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={"mobile-menu" + (menuOpen ? " open" : "")}>
        <button className="mm-close" aria-label="Close" onClick={() => setMenuOpen(false)}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setMenuOpen(false)}>{l}<span className="mi"><Arrow s={22} /></span></a>)}
        <div className="mm-foot">
          <button className="btn btn--gold" onClick={openPass}>Get the Pass</button>
          <div className="social">
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IG /></a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><TT /></a>
            <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X"><XI /></a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero__media">
          {heroImgs.map((h, i) => (
            <div key={i} className={"hero__layer" + (i === heroIdx ? " on" : "")}><img src={h.src} alt={h.alt ?? "Yarden"} fetchPriority={i === 0 ? "high" : "low"} /></div>
          ))}
        </div>
        <div className="hero__scrim-l" /><div className="hero__scrim-b" /><div className="hero__glow" />
        <div className="hero__in">
          <div className="wrap"><div className="hero__body">
            <div className="hero__eyebrow eyebrow"><span className="ankh gold"><Ankh s={18} /></span>Yarden · The Muse Era</div>
            <h1>Yar<span className="it">den</span></h1>
            <p className="hero__sub">New nostalgia from Lagos — <b>the descendants</b> speak in Afrobeats, soul, and a little sweet chaos.</p>
            <div className="hero__actions">
              <a className="btn btn--gold" href={epListen} target="_blank" rel="noreferrer">Play <b>{ep?.title ?? "Muse"}</b> <span className="arw"><Arrow s={15} /></span></a>
              <a className="btn btn--line" href={SOCIAL.youtube} target="_blank" rel="noreferrer">Follow <span className="arw"><Arrow s={15} /></span></a>
            </div>
          </div></div>
          <div className="hero__bar"><div className="wrap hero__bar-in">
            <a className="np" key={np?.id ?? npIdx} href={listenOf(np)} target="_blank" rel="noreferrer">
              <span className="np__play"><Play /></span>
              <span><span className="np__lbl">Now Playing</span><span className="np__ttl">{np?.title ?? "Muse"}{np?.subtitle && /feat|&/i.test(np.subtitle) ? <span> · {np.subtitle}</span> : null}</span></span>
            </a>
            <a className="next" href="#tour">
              <span className="next__txt"><span className="next__lbl">Next{(shows[0] as any)?.dateLabel ? ` · ${(shows[0] as any).dateLabel}` : ""}</span><span className="next__val">{(shows[0] as any)?.city ?? "Tour"}</span></span>
              <span className="arw"><Arrow s={18} /></span>
            </a>
          </div></div>
        </div>
      </section>

      {/* MUSIC — projects spotlight */}
      <section className="sec" id="music">
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">01</span><span className="rule" />Discography</span><h2 className="sec__title">The <span className="it">projects</span></h2></div>
            <a className="btn btn--line" href={ep?.fanLink ?? epListen} target="_blank" rel="noreferrer">All platforms <span className="arw"><Arrow s={15} /></span></a>
          </div>

          <div className="feat rv">
            <div className="feat__stage" key={ep?.id ?? epIdx}>
              <a className="feat__art" href={epListen} target="_blank" rel="noreferrer">
                <span className="tag">{projects.length > 1 ? `Project ${epIdx + 1} / ${projects.length}` : `Latest · ${ep?.format ?? "EP"}`}</span>
                <img src={artOf(ep?.art)} alt={`${ep?.title} cover`} />
              </a>
              <div className="feat__meta">
                <div className="kicker">{ep?.format ?? ep?.subtitle ?? "Extended Play"}</div>
                <h3>{ep?.title}</h3>
                <div className="yr">{ep?.year}{ep?.tracklist?.length ? ` · ${ep.tracklist.length} tracks` : ""}</div>
                {ep?.tracklist?.length ? (
                  <div className="tracks">
                    {ep.tracklist.map((t: any, i: number) => (
                      <a className="track" key={i} href={epListen} target="_blank" rel="noreferrer">
                        <span className="track__n">{i + 1}</span><span className="track__t">{t.title}</span>
                        {t.meta ? <span className="track__m">{t.meta}</span> : null}
                        {t.duration ? <span className="track__d">{t.duration}</span> : null}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="plat">
                  {epPlatforms.map(([k, label]) => (<a key={k} className={k === epPrimary ? "pri" : ""} href={epLinks[k]} target="_blank" rel="noreferrer">{label}</a>))}
                </div>
                {projects.length > 1 && (
                  <div className="ep-ctl">
                    <div className="ep-dots">{projects.map((_, i) => (<button key={i} className={"ep-dot" + (i === epIdx ? " on" : "")} aria-label={`Project ${i + 1}`} onClick={() => setEpIdx(i)} />))}</div>
                    <span className="ep-badge">switching eras</span>
                    <div className="ep-arrows">
                      <button className="ep-arrow" aria-label="Previous" onClick={() => setEpIdx((i) => (i - 1 + projects.length) % projects.length)}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg></button>
                      <button className="ep-arrow" aria-label="Next" onClick={() => setEpIdx((i) => (i + 1) % projects.length)}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 6l6 6-6 6" /></svg></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {singles.length > 0 && (
            <div className="cat rv">
              <div className="cat__lbl"><span className="eyebrow" style={{ margin: 0 }}>The singles</span></div>
              <div className="cat__grid">
                {singles.slice(0, 4).map((r: any) => (
                  <a className="rel" key={r.id} href={listenOf(r)} target="_blank" rel="noreferrer">
                    <div className="rel__art"><img src={artOf(r.art)} alt={r.title} loading="lazy" decoding="async" /><span className="rel__play"><Play /></span></div>
                    <div className="rel__ttl">{r.title}</div>
                    <div className="rel__sub">{[r.format ?? r.subtitle, r.year].filter(Boolean).join(" · ")}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LYRIC — rotates */}
      <section className="lyric">
        <div className="lyric__glow" />
        <div className="wrap">
          <p className="lyric__q" key={lyIdx}><span className="mark">&ldquo;</span>{ly.line}<span className="mark">&rdquo;</span></p>
          <div className="lyric__attr" key={"a" + lyIdx}>— {ly.song}</div>
        </div>
      </section>

      {/* VISUALS — live */}
      <section className="sec" id="visuals" style={{ background: "linear-gradient(180deg,transparent,rgba(21,18,31,.5),transparent)" }}>
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">02</span><span className="rule" />Visuals</span><h2 className="sec__title">Watch the <span className="it">world</span></h2></div>
            <a className="btn btn--line" href={SOCIAL.youtube} target="_blank" rel="noreferrer">YouTube <span className="arw"><Arrow s={15} /></span></a>
          </div>
          <div className="vis rv">
            <div className={"vfeat" + (playing ? " playing" : "")}>
              <div id="yt-slot" />
              {!playing && (
                <>
                  <img src={vids[vIdx]?.yid ? `https://img.youtube.com/vi/${vids[vIdx].yid}/maxresdefault.jpg` : artOf(heroA?.src)} alt={vids[vIdx]?.title ?? "Video"} />
                  <div className="vfeat__grad" /><div className="vfeat__play"><span><Play s={24} /></span></div>
                  <div className="vfeat__cap"><div className="k">{vids[vIdx]?.kind} · {vids[vIdx]?.year}</div><h3>{vids[vIdx]?.title}</h3></div>
                </>
              )}
              {playing && (
                <button className="vmute" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                  {muted
                    ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M17 9l4 6M21 9l-4 6" /></svg>
                    : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M16 9a4 4 0 0 1 0 6" /></svg>}
                </button>
              )}
            </div>
            <div className="queue">
              <div className="queue__lbl"><span>Playing now · auto</span><span>{vids.length} films</span></div>
              {vids.slice(0, 6).map((v: any, i: number) => (
                <button className={"q" + (i === vIdx ? " active" : "")} key={v.id} onClick={() => setVIdx(i)}>
                  <span className="q__thumb"><img src={`https://img.youtube.com/vi/${v.yid}/mqdefault.jpg`} alt="" loading="lazy" /><span className="q__eq"><span /><span /><span /></span></span>
                  <div className="q__b"><div className="q__t">{v.title}</div><div className="q__m">{[v.kind, v.year].filter(Boolean).join(" · ")}</div></div>
                  <span className="q__arw"><Arrow /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOUR */}
      <section className="sec" id="tour">
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">03</span><span className="rule" />Live</span><h2 className="sec__title">On the <span className="it">road</span></h2></div>
            <button className="btn btn--line" onClick={openPass}>Get alerts <span className="arw"><Arrow s={15} /></span></button>
          </div>
          <div className="tour rv">
            <div className="ledger">
              {shows.map((s: any) => {
                const [m, d] = String(s.dateLabel ?? "").split(" ");
                const status = s.status ?? "announce";
                const statusLabel = status === "onsale" ? "On sale" : status === "soldout" ? "Sold out" : "Announced";
                return (
                  <a className="show" key={s.id} href={s.href ?? "#"} target={s.href ? "_blank" : undefined} rel="noreferrer">
                    <div className="show__date"><span className="m">{m}</span><span className="d">{d}</span></div>
                    <div><div className="show__city">{s.city}</div><div className="show__venue">{s.venue}</div></div>
                    <div className="show__status">{statusLabel}</div>
                  </a>
                );
              })}
            </div>
            <aside className="tour__aside">
              <div className="tour__portrait"><img src={tourPoster} alt="Next show" loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/Pictures/yard.jpg"; }} /></div>
              <p className="tour__note">{shows.length} {shows.length === 1 ? "date" : "dates"}. One chapter. <b>Pass holders</b> get the pre-sale window and the door before anyone else.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* STORE */}
      <section className="sec" id="store" style={{ background: "linear-gradient(180deg,transparent,rgba(21,18,31,.5),transparent)" }}>
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">04</span><span className="rule" />Store</span><h2 className="sec__title">Wear the <span className="it">era</span></h2></div>
            {(props.storeConfig as any)?.storeHref ? <a className="btn btn--line" href={(props.storeConfig as any).storeHref} target="_blank" rel="noreferrer">Full store <span className="arw"><Arrow s={15} /></span></a> : null}
          </div>
          <div className="shop2 rv">
            {merch.slice(0, 4).map((p: any) => {
              const href = p.href ?? p.links?.[0]?.href ?? "#";
              return (
                <a className="mcard" key={p.id} href={href} target={href !== "#" ? "_blank" : undefined} rel="noreferrer">
                  <div className="mcard__img">
                    {p.tag ? <span className="mcard__tag">{p.tag}</span> : null}
                    <img src={artOf(p.images?.[0])} alt={p.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="mcard__body">
                    <div className="mcard__n">{p.name}</div>
                    <div className="mcard__foot">
                      <span className="mcard__p">{p.available ? (p.price ?? "Shop") : "Drop soon"}</span>
                      <span className="mcard__cta">{p.available ? "Shop" : "Notify me"} <Arrow s={13} /></span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRESS */}
      {press.length > 0 && (
        <section className="sec" id="press">
          <div className="wrap">
            <div className="sec__head rv"><div><span className="eyebrow"><span className="num">05</span><span className="rule" />Press</span><h2 className="sec__title">In the <span className="it">room</span></h2></div></div>
            <div className="press__grid rv">
              {press.slice(0, 6).map((p) => (
                <a className="press" key={p.id} href={p.href} target="_blank" rel="noreferrer">
                  {p.image ? <div className="press__img"><img src={p.image} alt={p.outlet} loading="lazy" decoding="async" /></div> : null}
                  <div className="press__body">
                    <div className="press__top"><span className="press__outlet">{p.outlet}</span>{p.tag ? <span className="press__tag">{p.tag}</span> : null}</div>
                    <div className="press__ttl">{p.title}</div>
                    {p.excerpt ? <div className="press__ex">{p.excerpt}</div> : null}
                    <div className="press__foot"><span className="press__date">{p.date}</span><span className="press__go">Read <Arrow s={13} /></span></div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JOIN */}
      <section className="join" id="join">
        <div className="join__glow" />
        <div className="ankh-wm" aria-hidden="true"><svg width="360" height="540" viewBox="0 0 26 40" fill="none"><g stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><ellipse cx="13" cy="10" rx="7" ry="8.2" /><line x1="13" y1="18" x2="13" y2="35" /><line x1="5.5" y1="23" x2="20.5" y2="23" /></g></svg></div>
        <div className="wrap"><div className="rv">
          <span className="ankh-big"><Ankh s={60} /></span>
          <h2>Join the <span className="it">descendants</span></h2>
          <p>Early links, show alerts, and first dibs on drops. Generate your Yard Pass — it&rsquo;s free, it just means you&rsquo;re in.</p>
          <div className="form"><button className="btn btn--gold" onClick={openPass} style={{ width: "100%", justifyContent: "center" }}>Generate your Pass <span className="arw"><Arrow s={15} /></span></button></div>
          <div className="social" style={{ justifyContent: "center", marginTop: 22 }}>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IG /></a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><TT /></a>
            <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X"><XI /></a>
            <a href={SOCIAL.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><YTIcon /></a>
          </div>
        </div></div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <div className="foot__brand"><span className="ankh"><Ankh s={26} /></span> Yarden</div>
              <p className="foot__tag">New nostalgia from Lagos. The descendants, in sound.</p>
              <div className="social" style={{ marginTop: 18 }}>
                <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IG /></a>
                <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><TT /></a>
                <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X"><XI /></a>
                <a href={SOCIAL.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><YTIcon /></a>
              </div>
            </div>
            <div className="foot__cols">
              <div className="foot__col"><h4>Listen</h4>
                <a href={epLinks.spotify ?? "#"} target="_blank" rel="noreferrer">Spotify</a>
                <a href={epLinks.apple ?? "#"} target="_blank" rel="noreferrer">Apple Music</a>
                <a href={SOCIAL.audiomack} target="_blank" rel="noreferrer">Audiomack</a>
                <a href={SOCIAL.youtube} target="_blank" rel="noreferrer">YouTube</a>
              </div>
              <div className="foot__col"><h4>Follow</h4>
                <a href={SOCIAL.instagram} target="_blank" rel="noreferrer">Instagram</a>
                <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer">TikTok</a>
                <a href={SOCIAL.x} target="_blank" rel="noreferrer">X / Twitter</a>
              </div>
              <div className="foot__col"><h4>Site</h4><a href="#music">Music</a><a href="#tour">Live</a><a href="#store">Store</a><a href="#press">Press</a></div>
            </div>
          </div>
          <div className="foot__base"><span>© {new Date().getFullYear()} Yarden. All rights reserved.</span><span>Etins Records · thisisyarden.com</span></div>
        </div>
      </footer>

      <PassModal open={passOpen} onClose={() => setPassOpen(false)} />
    </div>
  );
}
