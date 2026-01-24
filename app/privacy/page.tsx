// app/privacy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Yarden",
  description: "Privacy policy for Yarden's official website.",
};

export default function PrivacyPage() {
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
              className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              ← Back Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16 pt-24">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-white/60">
              <span className="opacity-70">☥</span>
              Legal
            </div>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-white/60">Last updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/70 leading-relaxed">
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">1. Overview</h2>
              <p className="mb-4">
                This Privacy Policy explains how information is collected, used, and protected when you
                visit or interact with <span className="text-white">https://thisisyarden.com</span> (the
                “Website”).
              </p>
              <p>
                This Website represents the official online presence of the artist{" "}
                <span className="text-white">Yarden</span> and is operated in association with{" "}
                <span className="text-white">Etins Records</span>.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">2. Information We Collect</h2>
              <p className="mb-4">We may collect the following information:</p>

              <div className="space-y-5">
                <div>
                  <h3 className="mb-2 font-semibold text-white">a) Information You Provide</h3>
                  <p className="mb-3">
                    When you voluntarily submit it, such as through mailing lists, contact forms, or
                    enquiries:
                  </p>
                  <ul className="ml-4 list-disc list-inside space-y-2">
                    <li>Your name</li>
                    <li>Email address</li>
                    <li>Contact details (where provided)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-white">b) Automatically Collected Information</h3>
                  <p className="mb-3">This may include:</p>
                  <ul className="ml-4 list-disc list-inside space-y-2">
                    <li>IP address</li>
                    <li>Browser type and device information</li>
                    <li>Pages visited and time spent on the Website</li>
                  </ul>
                  <p className="mt-3 text-white/60">
                    This information is collected for analytics, security, and to improve the Website experience.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">3. How We Use Your Information</h2>
              <p className="mb-4">We may use collected information to:</p>
              <ul className="ml-4 list-disc list-inside space-y-2">
                <li>Respond to messages or enquiries</li>
                <li>Send updates, newsletters, or announcements (only where you have opted in)</li>
                <li>Improve website functionality and content</li>
                <li>Monitor traffic, performance, and security</li>
              </ul>
              <p className="mt-4">
                We do <span className="text-white">not</span> sell, rent, or trade personal data to third parties.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">4. Cookies</h2>
              <p className="mb-4">
                This Website may use cookies or similar technologies to:
              </p>
              <ul className="ml-4 list-disc list-inside space-y-2">
                <li>Analyse traffic and user behaviour</li>
                <li>Improve performance and user experience</li>
              </ul>
              <p className="mt-4">
                You can control or disable cookies through your browser settings. Some features of the Website may not
                function correctly if cookies are disabled.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">5. Third-Party Links &amp; Services</h2>
              <p className="mb-4">
                This Website may include links to third-party platforms, including but not limited to:
              </p>
              <ul className="ml-4 list-disc list-inside space-y-2">
                <li>Streaming services</li>
                <li>Social media platforms</li>
                <li>Ticketing or merchandise providers</li>
              </ul>
              <p className="mt-4">
                We are not responsible for the privacy practices or content of third-party websites. Please review
                their individual privacy policies.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">6. Data Security</h2>
              <p>
                Reasonable technical and organisational measures are taken to protect personal data. However, no method
                of transmission over the internet or electronic storage is completely secure, and absolute security
                cannot be guaranteed.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">7. Your Rights</h2>
              <p className="mb-4">
                Depending on your jurisdiction (including the EU/EEA), you may have the right to:
              </p>
              <ul className="ml-4 list-disc list-inside space-y-2">
                <li>Request access to personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent for communications at any time</li>
              </ul>
              <p className="mt-4">
                You can exercise these rights by contacting us using the details below.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">8. Intellectual Property</h2>
              <p>
                All content on this Website — including music, images, videos, artwork, logos, and text — is owned by
                or licensed to <span className="text-white">Yarden</span> and/or{" "}
                <span className="text-white">Etins Records</span>, unless otherwise stated.
              </p>
              <p className="mt-4">
                Unauthorised reproduction, distribution, or use of any content is strictly prohibited.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">9. Changes to This Policy</h2>
              <p>
                This Privacy Policy may be updated from time to time. Any changes will be posted on this page with an
                updated revision date.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="mb-4 text-xl font-semibold text-white">10. Contact Information</h2>
              <p className="mb-4">
                For any questions regarding this Privacy Policy or how your data is used, please contact:
              </p>
              <div className="space-y-2">
                <p>
                  <span className="text-white">Website Management:</span> Etins Records
                </p>
                <p>
                  <span className="text-white">Email:</span>{" "}
                  <a
                    href="mailto:info@etinsrecords.com"
                    className="text-white underline underline-offset-4 transition hover:text-white/80"
                  >
                    info@etinsrecords.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-5 text-center text-xs text-white/40 md:px-8">
          © 2026 Yarden. All rights reserved. Website operated in association with Etins Records.
        </div>
      </footer>
    </div>
  );
}
