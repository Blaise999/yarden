// app/api/health/route.ts
// Health check endpoint to verify configuration

import { NextResponse } from "next/server";
import { isStorageConfigured } from "@/libs/passStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasKV = isStorageConfigured();
  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD);
  
  return NextResponse.json({
    status: hasKV && hasAdminPassword ? "healthy" : "degraded",
    checks: {
      storage: {
        configured: hasKV,
        message: hasKV 
          ? "Vercel KV connected" 
          : "⚠️ KV not configured - passes won't persist",
      },
      admin: {
        configured: hasAdminPassword,
        message: hasAdminPassword 
          ? "Admin password set" 
          : "⚠️ ADMIN_PASSWORD not set",
      },
    },
    timestamp: new Date().toISOString(),
  });
}
