import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOriginRequest } from "../../../../../libs/adminAuth";
import { resetCms } from "../../../../../libs/cmsStore";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req) || !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ ok: true, cms: await resetCms() }); }
  catch { return NextResponse.json({ error: "Reset failed" }, { status: 503 }); }
}
