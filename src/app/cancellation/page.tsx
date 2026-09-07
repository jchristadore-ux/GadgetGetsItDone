import { getPublicContact } from "@/lib/business-settings";

export const metadata = { title: "Cancellation Policy" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const contact = await getPublicContact();
  const policy =
    contact.cancellationPolicy ||
    "Cancel or reschedule at least 24 hours before your visit when possible. Late cancellations may forfeit deposits. Membership terms may differ.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1 className="text-4xl font-bold text-brand-navy mb-4">Cancellation Policy</h1>
      <p className="text-sm text-brand-orange font-medium">
        This page is a starter template and is not legal advice. Have an attorney review before publishing.
      </p>
      <p className="text-brand-slate leading-relaxed mt-6 whitespace-pre-wrap">{policy}</p>
      <p className="text-brand-slate mt-4">
        {[
          contact.phone && `phone ${contact.phone}`,
          contact.email && `email ${contact.email}`,
          contact.formattedAddress && `address ${contact.formattedAddress}`,
        ]
          .filter(Boolean)
          .join(" · ") || "Add phone, email, and address in Admin → Settings."}
      </p>
    </div>
  );
}
