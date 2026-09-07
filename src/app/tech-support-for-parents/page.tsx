import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata = { title: "Tech Support for Parents" };

export default function ParentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Tech Support for Parents</h1>
      <p className="text-xl text-brand-orange font-semibold mb-4">{brand.messaging.parents}</p>
      <p className="text-brand-slate mb-6 leading-relaxed">
        You can purchase support for their household while keeping accounts isolated. We show up patient,
        explain clearly, and leave things labeled so the next call is easier — or unnecessary.
      </p>
      <Button asChild size="lg"><Link href="/book?intent=parents">Book parent support</Link></Button>
    </div>
  );
}
