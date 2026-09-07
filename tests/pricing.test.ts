import { describe, expect, it } from "vitest";
import {
  assertServerPriced,
  computeCheckoutAmount,
  computeDeposit,
  sumLines,
} from "@/lib/pricing";

describe("pricing", () => {
  it("sums line items", () => {
    expect(
      sumLines([
        { name: "A", quantity: 2, unitPriceCents: 1000 },
        { name: "B", quantity: 1, unitPriceCents: 500 },
      ])
    ).toBe(2500);
  });

  it("rejects negative lines", () => {
    expect(() => sumLines([{ name: "x", quantity: -1, unitPriceCents: 100 }])).toThrow();
  });

  it("computes deposit percent", () => {
    expect(computeDeposit(10000, null, 25)).toBe(2500);
    expect(computeDeposit(10000, 3000)).toBe(3000);
  });

  it("pay now charges full amount", () => {
    const r = computeCheckoutAmount({
      lines: [{ name: "svc", quantity: 1, unitPriceCents: 14900 }],
      paymentMode: "PAY_NOW",
    });
    expect(r.amountDueNowCents).toBe(14900);
  });

  it("deposit mode charges deposit only", () => {
    const r = computeCheckoutAmount({
      lines: [{ name: "svc", quantity: 1, unitPriceCents: 20000 }],
      paymentMode: "DEPOSIT",
      depositCents: 5000,
    });
    expect(r.amountDueNowCents).toBe(5000);
    expect(r.totalCents).toBe(20000);
  });

  it("quote_required and pay_after charge zero now", () => {
    expect(
      computeCheckoutAmount({
        lines: [{ name: "svc", quantity: 1, unitPriceCents: 10000 }],
        paymentMode: "QUOTE_REQUIRED",
      }).amountDueNowCents
    ).toBe(0);
    expect(
      computeCheckoutAmount({
        lines: [{ name: "svc", quantity: 1, unitPriceCents: 10000 }],
        paymentMode: "PAY_AFTER",
      }).amountDueNowCents
    ).toBe(0);
  });

  it("rejects client-trusted price mismatch", () => {
    expect(() => assertServerPriced(100, 200)).toThrow(/mismatch/);
    expect(() => assertServerPriced(200, 200)).not.toThrow();
  });
});
