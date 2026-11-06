/** Persistent storage for CMS, admin settings and Yard Passes.
 * Production MUST have Upstash Redis. No ephemeral-memory fallback.
 * Local development uses .local-data/yard-data.json (gitignored).
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const localPath = path.join(process.cwd(), ".local-data", "yard-data.json");
const isProd = process.env.NODE_ENV === "production";
// Use credentials from ONE complete integration; never mix the URL of one store
// with the token of another. Vercel integrations may expose either prefix.
function redisCredentials(): {url: string; token: string} | null {
  const pairs = [
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ];
  for (const [url, token] of pairs) if (url && token) return { url, token };
  return null;
}
const kvConfigured = Boolean(redisCredentials());
export class StoreNotConfigured extends Error {
  constructor() { super("Persistent storage not configured. Connect an Upstash Redis database before using admin or Yard Pass on Vercel."); }
}
export const hasPersistentStore = () => !isProd || kvConfigured;
/** Verify that Vercel can actually TALK to Redis, not only see env variable names. */
export async function storageHealth(): Promise<{configured:boolean; connected:boolean; provider:string}> {
  if (!kvConfigured && !isProd) return { configured: true, connected: true, provider: "local-development" };
  if (!kvConfigured) return { configured: false, connected: false, provider: "upstash-redis" };
  try {
    const reply = await (await redis()).ping();
    return { configured: true, connected: reply === "PONG", provider: "upstash-redis" };
  } catch (error) {
    // Deliberately log only error type; Redis URLs and tokens must never enter logs.
    console.error("Yarden Redis health check failed:", error instanceof Error ? error.name : "UnknownError");
    return { configured: true, connected: false, provider: "upstash-redis" };
  }
}


type LocalDb = { data: Record<string, unknown>; sets: Record<string, string[]>; counters: Record<string, {count:number; until:number}> };
const empty = (): LocalDb => ({ data: {}, sets: {}, counters: {} });
let queue = Promise.resolve();
async function readLocal(): Promise<LocalDb> {
  try { return { ...empty(), ...JSON.parse(await fs.readFile(localPath, "utf8")) }; }
  catch (e: any) { if (e.code === "ENOENT") return empty(); throw e; }
}
async function transactLocal<T>(work: (db: LocalDb) => Promise<T> | T): Promise<T> {
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => { resolveDone = r; });
  const previous = queue; queue = done;
  await previous;
  try {
    const db = await readLocal();
    const result = await work(db);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    const temp = `${localPath}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(db, null, 2), { mode: 0o600 });
    await fs.rename(temp, localPath);
    return result;
  } finally { resolveDone(); }
}
let redisClient: import("@upstash/redis").Redis | null = null;
async function redis() {
  if (!kvConfigured) throw new StoreNotConfigured();
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis(redisCredentials()!);
  }
  return redisClient;
}

export async function readRecord<T>(key: string): Promise<T | null> {
  if (!kvConfigured && !isProd) return ((await readLocal()).data[key] as T) ?? null;
  return (await redis()).get<T>(key);
}
export async function saveRecord<T>(key: string, data: T): Promise<void> {
  if (!kvConfigured && !isProd) { await transactLocal((db) => { db.data[key] = data; }); return; }
  await (await redis()).set(key, data);
}
export async function createRecord<T>(key: string, data: T): Promise<boolean> {
  if (!kvConfigured && !isProd) return transactLocal((db) => {
    if (Object.prototype.hasOwnProperty.call(db.data, key)) return false;
    db.data[key] = data; return true;
  });
  const result = await (await redis()).set(key, data, { nx: true });
  return result === "OK";
}
export async function addToSet(key: string, member: string): Promise<void> {
  if (!kvConfigured && !isProd) { await transactLocal((db) => { const s = new Set(db.sets[key] || []); s.add(member); db.sets[key] = [...s]; }); return; }
  await (await redis()).sadd(key, member);
}

export async function removeFromSet(key: string, member: string): Promise<void> {
  if (!kvConfigured && !isProd) { await transactLocal((db) => { db.sets[key] = (db.sets[key] || []).filter(item => item !== member); }); return; }
  await (await redis()).srem(key, member);
}

export async function readSet(key: string): Promise<string[]> {
  if (!kvConfigured && !isProd) return (await readLocal()).sets[key] ?? [];
  return (await redis()).smembers(key) as Promise<string[]>;
}
export async function rateLimited(key: string, maxAttempts: number, windowSeconds = 900): Promise<boolean> {
  if (!kvConfigured && !isProd) return transactLocal((db) => {
    const now = Date.now(); const prev = db.counters[key];
    const counter = !prev || prev.until < now ? { count: 1, until: now + windowSeconds * 1000 } : { ...prev, count: prev.count + 1 };
    db.counters[key] = counter;
    return counter.count > maxAttempts;
  });
  const store = await redis();
  const count = await store.eval<[number], number>(`local n = redis.call("INCR", KEYS[1]); if n == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end; return n`, [key], [windowSeconds]);
  return count > maxAttempts;
}
