"use client";

import { ArrowUpRight, ArrowDown, Pause, Play } from "lucide-react";
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

const DEFAULTS = {
  desktop: "/videos/yarden-desktop-web.mp4",
  mobile: "/videos/yarden-mobile-web.mp4",
  desktopPoster: "/videos/yarden-desktop-poster.webp",
  mobilePoster: "/videos/yarden-mobile-poster.webp",
};

function preferredFilm(cms: string | undefined, original: string, fromEnvironment?: string) {
  // An explicit production Blob URL must be able to rescue a stale CMS video path.
  return fromEnvironment || (cms && !/^\/videos\/yarden-(desktop|mobile)(-4k|-uhd|-web)?\.mp4$/.test(cms) ? cms : original);
}

export default function YardenVideoHero({ releaseName, releaseHref, site }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const resumeRef = useRef(true);
  const [portrait, setPortrait] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [usingWebFallback, setUsingWebFallback] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion(); motion.addEventListener("change", syncMotion);
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => { setPortrait(media.matches); };
    update();
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); motion.removeEventListener("change", syncMotion); };
  }, []);

  const desktopHD = preferredFilm(site?.desktopVideo, DEFAULTS.desktop, process.env.NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL || process.env.NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL);
  const mobileHD = preferredFilm(site?.mobileVideo, DEFAULTS.mobile, process.env.NEXT_PUBLIC_YARDEN_MOBILE_4K_URL || process.env.NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL);
  const hd = portrait ? mobileHD : desktopHD;
  const poster = portrait
    ? process.env.NEXT_PUBLIC_YARDEN_MOBILE_POSTER_URL || site?.mobilePoster || DEFAULTS.mobilePoster
    : process.env.NEXT_PUBLIC_YARDEN_DESKTOP_POSTER_URL || site?.desktopPoster || DEFAULTS.desktopPoster;
  const fallbackSrc = portrait ? DEFAULTS.mobile : DEFAULTS.desktop;
  const src = portrait === null ? undefined : (usingWebFallback ? fallbackSrc : hd);

  // Restore the preferred UHD/CDN source when the device orientation or CMS selection changes.
  useEffect(() => { setUsingWebFallback(false); }, [portrait, desktopHD, mobileHD]);

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
    // React updates the source; avoid a second load that cancels the native request.
    const readyToPlay = () => {
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
  }, [src, play, reducedMotion]);

  const togglePlayback = () => {
    const film = videoRef.current;
    if (!film) return;
    if (film.paused) { resumeRef.current = true; if (failed) film.load(); void play(); }
    else { resumeRef.current = false; film.pause(); }
  };

  const handleError = () => {
    // Bad/unavailable CDN URL should not leave fans with a blank masthead.
    // Switch to the bundled, optimized silent web video before reporting failure.
    if (!usingWebFallback && src && src !== fallbackSrc) {
      setUsingWebFallback(true);
      setReady(false);
      setBuffering(true);
      setBlocked(false);
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
        autoPlay={!reducedMotion}
        muted
        playsInline
        loop
        preload={reducedMotion ? "none" : "metadata"}
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
        <div className="yv__topline"><span>FROM LAGOS, WITH FEELING.</span><span>THE ANGEL ERA / 2026</span></div>
        <div className="yv__content">
          <span className="hero-release-label"><i/> THE DEBUT ALBUM / OUT NOW</span>
          <h1>{site?.title || "ANGEL."}</h1>
          <div className="hero-release-bottom"><p>{site?.description || "Thirteen songs. Every shade of feeling."}</p><a href={releaseHref} target="_blank" rel="noreferrer" aria-label={`Stream ${releaseName}`}>STEP INSIDE <ArrowUpRight size={23}/></a></div>
        </div>
        <div className="hero-signature" aria-hidden="true">YARDEN / ANGEL ERA</div>
        <div className="yv__bottomline"><a href="#music">EXPLORE THE RECORDS <ArrowDown size={15}/></a><div className="yv__video-controls"><span>SILENT FILM</span><button type="button" onClick={togglePlayback} aria-label={playing ? "Pause background film" : "Resume background film"}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button></div></div>
        {failed && <span className="yv__loading" role="status">Film unavailable. Use the film control to retry.</span>}
        {buffering && !failed && !blocked && <span className="yv__loading" role="status">Loading the film…</span>}
      </div>
      <div className="yv__progress" aria-hidden="true"><span ref={progressRef} style={{ transform: "scaleX(0)" }} /></div>
    </section>
  );
}
