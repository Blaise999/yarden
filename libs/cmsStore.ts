import { DEFAULT_CMS, type CmsData } from "../content/defaultCms";
import { readRecord, saveRecord } from "./persistence";
export const CMS_KEY = "yarden:cms:v1"; // Retain the existing live CMS data, if any.
export function normalizeCms(input: Partial<CmsData> | null | undefined): CmsData {
  const base = input && typeof input === "object" ? input : {};
  return {
    ...DEFAULT_CMS,
    ...base,
    site: { ...DEFAULT_CMS.site, ...base.site },
    releases: Array.isArray(base.releases) ? base.releases : DEFAULT_CMS.releases,
    visuals: Array.isArray(base.visuals) ? base.visuals : DEFAULT_CMS.visuals,
    tour: {
      config: { ...DEFAULT_CMS.tour.config, ...base.tour?.config },
      shows: Array.isArray(base.tour?.shows) ? base.tour.shows : DEFAULT_CMS.tour.shows,
    },
    store: {
      config: { ...DEFAULT_CMS.store.config, ...base.store?.config },
      merch: Array.isArray(base.store?.merch) ? base.store.merch : DEFAULT_CMS.store.merch,
    },
    newsletter: {
      ...DEFAULT_CMS.newsletter,
      ...base.newsletter,
      pressItems: Array.isArray(base.newsletter?.pressItems) ? base.newsletter.pressItems : DEFAULT_CMS.newsletter.pressItems,
      videos: Array.isArray(base.newsletter?.videos) ? base.newsletter.videos : DEFAULT_CMS.newsletter.videos,
    },
    updatedAt: typeof base.updatedAt === "number" ? base.updatedAt : DEFAULT_CMS.updatedAt,
  };
}
export async function getCms(): Promise<CmsData> {
  return normalizeCms(await readRecord<CmsData>(CMS_KEY));
}
function safeUrl(value: unknown, allowLocal = true) {
  if (typeof value !== "string") return false;
  if (!value || value === "#" || /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  if (allowLocal && /^\/(?!\/)[\w\-./%]+$/.test(value)) return true;
  try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) && !!u.hostname; } catch { return false; }
}
function safeUrlsDeep(obj: unknown): boolean {
  if (Array.isArray(obj)) return obj.every(safeUrlsDeep);
  if (!obj || typeof obj !== "object") return true;
  return Object.entries(obj as Record<string, unknown>).every(([k, v]) => {
    const isUrl = /^(art|href|url|src|image|posterSrc|backgroundImage|fanLink|storeHref|ticketPortalHref|desktopVideo|mobileVideo|desktopPoster|mobilePoster|poster|spotify|apple|youtube|audiomack|boomplay|soundcloud|deezer|tidal)$/i.test(k);
    if (isUrl && v !== null && v !== undefined && !safeUrl(v)) return false;
    if (k === "images" && Array.isArray(v) && !v.every((url) => safeUrl(url))) return false;
    return safeUrlsDeep(v);
  });
}
export function validateCms(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Invalid CMS data";
  const data = value as Partial<CmsData>;
  for (const [key, max] of [["releases", 150], ["visuals", 150]] as const) {
    if (data[key] && (!Array.isArray(data[key]) || data[key]!.length > max)) return `Invalid ${key} entries`;
  }
  if (data.tour?.shows && (!Array.isArray(data.tour.shows) || data.tour.shows.length > 200)) return "Invalid tour shows";
  if (data.store?.merch && (!Array.isArray(data.store.merch) || data.store.merch.length > 200)) return "Invalid merch items";
  if (data.newsletter?.pressItems && (!Array.isArray(data.newsletter.pressItems) || data.newsletter.pressItems.length > 200)) return "Invalid press entries";
  if (data.newsletter?.videos && (!Array.isArray(data.newsletter.videos) || data.newsletter.videos.length > 100)) return "Invalid video entries";
  if (!safeUrlsDeep(data)) return "Links must use http(s) or a local /path";
  return null;
}
export async function putCms(input: Partial<CmsData>): Promise<CmsData> {
  const existing = await getCms();
  const merged = normalizeCms({ ...existing, ...input, updatedAt: Date.now() });
  await saveRecord(CMS_KEY, merged);
  return merged;
}
export async function resetCms(): Promise<CmsData> {
  const data = normalizeCms({ ...DEFAULT_CMS, updatedAt: Date.now() });
  await saveRecord(CMS_KEY, data);
  return data;
}
