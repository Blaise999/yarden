// app/careers/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Yarden",
  description: "Join the team. Explore opportunities with Yarden and Etins Records.",
};

export default function CareersPage() {
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
              Join Us
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              Careers
            </h1>
            <p className="text-xl text-white/70 leading-relaxed max-w-2xl">
              Help shape the future of music. We're always looking for passionate, creative 
              individuals to join our journey.
            </p>
          </div>

          {/* Culture Section */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Culture</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              At Yarden and Etins Records, we believe in the power of music to connect, inspire, 
              and transform. We're a team of dreamers, creators, and innovators who are passionate 
              about pushing boundaries and creating meaningful experiences.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">Creative Freedom</h3>
                <p className="text-sm text-white/60">Express yourself and bring bold ideas to life.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-2xl mb-2">🌍</div>
                <h3 className="font-semibold mb-1">Global Impact</h3>
                <p className="text-sm text-white/60">Work that reaches audiences worldwide.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-semibold mb-1">Growth Mindset</h3>
                <p className="text-sm text-white/60">Continuous learning and development.</p>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
            
            <div className="space-y-4">
              {/* Position Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Creative Director</h3>
                    <p className="text-sm text-white/60 mb-3">Full-time • Remote / Lagos</p>
                    <p className="text-white/70 text-sm">
                      Lead visual direction for releases, music videos, and brand campaigns.
                    </p>
                  </div>
                  <a 
                    href="mailto:careers@etinsrecords.com?subject=Creative Director Application"
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition whitespace-nowrap"
                  >
                    Apply →
                  </a>
                </div>
              </div>

              {/* Position Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Social Media Manager</h3>
                    <p className="text-sm text-white/60 mb-3">Full-time • Remote</p>
                    <p className="text-white/70 text-sm">
                      Manage social presence across platforms and grow our community.
                    </p>
                  </div>
                  <a 
                    href="mailto:careers@etinsrecords.com?subject=Social Media Manager Application"
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition whitespace-nowrap"
                  >
                    Apply →
                  </a>
                </div>
              </div>

              {/* Position Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Video Editor / Motion Designer</h3>
                    <p className="text-sm text-white/60 mb-3">Contract • Remote</p>
                    <p className="text-white/70 text-sm">
                      Create compelling visual content for releases and social media.
                    </p>
                  </div>
                  <a 
                    href="mailto:careers@etinsrecords.com?subject=Video Editor Application"
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition whitespace-nowrap"
                  >
                    Apply →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Don't see a fit? */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-4">Don't See a Fit?</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We're always interested in meeting talented people. If you're passionate about music 
              and think you'd be a great addition to our team, we'd love to hear from you.
            </p>
            <a 
              href="mailto:careers@etinsrecords.com?subject=General Application"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition"
            >
              Send Your Resume
              <span>→</span>
            </a>
          </section>
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
