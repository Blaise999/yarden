// app/api/admin/cms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_CMS, type CmsData } from "../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var cmsCache: CmsData | null;
}

function isAdmin(): boolean {
  return !!cookies().get("yard_admin_token")?.value;
}

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
    updatedAt: Date.now(),
  };
}

// optional admin GET
export async function GET() {
  const cms = normalize(global.cmsCache ?? DEFAULT_CMS);
  return NextResponse.json({ ok: true, cms });
}

// ✅ this is what your frontend needs
export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { cms?: Partial<CmsData> } | Partial<CmsData>;

    // accept either {cms:{...}} or direct {...}
    const incoming = "cms" in (body as any) ? (body as any).cms : body;

    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json({ error: "Invalid CMS payload" }, { status: 400 });
    }

    const next = normalize({ ...(global.cmsCache ?? DEFAULT_CMS), ...(incoming as any) });
    global.cmsCache = next;

    return NextResponse.json({ ok: true, cms: next });
  } catch (e) {
    console.error("CMS PUT error:", e);
    return NextResponse.json({ error: "Failed to save CMS" }, { status: 500 });
  }
}

// keep POST as reset-to-default if you use it
export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const next = normalize(DEFAULT_CMS);
  global.cmsCache = next;
  return NextResponse.json({ ok: true, cms: next });
}
