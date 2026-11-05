"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { ReleaseItem } from "./ReleasesSection";

type Props = { releases: ReleaseItem[] };

const artFallback = "/Pictures/muse.jpg";
const ART_OVERRIDES: Record<string, string> = {
  "Ifeoma": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d2/31/53/d23153b6-0111-f293-25ec-4f65ae571209/764656160401_cover.jpg/3000x3000bb.jpg",
  "Soul": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ef/90/fd/ef90fd34-b9fd-df52-0966-0deed1a60d73/24UMGIM73843.rgb.jpg/3000x3000bb.jpg",
  "Wetin": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3b/e3/f6/3be3f62d-fa81-cfbf-3c29-9dfc7d8b93ab/685457911491_cover.jpg/3000x3000bb.jpg",
};
const isProject = (r: ReleaseItem) => {
  const marker = `${r.format ?? ""} ${r.subtitle ?? ""} ${(r.chips ?? []).join(" ")}`;
  return /\b(ep|album|mixtape|lp)\b/i.test(marker) || (!/\bsingle\b/i.test(marker) && !!r.tracklist?.length && r.tracklist.length > 1);
};
const releaseUrl = (r: ReleaseItem) => {
  if (r.primary && r.links?.[r.primary]) return r.links[r.primary]!;
  return r.fanLink || r.links?.spotify || r.links?.apple || r.links?.audiomack || r.links?.youtube || "#";
};
const releaseArt = (r: ReleaseItem) => {
  if (r.art && !r.art.startsWith("/images/releases/")) return r.art;
  return ART_OVERRIDES[r.title] || "";
};
const services: Array<[keyof ReleaseItem["links"], string]> = [
  ["spotify", "Spotify"], ["apple", "Apple Music"], ["audiomack", "Audiomack"], ["youtube", "YouTube"],
];

export default function YardenMusicGallery({ releases }: Props) {
  const projects = useMemo(() => releases.filter(isProject), [releases]);
  const singles = useMemo(() => releases.filter((r) => !isProject(r)), [releases]);
  const [selected, setSelected] = useState(0);
  const active = projects[Math.min(selected, Math.max(projects.length - 1, 0))];
  const railRef = useRef<HTMLDivElement | null>(null);
  const [artFailed, setArtFailed] = useState<Record<string, boolean>>({});
  useEffect(() => setSelected((v) => Math.min(v, Math.max(0, projects.length - 1))), [projects.length]);
  if (!active) return null;

  return (
    <section id="music" className="ym" aria-labelledby="ym-heading">
      <div className="ym__wrap">
        <div className="ym__intro rv">
          <div>
            <p className="ym__eyebrow">THE DISCOGRAPHY / LISTEN CLOSELY</p>
            <h2 id="ym-heading">Every side of <em>Yarden.</em></h2>
          </div>
          <p className="ym__intro-copy">Start with ANGEL. Then follow the melodies back to where this story began.</p>
        </div>

        <div className="ym__feature rv">
          <div className="ym__artwork" key={`${active.title}-art`}>
            <div className="ym__art-glow" aria-hidden="true" />
            <a href={releaseUrl(active)} target="_blank" rel="noopener noreferrer" className="ym__big-cover" aria-label={`Listen to ${active.title}`}>
              <Image src={releaseArt(active) || artFallback} alt={`${active.title} official artwork`} fill sizes="(max-width: 800px) 92vw, 46vw" priority={active.id === "angel-album"} unoptimized={releaseArt(active).startsWith("http")} />
              <span className="ym__cover-play" aria-hidden="true">▶</span>
            </a>
            <span className="ym__artnote">{active.id === "angel-album" ? "ANGEL — OFFICIAL ARTWORK / ETINS RECORDS" : "RELEASE ART / " + (active.year || "YARDEN")}</span>
          </div>

          <div className="ym__details" key={`${active.title}-details`}>
            <div className="ym__type">FEATURED PROJECT <span className="ym__mini-line" /> {active.format || "EP"}</div>
            <h3>{active.title}</h3>
            <p className="ym__release-description">{active.year} <span>·</span> {active.tracklist?.length || 0} tracks <span>·</span> Yarden</p>
            <div className="ym__tracks">
              {(active.tracklist || []).slice(0, active.format?.toLowerCase() === "album" ? 13 : 7).map((t, index) => (
                <a className="ym__track" key={`${active.title}-${index}`} href={releaseUrl(active)} target="_blank" rel="noopener noreferrer">
                  <span className="ym__track-no">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ym__track-name">{t.title}{t.meta && <small>{t.meta}</small>}</span>
                  <span className="ym__track-duration">{t.duration || "↗"}</span>
                </a>
              ))}
            </div>
            <div className="ym__actions">
              <a className="ym__listen" href={releaseUrl(active)} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Play release <span aria-hidden="true">↗</span></a>
              <div className="ym__platforms" aria-label="Streaming platforms">
                {services.filter(([key]) => !!active.links?.[key]).map(([key, label]) => <a key={key} href={active.links[key]!} target="_blank" rel="noopener noreferrer">{label}</a>)}
              </div>
            </div>
          </div>
        </div>

        {projects.length > 1 && <div className="ym__chooser rv" role="group" aria-label="Choose featured album or EP">
          <p>MORE PROJECTS</p>
          <div className="ym__chooser-items">
            {projects.map((project, index) => <button key={project.title} className={index === selected ? "is-current" : ""} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>
              <Image src={releaseArt(project) || artFallback} alt="" width={54} height={54} sizes="54px" unoptimized={releaseArt(project).startsWith("http")} />
              <span><strong>{project.title}</strong><small>{project.year} · {project.format || "Project"}</small></span>
              <span className="ym__choose-arrow" aria-hidden="true">↗</span>
            </button>)}
          </div>
        </div>}

        {singles.length > 0 && <div className="ym__singles rv">
          <div className="ym__singles-head">
            <div><p className="ym__eyebrow">THE MOMENTS THAT LED HERE</p><h3>Earlier <em>singles.</em></h3></div>
            <div className="ym__rail-controls"><button type="button" aria-label="Scroll singles left" onClick={() => railRef.current?.scrollBy({left:-320,behavior:"smooth"})}>←</button><button type="button" aria-label="Scroll singles right" onClick={() => railRef.current?.scrollBy({left:320,behavior:"smooth"})}>→</button></div>
          </div>
          <div className="ym__single-rail" ref={railRef}>
            {singles.map((r) => {
              const src = releaseArt(r);
              return <a className="ym__single" key={r.title} href={releaseUrl(r)} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${r.title}`}>
                <div className="ym__single-cover">
                  {src && !artFailed[r.title] ? <Image src={src} fill alt={`${r.title} single artwork`} sizes="(max-width: 640px) 74vw, 255px" unoptimized={src.startsWith("http")} onError={() => setArtFailed((x) => ({ ...x, [r.title]: true }))} /> : <span className="ym__art-fallback"><span>yarden</span><strong>{r.title}</strong></span>}
                  <span className="ym__single-play" aria-hidden="true">▶</span>
                </div>
                <div className="ym__single-meta"><span><strong>{r.title}</strong><small>{r.year || ""} · Single</small></span><span aria-hidden="true">↗</span></div>
              </a>;
            })}
          </div>
          <p className="ym__single-end">The songs before the chapter became an album.</p>
        </div>}
      </div>
    </section>
  );
}
