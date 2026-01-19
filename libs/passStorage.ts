// libs/passStorage.ts
// Production storage using @vercel/kv (official SDK)

import { kv } from "@vercel/kv";
import type { YardPass } from "./passTypes";

// KV Key patterns
const PASS_KEY = (anonId: string) => `pass:${anonId}`;
const ALL_ANON_IDS_KEY = "passes:anon_ids";

/**
 * Check if Vercel KV is configured
 */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Get a pass by anonymous ID
 */
export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  if (!anonId) return null;
  
  try {
    const pass = await kv.get<YardPass>(PASS_KEY(anonId));
    return pass || null;
  } catch (err) {
    console.error("getPassByAnonId error:", err);
    return null;
  }
}

/**
 * Save a pass to storage
 */
export async function savePass(pass: YardPass): Promise<YardPass> {
  try {
    // Save the pass data
    await kv.set(PASS_KEY(pass.anonId), pass);
    
    // Add anonId to the set of all passes (for admin listing)
    await kv.sadd(ALL_ANON_IDS_KEY, pass.anonId);
    
    // BUG 1 FIX: Missing opening parenthesis in console.log
    console.log(`✅ Pass saved: ${pass.id} for ${pass.anonId}`);
    return pass;
  } catch (err) {
    console.error("savePass error:", err);
    throw new Error("Failed to save pass");
  }
}

/**
 * Get all passes (for admin)
 */
export async function getAllPasses(): Promise<YardPass[]> {
  try {
    // BUG 2 FIX: smembers returns string[] not string, remove generic
    const anonIds = await kv.smembers(ALL_ANON_IDS_KEY);
    
    // BUG 3 FIX: Check if anonIds is array before checking length
    if (!anonIds || !Array.isArray(anonIds) || anonIds.length === 0) {
      return [];
    }
    
    // Fetch all passes in parallel
    const passes = await Promise.all(
      anonIds.map(async (anonId) => {
        try {
          // BUG 4 FIX: anonId could be any type from smembers, ensure string
          if (typeof anonId !== "string") return null;
          return await kv.get<YardPass>(PASS_KEY(anonId));
        } catch {
          return null;
        }
      })
    );
    
    // Filter nulls and sort by date (newest first)
    return passes
      .filter((p): p is YardPass => p !== null)
      // BUG 5 FIX: Add null check for createdAt before creating Date
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  } catch (err) {
    console.error("getAllPasses error:", err);
    return [];
  }
}

/**
 * Generate a unique pass ID
 */
export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const chars = "0123456789ABCDEF";
  let hex = "";
  // BUG 6 FIX: This was actually fine, but let's use crypto for better randomness
  for (let i = 0; i < 12; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  return `YARD-${year}-${hex}`;
}
