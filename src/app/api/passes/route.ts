// app/api/passes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Buffer } from "node:buffer";

import { getOrCreateAnonId, getAnonIdFromCookie } from "@/libs/cookieUtils";
import { savePass, getPassByAnonId, generatePassId } from "@/libs/passStorage";
import type { YardPass, Gender } from "@/libs/passTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** data:image/png;base64,... -> Buffer */
function pngDataUrlToBuffer(pngDataUrl: string): Buffer {
  const match = /^data:image\/png;base64,(.+)$/i.exec(pngDataUrl);
  if (!match?.[1]) throw new Error("Invalid pngDataUrl. Expected data:image/png;base64,...");
  return Buffer.from(match[1], "base64");
}

/** ✅ Always returns a real ArrayBuffer (no ArrayBufferLike/SharedArrayBuffer typing drama) */
function toArrayBufferCopy(bytes: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return ab;
}

function getClientIp(h: Headers): string {
  const v =
    h.get("x-forwarded-for") ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("true-client-ip");

  if (!v) return "unknown";
  return v.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      gender?: Gender;
      pngDataUrl?: string;
    };

    const name = body?.name?.trim();
    const email = body?.email?.trim();
    const phone = body?.phone?.trim();
    const gender = body?.gender;
    const pngDataUrl = body?.pngDataUrl;

    if (!name || !email || !phone || !gender || !pngDataUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anonId = await getOrCreateAnonId();

    const h = request.headers;
    const ip = getClientIp(h);
    const userAgent = h.get("user-agent") || "unknown";

    const isAngel = gender === "female";
    const title: YardPass["title"] = isAngel ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT";
    const status: YardPass["status"] = isAngel ? "Angel Certified" : "Descendant Certified";

    const now = new Date();
    const createdAt = now.toISOString();
    const yearJoined = now.getFullYear();

    const passId = generatePassId();

    // ✅ PNG bytes -> ArrayBuffer (real, TS-safe)
    const pngBuffer = pngDataUrlToBuffer(pngDataUrl); // Buffer is a Uint8Array
    const pngArrayBuffer = toArrayBufferCopy(pngBuffer);

    const filename = `passes/${anonId}/${passId}.png`;

    // ✅ “as any” here is intentional: your local typings are out of sync, but runtime is fine.
    // Docs: put() accepts ArrayBuffer + requires access: "public" :contentReference[oaicite:1]{index=1}
    const uploaded = await put(
      filename,
      pngArrayBuffer,
      {
        access: "public",
        contentType: "image/png",
      } as any
    );

    const pass: YardPass = {
      id: passId,
      anonId,
      name,
      email,
      phone,
      gender,
      title,
      status,
      yearJoined,
      createdAt,
      pngDataUrl: uploaded.url,
      ip,
      userAgent,
    };

    const savedPass = await savePass(pass);
    return NextResponse.json({ pass: savedPass }, { status: 201 });
  } catch (error: unknown) {
    const hint = error instanceof Error ? error.message : String(error);
    console.error("Error saving pass:", error);
    return NextResponse.json({ error: "Failed to save pass", hint }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryAnonId = searchParams.get("anonId");

    const anonId = queryAnonId || (await getAnonIdFromCookie());
    if (!anonId) return NextResponse.json({ pass: null }, { status: 200 });

    const pass = await getPassByAnonId(anonId);
    return NextResponse.json({ pass }, { status: 200 });
  } catch (error: unknown) {
    const hint = error instanceof Error ? error.message : String(error);
    console.error("Error fetching pass:", error);
    return NextResponse.json({ error: "Failed to fetch pass", hint }, { status: 500 });
  }
}
