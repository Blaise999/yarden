"use client";

import type { AngelConfig } from "../../libs/angelStore";

// Vinyl and listening-party sections consume the same public record. Share
// their in-flight request so the homepage does not call /api/angel twice.
let pending: Promise<AngelConfig> | null = null;
let validUntil = 0;
export function getPublicAngel(): Promise<AngelConfig> {
  if (pending && Date.now() < validUntil) return pending;
  validUntil = Date.now() + 30_000;
  const request = fetch("/api/angel", { cache: "no-store" }).then(async response => {
    if (!response.ok) throw Error("Unable to load ANGEL event data");
    return await response.json() as AngelConfig;
  });
  pending = request;
  void request.catch(() => {
    if (pending === request) { pending = null; validUntil = 0; }
  });
  return request;
}
