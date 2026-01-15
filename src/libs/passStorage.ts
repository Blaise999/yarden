// libs/passStorage.ts
// Production-ready storage using Vercel KV (Redis)
// Works on Vercel serverless - no filesystem dependency

import type { YardPass } from "./passTypes";

/* ---------------------------------- */
/* Vercel KV Configuration            */
/* ---------------------------------- */
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const HAS_KV = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);

// KV Key patterns
const PASS_KEY = (anonId: string) => `pass:${anonId}`;
const ALL_PASSES_KEY = "passes:all";

/* ---------------------------------- */
/* KV Helper Functions                */
/* ---------------------------------- */

async function kvGet(key: string): Promise<string | null> {
  if (!HAS_KV) return null;
  
  try {
    const res = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error("KV GET error:", err);
    return null;
  }
}

async function kvSet(key: string, value: string): Promise<boolean> {
  if (!HAS_KV) return false;
  
  try {
    const res = await fetch(`${KV_REST_API_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
      cache: "no-store",
    });
    
    return res.ok;
  } catch (err) {
    console.error("KV SET error:", err);
    return false;
  }
}

async function kvSadd(key: string, member: string): Promise<boolean> {
  if (!HAS_KV) return false;
  
  try {
    const res = await fetch(`${KV_REST_API_URL}/sadd/${key}/${encodeURIComponent(member)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    });
    
    return res.ok;
  } catch (err) {
    console.error("KV SADD error:", err);
    return false;
  }
}

async function kvSmembers(key: string): Promise<string[]> {
  if (!HAS_KV) return [];
  
  try {
    const res = await fetch(`${KV_REST_API_URL}/smembers/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data.result) ? data.result : [];
  } catch (err) {
    console.error("KV SMEMBERS error:", err);
    return [];
  }
}

/* ---------------------------------- */
/* Public API                         */
/* ---------------------------------- */

export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  if (!anonId) return null;
  
  if (!HAS_KV) {
    console.warn("⚠️ KV not configured - storage disabled");
    return null;
  }
  
  try {
    const raw = await kvGet(PASS_KEY(anonId));
    if (!raw) return null;
    
    return JSON.parse(raw) as YardPass;
  } catch (err) {
    console.error("Error in getPassByAnonId:", err);
    return null;
  }
}

export async function savePass(pass: YardPass): Promise<YardPass> {
  if (!HAS_KV) {
    console.warn("⚠️ KV not configured - pass not saved to persistent storage");
    // Still return the pass so the UI works, just won't persist
    return pass;
  }
  
  try {
    const passJson = JSON.stringify(pass);
    
    // Save individual pass
    const saved = await kvSet(PASS_KEY(pass.anonId), passJson);
    if (!saved) {
      throw new Error("Failed to save pass to KV");
    }
    
    // Add to set of all passes (for admin listing)
    await kvSadd(ALL_PASSES_KEY, pass.anonId);
    
    return pass;
  } catch (err) {
    console.error("Error in savePass:", err);
    throw err;
  }
}

export async function getAllPasses(): Promise<YardPass[]> {
  if (!HAS_KV) {
    console.warn("⚠️ KV not configured - returning empty passes list");
    return [];
  }
  
  try {
    // Get all anon IDs from the set
    const anonIds = await kvSmembers(ALL_PASSES_KEY);
    
    if (anonIds.length === 0) return [];
    
    // Fetch all passes in parallel
    const passPromises = anonIds.map(async (anonId) => {
      const raw = await kvGet(PASS_KEY(anonId));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as YardPass;
      } catch {
        return null;
      }
    });
    
    const passes = await Promise.all(passPromises);
    
    // Filter out nulls and sort by creation date (newest first)
    return passes
      .filter((p): p is YardPass => p !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error in getAllPasses:", err);
    return [];
  }
}

export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  
  // Generate random hex string
  const chars = "0123456789ABCDEF";
  let hex = "";
  for (let i = 0; i < 12; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  
  return `YARD-${year}-${hex}`;
}

// Check if storage is properly configured
export function isStorageConfigured(): boolean {
  return HAS_KV;
}
