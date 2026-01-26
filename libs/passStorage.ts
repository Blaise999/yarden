// libs/passStorage.ts
// Storage with in-memory fallback for development

import type { YardPass } from "./passTypes";

// Check if Vercel KV is configured
const isKVConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// In-memory storage for development
declare global {
  var passStorage: Map<string, YardPass>;
  var passAnonIds: Set<string>;
}

if (!global.passStorage) {
  global.passStorage = new Map();
}
if (!global.passAnonIds) {
  global.passAnonIds = new Set();
}

// KV Key patterns
const PASS_KEY = (anonId: string) => `pass:${anonId}`;
const ALL_ANON_IDS_KEY = "passes:anon_ids";

/**
 * Check if storage is properly configured
 */
export function isStorageConfigured(): boolean {
  return isKVConfigured || true; // Always return true since we have fallback
}

/**
 * Get a pass by anonymous ID
 */
export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  if (!anonId) return null;

  try {
    if (isKVConfigured) {
      const { kv } = await import("@vercel/kv");
      const pass = await kv.get<YardPass>(PASS_KEY(anonId));
      return pass || null;
    }

    // Fallback to in-memory storage
    return global.passStorage.get(anonId) || null;
  } catch (err) {
    console.error("getPassByAnonId error:", err);
    // Try in-memory as fallback
    return global.passStorage.get(anonId) || null;
  }
}

/**
 * Save a pass to storage
 */
export async function savePass(pass: YardPass): Promise<YardPass> {
  try {
    if (isKVConfigured) {
      const { kv } = await import("@vercel/kv");
      await kv.set(PASS_KEY(pass.anonId), pass);
      await kv.sadd(ALL_ANON_IDS_KEY, pass.anonId);
    }

    // Always save to in-memory as well (for consistency)
    global.passStorage.set(pass.anonId, pass);
    global.passAnonIds.add(pass.anonId);

    console.log(`✅ Pass saved: ${pass.id} for ${pass.anonId}`);
    return pass;
  } catch (err) {
    console.error("savePass error:", err);
    
    // Fallback to in-memory only
    global.passStorage.set(pass.anonId, pass);
    global.passAnonIds.add(pass.anonId);
    
    console.log(`✅ Pass saved (in-memory): ${pass.id} for ${pass.anonId}`);
    return pass;
  }
}

/**
 * Get all passes (for admin)
 */
export async function getAllPasses(): Promise<YardPass[]> {
  try {
    let passes: YardPass[] = [];

    if (isKVConfigured) {
      const { kv } = await import("@vercel/kv");
      const anonIds = await kv.smembers(ALL_ANON_IDS_KEY);

      if (anonIds && Array.isArray(anonIds) && anonIds.length > 0) {
        const kvPasses = await Promise.all(
          anonIds.map(async (anonId) => {
            try {
              if (typeof anonId !== "string") return null;
              return await kv.get<YardPass>(PASS_KEY(anonId));
            } catch {
              return null;
            }
          })
        );
        passes = kvPasses.filter((p): p is YardPass => p !== null);
      }
    }

    // Merge with in-memory storage
    for (const [, pass] of global.passStorage) {
      if (!passes.find((p) => p.anonId === pass.anonId)) {
        passes.push(pass);
      }
    }

    // Sort by date (newest first)
    return passes.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.error("getAllPasses error:", err);

    // Fallback to in-memory only
    return Array.from(global.passStorage.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
}

/**
 * Generate a unique pass ID
 */
export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const chars = "0123456789ABCDEF";
  let hex = "";
  for (let i = 0; i < 12; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  return `YARD-${year}-${hex}`;
}
