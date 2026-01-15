import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getOrCreateAnonId, getAnonIdFromCookie } from "@/libs/cookieUtils";
import { savePass, getPassByAnonId, generatePassId } from "@/libs/passStorage";
import type { YardPass, Gender } from "@/libs/passTypes";

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

    if (!name || !email || !phone || !gender || !pngDataUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const anonId = await getOrCreateAnonId();
    
    // Get IP and user agent
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const title: YardPass["title"] = gender === "female" 
      ? "YARDEN'S ANGEL" 
      : "YARDEN'S DESCENDANT";
    
    const status: YardPass["status"] = gender === "female"
      ? "Angel Certified"
      : "Descendant Certified";

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

    const savedPass = savePass(pass);

    return NextResponse.json({ pass: savedPass });
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
    
    // Use query param or cookie
    const anonId = queryAnonId || await getAnonIdFromCookie();
    
    if (!anonId) {
      return NextResponse.json({ pass: null });
    }

    const pass = getPassByAnonId(anonId);
    return NextResponse.json({ pass });
  } catch (error) {
    console.error("Error fetching pass:", error);
    return NextResponse.json(
      { error: "Failed to fetch pass" },
      { status: 500 }
    );
  }
}
