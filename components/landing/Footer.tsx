// src/components/landing/Footer.tsx
"use client";

import Link from "next/link";
import React from "react";

type SocialLink = {
  label: string;
  href: string;
  hint?: string;
  Icon: React.FC<{ className?: string }>;
};

const year = new Date().getFullYear();

const socials: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/thisisyarden/",
    hint: "@thisisyarden",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M7.5 3.5h9A4 4 0 0 1 20.5 7.5v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M17.3 6.8h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@thisisyarden",
    hint: "@thisisyarden",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M13.2 3v10.1a3.9 3.9 0 1 1-3.2-3.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M13.2 3c.7 3.6 2.9 5.6 6.3 6v3.2c-2.5 0-4.7-1-6.3-2.7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/thisisyarden",
    hint: "@thisisyarden",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M5 19 19 5M8.2 5H19v10.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@thisisyarden",
    hint: "@thisisyarden",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M20 7.8c.2 1.1.2 2.3.2 4.2s0 3.1-.2 4.2c-.2 1-1 1.8-2 2-1.6.3-4.3.3-6 .3s-4.4 0-6-.3c-1-.2-1.8-1-2-2C4 15.1 4 13.9 4 12s0-3.1.2-4.2c.2-1 1-1.8 2-2C7.8 5.5 10.5 5.5 12 5.5s4.2 0 6 .3c1 .2 1.8 1 2 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M11 10.2v3.6c0 .4.4.6.8.4l3-1.8c.3-.2.3-.6 0-.8l-3-1.8c-.4-.2-.8 0-.8.4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd",
    hint: "Listen",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7.6 10.6c3.6-1 7.3-.7 10.7 1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M8.4 13.4c2.9-.8 5.8-.5 8.5.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity=".9"
        />
        <path
          d="M9.2 16c2.1-.5 4.2-.3 6 .5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity=".85"
        />
      </svg>
    ),
  },
  {
    label: "Apple Music",
    href: "https://music.apple.com/gb/artist/yarden/1525448636",
    hint: "Listen",
    Icon: (p) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={p.className}>
        <path
          d="M16 4v11.3a2.7 2.7 0 1 1-1.6-2.4V7.2l-6 1.3v8a2.7 2.7 0 1 1-1.6-2.4V6.7c0-.6.4-1.1 1-1.3l7.2-1.6c.5-.1 1 .3 1 .8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function External({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10" data-section="footer">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[260px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-white/5 shadow-[0_12px_50px_rgba(0,0,0,.35)]">
                <span className="text-lg leading-none">☥</span>
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight text-white">Yarden</div>
                <div className="text-xs text-white/60">new nostalgia • the descendants</div>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              One place for everything.
              you’re there.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/8"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/8"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/8"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Explore
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Releases", href: "#releases" },
                { label: "Watch", href: "#watch" },
                { label: "Tour", href: "#tour" },
                { label: "Store", href: "#store" },
                { label: "Newsletter", href: "#newsletter" },
              ].map((i) => (
                <li key={i.href}>
                  <a
                    href={i.href}
                    className="inline-flex items-center gap-2 text-white/75 hover:text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div className="md:col-span-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Socials & streaming
              </div>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/8"
              >
                <span className="text-base leading-none">↑</span> Top
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {socials.map((s) => (
                <External
                  key={s.label}
                  href={s.href}
                  ariaLabel={`Open ${s.label}`}
                  className={cx(
                    "group flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-4 py-3",
                    "hover:bg-white/8 hover:border-white/18 transition"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-black/30">
                      <s.Icon className="h-5 w-5 text-white/85" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-white">{s.label}</div>
                      <div className="text-xs text-white/60">{s.hint ?? "Open"}</div>
                    </div>
                  </div>

                  <span className="text-white/55 transition group-hover:translate-x-0.5 group-hover:text-white/80">
                    ↗
                  </span>
                </External>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/55">
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                © {year} Yarden
              </span>
              <Link className="hover:text-white" href="/privacy">
                Privacy
              </Link>
              <span className="text-white/25">•</span>
              <Link className="hover:text-white" href="/terms">
                Terms
              </Link>
              <span className="text-white/25">•</span>
              <Link className="hover:text-white" href="/careers">
                Careers
              </Link>
            </div>
          </div>
        </div>

        {/* bottom hairline */}
        <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mt-6 flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="opacity-70">☥</span>
            <span>Designed to feel like the music.</span>
          </div>

          <div className="flex items-center gap-3">
            <External
              href="https://www.youtube.com/@thisisyarden"
              className="hover:text-white"
              ariaLabel="Open YouTube"
            >
              Watch
            </External>
            <span className="text-white/25">•</span>
            <External
              href="https://open.spotify.com/artist/1nN9bKS2bD4OHNrKkS0Djd"
              className="hover:text-white"
              ariaLabel="Open Spotify"
            >
              Stream
            </External>
            <span className="text-white/25">•</span>
            <a href="#newsletter" className="hover:text-white">
              Join the list
            </a>
          </div>
        </div>

        {/* Full copyright notice */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-white/40">
          © 2026 Yarden. All rights reserved. Website operated in association with Etins Records.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
