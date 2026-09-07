import { brand } from "./brand";

export function isSmsEnabled() {
  return process.env.SMS_ENABLED === "true";
}

export async function sendSms(params: { to: string; body: string }) {
  if (!isSmsEnabled()) {
    console.info("[sms:disabled]", params.to, params.body.slice(0, 80));
    return { skipped: true as const, reason: "SMS_ENABLED is not true" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn("[sms] Twilio credentials missing");
    return { skipped: true as const, reason: "missing_twilio_env" };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: params.to, From: from, Body: params.body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error: ${res.status} ${text}`);
  }

  return res.json();
}

export function bookingConfirmedSms(when: string) {
  return `${brand.name}: Your visit is confirmed for ${when}. Reply STOP to opt out.`;
}
