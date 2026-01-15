// libs/passStorage.ts
import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import type { YardPass } from "./passTypes";

/* ---------------------------------- */
/* KV keys                             */
/* ---------------------------------- */
const PASS_BY_ANON = (anonId: string) => `pass:anon:${anonId}`;
const PASS_ANONS = "passes:anons"; // index of anonIds
const PASS_IDS = "passes:ids"; // optional index of ids

const HAS_KV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/* ---------------------------------- */
/* FS fallback                          */
/* ---------------------------------- */
const DATA_DIR = path.join(process.cwd(), "data");
const PASSES_FILE = path.join(DATA_DIR, "passes.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readPassesFS(): YardPass[] {
  ensureDataDir();
  if (!fs.existsSync(PASSES_FILE)) return [];
  try {
    const raw = fs.readFileSync(PASSES_FILE, "utf-8");
    return JSON.parse(raw) as YardPass[];
  } catch {
    return [];
  }
}

function writePassesFS(passes: YardPass[]) {
  ensureDataDir();
  fs.writeFileSync(PASSES_FILE, JSON.stringify(passes, null, 2), "utf-8");
}

/* ---------------------------------- */
/* Helpers (narrow unknown -> string[]) */
/* ---------------------------------- */
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function parsePass(raw: string): YardPass | null {
  try {
    return JSON.parse(raw) as YardPass;
  } catch {
    return null;
  }
}

/* ---------------------------------- */
/* Public API (always async)           */
/* ---------------------------------- */

export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  if (HAS_KV) {
    const raw = (await kv.get(PASS_BY_ANON(anonId))) as unknown;
    if (typeof raw !== "string" || raw.length === 0) return null;
    return parsePass(raw);
  }

  const passes = readPassesFS();
  return passes.find((p) => p.anonId === anonId) || null;
}

export async function savePass(pass: YardPass): Promise<YardPass> {
  if (HAS_KV) {
    await kv.set(PASS_BY_ANON(pass.anonId), JSON.stringify(pass));
    await kv.sadd(PASS_ANONS, pass.anonId);
    await kv.sadd(PASS_IDS, pass.id);
    return pass;
  }

  const passes = readPassesFS();
  const existingIndex = passes.findIndex((p) => p.anonId === pass.anonId);

  if (existingIndex >= 0) passes[existingIndex] = pass;
  else passes.push(pass);

  writePassesFS(passes);
  return pass;
}

export async function getAllPasses(): Promise<YardPass[]> {
  if (HAS_KV) {
    // ✅ don't use kv.smembers<string>() — typings vary; narrow manually
    const anonIdsRaw = (await kv.smembers(PASS_ANONS)) as unknown;
    const anonIds = asStringArray(anonIdsRaw);
    if (anonIds.length === 0) return [];

    const raws = await Promise.all(anonIds.map((a) => kv.get(PASS_BY_ANON(a))));

    return raws
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((s) => parsePass(s))
      .filter((p): p is YardPass => Boolean(p));
  }

  return readPassesFS();
}

export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const bytes = new Uint8Array(6);

  const c = globalThis.crypto as Crypto | undefined;
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `YARD-${year}-${hex}`;
}
