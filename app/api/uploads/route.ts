import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { uploadsRoot } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    await fs.mkdir(uploadsRoot, { recursive: true });
    await fs.writeFile(path.join(uploadsRoot, filename), buffer);

    return NextResponse.json({
      success: true,
      path: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du téléversement",
      },
      { status: 500 }
    );
  }
}
