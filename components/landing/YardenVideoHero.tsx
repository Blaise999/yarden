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

// These small, browser-compatible H.264 files ship with the website. The hero
// never waits for a remote video before showing the moving film.
const FILMS = {
  desktop: ["/videos/yarden-desktop-web.mp4", "/videos/yarden-desktop.mp4"],
  mobile: ["/videos/yarden-mobile-web.mp4", "/videos/yarden-mobile.mp4"],
  desktopPoster: "/videos/yarden-desktop-poster.webp",
  mobilePoster: "/videos/yarden-mobile-poster.webp",
} as const;

// Production CMS may have a stale file path. Local video stays primary;
// the remote 4K source is only shown AFTER it actually starts playing.
function configuredUpgrade(cms: string | undefined, environment: string | undefined, localFiles: readonly string[]) {
  const candidate = (environment || cms || "").trim();
  if (!candidate || localFiles.includes(candidate)) return "";
  // Only safe root-relative URLs and public HTTPS video URLs are candidates.
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" ? candidate : "";
  } catch {
    return "";
  }
}

export default function YardenVideoHero({ releaseName, releaseHref, site }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const upgradeRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const wantsPlayback = useRef(true);
  const inView = useRef(true);
  const [portrait, setPortrait] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [localAttempt, setLocalAttempt] = useState(0);
  const [localReady, setLocalReady] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [upgradeFailed, setUpgradeFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const orientation = window.matchMedia("(max-width: 767px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const refreshOrientation = () => setPortrait(orientation.matches);
    const refreshMotion = () => setReduceMotion(motion.matches);
    refreshOrientation(); refreshMotion();
    const network = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    setSaveData(Boolean(network?.saveData || network?.effectiveType === "slow-2g" || network?.effectiveType === "2g"));
    orientation.addEventListener("change", refreshOrientation);
    motion.addEventListener("change", refreshMotion);
    return () => {
      orientation.removeEventListener("change", refreshOrientation);
      motion.removeEventListener("change", refreshMotion);
    };
  }, []);

  const localFiles = portrait ? FILMS.mobile : FILMS.desktop;
  const localSrc = portrait === null ? undefined : localFiles[localAttempt];
  const remoteSrc = portrait === null ? "" : configuredUpgrade(
    portrait ? site?.mobileVideo : site?.desktopVideo,
    portrait
      ? process.env.NEXT_PUBLIC_YARDEN_MOBILE_4K_URL || process.env.NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL
      : process.env.NEXT_PUBLIC_YARDEN_DESKTOP_4K_URL || process.env.NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL,
    localFiles,
  );
  const defaultPoster = portrait ? FILMS.mobilePoster : FILMS.desktopPoster;
  const poster = (portrait
    ? process.env.NEXT_PUBLIC_YARDEN_MOBILE_POSTER_URL || site?.mobilePoster
    : process.env.NEXT_PUBLIC_YARDEN_DESKTOP_POSTER_URL || site?.desktopPoster) || defaultPoster;

  // Change of device layout or admin/CDN address resets only that source's state.
  useEffect(() => {
    setLocalAttempt(0);
    setLocalReady(false);
    setUpgraded(false);
    setUpgradeFailed(false);
    setFailed(false);
    setBuffering(true);
  }, [portrait, remoteSrc]);

  const playLocal = useCallback(async (manual = false) => {
    const film = localRef.current;
    if (!film || !film.getAttribute("src") || !inView.current) return;
    if (reduceMotion && !manual) return;
    film.muted = true;
    try {
      await film.play();
      setBlocked(false);
    } catch (error) {
      // AbortError occurs when a source is swapped during play(), not because
      // autoplay was blocked. Don't misleadingly ask the visitor to tap play.
      if ((error as DOMException)?.name !== "AbortError") setBlocked(true);
    }
  }, [reduceMotion]);

  // Pause videos when offscreen. Resume the local film on return; UHD can
  // independently resume if it has proven playable.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || portrait === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = Boolean(entry?.isIntersecting);
      if (!inView.current) {
        localRef.current?.pause();
        upgradeRef.current?.pause();
      } else if (wantsPlayback.current && !reduceMotion) {
        void playLocal();
        void upgradeRef.current?.play().catch(() => {});
      }
    }, { threshold: 0.02 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [portrait, reduceMotion, playLocal]);

  // If the bundled web file was omitted during deployment or the browser
  // cannot decode it, try the second bundled H.264 file. Never spin forever.
  useEffect(() => {
    const film = localRef.current;
    if (!localSrc || !film) return;
    setBuffering(true);
    const timer = window.setTimeout(() => {
      if (film.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (localAttempt === 0) setLocalAttempt(1);
      else { setFailed(true); setBuffering(false); }
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [localSrc, localAttempt]);

  // Do not keep downloading a failed 4K file. The working local movie stays
  // visible throughout the upgrade attempt.
  useEffect(() => {
    if (!remoteSrc || !localReady || upgradeFailed || reduceMotion || saveData) return;
    const timer = window.setTimeout(() => {
      if ((upgradeRef.current?.readyState ?? 0) < HTMLMediaElement.HAVE_CURRENT_DATA) {
        setUpgradeFailed(true);
        setUpgraded(false);
      }
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [remoteSrc, localReady, upgradeFailed, reduceMotion, saveData]);

  // Crossfade to the UHD stream before suspending its local HD backup.
  useEffect(() => {
    if (!upgraded) {
      if (wantsPlayback.current && inView.current && !reduceMotion) void playLocal();
      return;
    }
    const timer = window.setTimeout(() => localRef.current?.pause(), 650);
    return () => window.clearTimeout(timer);
  }, [upgraded, playLocal, reduceMotion]);

  const onLocalError = () => {
    setLocalReady(false);
    if (localAttempt === 0) {
      setLocalAttempt(1);
      setBuffering(true);
    } else {
      setFailed(true);
      setPlaying(false);
      setBuffering(false);
    }
  };

  const onLocalPlaying = () => {
    setLocalReady(true);
    setPlaying(true);
    setFailed(false);
    setBlocked(false);
    setBuffering(false);
  };

  const tryUpgrade = () => {
    if (!wantsPlayback.current || !inView.current || reduceMotion) return;
    const remote = upgradeRef.current;
    if (!remote) return;
    remote.muted = true;
    void remote.play().catch(() => { /* HD continues uninterrupted. */ });
  };

  const downgrade = () => {
    setUpgraded(false);
    setUpgradeFailed(true);
    if (wantsPlayback.current && inView.current) void playLocal(true);
  };

  const togglePlayback = () => {
    if (wantsPlayback.current && playing) {
      wantsPlayback.current = false;
      localRef.current?.pause();
      upgradeRef.current?.pause();
      setPlaying(false);
      return;
    }
    wantsPlayback.current = true;
    setBlocked(false);
    if (failed) {
      setFailed(false);
      setLocalAttempt(0);
      localRef.current?.load();
    }
    void playLocal(true);
    void upgradeRef.current?.play().catch(() => {});
  };

  const updateProgress = (film: HTMLVideoElement) => {
    if (progressRef.current && film.duration > 0 && Number.isFinite(film.duration)) {
      progressRef.current.style.transform = `scaleX(${Math.min(1, film.currentTime / film.duration)})`;
    }
  };

  return (
    <section className="yv yv--v11 yv--v12" id="top" aria-label="Yarden — ANGEL silent film" ref={sectionRef}>
      <div className="yv__backdrop" style={{ backgroundImage: `url("${poster}"),url("${defaultPoster}")` }} aria-hidden="true" />
      {localSrc && (
        <video
          key={`hd-${portrait ? "mobile" : "desktop"}-${localAttempt}`}
          ref={localRef}
          className={`yv__video yv__video--base ${localReady ? "is-ready" : ""}`}
          src={localSrc}
          poster={defaultPoster}
          muted
          autoPlay={!reduceMotion}
          playsInline
          loop
          preload={reduceMotion ? "none" : "auto"}
          disablePictureInPicture
          aria-label="Silent ANGEL cinematic background film"
          onLoadedData={() => {
            setLocalReady(true);
            setBuffering(false);
            if (wantsPlayback.current && inView.current) void playLocal();
          }}
          onCanPlay={() => { if (wantsPlayback.current && inView.current) void playLocal(); }}
          onPlaying={onLocalPlaying}
          onWaiting={() => { if (!upgraded && !failed) setBuffering(true); }}
          onStalled={() => { if (!upgraded && !failed) setBuffering(true); }}
          onPause={() => { if (!upgraded) setPlaying(false); }}
          onTimeUpdate={event => { if (!upgraded) updateProgress(event.currentTarget); }}
          onError={onLocalError}
        />
      )}
      {remoteSrc && localReady && !upgradeFailed && !saveData && !reduceMotion && (
        <video
          key={`uhd-${portrait ? "mobile" : "desktop"}-${remoteSrc}`}
          ref={upgradeRef}
          className={`yv__video yv__video--enhanced ${upgraded ? "is-ready" : ""}`}
          src={remoteSrc}
          muted
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          aria-label="High-resolution ANGEL cinematic film"
          onLoadedData={tryUpgrade}
          onCanPlay={tryUpgrade}
          onPlaying={() => { setUpgraded(true); setPlaying(true); setBlocked(false); }}
          onWaiting={() => { if (upgraded) setUpgraded(false); }}
          onStalled={() => { if (upgraded) setUpgraded(false); }}
          onTimeUpdate={event => { if (upgraded) updateProgress(event.currentTarget); }}
          onError={downgrade}
        />
      )}
      <div className="yv__gradient" aria-hidden="true" />
      <div className="yv__frame">
        <div className="yv__topline"><span>FROM LAGOS, WITH FEELING.</span><span>THE ANGEL ERA / 2026</span></div>
        <div className="yv__content">
          <span className="hero-release-label"><i /> THE DEBUT ALBUM / OUT NOW</span>
          <h1>{site?.title || "ANGEL."}</h1>
          <div className="hero-release-bottom"><p>{site?.description || "Thirteen songs. Every shade of feeling."}</p><a href={releaseHref} target="_blank" rel="noreferrer" aria-label={`Stream ${releaseName}`}>STEP INSIDE <ArrowUpRight size={23} /></a></div>
        </div>
        <div className="hero-signature" aria-hidden="true">YARDEN / ANGEL ERA</div>
        <div className="yv__bottomline"><a href="#music">EXPLORE THE RECORDS <ArrowDown size={15} /></a><div className="yv__video-controls"><span>{upgraded ? "UHD" : "HD"} / SILENT FILM</span><button type="button" onClick={togglePlayback} aria-label={playing ? "Pause background film" : "Play background film"}>{playing ? <Pause size={15} /> : <Play size={15} />}</button></div></div>
        {failed && <span className="yv__loading" role="status">Film unavailable. Check the video files on this site.</span>}
        {blocked && !failed && <span className="yv__loading" role="status">Tap play to start the silent film.</span>}
        {buffering && !failed && !blocked && !localReady && <span className="yv__loading" role="status">Loading the film…</span>}
      </div>
      <div className="yv__progress" aria-hidden="true"><span ref={progressRef} style={{ transform: "scaleX(0)" }} /></div>
    </section>
  );
}
