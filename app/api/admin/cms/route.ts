// app/api/admin/cms/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_CMS, type CmsData } from "../../../../content/defaultCms";

export const runtime = "nodejs";

// Global cache for sharing state between routes
// In production, this would be a database or KV store
declare global {
  var cmsCache: CmsData | null;
}

if (!global.cmsCache) {
  global.cmsCache = null;
}

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("yard_admin_token");
    return !!token?.value;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return cached CMS or default
  const data = global.cmsCache ?? { ...DEFAULT_CMS, updatedAt: Date.now() };
  
  // Ensure all required fields exist (migration support)
  const migrated: CmsData = {
    ...DEFAULT_CMS,
    ...data,
    releases: data.releases ?? DEFAULT_CMS.releases,
    visuals: data.visuals ?? DEFAULT_CMS.visuals,
    tour: data.tour ?? DEFAULT_CMS.tour,
    store: data.store ?? DEFAULT_CMS.store,
    newsletter: data.newsletter ?? DEFAULT_CMS.newsletter,
  };

  return NextResponse.json({ cms: migrated });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cms = body?.cms as CmsData | undefined;

    if (!cms || typeof cms !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const next: CmsData = {
      ...cms,
      version: Number(cms.version ?? 1),
      updatedAt: Date.now(),
    };

    // Store in cache
    global.cmsCache = next;

    return NextResponse.json({ ok: true, cms: next });
  } catch (error) {
    console.error("CMS PUT error:", error);
    return NextResponse.json({ error: "Failed to update CMS" }, { status: 500 });
  }
}
