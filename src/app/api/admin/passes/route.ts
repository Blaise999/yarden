import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/libs/cookieUtils";
import { getAllPasses } from "@/libs/passStorage";

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const passes = getAllPasses();
    return NextResponse.json({ passes });
  } catch (error) {
    console.error("Error fetching admin passes:", error);
    return NextResponse.json(
      { error: "Failed to fetch passes" },
      { status: 500 }
    );
  }
}
