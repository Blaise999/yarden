// app/api/admin/cms/public/route.ts
import { NextResponse } from "next/server";
import { DEFAULT_CMS, type CmsData } from "../../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Import the cache from the main route (shared state)
// In production, this would be a database or KV store
declare global {
  var cmsCache: CmsData | null;
}

export async function GET() {
  // Get from global cache or use defaults
  const data = global.cmsCache ?? DEFAULT_CMS;
  
  // Ensure all required fields exist
  const cms: CmsData = {
    ...DEFAULT_CMS,
    ...data,
    releases: data.releases ?? DEFAULT_CMS.releases,
    visuals: data.visuals ?? DEFAULT_CMS.visuals,
    tour: data.tour ?? DEFAULT_CMS.tour,
    store: data.store ?? DEFAULT_CMS.store,
    newsletter: data.newsletter ?? DEFAULT_CMS.newsletter,
    updatedAt: data.updatedAt || Date.now(),
  };

  return NextResponse.json({ cms });
}
