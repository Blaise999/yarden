import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getPassByAnonId, savePass, generatePassId } from "../../../libs/passStorage";
import { publicPass, type YardPass } from "../../../libs/passTypes";
import { sameOriginRequest, clientRateKey } from "../../../libs/adminAuth";
import { rateLimited, StoreNotConfigured } from "../../../libs/persistence";
import { sendYardPassWelcome, sendAdminNotification } from "../../../libs/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "yard_member";
function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || !/^[0-9a-fA-F]{64,}$/.test(s)) throw new Error("Session secret not configured");
  return s;
}
function cookieFor(id: string) { return `${id}.${createHmac("sha256", secret()).update(id).digest("hex")}`; }
function getMemberId() {
  const token = cookies().get(COOKIE)?.value || "";
  const [id, sig] = token.split(".");
  if (!id || !/^[a-f0-9]{48}$/.test(id) || !sig) return null;
  const actual = Buffer.from(sig, "hex");
  const expected = Buffer.from(createHmac("sha256", secret()).update(id).digest("hex"), "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return id;
}
function errorResponse(e: unknown) {
  const msg = e instanceof StoreNotConfigured ? e.message : "Unable to access persistent Yard Pass storage";
  return NextResponse.json({ error: msg }, { status: 503 });
}
export async function GET() {
  try {
    const id = getMemberId();
    const pass = id ? await getPassByAnonId(id) : null;
    return NextResponse.json({ pass: pass ? publicPass(pass) : null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return errorResponse(e); }
}
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  try {
    if (await rateLimited(clientRateKey(req, "pass"), 8, 3600)) return NextResponse.json({ error: "Too many registrations. Please try later." }, { status: 429 });
    const existingId = getMemberId();
    const existingPass = existingId && await getPassByAnonId(existingId);
    if (existingPass) return NextResponse.json({ pass: publicPass(existingPass), existing: true }, { status: 200 });
    if (Number(req.headers.get("content-length") || 0) > 10_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const body = await req.json();
    const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const gender = body.gender;
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
      const delivered = await sendYardPassWelcome(result.pass);
      if (!delivered.sent && delivered.reason !== "Resend or EMAIL_FROM not configured") console.warn("Yard Pass email not delivered:", delivered.reason);
      await sendAdminNotification("Yarden: new Yard Pass", `A new Yard Pass was created: ${result.pass.id}`).catch(() => {});
    }
    cookies().set(COOKIE, cookieFor(anonId), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 86400 });
    return NextResponse.json({ pass: publicPass(result.pass), success: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return errorResponse(e); }
}
