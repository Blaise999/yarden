import Image from "next/image";

export function BrandLogo({
  className = "",
  size = 44,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={["inline-flex items-center justify-center", className].join(" ")}>
      <Image
        src="/Pictures/logo.png"
        alt="The Yard logo"
        width={size}
        height={size}
        priority
        className="h-auto w-auto object-contain"
      />
    </div>
  );
}
