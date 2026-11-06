import { NextRequest, NextResponse } from "next/server";
import { bootstrapAdmin, adminExists, adminLogin, issueAdminCookie, sameOriginRequest, clientRateKey } from "../../../../libs/adminAuth";
import { rateLimited } from "../../../../libs/persistence";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  try {
    if (await rateLimited(clientRateKey(req, "setup"), 10, 3600)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    if (await adminExists()) return NextResponse.json({ error: "Already set up. Log in to change your password." }, { status: 409 });
    const { setupToken, password } = await req.json();
    const result = await bootstrapAdmin(setupToken, password);
    if (!result) return NextResponse.json({ error: "Invalid setup token or setup already completed" }, { status: 401 });
    const record = await adminLogin(password);
    if (record) await issueAdminCookie(record);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Setup unavailable" }, { status: 400 });
  }
}
