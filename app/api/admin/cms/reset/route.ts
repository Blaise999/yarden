import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { isAdmin } from "../../../../../libs/adminAuth";
import { CMS_KV_KEY, DEFAULT_CMS } from "../../../../../content/defaultCms";

export const runtime = "nodejs";

export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const next = { ...DEFAULT_CMS, updatedAt: Date.now() };
  await kv.set(CMS_KV_KEY, next);
  return NextResponse.json({ ok: true, cms: next });
}
