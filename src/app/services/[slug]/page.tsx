import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const s = await prisma.service.findUnique({ where: { slug } });
    if (s) return { title: s.name, description: s.shortDesc || undefined };
  } catch {}
  return { title: "Service" };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let service: any = null;
  try {
    service = await prisma.service.findUnique({
      where: { slug },
      include: { category: true, options: { where: { active: true } }, questions: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {}

  if (!service) {
    // Fallback catalog for build / pre-seed
    const fallbacks: Record<string, any> = {
      "wifi-tune-up": {
        name: "Whole-Home Wi-Fi Tune-Up",
        shortDesc: "Coverage, mesh, and dead-zone fixes.",
        description: "We assess your coverage, optimize channels, and set up or tune mesh systems so every room works.",
        basePriceCents: 14900,
        paymentMode: "PAY_NOW",
        category: { name: "Wi-Fi & Networking" },
        options: [],
      },
      "smart-home-starter": {
        name: "Smart Home Starter Setup",
        shortDesc: "Hubs, lights, locks, and routines.",
        description: "We install and connect your smart home devices, name them clearly, and leave you with simple routines.",
        basePriceCents: 19900,
        paymentMode: "DEPOSIT",
        depositCents: 5000,
        category: { name: "Smart Home" },
        options: [],
      },
    };
    service = fallbacks[slug];
  }

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-brand-orange font-semibold mb-2">{service.category?.name}</p>
      <h1 className="text-4xl font-bold mb-3">{service.name}</h1>
      <Badge className="mb-4">{String(service.paymentMode).replaceAll("_", " ")}</Badge>
      <p className="text-lg text-brand-slate mb-6">{service.description || service.shortDesc}</p>
      <p className="text-2xl font-bold text-brand-navy mb-8">
        {service.basePriceCents != null ? `From ${formatCents(service.basePriceCents)}` : "Custom quote"}
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg"><Link href={`/book?service=${slug}`}>Book this service</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/services">All services</Link></Button>
      </div>
    </div>
  );
}
