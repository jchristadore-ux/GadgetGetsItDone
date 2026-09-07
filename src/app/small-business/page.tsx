import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata = { title: "Small Business" };

export default function SmallBusinessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Small Business Tech</h1>
      <p className="text-xl text-brand-orange font-semibold mb-4">{brand.messaging.smallBiz}</p>
      <p className="text-brand-slate mb-6 leading-relaxed">
        Wi‑Fi that holds up at lunch rush, printers that print, POS adjacent devices, cameras, and guest networks —
        without an enterprise MSP contract.
      </p>
      <Button asChild size="lg"><Link href="/book?intent=business">Book a business visit</Link></Button>
    </div>
  );
}
