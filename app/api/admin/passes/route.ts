import { NextResponse } from "next/server";
import { isAdmin } from "../../../../libs/adminAuth";
import { getAllPasses } from "../../../../libs/passStorage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized", passes: [] }, { status: 401 });
  try {
    const passes = await getAllPasses();
    return NextResponse.json({ passes, count: passes.length }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Pass database unavailable", passes: [] }, { status: 503 }); }
}
