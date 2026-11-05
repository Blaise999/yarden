import { NextRequest, NextResponse } from "next/server";
import { isAdmin, changeAdminPassword, sameOriginRequest, clientRateKey } from "../../../../libs/adminAuth";
import { rateLimited } from "../../../../libs/persistence";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req) || !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (await rateLimited(clientRateKey(req, "password"), 10, 3600)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    const { currentPassword, newPassword } = await req.json();
    const changed = await changeAdminPassword(currentPassword, newPassword);
    return changed ? NextResponse.json({ success: true, message: "Password changed. Other sessions are now invalid." }) : NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  } catch (e: any) { return NextResponse.json({ error: e.message || "Password change failed" }, { status: 400 }); }
}
