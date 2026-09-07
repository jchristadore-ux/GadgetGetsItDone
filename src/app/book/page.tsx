import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/wizard";

export const metadata = { title: "Book" };

export default function BookPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Book a visit</h1>
      <p className="text-brand-slate mb-8">Multi-step booking. Prices are calculated on the server — never trust client totals.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <BookingWizard />
      </Suspense>
    </div>
  );
}
