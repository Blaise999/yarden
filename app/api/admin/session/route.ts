import { NextResponse } from "next/server";
import { isAdmin, adminExists } from "../../../../libs/adminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ authenticated: await isAdmin(), setupRequired: !(await adminExists()) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ authenticated: false, setupRequired: false, error: "Storage unavailable" }, { status: 503 }); }
}
