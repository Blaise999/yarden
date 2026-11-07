import type { HTMLAttributes } from "react";

/** Genuine flared ankh extracted from the YARD artwork supplied in the original project. */
export default function AnkhMark({ className = "", ...rest }: HTMLAttributes<HTMLImageElement>) {
  return <img src="/brand/ankh-original-ivory.png" alt="" aria-hidden="true" draggable={false} className={className} {...rest} />;
}
