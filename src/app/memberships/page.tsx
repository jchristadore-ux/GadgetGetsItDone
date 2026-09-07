import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { brand } from "@/lib/brand";

export const metadata = { title: "Memberships" };

const plans = [
  {
    name: "Home Care",
    slug: "home-care",
    price: "$49/mo",
    features: ["Priority scheduling", "Remote check-ins", "Member-only rates", "1 household"],
  },
  {
    name: "Family Plus",
    slug: "family-plus",
    price: "$89/mo",
    features: ["Everything in Home Care", "Supported household for parents", "Quarterly on-site visit credit"],
  },
  {
    name: "Business Essentials",
    slug: "business-essentials",
    price: "$149/mo",
    features: ["On-call tech guy", "Priority same-week visits", "Network & printer support", "Invoice-friendly billing"],
  },
];

export default function MembershipsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Memberships</h1>
      <p className="text-brand-slate mb-10 max-w-2xl">{brand.messaging.smartHome}</p>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.slug} className="flex flex-col">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <p className="text-3xl font-bold text-brand-orange">{p.price}</p>
              <CardDescription>Billed via Stripe. Cancel anytime per plan terms.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="text-sm space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-brand-orange">●</span>{f}</li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href={`/api/checkout/membership?plan=${p.slug}`}>Subscribe</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
