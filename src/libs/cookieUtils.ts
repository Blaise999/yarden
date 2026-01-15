import { cookies } from "next/headers";

const ANON_ID_COOKIE = "yard_anon_id";
const ADMIN_COOKIE = "yard_admin_session";
const ADMIN_COOKIE_MAX_AGE = 12 * 60 * 60; // 12 hours

function generateUUID(): string {
  // Generate UUID v4 without external dependency
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateAnonId(): Promise<string> {
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
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
  });
  
  return newId;
}

export async function getAnonIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ANON_ID_COOKIE)?.value || null;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = generateUUID();
  
  cookieStore.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return !!session?.value;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
