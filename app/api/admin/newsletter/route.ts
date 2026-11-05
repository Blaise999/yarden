/** A deliberately limited admin newsletter sender for small, consented lists.
 * For larger audiences, export contacts to Resend Broadcasts and use its managed sending/unsubscribe features.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdmin, sameOriginRequest, clientRateKey } from "../../../../libs/adminAuth";
import { newUnsubscribeToken, subscribers } from "../../../../libs/audienceStore";
import { createRecord, rateLimited, saveRecord } from "../../../../libs/persistence";
import { emailConfigured, newsletterTemplate, sendEmail, siteOrigin } from "../../../../libs/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMIT = 40;
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const origin = siteOrigin();
  return NextResponse.json({ configured: emailConfigured() && !!origin, fromConfigured: Boolean(process.env.EMAIL_FROM), siteUrlConfigured: !!origin, limit: LIMIT }, { headers: { "cache-control": "private, no-store" } });
}
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req) || !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (await rateLimited(clientRateKey(req,"admin-newsletter"), 12, 3600)) return NextResponse.json({ error: "Too many mail requests this hour." }, { status: 429 });
    if (Number(req.headers.get("content-length") || 0) > 14000) return NextResponse.json({ error: "Message too large" }, { status: 413 });
    const body = await req.json();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const test = body.test === true;
    if (subject.length < 4 || subject.length > 140 || message.length < 10 || message.length > 6000) return NextResponse.json({ error: "Subject must be 4–140 characters and body 10–6000 characters." }, { status: 400 });
    if (!emailConfigured() || !siteOrigin()) return NextResponse.json({ error: "Configure RESEND_API_KEY, EMAIL_FROM, and NEXT_PUBLIC_SITE_URL on Vercel first." }, { status: 503 });
    const origin = siteOrigin()!;
    if (test) {
      const to = String(body.testEmail || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || to.length > 254) return NextResponse.json({ error: "Enter a valid test recipient email." }, { status: 400 });
      const result = await sendEmail({to, subject:`[TEST] ${subject}`, text:message, html:newsletterTemplate(subject, message, `${origin}/unsubscribe`)});
      if (!result.sent) return NextResponse.json({ error: result.reason || "Test email failed" }, { status: 502 });
      return NextResponse.json({ ok: true, test: true, sent: 1 });
    }
    if (body.confirm !== "SEND" || !/^[a-f0-9-]{20,50}$/i.test(String(body.campaignId || ""))) return NextResponse.json({ error: "Explicit SEND confirmation and a unique campaign ID required." }, { status: 400 });
    const list = await subscribers();
    if (list.length > LIMIT) return NextResponse.json({ error: `This admin sender supports at most ${LIMIT} subscribed addresses per campaign. Use Resend Broadcasts for larger audiences.` }, { status: 413 });
    if (!list.length) return NextResponse.json({ error: "There are no opted-in subscribers." }, { status: 400 });
    const campaignId = String(body.campaignId);
    const lockKey = `yarden:newsletter:campaign:${campaignId}`;
    const locked = await createRecord(lockKey, { startedAt: new Date().toISOString(), count: list.length, status: "sending" });
    if (!locked) return NextResponse.json({ error: "This campaign has already been started; use a new draft only if you intend a new send." }, { status: 409 });
    let sent = 0, failed = 0;
    // Bounded concurrency prevents very slow sequential sends and avoids a burst of 40 simultaneous API requests.
    const batchSize = 4;
    for (let index = 0; index < list.length; index += batchSize) {
      const batch = list.slice(index, index + batchSize);
      const results = await Promise.all(batch.map(async (subscriber): Promise<boolean> => {
        // Every recipient gets a unique opt-out link. Yard Pass holders are never targeted by default.
        try {
          const token = await newUnsubscribeToken(subscriber.email);
          const unsub = { page: `${origin}/unsubscribe?token=${token}`, oneClick: `${origin}/api/unsubscribe?token=${token}` };
          const result = await sendEmail({
            to: subscriber.email, subject, text: `${message}\n\nUnsubscribe: ${unsub.page}`,
            html: newsletterTemplate(subject, message, unsub.page), unsubscribe: unsub,
            idempotencyKey: `yarden-${campaignId}-${createHash("sha256").update(subscriber.email).digest("hex").slice(0,16)}`,
          });
          return result.sent;
        } catch { return false; }
      }));
      for (const ok of results) { if (ok) sent++; else failed++; }
    }
    await saveRecord(lockKey,{ endedAt: new Date().toISOString(), sent, failed, status:"completed" });
    return NextResponse.json({ok: true, sent, failed, total: list.length, note: failed ? "Some messages failed. Check Resend dashboard before attempting another campaign to prevent duplicates." : undefined});
  } catch { return NextResponse.json({error:"Could not send newsletter. Check database and Resend configuration."},{status:503}); }
}
