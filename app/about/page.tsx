import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Yarden — The ANGEL Era",
  description: "From the gospel and old records of a Lagos childhood to ANGEL, Yarden's 13-track debut album. Music that holds light and darkness at once.",
};
const projects = [
  { year:"2026", title:"ANGEL", detail:"Debut album · 13 tracks", href:"https://music.apple.com/us/album/angel/6817875363" },
  { year:"2025", title:"Muse", detail:"EP · 6 tracks", href:"https://audiomack.com/thisisyarden/album/muse" },
  { year:"2023", title:"The One Who Descends", detail:"EP · 5 tracks", href:"https://yarden.lnk.to/towd" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#100e13] text-[#f6f0e7]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#100e13]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-[.04em]">☥ Yarden</Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white">← Back to the film</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <p className="mb-6 text-xs uppercase tracking-[.26em] text-[#d0aa76]">The artist / Between two worlds</p>
        <h1 className="max-w-5xl font-serif text-6xl font-normal tracking-tight md:text-8xl">The sound has <em>its own soul.</em></h1>
        <div className="mt-12 grid gap-9 border-t border-white/15 pt-10 md:grid-cols-2 md:gap-20">
          <p className="text-lg leading-relaxed text-white/75">Raised in Lagos, Yarden grew up between gospel music from his mother and the records and DJ sounds from his father. That mixture of feeling, rhythm and old-school influence became a language of his own.</p>
          <p className="text-lg leading-relaxed text-white/75">His music lives between contrasts: warmth and shadow, vulnerability and confidence, nostalgia and discovery. From <em>Wetin</em> to <em>Muse</em>, every release adds another shade. His debut album <strong>ANGEL</strong> opens the next chapter.</p>
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#171317] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.26em] text-[#d0aa76]">The chapters</p><h2 className="mt-3 font-serif text-4xl md:text-6xl">A body of <em>feeling.</em></h2></div><Link href="/#music" className="text-sm text-[#d0aa76] underline underline-offset-8">Explore the discography ↗</Link></div>
          <div className="grid gap-3 md:grid-cols-3">{projects.map(p=>(<a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="group border border-white/15 p-7 transition hover:border-[#c5a174] hover:bg-white/[.035]"><span className="text-xs tracking-widest text-[#c5a174]">{p.year}</span><h3 className="mt-8 font-serif text-3xl">{p.title}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/60"><span>{p.detail}</span><span className="text-[#c5a174] group-hover:translate-x-1">↗</span></div></a>))}</div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-white/55"><span>Yarden / ANGEL — out now</span><Link href="/">Home ↗</Link></footer>
    </main>
  );
}
