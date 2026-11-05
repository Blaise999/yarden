import { NextResponse } from "next/server";
import { hasPersistentStore } from "../../../libs/persistence";
import { emailConfigured, siteOrigin } from "../../../libs/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const storage = hasPersistentStore();
  const sessions = Boolean(process.env.ADMIN_SESSION_SECRET && /^[0-9a-fA-F]{64,}$/.test(process.env.ADMIN_SESSION_SECRET));
  return NextResponse.json({ status: storage && sessions ? "healthy" : "configuration_required", checks: { persistentStorage: storage, sessionSigningSecret: sessions, emailDeliveryConfigured: emailConfigured(), emailLinksConfigured: Boolean(siteOrigin()) } }, { headers: { "Cache-Control": "no-store" } });
}
