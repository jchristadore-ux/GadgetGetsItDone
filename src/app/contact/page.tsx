import { brand } from "@/lib/brand";
import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Contact</h1>
      <p className="text-brand-slate mb-8">Questions before you book? Send a note — we will get back to you.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Phone:</span> {brand.phone}</p>
          <p><span className="font-semibold">Email:</span> {brand.email}</p>
          <p><span className="font-semibold">Area:</span> REPLACE_ME</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
