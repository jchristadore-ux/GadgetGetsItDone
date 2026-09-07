import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const rl = rateLimit(`membership:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const url = new URL(req.url);
  const planSlug = url.searchParams.get("plan");
  if (!planSlug) return NextResponse.redirect(new URL("/memberships", getAppUrl()));

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=/memberships`, getAppUrl()));
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    // Fallback catalog prices (server-side) if not seeded
    const fallback: Record<string, { name: string; cents: number }> = {
      "home-care": { name: "Home Care", cents: 4900 },
      "family-plus": { name: "Family Plus", cents: 8900 },
      "business-essentials": { name: "Business Essentials", cents: 14900 },
    };
    const f = fallback[planSlug];
    if (!f) return NextResponse.redirect(new URL("/memberships", getAppUrl()));
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.redirect(new URL("/memberships?error=stripe", getAppUrl()));
    }
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: f.cents,
            product_data: { name: f.name },
          },
        },
      ],
      metadata: { planSlug, type: "membership" },
      success_url: `${getAppUrl()}/dashboard?member=1`,
      cancel_url: `${getAppUrl()}/memberships`,
    });
    return NextResponse.redirect(checkout.url!);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/memberships?error=stripe", getAppUrl()));
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const customer = user
    ? await prisma.customer.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      })
    : null;

  const stripe = getStripe();
  const lineItem = plan.stripePriceId
    ? { price: plan.stripePriceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval: (plan.interval as "month" | "year") || "month" },
          unit_amount: plan.priceCents,
          product_data: { name: plan.name },
        },
      };

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [lineItem as any],
    metadata: {
      planSlug: plan.slug,
      customerId: customer?.id || "",
      type: "membership",
    },
    success_url: `${getAppUrl()}/dashboard?member=1`,
    cancel_url: `${getAppUrl()}/memberships`,
  });

  return NextResponse.redirect(checkout.url!);
}
