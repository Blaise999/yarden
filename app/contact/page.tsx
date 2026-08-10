// app/contact/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Yarden",
  description: "Get in touch with Yarden for bookings, press inquiries, and collaborations.",
};

export default function ContactPage() {
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
              Contact
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-white/70 leading-relaxed max-w-2xl">
              For bookings, press inquiries, collaborations, and general questions.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <div className="h-12 w-12 rounded-2xl border border-white/12 bg-white/5 flex items-center justify-center mb-4">
                <span className="text-xl">📧</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">General Inquiries</h2>
              <p className="text-white/60 mb-4">
                Questions about music, releases, or just want to connect.
              </p>
              <a 
                href="mailto:hello@yarden.music"
                className="text-white hover:text-white/80 transition underline underline-offset-4"
              >
                hello@yarden.music
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <div className="h-12 w-12 rounded-2xl border border-white/12 bg-white/5 flex items-center justify-center mb-4">
                <span className="text-xl">🎤</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Bookings</h2>
              <p className="text-white/60 mb-4">
                For live performance bookings and show inquiries.
              </p>
              <a 
                href="mailto:bookings@yarden.music"
                className="text-white hover:text-white/80 transition underline underline-offset-4"
              >
                bookings@yarden.music
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <div className="h-12 w-12 rounded-2xl border border-white/12 bg-white/5 flex items-center justify-center mb-4">
                <span className="text-xl">📰</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Press & Media</h2>
              <p className="text-white/60 mb-4">
                Interview requests, press kits, and media inquiries.
              </p>
              <a 
                href="mailto:press@yarden.music"
                className="text-white hover:text-white/80 transition underline underline-offset-4"
              >
                press@yarden.music
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <div className="h-12 w-12 rounded-2xl border border-white/12 bg-white/5 flex items-center justify-center mb-4">
                <span className="text-xl">🤝</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Management</h2>
              <p className="text-white/60 mb-4">
                Business inquiries and partnership opportunities.
              </p>
              <a 
                href="mailto:management@etinsrecords.com"
                className="text-white hover:text-white/80 transition underline underline-offset-4"
              >
                management@etinsrecords.com
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-semibold mb-4">Follow Along</h2>
            <p className="text-white/60 mb-6">
              Stay connected through social media for the latest updates.
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://www.instagram.com/thisisyarden/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
              >
                Instagram ↗
              </a>
              <a 
                href="https://x.com/thisisyarden"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
              >
                X (Twitter) ↗
              </a>
              <a 
                href="https://www.tiktok.com/@thisisyarden"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
              >
                TikTok ↗
              </a>
              <a 
                href="https://www.youtube.com/@thisisyarden"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
              >
                YouTube ↗
              </a>
            </div>
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
