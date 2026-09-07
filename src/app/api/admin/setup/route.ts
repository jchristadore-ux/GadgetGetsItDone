import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const rl = rateLimit(`admin-setup:${ip}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_BOOTSTRAP_TOKEN not configured" }, { status: 503 });
  }

  const existingAdmins = await prisma.admin.count();
  if (existingAdmins > 0) {
    return NextResponse.json({ error: "Admin already bootstrapped" }, { status: 403 });
  }

  const body = schema.parse(await req.json());
  if (body.token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { email: body.email.toLowerCase() },
    create: { email: body.email.toLowerCase(), role: "SUPER_ADMIN" },
    update: { role: "SUPER_ADMIN" },
  });

  await prisma.admin.create({
    data: { userId: user.id, title: "Owner", bootstrapAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "admin.bootstrap",
      entityType: "Admin",
      entityId: user.id,
    },
  });

  return NextResponse.json({ message: "Admin created. Sign in with magic link." });
}
