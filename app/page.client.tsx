// app/page.client.tsx — Yarden 2026 redesign
// Self-contained landing. All styling is scoped under `.yd` (see redesign.css),
// so it can't leak into /admin or anywhere else. Wired to your CMS props.
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./redesign.css";

import type { ReleaseItem } from "../components/landing/ReleasesSection";
import type { VisualItem } from "../components/landing/VisualsSection";
import type { ShowItem, TourConfig } from "../components/landing/TourSection";
import type { MerchItem, StoreConfig } from "../components/landing/StoreSection";
import { PassModal } from "../components/landing/PassModal";

/* ---------- tiny inline icons ---------- */
const Ankh = ({ s = 18 }: { s?: number }) => (
  <svg width={(s * 26) / 40} height={s} viewBox="0 0 26 40" fill="none" aria-hidden>
    <g stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <ellipse cx="13" cy="10" rx="7" ry="8.2" />
      <line x1="13" y1="18" x2="13" y2="35" />
      <line x1="5.5" y1="23" x2="20.5" y2="23" />
    </g>
  </svg>
);
const Play = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);
const Arrow = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M7 17L17 7M17 7H8M17 7v9" />
  </svg>
);

/* ---------- helpers ---------- */
const PLAT_ORDER: Array<[string, string]> = [
  ["spotify", "Spotify"],
  ["apple", "Apple Music"],
  ["audiomack", "Audiomack"],
  ["youtube", "YouTube"],
  ["tidal", "Tidal"],
  ["soundcloud", "SoundCloud"],
  ["deezer", "Deezer"],
];

const FALLBACK_ART = "/Pictures/hero3.jpg";
function artOf(src?: string) {
  return src && src.length ? src : FALLBACK_ART;
}

type NavItem = { id: string; label: string };

export type PageClientProps = {
  headerOffset?: number;
  links?: any;
  nav?: NavItem[];
  heroA?: { src: string; alt?: string };
  heroB?: { src: string; alt?: string };
  releases: ReleaseItem[];
  visuals: VisualItem[];
  tourConfig?: TourConfig;
  shows: ShowItem[];
  storeConfig?: StoreConfig;
  merch: MerchItem[];
  isAdmin?: boolean;
};

export default function PageClient(props: PageClientProps) {
  const {
    heroA,
    releases = [],
    visuals = [],
    shows = [],
    merch = [],
    links,
  } = props;

  const [scrolled, setScrolled] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const openPass = useCallback(() => setPassOpen(true), []);

  // nav background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll reveals (respects reduced motion)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ---- derive content ----
  const featured =
    releases.find((r) => (r as any).highlight) ?? releases[0];
  const catalog = releases.filter((r) => r !== featured).slice(0, 4);

  const listenHref =
    (featured as any)?.links?.spotify ?? links?.spotify ?? "#";
  const followHref = links?.youtubeChannel ?? "#";

  const featLinks = (featured as any)?.links ?? {};
  const featPrimary = (featured as any)?.primary ?? "spotify";
  const platforms = PLAT_ORDER.filter(([k]) => featLinks[k]);

  const videoFeature = visuals[0];
  const queue = visuals.slice(1, 6);

  const nowTitle =
    (featured as any)?.tracklist?.find((t: any) => /me\s*&\s*u/i.test(t.title))
      ?.title ?? "ME & U";

  return (
    <div className="yd" ref={rootRef}>
      <div className="grain" aria-hidden="true" />

      {/* ═══ NAV ═══ */}
      <header className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="wrap nav__in">
          <a className="brand" href="#top">
            <span className="ankh gold" aria-hidden>
              <Ankh s={26} />
            </span>
            Yarden
          </a>
          <nav className="nav__links">
            <a href="#music">Music</a>
            <a href="#visuals">Visuals</a>
            <a href="#tour">Live</a>
            <a href="#store">Store</a>
            <a href="#join">The List</a>
          </nav>
          <div className="nav__cta">
            <a className="btn btn--ghost" href={listenHref} target="_blank" rel="noreferrer" style={{ padding: "8px 4px" }}>
              Listen <span className="arw"><Arrow s={14} /></span>
            </a>
            <button className="btn btn--gold" onClick={openPass}>Get the Pass</button>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="hero" id="top">
        <div className="hero__media"><img src={artOf(heroA?.src)} alt={heroA?.alt ?? "Yarden"} /></div>
        <div className="hero__scrim-l" />
        <div className="hero__scrim-b" />
        <div className="hero__glow" />

        <div className="hero__in">
          <div className="wrap">
            <div className="hero__body">
              <div className="hero__eyebrow eyebrow">
                <span className="ankh gold" aria-hidden><Ankh s={18} /></span>
                Yarden · The Muse Era
              </div>
              <h1>Yar<span className="it">den</span></h1>
              <p className="hero__sub">
                New nostalgia from Lagos — <b>the descendants</b> speak in Afrobeats, soul, and a little sweet chaos.
              </p>
              <div className="hero__actions">
                <a className="btn btn--gold" href={listenHref} target="_blank" rel="noreferrer">
                  Play <b>{(featured as any)?.title ?? "Muse"}</b> <span className="arw"><Arrow s={15} /></span>
                </a>
                <a className="btn btn--line" href={followHref} target="_blank" rel="noreferrer">
                  Follow <span className="arw"><Arrow s={15} /></span>
                </a>
              </div>
            </div>
          </div>

          <div className="hero__bar">
            <div className="wrap hero__bar-in">
              <a className="np" href={listenHref} target="_blank" rel="noreferrer">
                <span className="np__play"><Play /></span>
                <span>
                  <span className="np__lbl">Now Playing</span>
                  <span className="np__ttl">{nowTitle}</span>
                </span>
              </a>
              <a className="next" href="#tour">
                <span className="next__txt">
                  <span className="next__lbl">Next{shows[0]?.dateLabel ? ` · ${shows[0].dateLabel}` : ""}</span>
                  <span className="next__val">{shows[0]?.city ?? "Tour"}</span>
                </span>
                <span className="arw"><Arrow s={18} /></span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MUSIC ═══ */}
      <section className="sec" id="music">
        <div className="wrap">
          <div className="sec__head rv">
            <div>
              <span className="eyebrow"><span className="num">01</span><span className="rule" />Discography</span>
              <h2 className="sec__title">The <span className="it">catalogue</span></h2>
            </div>
            <a className="btn btn--line" href={(featured as any)?.fanLink ?? listenHref} target="_blank" rel="noreferrer">
              All platforms <span className="arw"><Arrow s={15} /></span>
            </a>
          </div>

          {featured && (
            <div className="feat rv">
              <a className="feat__art" href={featLinks[featPrimary] ?? listenHref} target="_blank" rel="noreferrer">
                <span className="tag">Latest · {(featured as any).format ?? "EP"}</span>
                <img src={artOf((featured as any).art)} alt={`${(featured as any).title} cover`} />
              </a>
              <div className="feat__meta">
                <div className="kicker">{(featured as any).subtitle ?? "Extended Play"}</div>
                <h3>{(featured as any).title}</h3>
                <div className="yr">
                  {(featured as any).year}
                  {(featured as any).tracklist?.length ? ` · ${(featured as any).tracklist.length} tracks` : ""}
                </div>
                {(featured as any).tracklist?.length ? (
                  <div className="tracks">
                    {(featured as any).tracklist.map((t: any, i: number) => (
                      <div className="track" key={i}>
                        <span className="track__n">{i + 1}</span>
                        <span className="track__t">{t.title}</span>
                        {t.meta ? <span className="track__m">{t.meta}</span> : null}
                        {t.duration ? <span className="track__d">{t.duration}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="plat">
                  {platforms.map(([k, label]) => (
                    <a
                      key={k}
                      className={k === featPrimary ? "pri" : ""}
                      href={featLinks[k]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {catalog.length > 0 && (
            <div className="cat rv">
              <div className="cat__grid">
                {catalog.map((r) => (
                  <a
                    className="rel"
                    key={(r as any).id}
                    href={(r as any).fanLink ?? (r as any).links?.spotify ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="rel__art">
                      <img src={artOf((r as any).art)} alt={(r as any).title} />
                      <span className="rel__play"><Play /></span>
                    </div>
                    <div className="rel__ttl">{(r as any).title}</div>
                    <div className="rel__sub">
                      {[(r as any).format ?? (r as any).subtitle, (r as any).year].filter(Boolean).join(" · ")}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ LYRIC ═══ */}
      <section className="lyric">
        <div className="lyric__glow" />
        <div className="wrap">
          <p className="lyric__q rv">
            <span className="mark">&ldquo;</span>You know I&rsquo;m the only one that you need in your life<span className="mark">&rdquo;</span>
          </p>
          <div className="lyric__attr rv">— ME &amp; U</div>
        </div>
      </section>

      {/* ═══ VISUALS ═══ */}
      <section className="sec" id="visuals" style={{ background: "linear-gradient(180deg,transparent,rgba(21,18,31,.5),transparent)" }}>
        <div className="wrap">
          <div className="sec__head rv">
            <div>
              <span className="eyebrow"><span className="num">02</span><span className="rule" />Visuals</span>
              <h2 className="sec__title">Watch the <span className="it">world</span></h2>
            </div>
            <a className="btn btn--line" href={links?.youtubeChannel ?? "#"} target="_blank" rel="noreferrer">
              YouTube <span className="arw"><Arrow s={15} /></span>
            </a>
          </div>

          <div className="vis rv">
            {videoFeature && (
              <a className="vfeat" href={(videoFeature as any).href} target="_blank" rel="noreferrer">
                <img src={artOf(heroA?.src)} alt={(videoFeature as any).title} />
                <div className="vfeat__grad" />
                <div className="vfeat__play"><span><Play s={24} /></span></div>
                <div className="vfeat__cap">
                  <div className="k">{(videoFeature as any).kind} · {(videoFeature as any).year}</div>
                  <h3>{(videoFeature as any).title}</h3>
                </div>
              </a>
            )}

            <div className="queue">
              <div className="queue__lbl"><span>Up next</span><span>{visuals.length} films</span></div>
              {queue.map((v, i) => (
                <a className="q" key={(v as any).id} href={(v as any).href} target="_blank" rel="noreferrer">
                  <span className="q__n">{i + 1}</span>
                  <div className="q__b">
                    <div className="q__t">{(v as any).title}</div>
                    <div className="q__m">{[(v as any).kind, (v as any).year].filter(Boolean).join(" · ")}</div>
                  </div>
                  <span className="q__arw"><Arrow /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TOUR ═══ */}
      <section className="sec" id="tour">
        <div className="wrap">
          <div className="sec__head rv">
            <div>
              <span className="eyebrow"><span className="num">03</span><span className="rule" />Live</span>
              <h2 className="sec__title">On the <span className="it">road</span></h2>
            </div>
            <button className="btn btn--line" onClick={openPass}>
              Get alerts <span className="arw"><Arrow s={15} /></span>
            </button>
          </div>

          <div className="tour rv">
            <div className="ledger">
              {shows.map((s) => {
                const [m, d] = String((s as any).dateLabel ?? "").split(" ");
                const status = (s as any).status ?? "announce";
                const statusLabel =
                  status === "onsale" ? "On sale" : status === "soldout" ? "Sold out" : "Announced";
                return (
                  <a className="show" key={(s as any).id} href={(s as any).href ?? "#"}>
                    <div className="show__date">
                      <span className="m">{m}</span>
                      <span className="d">{d}</span>
                    </div>
                    <div>
                      <div className="show__city">{(s as any).city}</div>
                      <div className="show__venue">{(s as any).venue}</div>
                    </div>
                    <div className="show__status">{statusLabel}</div>
                  </a>
                );
              })}
            </div>
            <aside className="tour__aside">
              <div className="tour__portrait"><img src="/Pictures/yard.jpg" alt="Yarden live" /></div>
              <p className="tour__note">
                {shows.length} {shows.length === 1 ? "city" : "cities"}. One chapter.{" "}
                <b>Pass holders</b> get the pre-sale window and the door before anyone else.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══ STORE ═══ */}
      <section className="sec" id="store" style={{ background: "linear-gradient(180deg,transparent,rgba(21,18,31,.5),transparent)" }}>
        <div className="wrap">
          <div className="sec__head rv">
            <div>
              <span className="eyebrow"><span className="num">04</span><span className="rule" />Store</span>
              <h2 className="sec__title">Wear the <span className="it">era</span></h2>
            </div>
          </div>

          <div className="shop rv">
            {merch.slice(0, 5).map((p, i) => {
              const span = ["a", "b", "c", "d", "e"][i] ?? "c";
              const href = (p as any).links?.[0]?.href ?? "#";
              return (
                <a className={"prod " + span} key={(p as any).id} href={href} target="_blank" rel="noreferrer">
                  {(p as any).tag ? <span className="prod__tag">{(p as any).tag}</span> : null}
                  <img src={artOf((p as any).images?.[0])} alt={(p as any).name} />
                  <div className="prod__grad" />
                  <div className="prod__in">
                    <div>
                      <div className="prod__n">{(p as any).name}</div>
                      <div className="prod__p">{(p as any).available ? (p as any).price ?? "Shop" : "Notify me"}</div>
                    </div>
                    <span className="prod__cta"><Arrow /></span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ JOIN ═══ */}
      <section className="join" id="join">
        <div className="join__glow" />
        <div className="ankh-wm" aria-hidden="true">
          <svg width="360" height="540" viewBox="0 0 26 40" fill="none">
            <g stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
              <ellipse cx="13" cy="10" rx="7" ry="8.2" />
              <line x1="13" y1="18" x2="13" y2="35" />
              <line x1="5.5" y1="23" x2="20.5" y2="23" />
            </g>
          </svg>
        </div>
        <div className="wrap">
          <div className="rv">
            <span className="ankh-big" aria-hidden><Ankh s={60} /></span>
            <h2>Join the <span className="it">descendants</span></h2>
            <p>Early links, show alerts, and first dibs on drops. The Pass is free — it just means you hear it first.</p>
            <div className="form">
              <input type="email" placeholder="you@email.com" aria-label="Email" />
              <button className="btn btn--gold" onClick={openPass}>Get the Pass</button>
            </div>
            <div className="join__fine">No noise. Leave whenever.</div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <div className="foot__brand"><span className="ankh"><Ankh s={26} /></span> Yarden</div>
              <p className="foot__tag">New nostalgia from Lagos. The descendants, in sound.</p>
            </div>
            <div className="foot__cols">
              <div className="foot__col">
                <h4>Listen</h4>
                <a href={featLinks.spotify ?? "#"} target="_blank" rel="noreferrer">Spotify</a>
                <a href={featLinks.apple ?? "#"} target="_blank" rel="noreferrer">Apple Music</a>
                <a href={featLinks.audiomack ?? "#"} target="_blank" rel="noreferrer">Audiomack</a>
                <a href={links?.youtubeChannel ?? "#"} target="_blank" rel="noreferrer">YouTube</a>
              </div>
              <div className="foot__col">
                <h4>Follow</h4>
                <a href="#" target="_blank" rel="noreferrer">Instagram</a>
                <a href="#" target="_blank" rel="noreferrer">TikTok</a>
                <a href="#" target="_blank" rel="noreferrer">X / Twitter</a>
              </div>
              <div className="foot__col">
                <h4>Site</h4>
                <a href="#music">Music</a>
                <a href="#tour">Live</a>
                <a href="#store">Store</a>
                <a href="#join">The List</a>
              </div>
            </div>
          </div>
          <div className="foot__base">
            <span>© {new Date().getFullYear()} Yarden. All rights reserved.</span>
            <span>Etins Records · thisisyarden.com</span>
          </div>
        </div>
      </footer>

      <PassModal open={passOpen} onClose={() => setPassOpen(false)} />
    </div>
  );
}
