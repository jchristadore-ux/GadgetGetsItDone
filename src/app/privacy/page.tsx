import { getPublicContact } from "@/lib/business-settings";

export const metadata = { title: "Privacy Policy" };
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
      <h1 className="text-4xl font-bold text-brand-navy mb-4">Privacy Policy</h1>
      <p className="text-sm text-brand-orange font-medium">
        This page is a starter template and is not legal advice. Have an attorney review before publishing.
      </p>
      <p className="text-brand-slate leading-relaxed mt-6">
        We collect account, booking, and payment metadata needed to provide services. Payment card data is
        handled by Stripe. Do not invent data practices — update this policy with your counsel.
      </p>
      <p className="text-brand-slate mt-4">
        {nap || "Add phone, email, and address in Admin → Settings."}
      </p>
    </div>
  );
}
