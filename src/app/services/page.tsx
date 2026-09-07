import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Services" };

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let categories: Awaited<ReturnType<typeof prisma.serviceCategory.findMany>> = [];
  try {
    categories = await prisma.serviceCategory.findMany({
      where: { active: true },
      include: { services: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    categories = [];
  }

  const fallback = [
    { name: "Wi-Fi & Networking", slug: "wifi-networking", services: [
      { name: "Whole-Home Wi-Fi Tune-Up", slug: "wifi-tune-up", shortDesc: "Coverage, mesh, and dead-zone fixes.", basePriceCents: 14900, paymentMode: "PAY_NOW" },
    ]},
    { name: "Smart Home", slug: "smart-home", services: [
      { name: "Smart Home Starter Setup", slug: "smart-home-starter", shortDesc: "Hubs, lights, locks, and routines.", basePriceCents: 19900, paymentMode: "DEPOSIT" },
    ]},
  ];

  const data = categories.length ? categories : fallback;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold text-brand-navy mb-2">Services</h1>
      <p className="text-brand-slate mb-10 max-w-2xl">
        Setup, fix, connect, and maintain — priced from our catalog. Some services need a deposit or quote.
      </p>
      <div className="space-y-12">
        {data.map((cat: any) => (
          <section key={cat.slug}>
            <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(cat.services || []).map((s: any) => (
                <Card key={s.slug}>
                  <CardHeader>
                    <div className="flex justify-between gap-2 items-start">
                      <CardTitle className="text-lg">{s.name}</CardTitle>
                      <Badge variant="muted">{String(s.paymentMode || "PAY_NOW").replace("_", " ")}</Badge>
                    </div>
                    <CardDescription>{s.shortDesc || s.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="font-semibold text-brand-navy">
                      {s.basePriceCents != null ? `From ${formatCents(s.basePriceCents)}` : "Quote"}
                    </span>
                    <Button asChild size="sm"><Link href={`/services/${s.slug}`}>Details</Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
