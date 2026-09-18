import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canAccessCustomer } from "@/lib/authz";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { escapeHtml, notifyAdminOfRequest } from "@/lib/email";

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

  const customerName = quote.customer.user.name || "Customer";
  const customerEmail = quote.customer.user.email || "";
  await notifyAdminOfRequest({
    type: "quote_accepted",
    subject: "[Gadget Gets IT Done] Quote accepted",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
        <h2>Quote accepted</h2>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(quote.customer.user.phone || "—")}</p>
        <p><strong>Title:</strong> ${escapeHtml(quote.title || "Quoted service")}</p>
        <p><strong>Quote ID:</strong> ${escapeHtml(quote.id)}</p>
        <p><strong>Total:</strong> $${((quote.totalCents || 0) / 100).toFixed(2)}</p>
      </div>`,
    text: `Quote accepted\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${quote.customer.user.phone || "—"}\nTitle: ${quote.title || "Quoted service"}\nQuote ID: ${quote.id}\nTotal: $${((quote.totalCents || 0) / 100).toFixed(2)}`,
  });

  return NextResponse.json({ checkoutUrl: checkout.url });
}
