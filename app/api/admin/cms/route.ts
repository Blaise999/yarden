import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOriginRequest } from "../../../../libs/adminAuth";
import { getCms, putCms, resetCms, validateCms } from "../../../../libs/cmsStore";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ ok: true, cms: await getCms() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Persistent CMS storage unavailable" }, { status: 503 }); }
}
export async function PUT(req: NextRequest) {
  if (!sameOriginRequest(req) || !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (Number(req.headers.get("content-length") || "0") > 1_000_000) return NextResponse.json({ error: "CMS data too large" }, { status: 413 });
    const body = await req.json();
    const incoming = body?.cms ?? body;
    if (JSON.stringify(incoming).length > 1_000_000) return NextResponse.json({ error: "CMS data too large" }, { status: 413 });
    const issue = validateCms(incoming);
    if (issue) return NextResponse.json({ error: issue }, { status: 400 });
    return NextResponse.json({ ok: true, cms: await putCms(incoming) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Could not save. Confirm Redis is connected and payload is valid." }, { status: 503 }); }
}
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req) || !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ ok: true, cms: await resetCms() }); }
  catch { return NextResponse.json({ error: "CMS reset failed" }, { status: 503 }); }
}
