import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { isAdmin } from "@/libs/adminAuth";
import { CMS_KV_KEY, DEFAULT_CMS, type CmsData } from "@/content/defaultCms";

export const runtime = "nodejs";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = (await kv.get<CmsData>(CMS_KV_KEY)) ?? null;

  if (!data) {
    await kv.set(CMS_KV_KEY, DEFAULT_CMS);
    return NextResponse.json({ cms: DEFAULT_CMS });
  }

  return NextResponse.json({ cms: data });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { cms?: CmsData } | null;
  const cms = body?.cms;

  if (!cms || typeof cms !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const next: CmsData = {
    ...cms,
    version: Number(cms.version ?? 1),
    updatedAt: Date.now(),
  };

  await kv.set(CMS_KV_KEY, next);
  return NextResponse.json({ ok: true, cms: next });
}
