import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/15 bg-[rgb(var(--yard-yellow))]/85 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-screen-2xl items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-6">
          <BrandLogo
            size={104}
            className={[
              "shrink-0",
              "!h-[70px] !w-[260px]",
              "origin-left scale-x-[1.18]",
              "border-0 bg-transparent p-0 shadow-none drop-shadow-[0_16px_30px_rgba(0,0,0,0.28)]",
            ].join(" ")}
          />

          <div className="leading-tight">
            <div className="text-sm font-semibold text-black/70">
              by Yarden • Fan Updates
            </div>
          </div>
        </Link>

        {/* Navigation - no auth buttons */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#houses" className="nav-link">Houses</a>
          <a href="#feed" className="nav-link">Feed</a>
          <a href="#pass" className="nav-link">Yard Pass</a>
        </nav>
      </div>
    </header>
  );
}
