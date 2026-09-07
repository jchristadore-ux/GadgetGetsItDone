import { ContactForm } from "@/components/contact-form";
import { getPublicContact } from "@/lib/business-settings";

export const metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contact = await getPublicContact();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Contact</h1>
      <p className="text-brand-slate mb-8">Questions before you book? Send a note — we will get back to you.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="text-brand-orange hover:underline">
                {contact.phone}
              </a>
            ) : (
              <span className="text-slate-400">Add phone in Admin → Settings</span>
            )}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="text-brand-orange hover:underline">
                {contact.email}
              </a>
            ) : (
              <span className="text-slate-400">Add email in Admin → Settings</span>
            )}
          </p>
          {contact.formattedAddress && (
            <p>
              <span className="font-semibold">Address:</span> {contact.formattedAddress}
            </p>
          )}
          <p>
            <span className="font-semibold">Area:</span>{" "}
            {contact.serviceArea || <span className="text-slate-400">Add service area in Admin → Settings</span>}
          </p>
          {contact.hours && (
            <div className="pt-2">
              <p className="font-semibold mb-1">Hours</p>
              <ul className="text-brand-slate space-y-0.5">
                {Object.entries(contact.hours).map(([day, hours]) => (
                  <li key={day} className="capitalize">
                    {day}: {hours}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
