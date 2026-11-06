import { NextResponse } from "next/server";
import { storageHealth } from "../../../libs/persistence";
import { emailConfigured, siteOrigin } from "../../../libs/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const redis = await storageHealth();
  const sessions = Boolean(process.env.ADMIN_SESSION_SECRET && /^[0-9a-fA-F]{64,}$/.test(process.env.ADMIN_SESSION_SECRET));
  const ready = redis.connected && sessions;
  return NextResponse.json({
    status: ready ? "healthy" : "configuration_required",
    checks: {
      persistentStorage: redis.configured,
      redisReachable: redis.connected,
      sessionSigningSecret: sessions,
      emailDeliveryConfigured: emailConfigured(),
      emailLinksConfigured: Boolean(siteOrigin()),
    },
    // These instructions are safe to expose; never output actual keys or URLs.
    nextStep: !redis.configured ? "Connect Upstash credentials to this Vercel project's Production environment and redeploy."
      : !redis.connected ? "Redis is configured but unreachable. Check Upstash credentials/region, then redeploy."
      : !sessions ? "Set ADMIN_SESSION_SECRET to a random 64-character hexadecimal value in Vercel Production and redeploy."
      : null,
  }, { status: ready ? 200 : 503, headers: { "Cache-Control": "private, no-store" } });
}
