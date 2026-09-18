import { Resend } from "resend";
import { brand } from "./brand";
import { getBusinessSettings, isPlaceholder } from "./business-settings";

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

const FALLBACK_ADMIN_EMAIL = "jchristadore@gmail.com";

/** Resolve who should receive operational admin alerts. */
export async function resolveAdminAlertEmail(): Promise<string> {
  const fromEnv = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (fromEnv && !isPlaceholder(fromEnv)) return fromEnv;

  try {
    const settings = await getBusinessSettings();
    if (settings.email && !isPlaceholder(settings.email)) {
      return settings.email.trim();
    }
  } catch (err) {
    console.error("[email] could not load business settings for admin alert:", err);
  }

  return FALLBACK_ADMIN_EMAIL;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Fire-and-forget style admin alert. Never throws — logs on failure so
 * customer-facing flows can still succeed.
 */
export async function notifyAdminOfRequest(params: {
  type: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  try {
    const to = await resolveAdminAlertEmail();
    await sendEmail({
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { ok: true };
  } catch (err) {
    console.error(`[email] admin alert failed (${params.type}):`, err);
    return { ok: false };
  }
}
