import type { PaymentMode } from "@prisma/client";

export type PriceLine = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type PriceSummary = {
  subtotalCents: number;
  depositCents: number;
  totalCents: number;
  amountDueNowCents: number;
  paymentMode: PaymentMode;
};

export function sumLines(lines: PriceLine[]): number {
  return lines.reduce((sum, line) => {
    if (line.quantity < 0 || line.unitPriceCents < 0) {
      throw new Error("Invalid line: negative quantity or price");
    }
    return sum + line.quantity * line.unitPriceCents;
  }, 0);
}

export function computeDeposit(
  totalCents: number,
  depositCents: number | null | undefined,
  depositPercent = 25
): number {
  if (depositCents != null && depositCents >= 0) {
    return Math.min(depositCents, totalCents);
  }
  return Math.round((totalCents * depositPercent) / 100);
}

export function computeCheckoutAmount(params: {
  lines: PriceLine[];
  paymentMode: PaymentMode;
  depositCents?: number | null;
  depositPercent?: number;
}): PriceSummary {
  const subtotalCents = sumLines(params.lines);
  const totalCents = subtotalCents;
  const deposit = computeDeposit(
    totalCents,
    params.depositCents,
    params.depositPercent ?? 25
  );

  let amountDueNowCents = 0;
  switch (params.paymentMode) {
    case "PAY_NOW":
      amountDueNowCents = totalCents;
      break;
    case "DEPOSIT":
      amountDueNowCents = deposit;
      break;
    case "QUOTE_REQUIRED":
    case "PAY_AFTER":
      amountDueNowCents = 0;
      break;
    default:
      amountDueNowCents = totalCents;
  }

  return {
    subtotalCents,
    depositCents: deposit,
    totalCents,
    amountDueNowCents,
    paymentMode: params.paymentMode,
  };
}

export function assertServerPriced(
  clientTotal: number | undefined,
  serverTotal: number
): void {
  if (clientTotal != null && clientTotal !== serverTotal) {
    throw new Error("Price mismatch: client totals are not trusted");
  }
}
