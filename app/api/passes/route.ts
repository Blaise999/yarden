import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getPassByAnonId, savePass, generatePassId } from "../../../libs/passStorage";
import { publicPass, type YardPass } from "../../../libs/passTypes";
import { sameOriginRequest, clientRateKey, SessionSecretNotConfigured } from "../../../libs/adminAuth";
import { rateLimited, StoreNotConfigured, storageHealth } from "../../../libs/persistence";
import { sendYardPassWelcome, sendAdminNotification } from "../../../libs/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "yard_member";
function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || !/^[0-9a-fA-F]{64,}$/.test(s)) throw new SessionSecretNotConfigured();
  return s;
}
function cookieFor(id: string) { return `${id}.${createHmac("sha256", secret()).update(id).digest("hex")}`; }
async function getMemberId() {
  const token = (await cookies()).get(COOKIE)?.value || "";
  const [id, sig] = token.split(".");
  if (!id || !/^[a-f0-9]{48}$/.test(id) || !sig) return null;
  const actual = Buffer.from(sig, "hex");
  const expected = Buffer.from(createHmac("sha256", secret()).update(id).digest("hex"), "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return id;
}
function errorResponse(e: unknown) {
  if (e instanceof StoreNotConfigured) {
    return NextResponse.json({ code: "REDIS_NOT_CONFIGURED", error: "Yard Pass storage is not connected yet. The site administrator needs to configure Upstash Redis." }, { status: 503 });
  }
  if (e instanceof SessionSecretNotConfigured) {
    return NextResponse.json({ code: "SIGNING_SECRET_MISSING", error: "Yard Pass setup isn't complete. The administrator needs to configure the session signing secret." }, { status: 503 });
  }
  console.error("Yard Pass service error:", e instanceof Error ? e.name : "UnknownError");
  return NextResponse.json({ code: "SERVICE_UNAVAILABLE", error: "The Yard Pass service is temporarily unavailable. Please try again shortly." }, { status: 503 });
}
export async function GET() {
  try {
    // A visitor without a cookie must still see a real service health result.
    // Otherwise the form appears ready even though the POST will always fail.
    secret();
    const store = await storageHealth();
    if (!store.configured) throw new StoreNotConfigured();
    if (!store.connected) throw new Error("Redis not reachable");
    const id = await getMemberId();
    const pass = id ? await getPassByAnonId(id) : null;
    return NextResponse.json({ pass: pass ? publicPass(pass) : null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return errorResponse(e); }
}
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  try {
    secret();
    if (await rateLimited(clientRateKey(req, "pass"), 8, 3600)) return NextResponse.json({ error: "Too many registrations. Please try later." }, { status: 429 });
    const existingId = await getMemberId();
    const existingPass = existingId && await getPassByAnonId(existingId);
    if (existingPass) return NextResponse.json({ pass: publicPass(existingPass), existing: true }, { status: 200 });
    if (Number(req.headers.get("content-length") || 0) > 10_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid registration data" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
    const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const gender = body.gender as "male" | "female";
    if (name.length < 2 || name.length > 90 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254 || phone.length > 32 || !["male", "female"].includes(gender))
      return NextResponse.json({ error: "Enter a valid name, email and pass type." }, { status: 400 });
    const anonId = randomBytes(24).toString("hex");
    const pass: YardPass = {
      id: generatePassId(), anonId, name, email, phone, gender,
      title: gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT",
      status: gender === "female" ? "Angel Certified" : "Descendant Certified",
      yearJoined: new Date().getFullYear(), createdAt: new Date().toISOString(),
    };
    const result = await savePass(pass);
    // A confirmation email is transactional, not an opt-in to marketing.
    // Do not reject a successfully stored Yard Pass when email is unavailable.
    if (result.created) {
      // Send both notifications concurrently; never invalidate a saved pass if email fails.
      const [welcome] = await Promise.allSettled([
        sendYardPassWelcome(result.pass),
        sendAdminNotification("Yarden: new Yard Pass", `A new Yard Pass was created: ${result.pass.id}`),
      ]);
      if (welcome.status === "fulfilled" && !welcome.value.sent && welcome.value.reason !== "Resend or EMAIL_FROM not configured") {
        console.warn("Yard Pass welcome delivery:", welcome.value.reason);
      }
    }
    (await cookies()).set(COOKIE, cookieFor(anonId), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 86400 });
    return NextResponse.json({ pass: publicPass(result.pass), success: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return errorResponse(e); }
}
