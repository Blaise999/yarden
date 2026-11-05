// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOriginRequest } from "../../../../libs/adminAuth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function generateFilename(originalName: string): string {
  const ext = ["jpg", "png", "webp", "gif"].includes(originalName) ? originalName : "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `upload_${timestamp}_${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request) || !(await isAdmin())) {
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
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 4MB" }, { status: 400 });
    }

    // Browser-supplied MIME type is not sufficient; inspect file signature too.
    const magic = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const jpeg = magic[0] === 0xff && magic[1] === 0xd8 && magic[2] === 0xff;
    const png = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4e && magic[3] === 0x47;
    const webp = String.fromCharCode(...magic.slice(0, 4)) === "RIFF" && String.fromCharCode(...magic.slice(8, 12)) === "WEBP";
    const gif = String.fromCharCode(...magic.slice(0, 4)) === "GIF8";
    const valid = (file.type === "image/jpeg" && jpeg) || (file.type === "image/png" && png) || (file.type === "image/webp" && webp) || (file.type === "image/gif" && gif);
    if (!valid) return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    const filename = generateFilename({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type] || "jpg");

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
