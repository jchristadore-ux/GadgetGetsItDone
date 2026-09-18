import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyStripeSignature } from "@/lib/webhooks";
import { getStripe } from "@/lib/stripe";
import { escapeHtml, notifyAdminOfRequest } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  const verified = verifyStripeSignature({
    payload,
    signatureHeader: signature,
    secret,
  });

  // Prefer Stripe SDK verification when secret present; our helper is tested & used as defense-in-depth
  let event: { id: string; type: string; data: { object: any } };
  try {
    if (process.env.STRIPE_SECRET_KEY && secret) {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(payload, signature || "", secret) as any;
    } else if (verified.ok) {
      event = JSON.parse(payload);
    } else {
      return NextResponse.json({ error: verified.reason || "invalid_signature" }, { status: 400 });
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const existing = await prisma.processedWebhookEvent.findUnique({
    where: { provider_eventId: { provider: "stripe", eventId: event.id } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  await prisma.processedWebhookEvent.create({
    data: { provider: "stripe", eventId: event.id, eventType: event.type },
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paidCents: session.amount_total || 0,
          },
        });
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { customer: { include: { user: true } }, items: true },
        });
        if (booking) {
          await prisma.payment.create({
            data: {
              customerId: booking.customerId,
              bookingId,
              amountCents: session.amount_total || 0,
              status: "SUCCEEDED",
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent || undefined,
              description: "Checkout payment",
            },
          });
          const amount = ((session.amount_total || 0) / 100).toFixed(2);
          const serviceName = booking.items[0]?.name || "Booking";
          const customerName = booking.customer.user.name || "Customer";
          const customerEmail = booking.customer.user.email || session.customer_email || "";
          await notifyAdminOfRequest({
            type: "payment_received_booking",
            subject: "[Gadget Gets IT Done] Payment received",
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
                <h2>Payment received</h2>
                <p><strong>Type:</strong> Booking</p>
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
                <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
                <p><strong>Service:</strong> ${escapeHtml(serviceName)}</p>
                <p><strong>Booking ID:</strong> ${escapeHtml(bookingId)}</p>
              </div>`,
            text: `Payment received (booking)\nAmount: $${amount}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nService: ${serviceName}\nBooking ID: ${bookingId}`,
          });
        }
      }

      const planSlug = session.metadata?.planSlug;
      const customerId = session.metadata?.customerId;
      if (session.mode === "subscription" && planSlug && customerId) {
        const plan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
        if (plan) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: session.subscription || `pending-${session.id}` },
            create: {
              customerId,
              planId: plan.id,
              status: "ACTIVE",
              stripeSubscriptionId: session.subscription || `pending-${session.id}`,
              stripeCustomerId: session.customer || undefined,
            },
            update: { status: "ACTIVE" },
          });
          const amount = ((session.amount_total || 0) / 100).toFixed(2);
          await notifyAdminOfRequest({
            type: "payment_received_membership",
            subject: "[Gadget Gets IT Done] Payment received",
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
                <h2>Payment received</h2>
                <p><strong>Type:</strong> Membership</p>
                <p><strong>Plan:</strong> ${escapeHtml(plan.name)}</p>
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>Customer ID:</strong> ${escapeHtml(customerId)}</p>
              </div>`,
            text: `Payment received (membership)\nPlan: ${plan.name}\nAmount: $${amount}\nCustomer ID: ${customerId}`,
          });
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const statusMap: Record<string, any> = {
        active: "ACTIVE",
        trialing: "TRIALING",
        past_due: "PAST_DUE",
        canceled: "CANCELLED",
        unpaid: "UNPAID",
        incomplete: "INCOMPLETE",
      };
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: statusMap[sub.status] || "ACTIVE",
          cancelAtPeriodEnd: !!sub.cancel_at_period_end,
          cancelledAt: sub.status === "canceled" ? new Date() : undefined,
        },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
