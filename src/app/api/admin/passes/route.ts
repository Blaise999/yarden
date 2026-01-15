// app/api/admin/passes/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllPasses } from "@/libs/passStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("yard_admin_token")?.value;
  return Boolean(token && token.length > 10);
}

export async function GET() {
  try {
    // Check admin auth
    const authed = await isAdmin();
    
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized", passes: [] }, { status: 401 });
    }

    // Fetch all passes
    const passes = await getAllPasses();
    
    return NextResponse.json({ passes, count: passes.length });
  } catch (error) {
    console.error("GET /api/admin/passes error:", error);
    return NextResponse.json({ error: "Failed to fetch passes", passes: [] }, { status: 500 });
  }
}
