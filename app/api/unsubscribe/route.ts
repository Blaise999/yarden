import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "../../../libs/audienceStore";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function confirmation(ok: boolean) {
  return new NextResponse(`<!doctype html><html><meta name="viewport" content="width=device-width, initial-scale=1"><body style="background:#111;color:#fff;font:17px Arial;padding:50px;text-align:center"><h1>${ok ? "You're unsubscribed" : "Link unavailable"}</h1><p>${ok ? "You will no longer receive promotional Yarden updates." : "This unsubscribe link may be invalid. Contact the sender for help."}</p></body></html>`, { status: ok ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
export async function POST(req: NextRequest) {
  try {
    let token = req.nextUrl.searchParams.get("token") || "";
    if (!token && (req.headers.get("content-type") || "").includes("form")) {
      const form = await req.formData(); token = String(form.get("token") || "");
    }
    return confirmation(await unsubscribeByToken(token));
  } catch { return confirmation(false); }
}
