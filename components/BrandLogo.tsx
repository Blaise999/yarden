import Image from "next/image";

/** The original full YARD logo, not a substituted or synthesized wordmark. */
export function BrandLogo({ className = "", size = 160 }: { className?: string; size?: number }) {
  return <Image src="/brand/yard-original-ivory.png" alt="The Yard — original YARD and ankh logo" width={size} height={Math.round(size * 509 / 811)} className={className} />;
}
