// app/api/admin/cms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_CMS, type CmsData } from "../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared in-memory cache (NOTE: not persistent on Vercel; use KV/DB for real persistence)
declare global {
  // eslint-disable-next-line no-var
  var cmsCache: CmsData | null;
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

function normalizeCms(data: CmsData | null): CmsData {
  const base = data ?? DEFAULT_CMS;

  return {
    ...DEFAULT_CMS,
    ...base,
    releases: base.releases ?? DEFAULT_CMS.releases,
    visuals: base.visuals ?? DEFAULT_CMS.visuals,
    tour: base.tour ?? DEFAULT_CMS.tour,
    store: base.store ?? DEFAULT_CMS.store,
    newsletter: base.newsletter ?? DEFAULT_CMS.newsletter,
    updatedAt: Date.now(),
  };
}

// (Optional) Admin GET: lets your admin panel load current CMS from the same endpoint it saves to
export async function GET() {
  const cms = normalizeCms(global.cmsCache);
  return NextResponse.json({ ok: true, cms });
}

// ✅ This is what your frontend needs (PUT /api/admin/cms)
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CmsData>;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid CMS payload" }, { status: 400 });
    }

    // Merge with defaults so missing fields never break the site
    const next: CmsData = normalizeCms({
      ...(global.cmsCache ?? DEFAULT_CMS),
      ...(body as CmsData),
    });

    global.cmsCache = next;
    return NextResponse.json({ ok: true, cms: next });
  } catch (e) {
    console.error("CMS PUT error:", e);
    return NextResponse.json({ error: "Failed to save CMS" }, { status: 500 });
  }
}

// Keep POST if you use it as “reset to default”
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const next = normalizeCms(DEFAULT_CMS);
  global.cmsCache = next;
  return NextResponse.json({ ok: true, cms: next });
}
