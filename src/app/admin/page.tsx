import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  let stats = { bookings: 0, customers: 0, quotes: 0, payments: 0 };
  try {
    const [bookings, customers, quotes, payments] = await Promise.all([
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.quote.count(),
      prisma.payment.count(),
    ]);
    stats = { bookings, customers, quotes, payments };
  } catch {}

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k}>
            <CardHeader><CardTitle className="text-base capitalize">{k}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-brand-orange">{v}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
