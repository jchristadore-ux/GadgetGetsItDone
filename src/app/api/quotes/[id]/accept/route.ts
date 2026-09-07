import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canAccessCustomer } from "@/lib/authz";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: { include: { user: true } }, items: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessCustomer(session.user, quote.customer.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (quote.status !== "PRICED" && quote.status !== "SENT") {
    return NextResponse.json({ error: "Quote not payable" }, { status: 400 });
  }
  if (quote.totalCents <= 0) {
    return NextResponse.json({ error: "Quote has no price" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: quote.customer.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: quote.totalCents,
          product_data: { name: quote.title || "Quoted service" },
        },
      },
    ],
    metadata: { quoteId: quote.id, type: "quote" },
    success_url: `${getAppUrl()}/dashboard?quote=paid`,
    cancel_url: `${getAppUrl()}/dashboard`,
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  return NextResponse.json({ checkoutUrl: checkout.url });
}
