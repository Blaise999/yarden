// app/api/passes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getOrCreateAnonId, getAnonIdFromCookie } from "@/libs/cookieUtils";
import { savePass, getPassByAnonId, generatePassId } from "@/libs/passStorage";
import type { YardPass, Gender } from "@/libs/passTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name: string;
      email: string;
      phone: string;
      gender: Gender;
      pngDataUrl: string;
    };

    const { name, email, phone, gender, pngDataUrl } = body;

    if (!name || !email || !phone || !gender || !pngDataUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anonId = await getOrCreateAnonId();

    // metadata
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const userAgent = h.get("user-agent") || "unknown";

    const title: YardPass["title"] =
      gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT";

    const status: YardPass["status"] =
      gender === "female" ? "Angel Certified" : "Descendant Certified";

    const now = new Date();
    const yearJoined = now.getFullYear();
    const createdAt = now.toISOString();

    const pass: YardPass = {
      id: generatePassId(),
      anonId,
      name,
      email,
      phone,
      gender,
      title,
      status,
      yearJoined,
      createdAt,
      pngDataUrl, // original behavior: store base64
      ip,
      userAgent,
    };

    // ✅ THIS is the original bug: you must await
    const savedPass = await savePass(pass);

    return NextResponse.json({ pass: savedPass }, { status: 201 });
  } catch (error) {
    console.error("Error saving pass:", error);
    return NextResponse.json({ error: "Failed to save pass" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryAnonId = searchParams.get("anonId");

    const anonId = queryAnonId || (await getAnonIdFromCookie());
    if (!anonId) return NextResponse.json({ pass: null }, { status: 200 });

    // ✅ THIS is the other original bug: you must await
    const pass = await getPassByAnonId(anonId);

    return NextResponse.json({ pass }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pass:", error);
    return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
  }
}
