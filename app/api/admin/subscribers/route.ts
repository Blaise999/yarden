import { NextResponse } from "next/server";
import { isAdmin } from "../../../../libs/adminAuth";
import { subscribers } from "../../../../libs/audienceStore";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const list = await subscribers(); return NextResponse.json({ subscribers: list, count: list.length }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "List unavailable" }, { status: 503 }); }
}
