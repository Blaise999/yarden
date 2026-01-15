// app/api/passes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { savePass, getPassByAnonId, generatePassId } from "@/libs/passStorage";
import type { YardPass, Gender } from "@/libs/passTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to get or create anon ID from cookie
function getAnonIdFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/yard_anon_id=([^;]+)/);
  return match ? match[1] : null;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

    // Validate required fields
    if (!name || !email || !phone || !gender || !pngDataUrl) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Get or create anon ID
    let anonId = getAnonIdFromRequest(request);
    const isNewAnon = !anonId;
    if (!anonId) {
      anonId = generateUUID();
    }

    // Get metadata
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const userAgent = h.get("user-agent") || "unknown";

    // Determine title and status based on gender
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
      pngDataUrl,
      ip,
      userAgent,
    };

    // Save the pass
    const savedPass = await savePass(pass);

    // Create response with cookie if new anon
    const response = NextResponse.json({ pass: savedPass }, { status: 201 });
    
    if (isNewAnon) {
      response.cookies.set("yard_anon_id", anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error saving pass:", error);
    return NextResponse.json(
      { error: "Failed to save pass" }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryAnonId = searchParams.get("anonId");

    // Try query param first, then cookie
    const anonId = queryAnonId || getAnonIdFromRequest(request);
    
    if (!anonId) {
      return NextResponse.json({ pass: null }, { status: 200 });
    }

    const pass = await getPassByAnonId(anonId);

    return NextResponse.json({ pass }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pass:", error);
    return NextResponse.json(
      { error: "Failed to fetch pass" }, 
      { status: 500 }
    );
  }
}
