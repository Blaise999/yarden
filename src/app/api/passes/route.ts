// app/api/passes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { savePass, getPassByAnonId, generatePassId } from "@/libs/passStorage";
import type { YardPass, Gender } from "@/libs/passTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, gender, pngDataUrl } = body as {
      name: string;
      email: string;
      phone: string;
      gender: Gender;
      pngDataUrl: string;
    };

    // Validate
    if (!name || !email || !phone || !gender || !pngDataUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get or create anon ID
    const cookieStore = await cookies();
    let anonId = cookieStore.get("yard_anon_id")?.value;
    const isNewAnon = !anonId;
    
    if (!anonId) {
      anonId = generateUUID();
    }

    // Get request metadata
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || request.headers.get("x-real-ip") 
      || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Build pass object
    const pass: YardPass = {
      id: generatePassId(),
      anonId,
      name,
      email,
      phone,
      gender,
      title: gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT",
      status: gender === "female" ? "Angel Certified" : "Descendant Certified",
      yearJoined: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
      pngDataUrl,
      ip,
      userAgent,
    };

    // Save to KV
    await savePass(pass);

    // Set cookie if new user
    if (isNewAnon) {
      cookieStore.set("yard_anon_id", anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }

    return NextResponse.json({ pass, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/passes error:", error);
    return NextResponse.json({ error: "Failed to save pass" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryAnonId = searchParams.get("anonId");
    
    // Try query param first, then cookie
    const cookieStore = await cookies();
    const anonId = queryAnonId || cookieStore.get("yard_anon_id")?.value;
    
    if (!anonId) {
      return NextResponse.json({ pass: null });
    }

    const pass = await getPassByAnonId(anonId);
    return NextResponse.json({ pass });
  } catch (error) {
    console.error("GET /api/passes error:", error);
    return NextResponse.json({ error: "Failed to fetch pass" }, { status: 500 });
  }
}
