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

const DESKTOP_FILE = "/videos/yarden-desktop.mp4";
const MOBILE_FILE = "/videos/yarden-mobile.mp4";
const DESKTOP_POSTER = "/videos/yarden-desktop-poster.webp";
const MOBILE_POSTER = "/videos/yarden-mobile-poster.webp";

function filmUrl(cmsValue: string | undefined, defaultValue: string, externalValue?: string) {
  // Uploaded film URLs in the CMS always win. For an unchanged default, an
  // optional Vercel Blob URL can bypass a Git-LFS deployment issue.
  if (cmsValue && cmsValue !== defaultValue) return cmsValue;
  return externalValue || cmsValue || defaultValue;
}

export default function YardenVideoHero({ releaseName, releaseHref, site }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const desktopUrl = filmUrl(site?.desktopVideo, DESKTOP_FILE, process.env.NEXT_PUBLIC_YARDEN_DESKTOP_VIDEO_URL);
  const mobileUrl = filmUrl(site?.mobileVideo, MOBILE_FILE, process.env.NEXT_PUBLIC_YARDEN_MOBILE_VIDEO_URL);
  const src = mobile === null ? "" : mobile ? mobileUrl : desktopUrl;
  const poster = mobile ? (site?.mobilePoster || MOBILE_POSTER) : (site?.desktopPoster || DESKTOP_POSTER);

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.getAttribute("src")) return;
    try {
      await video.play();
      setBlocked(false);
      setFailed(false);
    } catch {
      // e.g. battery saver, reduced motion, unsupported MP4 or a blocked autoplay.
      // The explicit PLAY control remains available to the visitor.
      setBlocked(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || !src) return;
    let visible = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    video.muted = true;
    video.defaultMuted = true;
    setMuted(true);
    setReady(false);
    setFailed(false);
    setBlocked(false);
    setProgress(0);
    video.load();

    const begin = () => {
      if (visible && !motion.matches) void tryPlay();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) begin();
      else video.pause();
    }, { threshold: 0.03 });
    observer.observe(section);
    motion.addEventListener("change", begin);
    // Some mobile browsers will not start until the file has buffered.
    video.addEventListener("canplay", begin);
    begin();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", begin);
      video.removeEventListener("canplay", begin);
    };
  }, [src, tryPlay]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) video.pause();
    else { if (failed) video.load(); void tryPlay(); }
  };
  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section className="yv yv--v10" id="top" aria-label="Yarden — ANGEL film" ref={sectionRef}>
      <div className="yv__backdrop" style={{ backgroundImage: `url("${poster}")` }} aria-hidden="true" />
      <video
        ref={videoRef}
        className={`yv__video ${ready ? "is-ready" : ""}`}
        src={src || undefined}
        poster={poster}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        aria-label="Cinematic video introducing Yarden's ANGEL era"
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onPlaying={() => { setReady(true); setPlaying(true); setFailed(false); setBlocked(false); }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const v = event.currentTarget;
          if (Number.isFinite(v.duration) && v.duration > 0) setProgress((v.currentTime / v.duration) * 100);
        }}
        onError={() => { setReady(false); setPlaying(false); setFailed(true); setBlocked(true); }}
      />
      <div className="yv__gradient" aria-hidden="true" />
      <div className="yv__noise" aria-hidden="true" />
      <div className="yv__frame">
        <div className="yv__topline">
          <span className="yv__edition">{site?.eyebrow || "YARDEN / ANGEL — OUT NOW"}</span>
          <span className="yv__now"><span className="yv__pulse" />  THE ANGEL ERA · 2026</span>
        </div>
        <div className="yv__content">
          <p className="yv__kicker">{site?.tagline || "THE DEBUT ALBUM / OUT NOW"}</p>
          <h1>{site?.title || "ANGEL."}</h1>
          <p className="yv__description">{site?.description || "Thirteen songs. An entire world of feeling."}</p>
          <div className="yv__actions">
            <a className="yv__primary" href={releaseHref} target="_blank" rel="noopener noreferrer">
              <span className="yv__play" aria-hidden="true">▶</span>
              Listen to {releaseName || "ANGEL"}
              <span aria-hidden="true" className="yv__link-arrow">↗</span>
            </a>
            <a className="yv__secondary" href="#music">Enter the world <span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <div className="yv__bottomline">
          <span>YARDEN · CHAPTER 01 / ANGEL</span>
          <span className="yv__scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span>
          <div className="yv__video-controls">
            <button type="button" onClick={toggleAudio} aria-label={muted ? "Unmute film" : "Mute film"} title={muted ? "Unmute" : "Mute"}>
              {muted ? "SOUND OFF" : "SOUND ON"}
            </button>
            <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause film" : "Play film"} title={playing ? "Pause" : "Play"}>
              {playing ? "PAUSE" : "PLAY"}<span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            </button>
          </div>
        </div>
        {blocked && !playing && (
          <button className="yv__blocked" type="button" onClick={togglePlayback}>
            {failed ? "Retry film" : "Play film"} <span aria-hidden="true">▶</span>
          </button>
        )}
      </div>
      <div className="yv__progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.min(1, progress / 100)})` }} /></div>
    </section>
  );
}
