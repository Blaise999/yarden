"use client";
import YardPassGen from "./YardPassGen";
/** Shared pass UI so modal and dedicated sections follow identical server-side rules. */
export default function PassGenerator({ embedded = false }: { embedded?: boolean }) {
  return <div className={embedded ? "" : "mx-auto max-w-4xl rounded-3xl bg-[#0B0B10] p-6"}><YardPassGen /></div>;
}
