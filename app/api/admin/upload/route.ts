// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(): boolean {
  const token = cookies().get("yard_admin_token")?.value;
  return !!token;
}

function generateFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `upload_${timestamp}_${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // ⚠️ Note: Vercel may have request body limits. If you still see failures above ~4–5MB,
    // switch to direct client upload with signed URLs.
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    const filename = generateFilename(file.name);

    // Upload to Vercel Blob (public)
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,        // ✅ public URL
      pathname: blob.pathname,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
