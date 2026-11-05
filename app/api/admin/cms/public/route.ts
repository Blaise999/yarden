import { NextResponse } from "next/server";
import { getCms } from "../../../../../libs/cmsStore";
import { DEFAULT_CMS } from "../../../../../content/defaultCms";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ cms: await getCms() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ cms: DEFAULT_CMS, storageOffline: true }, { headers: { "Cache-Control": "no-store" } }); }
}
