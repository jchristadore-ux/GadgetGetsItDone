import { NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { escapeHtml, notifyAdminOfRequest } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  message: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const rl = rateLimit(`contact:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = schema.parse(await req.json());
    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const message = body.message.trim().slice(0, 5000);

    try {
      await trackEvent({
        name: "contact_form_submit",
        meta: { name, email, message: message.slice(0, 2000) },
      });
    } catch (err) {
      console.error("[contact] trackEvent failed:", err);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    await notifyAdminOfRequest({
      type: "contact_form",
      subject: `[Gadget Gets IT Done] New contact message from ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
          <h2 style="color:#0B1F3A">New contact form message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;background:#F7F9FB;padding:12px;border-radius:8px">${safeMessage}</p>
        </div>`,
      text: `New contact form message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // Prefer succeeding the form even if the admin alert failed (logged inside helper).
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Could not send message" }, { status: 400 });
  }
}
