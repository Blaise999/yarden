import type { FanProfile } from "./types";

const KEY = "yarden_fan_profile_v1";

export function saveProfile(p: FanProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function loadProfile(): FanProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FanProfile;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
