/** Yarden transactional email and small-list newsletters through Resend.
 * Server-only module. Never put API keys into client props, HTML or source control.
 */
import { createHash } from "node:crypto";
import type { YardPass } from "./passTypes";

export type SendResult = { sent: boolean; reason?: string; id?: string };
const escapeHtml = (value: string) => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] || c));

export function emailConfigured(): boolean {
  const from = process.env.EMAIL_FROM || "";
  const emailAddress = from.includes("<") ? (from.match(/<([^<>\r\n]+)>$/)?.[1] || "") : from;
  return Boolean(process.env.RESEND_API_KEY && /^re_/.test(process.env.RESEND_API_KEY) && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(emailAddress) && !/[\r\n]/.test(from));
}
export function siteOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.hostname === "localhost" && url.protocol === "http:")) return null;
    return url.origin;
  } catch { return null; }
}
function emailShell(title: string, body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#0d0e0e;margin:0;padding:28px 12px;color:#f7f5ee;font-family:Arial,sans-serif"><div style="max-width:580px;margin:auto;background:#181a19;border:1px solid #343732;border-radius:14px;padding:32px"><div style="font-weight:bold;letter-spacing:4px;color:#ddd6bb;font-size:13px">YARDEN / THE YARD</div><h1 style="font-size:29px;line-height:1.2;margin:30px 0 18px;color:#fff">${escapeHtml(title)}</h1><div style="font-size:16px;line-height:1.7;color:#ddd">${body}</div><div style="margin-top:36px;border-top:1px solid #343732;padding-top:18px;color:#9b9b9b;font-size:12px">© ${new Date().getFullYear()} Yarden. Sent because of your activity on the official Yarden website.</div></div></body></html>`;
}
export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribe?: { page: string; oneClick: string };
  idempotencyKey?: string;
}): Promise<SendResult> {
  if (!emailConfigured()) return { sent: false, reason: "Resend or EMAIL_FROM not configured" };
  const headers: Record<string,string> = { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  if (message.idempotencyKey) headers["Idempotency-Key"] = message.idempotencyKey;
  const customHeaders: Record<string,string> = {};
  if (message.unsubscribe) {
    customHeaders["List-Unsubscribe"] = `<${message.unsubscribe.oneClick}>`;
    customHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const body = {
    from: process.env.EMAIL_FROM,
    to: [message.to], subject: message.subject, html: message.html, text: message.text,
    ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
    ...(message.unsubscribe ? { headers: customHeaders } : {}),
  };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!response.ok) {
      // Never log the key or recipient details. Failed responses remain retryable at the UI level.
      return { sent: false, reason: `Resend responded ${response.status}` };
    }
    const payload: {id?: string} = await response.json();
    return { sent: true, id: payload.id };
  } catch {
    return { sent: false, reason: "Resend connection failed" };
  }
}

export async function sendYardPassWelcome(pass: YardPass): Promise<SendResult> {
  return sendEmail({
    to: pass.email,
    subject: "Welcome to The Yard — your Yard Pass",
    text: `Hi ${pass.name},\n\nYour Yard Pass is ready.\nPass ID: ${pass.id}\nType: ${pass.title}\n\nYour digital pass is available in the same browser where you registered. Keep your ID for reference; it is not a login or proof of identity.\n\nYarden / The Yard`,
    html: emailShell("You're in The Yard.", `<p>Hi ${escapeHtml(pass.name)},</p><p>Your Yard Pass is ready.</p><p style="font-size:25px;font-weight:bold;letter-spacing:1px;color:#fff">${escapeHtml(pass.id)}</p><p>${escapeHtml(pass.title)}</p><p>Open the website in the same browser where you registered to view or download your pass. This email does not enable cross-device recovery.</p>`),
    idempotencyKey: `yard-pass-${createHash("sha256").update(pass.id).digest("hex").slice(0,32)}`,
  });
}
export async function sendSubscriberWelcome(email: string, unsubscribe: { page: string; oneClick: string }): Promise<SendResult> {
  return sendEmail({
    to: email,
    subject: "You're on the Yarden updates list",
    text: `Welcome to the Yarden updates list. You'll hear about Yarden music and announcements.\n\nUnsubscribe anytime: ${unsubscribe.page}`,
    html: emailShell("Welcome to the updates list.", `<p>You're signed up for occasional Yarden music and news.</p><p style="font-size:13px"><a style="color:#e3c8a1" href="${escapeHtml(unsubscribe.page)}">Unsubscribe from updates</a></p>`),
    unsubscribe,
  });
}
export async function sendAdminNotification(subject: string, text: string): Promise<SendResult> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { sent: false, reason: "Admin notification email not configured" };
  return sendEmail({ to, subject, text, html: emailShell(subject, `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`) });
}
export function newsletterTemplate(subject: string, message: string, unsubscribeUrl: string): string {
  return emailShell(subject, `<div style="white-space:pre-wrap">${escapeHtml(message)}</div><p style="margin-top:35px;font-size:13px"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#e3c8a1">Unsubscribe from Yarden updates</a></p>`);
}
