/** Password hashing and authenticated, revocable admin sessions. */
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readRecord, saveRecord, createRecord } from "./persistence";
const scrypt = promisify(scryptCb);
const AUTH_KEY = "yarden:admin:auth:v2";
export const ADMIN_COOKIE = "yard_admin_session";
export type AdminRecord = { salt: string; hash: string; revision: number; createdAt: number; changedAt: number };
function sessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !/^[0-9a-fA-F]{64,}$/.test(secret)) throw new Error("ADMIN_SESSION_SECRET must be a random hex value of at least 64 characters");
  return secret;
}
const passwordStrong = (password: string) => typeof password === "string" && password.length >= 12 && password.length <= 256;
export function validateAdminPassword(password: string) {
  if (!passwordStrong(password)) throw new Error("Password must be 12–256 characters.");
}
async function createPasswordRecord(password: string, revision: number, createdAt?: number): Promise<AdminRecord> {
  validateAdminPassword(password);
  const salt = randomBytes(24).toString("hex");
  const hash = (await scrypt(password, salt, 64) as Buffer).toString("hex");
  const now = Date.now();
  return { salt, hash, revision, createdAt: createdAt ?? now, changedAt: now };
}
async function verifyPassword(password: string, record: AdminRecord): Promise<boolean> {
  if (!password || typeof password !== "string") return false;
  const hash = await scrypt(password, record.salt, 64) as Buffer;
  return timingSafeEqual(hash, Buffer.from(record.hash, "hex"));
}
export async function adminExists() { return Boolean(await readRecord<AdminRecord>(AUTH_KEY)); }
export async function bootstrapAdmin(setupToken: string, password: string): Promise<boolean> {
  const expected = process.env.YARD_SETUP_TOKEN;
  if (!expected || !/^[0-9a-fA-F]{64,}$/.test(expected)) throw new Error("Set YARD_SETUP_TOKEN before setting up the admin account.");
  const a = Buffer.from(setupToken || ""); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const record = await createPasswordRecord(password, 1);
  return createRecord(AUTH_KEY, record); // first admin wins, never overwritten by setup
}
export async function adminLogin(password: string): Promise<AdminRecord | null> {
  const record = await readRecord<AdminRecord>(AUTH_KEY);
  if (!record) return null;
  return (await verifyPassword(password, record)) ? record : null;
}
function sign(raw: string) { return createHmac("sha256", sessionKey()).update(raw).digest("hex"); }
export function issueAdminCookie(record: AdminRecord) {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const raw = `${record.revision}.${exp}.${randomBytes(24).toString("hex")}`;
  const token = `${raw}.${sign(raw)}`;
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 12 * 3600,
  });
}
export function clearAdminCookie() {
  cookies().set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}
export async function isAdmin(): Promise<boolean> {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  const [revision, expiry, nonce, signature] = parts;
  if (!/^\d+$/.test(revision) || !/^\d+$/.test(expiry) || !/^[a-f0-9]{48}$/.test(nonce)) return false;
  if (Date.now() >= Number(expiry)) return false;
  const expected = Buffer.from(sign(`${revision}.${expiry}.${nonce}`), "hex");
  const supplied = Buffer.from(signature, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  const record = await readRecord<AdminRecord>(AUTH_KEY);
  return Boolean(record && record.revision === Number(revision));
}
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const record = await adminLogin(currentPassword);
  if (!record) return false;
  const updated = await createPasswordRecord(newPassword, record.revision + 1, record.createdAt);
  await saveRecord(AUTH_KEY, updated);
  issueAdminCookie(updated);
  return true;
}
// Protect state-changing operations against cross-origin form/request attacks.
export function sameOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const host = new URL(origin).host;
  return host === forwardedHost;
}
export function clientRateKey(req: Request, purpose: string): string {
  // No raw IP retained: hash the address, scoped to the current signing key.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `yarden:rate:${purpose}:${createHmac("sha256", sessionKey()).update(ip).digest("hex").slice(0, 20)}`;
}
