import { NextRequest, NextResponse } from "next/server";
import { adminLogin, adminExists, issueAdminCookie, clearAdminCookie, sameOriginRequest, clientRateKey } from "../../../../libs/adminAuth";
import { rateLimited, StoreNotConfigured } from "../../../../libs/persistence";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ setupRequired: !(await adminExists()) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Storage is not configured" }, { status: 503 }); }
}
export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  try {
    if (await rateLimited(clientRateKey(request, "login"), 12, 15 * 60)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const { password } = await request.json();
    const record = await adminLogin(password);
    if (!record) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    issueAdminCookie(record);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof StoreNotConfigured) return NextResponse.json({ error: e.message }, { status: 503 });
    return NextResponse.json({ error: "Login unavailable. Check admin setup and server settings." }, { status: 503 });
  }
}
export async function DELETE(request: NextRequest) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  clearAdminCookie(); return NextResponse.json({ success: true });
}
