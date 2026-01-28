import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { DEFAULT_CMS, type CmsData } from "../../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CMS_KEY = "yarden:cms:v1";

function normalize(data: Partial<CmsData> | null | undefined): CmsData {
  const base = (data ?? {}) as CmsData;

  return {
    ...DEFAULT_CMS,
    ...base,
    releases: base.releases ?? DEFAULT_CMS.releases,
    visuals: base.visuals ?? DEFAULT_CMS.visuals,
    tour: base.tour ?? DEFAULT_CMS.tour,
    store: base.store ?? DEFAULT_CMS.store,
    newsletter: base.newsletter ?? DEFAULT_CMS.newsletter,
    updatedAt: base.updatedAt || Date.now(),
  };
}

export async function GET() {
  const stored = (await kv.get(CMS_KEY)) as CmsData | null;
  const cms = normalize(stored ?? DEFAULT_CMS);

  const res = NextResponse.json({ cms });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
