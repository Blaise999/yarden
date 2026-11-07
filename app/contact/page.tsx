import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Connect with Yarden",
  description: "Find Yarden's public music and social channels. For press and bookings, use confirmed management contact details.",
};
const channels = [
  { label:"Instagram", handle:"@thisisyarden", href:"https://www.instagram.com/thisisyarden/" },
  { label:"X / Twitter", handle:"@thisisyarden", href:"https://x.com/thisisyarden" },
  { label:"TikTok", handle:"@thisisyarden", href:"https://www.tiktok.com/@thisisyarden" },
  { label:"YouTube", handle:"YARDEN", href:"https://www.youtube.com/@thisisyarden" },
];
export default function ContactPage(){ return <main className="min-h-screen bg-[#100e13] text-[#f6f0e7]">
  <header className="border-b border-white/10"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"><Link href="/" className="text-xl font-semibold tracking-[.04em]">☥ Yarden</Link><Link href="/" className="text-sm text-white/60 hover:text-white">← Back to the film</Link></div></header>
  <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-28 md:pt-32"><p className="text-xs uppercase tracking-[.26em] text-[#d0aa76]">Stay connected</p><h1 className="mt-6 max-w-4xl font-serif text-6xl font-normal tracking-tight md:text-8xl">Stay in the <em>world.</em></h1><p className="mt-7 max-w-xl leading-relaxed text-white/65">Music, new visuals and the moments in between. Follow the artist through these public channels, and join the updates list if you want news about the next chapter.</p>
    <div className="mt-14 grid gap-3 md:grid-cols-2">{channels.map(c=><a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-end justify-between border border-white/15 p-7 transition hover:border-[#c5a174]"><div><p className="text-xs tracking-[.15em] text-[#c5a174]">{c.label}</p><h2 className="mt-3 font-serif text-3xl">{c.handle}</h2></div><span className="text-2xl text-[#c5a174]">↗</span></a>)}</div>
    <div className="mt-12 border-l-2 border-[#c5a174] py-3 pl-6"><p className="text-sm leading-relaxed text-white/65">For bookings, press or business enquiries, please use management contact details confirmed by Yarden or his team. No unverified booking email is published on this site.</p></div>
    <div className="mt-10"><Link href="/#join" className="inline-block bg-[#f3e6d1] px-7 py-4 text-sm font-semibold text-[#17100d]">Get Yarden updates ↗</Link></div>
  </section>
</main> }
