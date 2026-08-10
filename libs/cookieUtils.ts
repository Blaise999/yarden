// libs/cookieUtils.ts
// Server-side cookie utilities - kept for backward compatibility
// Most cookie operations are now handled directly in API routes

import { cookies } from "next/headers";

const ANON_ID_COOKIE = "yard_anon_id";
const ADMIN_COOKIE = "yard_admin_session";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateAnonId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get(ANON_ID_COOKIE);
    
    if (existing?.value) {
      return existing.value;
    }
    
    const newId = generateUUID();
    cookieStore.set(ANON_ID_COOKIE, newId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    
    return newId;
  } catch {
    return generateUUID();
  }
}

export async function getAnonIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ANON_ID_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE);
    return !!session?.value;
  } catch {
    return false;
  }
}

export async function setAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = generateUUID();
    
    cookieStore.set(ADMIN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60,
      path: "/",
    });
  } catch (err) {
    console.error("Failed to set admin session:", err);
  }
}

export async function clearAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE);
  } catch (err) {
    console.error("Failed to clear admin session:", err);
  }
}
