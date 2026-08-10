// app/api/admin/cms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import { DEFAULT_CMS, type CmsData } from "../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CMS_KEY = "yarden:cms:v1";

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

export async function GET() {
  try {
    const stored = (await kv.get(CMS_KEY)) as CmsData | null;
    const cms = normalize(stored ?? DEFAULT_CMS);

    const res = NextResponse.json({ ok: true, cms });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("CMS GET error:", e);
    return NextResponse.json({ error: "Failed to load CMS" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { cms?: Partial<CmsData> } | Partial<CmsData>;
    const incoming = (body as any)?.cms ?? body;

    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json({ error: "Invalid CMS payload" }, { status: 400 });
    }

    const prev = (await kv.get(CMS_KEY)) as CmsData | null;

    // merge + normalize so missing fields never break the site
    const next = normalize({ ...(prev ?? DEFAULT_CMS), ...(incoming as any) });

    await kv.set(CMS_KEY, next);

    const res = NextResponse.json({ ok: true, cms: next });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("CMS PUT error:", e);
    return NextResponse.json({ error: "Failed to save CMS" }, { status: 500 });
  }
}

export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const next = normalize(DEFAULT_CMS);
    await kv.set(CMS_KEY, next);

    const res = NextResponse.json({ ok: true, cms: next });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    console.error("CMS POST error:", e);
    return NextResponse.json({ error: "Failed to reset CMS" }, { status: 500 });
  }
}
