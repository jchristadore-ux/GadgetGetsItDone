import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { alreadyProcessed, verifyStripeSignature } from "@/lib/webhooks";

function sign(payload: string, secret: string, ts: number) {
  const signed = `${ts}.${payload}`;
  const v1 = createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  return `t=${ts},v1=${v1}`;
}

describe("stripe webhook signature", () => {
  const secret = "whsec_test_secret";
  const payload = '{"id":"evt_1","type":"checkout.session.completed"}';

  it("accepts valid signature", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = sign(payload, secret, ts);
    expect(verifyStripeSignature({ payload, signatureHeader: header, secret })).toEqual({
      ok: true,
    });
  });

  it("rejects missing header", () => {
    expect(verifyStripeSignature({ payload, signatureHeader: null, secret }).ok).toBe(false);
  });

  it("rejects bad signature", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts},v1=deadbeef`;
    expect(verifyStripeSignature({ payload, signatureHeader: header, secret }).reason).toBe(
      "signature_mismatch"
    );
  });

  it("rejects old timestamps", () => {
    const ts = Math.floor(Date.now() / 1000) - 10_000;
    const header = sign(payload, secret, ts);
    expect(verifyStripeSignature({ payload, signatureHeader: header, secret }).reason).toBe(
      "timestamp_outside_tolerance"
    );
  });

  it("idempotency helper", () => {
    const seen = new Set<string>();
    expect(alreadyProcessed(seen, "evt_1")).toBe(false);
    expect(alreadyProcessed(seen, "evt_1")).toBe(true);
  });
});
