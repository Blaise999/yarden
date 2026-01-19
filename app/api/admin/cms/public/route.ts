import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { CMS_KV_KEY, DEFAULT_CMS, type CmsData } from "../../../../../content/defaultCms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = (await kv.get<CmsData>(CMS_KV_KEY)) ?? null;
  if (!data) {
    await kv.set(CMS_KV_KEY, DEFAULT_CMS);
    return NextResponse.json({ cms: DEFAULT_CMS });
  }
  return NextResponse.json({ cms: data });
}
