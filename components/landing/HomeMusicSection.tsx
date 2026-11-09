import Link from "next/link";
import { ArrowUpRight, Disc3 } from "lucide-react";
import type { ReleaseItem } from "./ReleasesSection";

function releaseHref(release: ReleaseItem) {
  const candidate = release.links?.[release.primary || "apple"] || release.fanLink || release.links?.spotify || release.links?.apple;
  if (candidate && (/^https?:\/\//i.test(candidate) || (candidate.startsWith("/") && !candidate.startsWith("//")))) return candidate;
  return "/music";
}

export default function HomeMusicSection({ releases }: { releases: ReleaseItem[] }) {
  const catalogue = releases.filter(item => item.title?.trim().toLowerCase() !== "angel").slice(0, 4);
  const rail = catalogue.length ? [...catalogue, ...catalogue] : [];

  return (
    <section className="v23-home-music" id="home-music" aria-labelledby="v23-home-music-title">
      <div className="v23-feature-heading">
        <span className="v23-overline">02 / THE DISCOGRAPHY</span>
        <Link href="/music">ALL RELEASES <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className="v23-home-music-intro">
        <div><span className="v23-feature-tag"><Disc3 size={16} aria-hidden="true" /> THE SOUND OF YARDEN <span className="v25-soundband" aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i} style={{animationDelay:`${-i*.13}s`}} />)}</span></span><h2 id="v23-home-music-title">The sound of Yarden.</h2></div>
        <p>Start with ANGEL, then move through the catalogue. These covers now travel in a continuous left-to-right rail.</p>
      </div>
      {rail.length > 0 ? <div className="v25-home-music-marquee" aria-label="Yarden releases moving automatically from left to right">
        <div className="v25-home-music-track">
          {rail.map((item, index) => {
            const href = releaseHref(item);
            const external = /^https?:\/\//i.test(href);
            return (
              <Link key={`${item.title}-${item.year || index}-${index}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="v25-home-release" aria-label={`Listen to ${item.title}`}>
                <span className="v25-home-release-image"><img src={item.art || "/Pictures/angel.jpg"} alt={`${item.title} cover artwork`} loading="lazy" decoding="async" /><span className="v25-home-release-icon"><ArrowUpRight size={18} aria-hidden="true" /></span></span>
                <span className="v25-home-release-info"><strong>{item.title}</strong><small>{item.format || item.subtitle || "Release"}{item.year ? ` / ${item.year}` : ""}</small></span>
              </Link>
            );
          })}
        </div>
      </div> : <p className="v23-home-music-empty">More releases will appear here as they&apos;re added. <Link href="/music">Explore the discography <ArrowUpRight size={14} /></Link></p>}
    </section>
  );
}
