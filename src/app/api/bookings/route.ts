import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeCheckoutAmount } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";

const schema = z.object({
  serviceSlug: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const rl = rateLimit(`book:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = schema.parse(await req.json());

    let service = await prisma.service.findUnique({ where: { slug: body.serviceSlug } });
    if (!service) {
      // Allow booking flow before seed with safe defaults (server-priced)
      const defaults: Record<string, { name: string; base: number; mode: "PAY_NOW" | "DEPOSIT" | "QUOTE_REQUIRED" | "PAY_AFTER"; deposit?: number }> = {
        "wifi-tune-up": { name: "Whole-Home Wi-Fi Tune-Up", base: 14900, mode: "PAY_NOW" },
        "smart-home-starter": { name: "Smart Home Starter Setup", base: 19900, mode: "DEPOSIT", deposit: 5000 },
        "tv-streaming-setup": { name: "TV & Streaming Setup", base: 12900, mode: "PAY_NOW" },
        "custom-project": { name: "Custom Project", base: 0, mode: "QUOTE_REQUIRED" },
      };
      const d = defaults[body.serviceSlug];
      if (!d) return NextResponse.json({ error: "Unknown service" }, { status: 404 });

      // Create minimal category+service if DB available
      try {
        const cat = await prisma.serviceCategory.upsert({
          where: { slug: "general" },
          create: { name: "General", slug: "general" },
          update: {},
        });
        service = await prisma.service.create({
          data: {
            categoryId: cat.id,
            name: d.name,
            slug: body.serviceSlug,
            basePriceCents: d.base,
            depositCents: d.deposit,
            paymentMode: d.mode,
          },
        });
      } catch {
        return NextResponse.json({
          message: "Booking received (DB unavailable in this environment). Configure DATABASE_URL and seed.",
        });
      }
    }

    const user = await prisma.user.upsert({
      where: { email: body.email.toLowerCase() },
      create: { email: body.email.toLowerCase(), name: body.name, phone: body.phone },
      update: { name: body.name, phone: body.phone },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        address1: body.address1,
        city: body.city,
        state: body.state,
        zip: body.zip,
      },
      update: {
        address1: body.address1,
        city: body.city,
        state: body.state,
        zip: body.zip,
      },
    });

    if (service.paymentMode === "QUOTE_REQUIRED") {
      const quote = await prisma.quote.create({
        data: {
          customerId: customer.id,
          status: "REQUESTED",
          title: service.name,
          description: body.notes,
          items: {
            create: [{ serviceId: service.id, name: service.name, quantity: 1 }],
          },
        },
      });
      await trackEvent({ name: "quote_requested", userId: user.id, meta: { quoteId: quote.id } });
      return NextResponse.json({ message: "Quote requested. We will send pricing soon.", quoteId: quote.id });
    }

    const priced = computeCheckoutAmount({
      lines: [
        {
          name: service.name,
          quantity: 1,
          unitPriceCents: service.basePriceCents || 0,
        },
      ],
      paymentMode: service.paymentMode,
      depositCents: service.depositCents,
    });

    let scheduledStart: Date | undefined;
    if (body.date) {
      scheduledStart = new Date(`${body.date}T${body.time || "10:00"}:00`);
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        status: priced.amountDueNowCents > 0 ? "PENDING" : "CONFIRMED",
        scheduledStart,
        address1: body.address1,
        city: body.city,
        state: body.state,
        zip: body.zip,
        notes: body.notes,
        subtotalCents: priced.subtotalCents,
        depositCents: priced.depositCents,
        totalCents: priced.totalCents,
        paymentMode: service.paymentMode,
        items: {
          create: [
            {
              serviceId: service.id,
              name: service.name,
              quantity: 1,
              unitPriceCents: service.basePriceCents || 0,
              totalCents: service.basePriceCents || 0,
            },
          ],
        },
      },
    });

    await trackEvent({ name: "booking_created", userId: user.id, meta: { bookingId: booking.id } });

    if (priced.amountDueNowCents > 0 && process.env.STRIPE_SECRET_KEY) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: body.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: priced.amountDueNowCents,
              product_data: {
                name:
                  service.paymentMode === "DEPOSIT"
                    ? `Deposit — ${service.name}`
                    : service.name,
              },
            },
          },
        ],
        metadata: { bookingId: booking.id, type: "booking" },
        success_url: `${getAppUrl()}/dashboard?paid=1`,
        cancel_url: `${getAppUrl()}/book?cancelled=1`,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ bookingId: booking.id, checkoutUrl: session.url });
    }

    return NextResponse.json({
      bookingId: booking.id,
      message:
        priced.amountDueNowCents > 0
          ? "Booking created. Configure STRIPE_SECRET_KEY to enable checkout."
          : "Booking confirmed (pay after / no upfront).",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create booking" }, { status: 400 });
  }
}
