import { put, del } from "@vercel/blob";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export function validateUpload(file: { type: string; size: number }) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("File type not allowed");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("File size must be between 1 byte and 5MB");
  }
}

export async function uploadValidatedFile(
  file: File,
  pathnamePrefix = "uploads"
) {
  validateUpload({ type: file.type, size: file.size });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const pathname = `${pathnamePrefix}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return blob;
}

export async function deleteBlob(url: string) {
  await del(url);
}
