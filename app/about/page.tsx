// app/about/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Yarden",
  description: "Learn more about Yarden - the new nostalgia, the descendants.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-white/5">
                <span className="text-lg leading-none">☥</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">Yarden</span>
            </Link>
            <Link 
              href="/"
              className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
            >
              ← Back Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-white/60 mb-6">
              <span className="opacity-70">☥</span>
              About
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              The Story of Yarden
            </h1>
            <p className="text-xl text-white/70 leading-relaxed max-w-2xl">
              New nostalgia. The descendants. Music that bridges worlds and tells stories that transcend time.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-4">The Vision</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Yarden represents a musical journey that blends contemporary sounds with timeless storytelling. 
                Each release is crafted to create an immersive experience that resonates across generations.
              </p>
              <p className="text-white/70 leading-relaxed">
                From the debut EP "The One Who Descends" to the latest release "Muse", every project 
                explores themes of identity, heritage, and the human experience.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-4">Discography</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-xs uppercase tracking-widest text-white/50 mb-2">2025</div>
                  <h3 className="text-lg font-semibold mb-1">Muse</h3>
                  <p className="text-sm text-white/60">EP • 6 tracks</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-xs uppercase tracking-widest text-white/50 mb-2">2023</div>
                  <h3 className="text-lg font-semibold mb-1">The One Who Descends</h3>
                  <p className="text-sm text-white/60">EP • 5 tracks</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-4">Connect</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Follow the journey across platforms. New music, visuals, and tour updates — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
                >
                  Spotify ↗
                </a>
                <a 
                  href="https://www.youtube.com/@thisisyarden"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
                >
                  YouTube ↗
                </a>
                <a 
                  href="https://www.instagram.com/thisisyarden/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
                >
                  Instagram ↗
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8 text-center text-xs text-white/40">
          © 2026 Yarden. All rights reserved. Website operated in association with Etins Records.
        </div>
      </footer>
    </div>
  );
}
