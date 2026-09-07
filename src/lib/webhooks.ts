import { createHmac, timingSafeEqual } from "crypto";

export function verifyStripeSignature(params: {
  payload: string | Buffer;
  signatureHeader: string | null | undefined;
  secret: string;
  toleranceSec?: number;
}): { ok: boolean; reason?: string } {
  const { payload, signatureHeader, secret, toleranceSec = 300 } = params;
  if (!signatureHeader) return { ok: false, reason: "missing_signature" };
  if (!secret) return { ok: false, reason: "missing_secret" };

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  if (!timestamp || !expectedSig) {
    return { ok: false, reason: "malformed_header" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };

  const age = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (age > toleranceSec) return { ok: false, reason: "timestamp_outside_tolerance" };

  const signed = `${timestamp}.${typeof payload === "string" ? payload : payload.toString("utf8")}`;
  const computed = createHmac("sha256", secret).update(signed, "utf8").digest("hex");

  try {
    const a = Buffer.from(computed, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature_mismatch" };
    }
  } catch {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}

export function alreadyProcessed(seen: Set<string>, eventId: string): boolean {
  if (seen.has(eventId)) return true;
  seen.add(eventId);
  return false;
}
