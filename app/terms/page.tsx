// app/terms/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Yarden",
  description: "Terms of service for Yarden's website and services.",
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-white/60">
              Last updated: January 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/70 leading-relaxed">
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using our website, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using or accessing this site. The materials contained in this 
                website are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily view the materials (information or software) on 
                Yarden's website for personal, non-commercial transitory viewing only. This is the 
                grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or public display</li>
                <li>Attempt to decompile or reverse engineer any software on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. Intellectual Property</h2>
              <p>
                All content on this website, including but not limited to music, artwork, text, graphics, 
                logos, images, audio clips, video clips, and software, is the property of Yarden or its 
                content suppliers and is protected by international copyright laws. The compilation of all 
                content on this site is the exclusive property of Yarden and protected by international 
                copyright laws.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. User Accounts</h2>
              <p className="mb-4">
                When you create an account with us (such as for the Yard Pass), you must provide 
                information that is accurate, complete, and current at all times. Failure to do so 
                constitutes a breach of the Terms, which may result in immediate termination of your 
                account on our service.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the service 
                and for any activities or actions under your password.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Disclaimer</h2>
              <p>
                The materials on Yarden's website are provided on an 'as is' basis. Yarden makes no 
                warranties, expressed or implied, and hereby disclaims and negates all other warranties 
                including, without limitation, implied warranties or conditions of merchantability, 
                fitness for a particular purpose, or non-infringement of intellectual property or other 
                violation of rights.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Limitations</h2>
              <p>
                In no event shall Yarden or its suppliers be liable for any damages (including, without 
                limitation, damages for loss of data or profit, or due to business interruption) arising 
                out of the use or inability to use the materials on Yarden's website, even if Yarden or 
                a Yarden authorized representative has been notified orally or in writing of the 
                possibility of such damage.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Links</h2>
              <p>
                Yarden has not reviewed all of the sites linked to its website and is not responsible 
                for the contents of any such linked site. The inclusion of any link does not imply 
                endorsement by Yarden of the site. Use of any such linked website is at the user's 
                own risk.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">8. Modifications</h2>
              <p>
                Yarden may revise these terms of service for its website at any time without notice. 
                By using this website you are agreeing to be bound by the then current version of 
                these terms of service.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">9. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with applicable 
                laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that 
                location.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <a href="mailto:legal@yarden.music" className="text-white underline underline-offset-4 hover:text-white/80 transition">
                  legal@yarden.music
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
