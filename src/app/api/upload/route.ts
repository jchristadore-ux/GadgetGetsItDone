import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadValidatedFile } from "@/lib/blob";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || session.user.id;
  const rl = rateLimit(`upload:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Uploads not configured" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  try {
    const blob = await uploadValidatedFile(file);
    const record = await prisma.uploadedFile.create({
      data: {
        userId: session.user.id,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        purpose: String(form.get("purpose") || "general"),
      },
    });
    return NextResponse.json({ id: record.id, url: record.blobUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upload_failed" },
      { status: 400 }
    );
  }
}
