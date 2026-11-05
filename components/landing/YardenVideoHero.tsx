"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  releaseName: string;
  releaseHref: string;
  site?: { eyebrow:string;title:string;tagline:string;description:string;desktopVideo:string;mobileVideo:string;desktopPoster:string;mobilePoster:string };
};

export default function YardenVideoHero({ releaseName, releaseHref, site }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileScreen = window.matchMedia("(max-width: 767px)");
    const updatePoster = () => {
      video.poster = (mobileScreen.matches ? site?.mobilePoster : site?.desktopPoster) ||
        (mobileScreen.matches ? "/videos/yarden-mobile-poster.webp" : "/videos/yarden-desktop-poster.webp");
    };
    updatePoster();
    mobileScreen.addEventListener?.("change", updatePoster);
    let visible = true;
    const start = async () => {
      if (!visible || reduceMotion.matches) return;
      video.muted = true;
      try {
        await video.play();
        setBlocked(false);
      } catch {
        setBlocked(true);
      }
    };
    const watch = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) void start();
      else video.pause();
    }, { threshold: 0.08 });
    watch.observe(root);
    const onMotion = () => reduceMotion.matches ? video.pause() : void start();
    reduceMotion.addEventListener?.("change", onMotion);
    if (!reduceMotion.matches) void start();
    return () => {
      watch.disconnect();
      mobileScreen.removeEventListener?.("change", updatePoster);
      reduceMotion.removeEventListener?.("change", onMotion);
    };
  }, [site?.mobilePoster, site?.desktopPoster]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
    }
  };

  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section className="yv" id="top" aria-label="Yarden's cinematic introduction" ref={rootRef}>
      <div className="yv__backdrop" aria-hidden="true" />
      <video
        ref={videoRef}
        className={`yv__video ${ready ? "is-ready" : ""}`}
        poster={site?.desktopPoster || "/videos/yarden-desktop-poster.webp"}
        autoPlay muted loop playsInline preload="metadata"
        aria-label="Yarden music-film scenes"
        onLoadedData={() => setReady(true)}
        onPlaying={() => { setReady(true); setPlaying(true); setBlocked(false); }}
        onPause={() => setPlaying(false)}
        onError={() => { setReady(false); setBlocked(true); }}
      >
        <source src={site?.mobileVideo || "/videos/yarden-mobile.mp4"} type="video/mp4" media="(max-width: 767px)" />
        <source src={site?.desktopVideo || "/videos/yarden-desktop.mp4"} type="video/mp4" />
      </video>
      <div className="yv__gradient" aria-hidden="true" />
      <div className="yv__noise" aria-hidden="true" />

      <div className="yv__frame">
        <div className="yv__topline">
          <span className="yv__edition">{site?.eyebrow || "YARDEN / ANGEL — OUT NOW"}</span>
          <span className="yv__now"><span className="yv__pulse" /> A NEW CHAPTER · 2026</span>
        </div>

        <div className="yv__content">
          <p className="yv__kicker">{site?.tagline || "THE DEBUT ALBUM / OUT NOW"}</p>
          <h1>{site?.title || "ANGEL."}</h1>
          <p className="yv__description">{site?.description || "Thirteen songs, no single mood. The debut album is yours now."}</p>
          <div className="yv__actions">
            <a className="yv__primary" href={releaseHref} target="_blank" rel="noopener noreferrer">
              <span className="yv__play" aria-hidden="true">▶</span>
              Listen to {releaseName || "ANGEL"}
              <span aria-hidden="true" className="yv__link-arrow">↗</span>
            </a>
            <a className="yv__secondary" href="#music">Explore the music <span aria-hidden="true">↘</span></a>
          </div>
        </div>

        <div className="yv__bottomline">
          <span>A SOUND WITH ITS OWN SOUL</span>
          <span className="yv__scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span>
          <div className="yv__video-controls">
            <button type="button" onClick={toggleAudio} aria-label={muted ? "Enable film sound" : "Mute film sound"} title={muted ? "Unmute" : "Mute"}>
              {muted ? "SOUND OFF" : "SOUND ON"}
            </button>
            <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause film" : "Play film"} title={playing ? "Pause" : "Play"}>
              {playing ? "PAUSE" : "PLAY"}<span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            </button>
          </div>
        </div>
        {blocked && !playing && <button className="yv__blocked" type="button" onClick={togglePlayback}>Play film <span aria-hidden="true">▶</span></button>}
      </div>
    </section>
  );
}
