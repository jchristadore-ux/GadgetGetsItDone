import { Resend } from "resend";
import { brand } from "./brand";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getResend();
  const from = process.env.EMAIL_FROM || `${brand.name} <onboarding@resend.dev>`;

  if (!resend) {
    console.info("[email:dev]", params.to, params.subject);
    return { id: "dev-noop", skipped: true as const };
  }

  const result = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (result.error) {
    console.error("[email] Resend error:", result.error);
    throw new Error(result.error.message || "Failed to send email");
  }

  return result;
}

export function magicLinkEmailHtml(url: string) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
    <h1 style="color:#0B1F3A">Sign in to ${brand.name}</h1>
    <p>Click the button below to sign in. This link expires shortly.</p>
    <p><a href="${url}" style="display:inline-block;background:#F15A29;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Sign in</a></p>
    <p style="color:#243447;font-size:14px">If you did not request this, you can ignore this email.</p>
  </div>`;
}
