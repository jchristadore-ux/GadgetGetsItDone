import { getPublicContact } from "@/lib/business-settings";

export const metadata = { title: "Terms of Service" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const contact = await getPublicContact();
  const nap = [
    contact.phone && `phone ${contact.phone}`,
    contact.email && `email ${contact.email}`,
    contact.formattedAddress && `address ${contact.formattedAddress}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1 className="text-4xl font-bold text-brand-navy mb-4">Terms of Service</h1>
      <p className="text-sm text-brand-orange font-medium">
        This page is a starter template and is not legal advice. Have an attorney review before publishing.
      </p>
      <p className="text-brand-slate leading-relaxed mt-6">
        By booking, you agree to provide accurate access information and a safe work environment. Service
        descriptions and prices come from our catalog at time of booking. Update with counsel before launch.
      </p>
      <p className="text-brand-slate mt-4">
        {nap || "Add phone, email, and address in Admin → Settings."}
      </p>
    </div>
  );
}
