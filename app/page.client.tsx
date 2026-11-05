// app/page.client.tsx — Yarden 2026 redesign (v3)
// Scoped under `.yd` (redesign.css). Fixes: now-playing cycles singles,
// catalogue spotlights ONLY projects (EPs) with correct links, lyrics rotate,
// video autoplays + advances, tour poster from CMS, cleaner merch, working Pass.
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./redesign.css";
import "./yarden-film.css";
import "./yarden-angel-v10.css";
import YardenVideoHero from "../components/landing/YardenVideoHero";
import YardenMusicGallery from "../components/landing/YardenMusicGallery";

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
  press?: PressItem[]; isAdmin?: boolean; site?: { eyebrow:string;title:string;tagline:string;description:string;desktopVideo:string;mobileVideo:string;desktopPoster:string;mobilePoster:string };
};


export default function PageClient(props: PageClientProps) {
  const { releases = [], visuals = [], shows = [], merch = [], press = [], tourConfig } = props;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [joinEmail, setJoinEmail] = useState("");
  const [joinConsent, setJoinConsent] = useState(false);
  const [joinStatus, setJoinStatus] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const joinAudience = async (e: React.FormEvent) => {
    e.preventDefault(); setJoinBusy(true); setJoinStatus("");
    try {
      const res = await fetch("/api/newsletter", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email:joinEmail, consent:joinConsent }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup unavailable");
      setJoinStatus(data.message); setJoinEmail(""); setJoinConsent(false);
    } catch (e: any) { setJoinStatus(e.message || "Signup unavailable"); }
    finally { setJoinBusy(false); }
  };
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

  /* Main listening link; album selection is handled within the release gallery. */
  const ep: any = projects[0] ?? {};
  const epLinks = ep?.links ?? {};
  const epListen = listenOf(ep);

  /* The visuals wall is click-to-play. Avoid hidden iframe autoplay, blocked
     player API initialization, and overlays that intercept YouTube controls. */
  const vids = useMemo(() => visuals.map((v: any) => ({ ...v, yid: ytId(v.href) })).filter((v) => v.yid), [visuals]);
  const [vIdx, setVIdx] = useState(0);
  const [videoStarted, setVideoStarted] = useState(false);
  const selectedVisual = vids[vIdx];
  const selectVisual = (index: number) => {
    setVIdx(index);
    setVideoStarted(true);
  };

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
      {/* Film: separate high-performance desktop and mobile edits */}
      <YardenVideoHero site={props.site} releaseName={projects[0]?.title || "ANGEL"} releaseHref={projects[0] ? listenOf(projects[0]) : SOCIAL.youtube} />

      {/* A kinetic album-era ticker, not a second oversized hero. */}
      <div className="angel-ticker" aria-label="ANGEL, the debut album, out now, thirteen tracks">
        <div className="angel-ticker__track" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => <span key={i}>ANGEL <b>✳</b> YARDEN <b>✳</b> THE DEBUT ALBUM <b>✳</b> 13 TRACKS <b>✳</b> </span>)}
        </div>
      </div>

      {/* Discography: ANGEL-led album listening room and the singles rail */}
      <YardenMusicGallery releases={releases} />

      <section className="angel-editorial" id="the-story" aria-label="Meet the artist behind ANGEL">
        <div className="angel-editorial__media rv">
          <div className="angel-editorial__hero-image"><img src="/Pictures/hero2.png" loading="lazy" decoding="async" alt="Portrait of Yarden wearing an ankh necklace" /></div>
          <div className="angel-editorial__stamp" aria-hidden="true"><span>THE</span><strong>ANGEL</strong><span>ERA</span></div>
          <div className="angel-editorial__inset"><img src="/Pictures/yarden3.png" loading="lazy" decoding="async" alt="Yarden, artistic portrait" /></div>
          <span className="angel-editorial__photoline">THE ARTIST / THE MANY SIDES</span>
        </div>
        <div className="angel-editorial__story rv">
          <span className="angel-editorial__eyebrow"><span /> BEHIND THE SOUND · 02 / 04</span>
          <div className="angel-editorial__index" aria-hidden="true">Y.</div>
          <h2>Not one mood.<br/><em>A whole world.</em></h2>
          <p className="angel-editorial__lead">Raised in Lagos, surrounded by his mother’s gospel and his father’s DJ records, Yarden grew up hearing music from more than one direction.</p>
          <p>There’s tenderness and tension in his melodies. Traces of old-school pop, modern rhythm and the freedom to move between genres. <i>ANGEL</i> is the latest chapter in that search.</p>
          <div className="angel-editorial__line" aria-hidden="true" />
          <a href="#visuals" className="angel-editorial__link">Step into the visuals <span>↗</span></a>
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
            <div className={"vfeat" + (videoStarted ? " playing" : "")}>
              {videoStarted && selectedVisual ? (
                <iframe
                  key={selectedVisual.yid}
                  src={`https://www.youtube-nocookie.com/embed/${selectedVisual.yid}?autoplay=1&playsinline=1&rel=0`}
                  title={`${selectedVisual.title} — Yarden official video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button type="button" className="vfeat__launch" onClick={() => selectedVisual && setVideoStarted(true)} aria-label={`Play ${selectedVisual?.title || "Yarden video"}`}>
                  <img src={selectedVisual?.yid ? `https://img.youtube.com/vi/${selectedVisual.yid}/hqdefault.jpg` : artOf(props.heroA?.src)} alt="" />
                  <span className="vfeat__grad" />
                  <span className="vfeat__play"><span><Play s={27} /></span></span>
                  <span className="vfeat__cap"><span className="k">{selectedVisual?.kind || "VISUAL STORY"} · {selectedVisual?.year || "YARDEN"}</span><strong>{selectedVisual?.title || "Explore the visuals"}</strong></span>
                </button>
              )}
              {selectedVisual && <a className="vfeat__external" href={selectedVisual.href} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${selectedVisual.title} on YouTube`}>↗</a>}
            </div>
            <div className="queue">
              <div className="queue__lbl"><span>CHOOSE A FILM</span><span>{vids.length} VISUALS</span></div>
              {vids.slice(0, 6).map((v: any, i: number) => (
                <button className={"q" + (i === vIdx ? " active" : "")} key={v.id} onClick={() => selectVisual(i)} type="button">
                  <span className="q__thumb"><img src={`https://img.youtube.com/vi/${v.yid}/mqdefault.jpg`} alt="" loading="lazy" /><span className="q__eq"><span /><span /><span /></span></span>
                  <span className="q__b"><span className="q__t">{v.title}</span><span className="q__m">{[v.kind, v.year].filter(Boolean).join(" · ")}</span></span>
                  <span className="q__arw"><Arrow /></span>
                </button>
              ))}
              <a className="queue__more" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer">ALL VIDEOS ON YOUTUBE <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* TOUR */}
      <section className="sec" id="tour">
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">03</span><span className="rule" />Live</span><h2 className="sec__title">On the <span className="it">road</span></h2></div>
            <a className="btn btn--line" href="#join">Get updates <span className="arw"><Arrow s={15} /></span></a>
          </div>
          <div className="tour rv">
            <div className="ledger">
              {shows.length === 0 && <div className="tour__empty"><span>01 / LIVE EXPERIENCES</span><strong>The next chapter<br/><em>is coming.</em></strong><p>Nothing announced yet. Real dates and official ticket links will appear here first.</p><a href="#join">Get official updates <Arrow s={16} /></a></div>}
              {shows.map((s: any) => {
                const [m, d] = String(s.dateLabel ?? "").split(" ");
                const status = s.status ?? "announce";
                const statusLabel = status === "onsale" || status === "tickets" ? "Tickets" : status === "soldout" ? "Sold out" : "Announced";
                const canBook = !!s.href && status !== "soldout";
                return (
                  <a className="show" key={s.id} href={canBook ? s.href : "#join"} target={canBook ? "_blank" : undefined} rel="noreferrer">
                    <div className="show__date"><span className="m">{m}</span><span className="d">{d}</span></div>
                    <div><div className="show__city">{s.city}</div><div className="show__venue">{s.venue}</div></div>
                    <div className="show__status">{statusLabel}</div>
                  </a>
                );
              })}
            </div>
            <aside className="tour__aside">
              <div className="tour__portrait"><img src={tourPoster} alt="Next show" loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/Pictures/yard.jpg"; }} /></div>
              <p className="tour__note">{shows.length ? `${shows.length} announced ${shows.length === 1 ? "date" : "dates"}.` : "Official dates will appear here when confirmed."} Follow Yarden for verified ticket announcements.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* STORE */}
      <section className="sec" id="store" style={{ background: "linear-gradient(180deg,transparent,rgba(21,18,31,.5),transparent)" }}>
        <div className="wrap">
          <div className="sec__head rv">
            <div><span className="eyebrow"><span className="num">04</span><span className="rule" />Store</span><h2 className="sec__title">Pieces of the <span className="it">world</span></h2></div>
            {(props.storeConfig as any)?.storeHref ? <a className="btn btn--line" href={(props.storeConfig as any).storeHref} target="_blank" rel="noreferrer">Full store <span className="arw"><Arrow s={15} /></span></a> : null}
          </div>
          <div className="shop2 rv">
            {merch.length === 0 && <div className="shop2__empty"><span>THE ARCHIVE / YARDEN OBJECTS</span><h3>Something to<br/><em>keep close.</em></h3><p>Merchandise hasn't been announced. Join the list for official drops.</p><a href="#join">JOIN THE LIST ↗</a></div>}
            {merch.map((p: any) => {
              const direct = p.href || p.links?.find((l: any) => l.href && l.href !== "#")?.href;
              const href = p.available && direct ? direct : "#join";
              return (
                <a className="mcard" key={p.id} href={href} target={href !== "#join" ? "_blank" : undefined} rel="noreferrer">
                  <div className="mcard__img">
                    {p.tag ? <span className="mcard__tag">{p.tag}</span> : null}
                    <img src={artOf(p.images?.[0])} alt={p.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="mcard__body">
                    <div className="mcard__n">{p.name}</div>
                    <div className="mcard__foot">
                      <span className="mcard__p">{p.available ? (p.price ?? "Shop") : "Drop soon"}</span>
                      <span className="mcard__cta">{p.available && direct ? "Shop" : "Coming soon"} <Arrow s={13} /></span>
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
            <div className="sec__head rv"><div><span className="eyebrow"><span className="num">05</span><span className="rule" />Press</span><h2 className="sec__title">Beyond the <span className="it">record</span></h2></div></div>
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
        <div className="wrap join__layout"><div className="rv join__main">
          <span className="join__eyebrow">YOU'RE INVITED / NO GATEKEEPING</span>
          <span className="ankh-big"><Ankh s={60} /></span>
          <h2>This world<br/>is <span className="it">yours too.</span></h2>
          <p>For the people who hear more than a melody. Make your free Yard Pass, then choose whether you want the news from Yarden’s world.</p>
          <div className="form"><button className="btn btn--gold" onClick={openPass} style={{ width: "100%", justifyContent: "center" }}>Generate your Pass <span className="arw"><Arrow s={15} /></span></button></div>
          <form onSubmit={joinAudience} className="mx-auto mt-6 max-w-lg space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60" htmlFor="yarden-newsletter-email">Join the updates list (optional)</label>
            <div className="flex flex-wrap gap-2">
              <input id="yarden-newsletter-email" type="email" required value={joinEmail} onChange={e => setJoinEmail(e.target.value)} placeholder="Your email" className="min-w-[180px] flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white" />
              <button className="rounded-lg bg-[#E4B13C] px-4 py-2 font-semibold text-black disabled:opacity-50" disabled={joinBusy || !joinConsent} type="submit">{joinBusy ? "Saving…" : "Join list"}</button>
            </div>
            <label className="flex items-start gap-2 text-xs text-white/65"><input type="checkbox" checked={joinConsent} onChange={e => setJoinConsent(e.target.checked)} className="mt-0.5" /> I agree to receive future music, merch and tour updates. Joining is separate from getting a Yard Pass.</label>
            <p className="text-xs text-white/45">Only opted-in fans receive promotional emails. Unsubscribe at any time. Delivery requires configured email service.</p>
            {joinStatus && <p role="status" className="text-sm text-[#E4B13C]">{joinStatus}</p>}
          </form>
          <div className="social" style={{ justifyContent: "center", marginTop: 22 }}>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IG /></a>
            <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><TT /></a>
            <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X"><XI /></a>
            <a href={SOCIAL.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><YTIcon /></a>
          </div>
        </div>
          <div className="join__card rv" aria-hidden="true">
            <span className="join__card-orbit">✳</span>
            <span className="join__card-small">YARDEN — THE YARD</span>
            <span className="join__card-ankh"><Ankh s={126} /></span>
            <strong>ANGEL.</strong>
            <div><span>YOUR PASS / YOUR STORY</span><span>EST. MMXXVI</span></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <div className="foot__brand"><span className="ankh"><Ankh s={26} /></span> Yarden</div>
              <p className="foot__tag">Old-school inspiration. New feelings. Music with a soul.</p>
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
          <div className="foot__wordmark" aria-hidden="true">YARDEN<span>✳</span></div>
          <div className="foot__base"><span>© {new Date().getFullYear()} Yarden. All rights reserved.</span><span>Etins Records · Yarden / ANGEL</span></div>
        </div>
      </footer>

      <PassModal open={passOpen} onClose={() => setPassOpen(false)} />
    </div>
  );
}
