import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/authz";
import {
  getBusinessSettings,
  upsertBusinessSettings,
} from "@/lib/business-settings";
import { prisma } from "@/lib/db";

const schema = z.object({
  businessName: z.string().min(1).max(200),
  tagline: z.string().max(500).default(""),
  phone: z.string().max(50).default(""),
  email: z.string().max(200).default(""),
  address1: z.string().max(200).default(""),
  city: z.string().max(100).default(""),
  state: z.string().max(50).default(""),
  zip: z.string().max(20).default(""),
  serviceArea: z.string().max(2000).default(""),
  timezone: z.string().max(100).default("America/New_York"),
  hoursJson: z.string().max(5000).default(""),
  cancellationPolicy: z.string().max(10000).default(""),
  depositPercent: z.coerce.number().int().min(0).max(100).default(25),
  bookingBufferMinutes: z.coerce.number().int().min(0).max(1440).default(30),
  smsEnabled: z.boolean().default(false),
  googleCalendarId: z.string().max(200).default(""),
});

export async function GET() {
  try {
    const session = await auth();
    requireAdmin(session?.user);
    const settings = await getBusinessSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const user = requireAdmin(session?.user);

    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.hoursJson.trim()) {
      try {
        JSON.parse(parsed.data.hoursJson);
      } catch {
        return NextResponse.json(
          { error: "Hours must be valid JSON (e.g. {\"mon\":\"9-17\",\"sun\":\"closed\"})" },
          { status: 400 }
        );
      }
    }

    const settings = await upsertBusinessSettings(parsed.data);

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "business_settings.update",
        entityType: "BusinessSettings",
        entityId: settings.id,
      },
    });

    return NextResponse.json({ settings, message: "Settings saved" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("settings PUT", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
