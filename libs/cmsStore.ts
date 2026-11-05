import { DEFAULT_CMS, type CmsData } from "../content/defaultCms";
import { readRecord, saveRecord } from "./persistence";
export const CMS_KEY = "yarden:cms:v1"; // Retain the existing live CMS data, if any.
export function normalizeCms(input: Partial<CmsData> | null | undefined): CmsData {
  const base = input && typeof input === "object" ? input : {};
  // V9 migration: surface the verified 2026 ANGEL album, without erasing
  // releases or hero text a CMS editor intentionally changed in V8.
  const legacy = typeof base.version !== "number" || base.version < 3;
  const site = { ...DEFAULT_CMS.site, ...base.site };
  if (legacy) {
    const oldCopy: Partial<typeof site> = {
      eyebrow: "YARDEN / THE MUSE ERA",
      title: "Feel everything.",
      tagline: "NEW NOSTALGIA FROM LAGOS",
      description: "Songs for the moments you want to hold on to.",
    };
    for (const key of ["eyebrow", "title", "tagline", "description"] as const) {
      if (site[key] === oldCopy[key]) site[key] = DEFAULT_CMS.site[key];
    }
  }
  const previousReleases = Array.isArray(base.releases) ? base.releases : DEFAULT_CMS.releases;
  const newEraReleases = DEFAULT_CMS.releases.filter(r => ["angel-album", "sdf-2026-single", "sunset-in-paris-2026-single", "celine-2026-single"].includes(r.id));
  const releases = legacy
    ? [
        ...newEraReleases.filter(r => !previousReleases.some(old => old?.id === r.id || old?.title?.toUpperCase() === r.title.toUpperCase())),
        ...previousReleases,
      ]
    : previousReleases;
  // Preserve existing video choices while introducing newly verified artist videos.
  const previousVisuals = Array.isArray(base.visuals) ? base.visuals : DEFAULT_CMS.visuals;
  const angelVideos = DEFAULT_CMS.visuals.filter(v => ["sfd-angel-video-2026", "angel-album-trailer-2026", "sunset-paris-video-2026", "celine-video-2026"].includes(v.id));
  const visuals = legacy
    ? [...angelVideos.filter(v => !previousVisuals.some(old => old?.id === v.id || old?.href?.split("?")[0] === v.href?.split("?")[0])), ...previousVisuals]
    : previousVisuals;
  const previousPress = Array.isArray(base.newsletter?.pressItems)
    ? base.newsletter.pressItems : DEFAULT_CMS.newsletter.pressItems;
  const defaultPress = DEFAULT_CMS.newsletter.pressItems;
  // Keep editor-modified stories intact while front-loading the verified ANGEL-era coverage.
  // Only new editorial records are inserted; newsletter subscribers and passes are unaffected.
  const spotlightIds = new Set([
    "turntable-angel-interview-nov-2026",
    "angel-album-release-2026",
    "ghanaplug-angel-oct-2026",
    "album-talks-angel-2026",
    "mmc-sdf-oct-2026",
  ]);
  const newPress = [
    ...defaultPress.filter(item => spotlightIds.has(item.id)).map(item => {
      const previous = previousPress.find(old => old.id === item.id);
      return previous ? { ...item, ...previous, image: previous.image || item.image } : item;
    }),
    ...previousPress.filter(item => !spotlightIds.has(item.id)).map(old => {
      const matching = defaultPress.find(item => item.id === old.id);
      return !old.image && matching?.image ? { ...old, image: matching.image } : old;
    }),
  ];
  return {
    ...DEFAULT_CMS,
    ...base,
    version: 3,
    site,
    releases,
    visuals,
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
      pressItems: newPress,
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
