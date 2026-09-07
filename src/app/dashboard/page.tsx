import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { formatCents } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (isAdmin(session.user)) redirect("/admin");

  let bookings: any[] = [];
  let quotes: any[] = [];
  let subscriptions: any[] = [];
  try {
    const customer = await prisma.customer.findUnique({ where: { userId: session.user.id } });
    if (customer) {
      bookings = await prisma.booking.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      quotes = await prisma.quote.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      subscriptions = await prisma.subscription.findMany({
        where: { customerId: customer.id },
        include: { plan: true },
      });
    }
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your dashboard</h1>
          <p className="text-brand-slate">{session.user.email}</p>
        </div>
        <Button asChild><Link href="/book">New booking</Link></Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {bookings.length === 0 && <p className="text-brand-slate">No bookings yet.</p>}
            {bookings.map((b) => (
              <div key={b.id} className="border-b pb-2">
                <div className="font-medium">{b.status}</div>
                <div>{formatCents(b.totalCents)} · {b.scheduledStart ? new Date(b.scheduledStart).toLocaleString() : "Unscheduled"}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quotes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {quotes.length === 0 && <p className="text-brand-slate">No quotes yet.</p>}
            {quotes.map((q) => (
              <div key={q.id} className="border-b pb-2">
                <div className="font-medium">{q.status}</div>
                <div>{q.title || "Quote"} · {formatCents(q.totalCents)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Memberships</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {subscriptions.length === 0 && (
              <p className="text-brand-slate">No membership. <Link className="text-brand-orange" href="/memberships">Browse plans</Link></p>
            )}
            {subscriptions.map((s) => (
              <div key={s.id} className="border-b pb-2">
                <div className="font-medium">{s.plan?.name}</div>
                <div>{s.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
