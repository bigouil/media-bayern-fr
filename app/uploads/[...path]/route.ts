import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { uploadsRoot } from "@/lib/uploads";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const relativePath = pathSegments?.join("/") ?? "";
  const absolutePath = path.resolve(uploadsRoot, relativePath);

  if (!absolutePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = mimeTypes[ext] ?? "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
