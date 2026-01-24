import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_CMS, type CmsData } from "../../../../../content/defaultCms";

export const runtime = "nodejs";

// Reference to the same cache as the main route (in production, use proper DB/KV)
declare global {
  // eslint-disable-next-line no-var
  var cmsCache: CmsData | null;
}

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("yard_admin_token");
    return !!token?.value;
  } catch {
    return false;
  }
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const next = { ...DEFAULT_CMS, updatedAt: Date.now() };
  global.cmsCache = next;
  return NextResponse.json({ ok: true, cms: next });
}
