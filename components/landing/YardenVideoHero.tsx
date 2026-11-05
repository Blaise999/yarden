"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SiteFilm = {
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  desktopVideo: string;
  mobileVideo: string;
  desktopPoster: string;
  mobilePoster: string;
};

type Props = { releaseName: string; releaseHref: string; site?: SiteFilm };
type Quality = "hd" | "4k";

const DEFAULTS = {
  desktop: "/videos/yarden-desktop.mp4",
  mobile: "/videos/yarden-mobile.mp4",
  desktop4k: "/videos/yarden-desktop-4k.mp4",
  mobile4k: "/videos/yarden-mobile-4k.mp4",
  desktopPoster: "/videos/yarden-desktop-poster.webp",
  mobilePoster: "/videos/yarden-mobile-poster.webp",
};

function preferredFilm(cms: string | undefined, original: string, fromEnvironment?: string) {
  // An explicit production Blob URL must be able to rescue a stale CMS video path.
  return fromEnvironment || (cms && cms !== original ? cms : original);
}

/** A successful 200 from Vercel is not sufficient: a Git LFS pointer is text, not a film. */
async function isRealFilm(url: string, signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", signal });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") || "";
    const bytes = Number(res.headers.get("content-length") || "0");
    return !/(text\/|json|html)/i.test(type) && (bytes === 0 || bytes > 1_000_000);
  } catch { return false; }
}

export default function YardenVideoHero({ releaseName, releaseHref, site }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const resumeAtRef = useRef(0);
  const resumeRef = useRef(true);
  const [portrait, setPortrait] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<Quality>("hd");
  const [fourKAvailable, setFourKAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => { setPortrait(media.matches); setQuality("hd"); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const desktopHD = preferredFilm(site?.desktopVideo, DEFAULTS.desktop, process.env.NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL);
  const mobileHD = preferredFilm(site?.mobileVideo, DEFAULTS.mobile, process.env.NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL);
  const desktop4K = process.env.NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL || DEFAULTS.desktop4k;
  const mobile4K = process.env.NEXT_PUBLIC_YARDEN_MOBILE_4K_URL || DEFAULTS.mobile4k;
  const hd = portrait ? mobileHD : desktopHD;
  const fourK = portrait ? mobile4K : desktop4K;
  const poster = portrait
    ? process.env.NEXT_PUBLIC_YARDEN_MOBILE_POSTER_URL || site?.mobilePoster || DEFAULTS.mobilePoster
    : process.env.NEXT_PUBLIC_YARDEN_DESKTOP_POSTER_URL || site?.desktopPoster || DEFAULTS.desktopPoster;
  const src = portrait === null ? undefined : quality === "4k" && fourKAvailable ? fourK : hd;

  // The default is ALWAYS HD. Native UHD on autoplay makes phones stutter and burns data.
  // 4K is offered only if a real asset is present, and only after a visitor selects it.
  useEffect(() => {
    if (portrait === null) return;
    const controller = new AbortController();
    setFourKAvailable(false);
    void isRealFilm(fourK, controller.signal).then(ok => {
      if (!controller.signal.aborted) setFourKAvailable(ok);
    });
    return () => controller.abort();
  }, [fourK, portrait]);

  const play = useCallback(async () => {
    const film = videoRef.current;
    if (!film || !film.currentSrc) return;
    try {
      film.muted = true;
      film.volume = 0;
      await film.play();
      setBlocked(false);
      setFailed(false);
    } catch {
      setBlocked(true);
    }
  }, []);

  useEffect(() => {
    const film = videoRef.current;
    const section = sectionRef.current;
    if (!film || !section || !src) return;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReady(false);
    setBuffering(true);
    setFailed(false);
    setBlocked(false);
    film.muted = true;
    film.volume = 0;
    film.load();
    const readyToPlay = () => {
      if (resumeAtRef.current > 0 && Number.isFinite(film.duration)) {
        try { film.currentTime = Math.min(resumeAtRef.current, Math.max(0, film.duration - 0.3)); } catch { /* not seekable yet */ }
        resumeAtRef.current = 0;
      }
      if (visible && resumeRef.current && !reducedMotion.matches) void play();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (!visible) film.pause();
      else if (resumeRef.current && !reducedMotion.matches) void play();
    }, { threshold: 0.04 });
    film.addEventListener("canplay", readyToPlay);
    observer.observe(section);
    return () => { film.removeEventListener("canplay", readyToPlay); observer.disconnect(); };
  }, [src, play]);

  const switchQuality = () => {
    const film = videoRef.current;
    resumeAtRef.current = film?.currentTime || 0;
    resumeRef.current = film ? !film.paused : true;
    setQuality(prev => prev === "4k" ? "hd" : "4k");
  };

  const togglePlayback = () => {
    const film = videoRef.current;
    if (!film) return;
    if (film.paused) { resumeRef.current = true; if (failed) film.load(); void play(); }
    else { resumeRef.current = false; film.pause(); }
  };

  const handleError = () => {
    if (quality === "4k") {
      setQuality("hd"); // recover without stranding the visitor on a broken 4K URL
      return;
    }
    setFailed(true);
    setBlocked(true);
    setReady(false);
    setPlaying(false);
    setBuffering(false);
  };

  return (
    <section className="yv yv--v11 yv--v12" id="top" aria-label="Yarden — ANGEL silent film" ref={sectionRef}>
      <div className="yv__backdrop" style={{ backgroundImage: `url("${poster}")` }} aria-hidden="true" />
      <video
        ref={videoRef}
        className={`yv__video ${ready ? "is-ready" : ""}`}
        src={src}
        poster={poster}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
        aria-label="Silent ANGEL cinematic film"
        onLoadedData={() => { setReady(true); setBuffering(false); }}
        onPlaying={() => { setReady(true); setPlaying(true); setBuffering(false); setFailed(false); setBlocked(false); }}
        onWaiting={() => { if (!failed) setBuffering(true); }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const film = event.currentTarget;
          if (progressRef.current && film.duration > 0 && Number.isFinite(film.duration)) {
            progressRef.current.style.transform = `scaleX(${Math.min(1, film.currentTime / film.duration)})`;
          }
        }}
        onError={handleError}
      />
      <div className="yv__gradient" aria-hidden="true" />
      <div className="yv__frame">
        <div className="yv__topline">
          <span className="yv__edition">{site?.eyebrow || "YARDEN / THE ANGEL ERA"}</span>
          <span className="yv__now"><span className="yv__pulse" /> SILENT FILM / 2026</span>
        </div>
        <div className="yv__content">
          <p className="yv__kicker">{site?.tagline || "THE DEBUT ALBUM / OUT NOW"}</p>
          <h1>{site?.title || "ANGEL."}</h1>
          <p className="yv__description">{site?.description || "Thirteen songs. An entire world of feeling."}</p>
          <div className="yv__actions">
            <a className="yv__primary" href={releaseHref} target="_blank" rel="noopener noreferrer">STREAM {releaseName || "ANGEL"} <span aria-hidden="true" className="yv__link-arrow">↗</span></a>
            <a className="yv__secondary" href="#music">Explore the catalogue <span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <div className="yv__bottomline">
          <span>YARDEN / ANGEL — THE FULL EXPERIENCE</span>
          <span className="yv__scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span>
          <div className="yv__video-controls" aria-label="Silent film controls">
            <span className="yv__film-quality">{quality === "4k" ? "4K / UHD" : "HD / FAST"}</span>
            {fourKAvailable && <button type="button" onClick={switchQuality} aria-label={quality === "4k" ? "Switch to HD" : "Switch to 4K"}>{quality === "4k" ? "HD" : "4K"}</button>}
          </div>
        </div>
        {blocked && !playing && <button className="yv__blocked" type="button" onClick={togglePlayback}>{failed ? "Film couldn't load — retry" : "Play silent film"} <span aria-hidden="true">▶</span></button>}
        {buffering && !failed && !blocked && <span className="yv__loading" aria-live="polite">LOADING FILM</span>}
      </div>
      <div className="yv__progress" aria-hidden="true"><span ref={progressRef} style={{ transform: "scaleX(0)" }} /></div>
    </section>
  );
}
