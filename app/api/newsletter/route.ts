import { NextRequest, NextResponse } from "next/server";
import { sameOriginRequest, clientRateKey } from "../../../libs/adminAuth";
import { subscribe, newUnsubscribeToken } from "../../../libs/audienceStore";
import { rateLimited } from "../../../libs/persistence";
import { emailConfigured, siteOrigin, sendSubscriberWelcome, sendAdminNotification } from "../../../libs/email";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  try {
    if (await rateLimited(clientRateKey(req, "newsletter"), 10, 3600)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    if (Number(req.headers.get("content-length") || 0) > 2000) return NextResponse.json({ error: "Invalid request" }, { status: 413 });
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid signup data" }, { status: 400 });
    const email = String(body.email || "").trim().toLowerCase();
    if (body.consent !== true || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254)
      return NextResponse.json({ error: "Enter a valid email and agree to receive updates." }, { status: 400 });
    const created = await subscribe(email);
    // Persistence is the source of truth. A mail outage must not erase a subscriber.
    if (created && emailConfigured()) {
      const origin = siteOrigin();
      if (origin) {
        try {
          const token = await newUnsubscribeToken(email);
          const unsub = { page: `${origin}/unsubscribe?token=${token}`, oneClick: `${origin}/api/unsubscribe?token=${token}` };
          const result = await sendSubscriberWelcome(email, unsub);
          if (!result.sent) console.warn("Newsletter confirmation not delivered:", result.reason);
        } catch { console.warn("Newsletter welcome mail could not be prepared"); }
      }
      // Admin alerts are optional. Never disclose secrets in logs.
      await sendAdminNotification("Yarden: new updates subscriber", "A visitor opted in to Yarden updates.").catch(() => {});
    }
    return NextResponse.json({ ok: true, message: created ? "You're on the Yarden updates list." : "This email is already on the list." });
  } catch { return NextResponse.json({ error: "The signup database is unavailable" }, { status: 503 }); }
}
