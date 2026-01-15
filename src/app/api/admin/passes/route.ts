// app/api/admin/passes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllPasses } from "@/libs/passStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminFromRequest(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/yard_admin_session=([^;]+)/);
  return !!match && match[1].length > 0;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = isAdminFromRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { passes: [], error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const passes = await getAllPasses();
    
    // Sort by creation date, newest first
    const sortedPasses = passes.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ passes: sortedPasses });
  } catch (error) {
    console.error("Error fetching admin passes:", error);
    return NextResponse.json(
      { passes: [], error: "Failed to fetch passes" }, 
      { status: 500 }
    );
  }
}
