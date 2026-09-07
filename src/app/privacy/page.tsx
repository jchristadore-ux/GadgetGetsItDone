export const metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1 className="text-4xl font-bold text-brand-navy mb-4">Privacy Policy</h1>
      <p className="text-sm text-brand-orange font-medium">This page is a starter template and is not legal advice. Have an attorney review before publishing.</p>
      <p className="text-brand-slate leading-relaxed mt-6">We collect account, booking, and payment metadata needed to provide services. Payment card data is handled by Stripe. Do not invent data practices — update this policy with your counsel.</p>
      <p className="text-brand-slate mt-4">Business placeholders: phone REPLACE_ME · email REPLACE_ME · address REPLACE_ME.</p>
    </div>
  );
}
