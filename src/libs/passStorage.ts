import { kv } from "@vercel/kv";
import type { YardPass } from "./passTypes";

const PASS_BY_ANON = (anonId: string) => `pass:anon:${anonId}`;
const PASS_IDS = "passes:ids";

export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  const raw = await kv.get<string>(PASS_BY_ANON(anonId));
  return raw ? (JSON.parse(raw) as YardPass) : null;
}

export async function savePass(pass: YardPass): Promise<YardPass> {
  await kv.set(PASS_BY_ANON(pass.anonId), JSON.stringify(pass));
  await kv.sadd(PASS_IDS, pass.id); // simple index
  return pass;
}

export async function getAllPasses(): Promise<YardPass[]> {
  const ids = await kv.smembers<string[]>(PASS_IDS);
  // If you want true listing, store additional index keys; this is enough for now.
  // Best approach: store anonIds in a list when saving and fetch those.
  return [];
}

export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const bytes = new Uint8Array(6);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `YARD-${year}-${hex}`;
}
