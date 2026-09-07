export const metadata = { title: "FAQ" };

const faqs = [
  ["Are you Geek Squad or a repair shop?", "No. We are a local tech setup, fix, connect, and maintain service for homes and small businesses."],
  ["How does booking work?", "Pick a service, answer a few questions, choose a time, and pay or request a quote based on the service payment mode."],
  ["What is a deposit?", "Some visits require a deposit to reserve the slot. The balance is due after the work per your booking."],
  ["Can I cancel?", "See our Cancellation page for timing and fees. Member visits follow membership terms."],
  ["Do you text?", "SMS is optional and only sent when SMS_ENABLED is configured with Twilio."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">FAQ</h1>
      <div className="space-y-4">
        {faqs.map(([q, a]) => (
          <details key={q} className="rounded-xl border bg-white p-5">
            <summary className="font-semibold cursor-pointer">{q}</summary>
            <p className="mt-2 text-sm text-brand-slate">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
