import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata = { title: "New Home Setup" };

export default function NewHomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">New Home Setup</h1>
      <p className="text-xl text-brand-orange font-semibold mb-4">{brand.messaging.newHome}</p>
      <p className="text-brand-slate mb-6 leading-relaxed">
        Moving in? We get Wi‑Fi, TVs, printers, smart locks, cameras, and streaming dialed in before the boxes are gone —
        so you start settled, not stuck troubleshooting.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-brand-slate mb-8">
        <li>Pre-move consult (optional)</li>
        <li>Day-of network and device setup</li>
        <li>Labeled remotes, networks, and passwords handoff</li>
      </ul>
      <Button asChild size="lg"><Link href="/book?intent=new-home">Book new home setup</Link></Button>
    </div>
  );
}
