// app/privacy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Yarden",
  description: "Privacy policy for Yarden's website and services.",
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
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-white/60 mb-6">
              <span className="opacity-70">☥</span>
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/60">
              Last updated: January 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/70 leading-relaxed">
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Yarden ("we," "our," or "us"). We are committed to protecting your personal 
                information and your right to privacy. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you visit our website.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this 
                privacy policy, please do not access the site.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p className="mb-4">We may collect information about you in a variety of ways:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Personal Data:</strong> Name, email address, and other contact details you voluntarily provide.</li>
                <li><strong className="text-white">Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
                <li><strong className="text-white">Newsletter Data:</strong> Email address when you subscribe to our newsletter.</li>
                <li><strong className="text-white">Pass Data:</strong> Information related to your Yard Pass registration.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, operate, and maintain our website</li>
                <li>Send you newsletters and promotional communications (with your consent)</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze usage and trends</li>
                <li>Improve our website and user experience</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Sharing Your Information</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information 
                to outside parties except as described in this policy. We may share information with 
                trusted third parties who assist us in operating our website, conducting our business, 
                or serving our users, as long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Cookies</h2>
              <p>
                Our website may use cookies to enhance your experience. Cookies are small files that a 
                site or its service provider transfers to your computer's hard drive through your web 
                browser that enables the site's or service provider's systems to recognize your browser 
                and capture and remember certain information.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have questions or comments about this policy, you may contact us at:
              </p>
              <p>
                <a href="mailto:privacy@yarden.music" className="text-white underline underline-offset-4 hover:text-white/80 transition">
                  privacy@yarden.music
                </a>
              </p>
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
