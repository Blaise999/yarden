// app/api/admin/cms/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_CMS, CMS_KV_KEY, type CmsData } from "../../../../content/defaultCms";

export const runtime = "nodejs";

// Simple in-memory storage for development (replace with proper DB/KV in production)
let cmsCache: CmsData | null = null;

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("yard_admin_token");
    // If token exists, user is authenticated
    return !!token?.value;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try to get from cache, otherwise use default
  const data = cmsCache ?? DEFAULT_CMS;
  return NextResponse.json({ cms: data });
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

    // Store in cache (in production, use proper DB/KV)
    cmsCache = next;

    return NextResponse.json({ ok: true, cms: next });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update CMS" }, { status: 500 });
  }
}
