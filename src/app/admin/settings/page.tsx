import { getBusinessSettings } from "@/lib/business-settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings = null;
  let loadError: string | null = null;
  try {
    settings = await getBusinessSettings();
  } catch {
    loadError = "Could not load business settings from the database.";
  }

  const initial = settings
    ? {
        id: settings.id,
        businessName: settings.businessName,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address1: settings.address1,
        city: settings.city,
        state: settings.state,
        zip: settings.zip,
        serviceArea: settings.serviceArea || "",
        timezone: settings.timezone,
        hoursJson: settings.hoursJson || "",
        cancellationPolicy: settings.cancellationPolicy || "",
        depositPercent: settings.depositPercent,
        bookingBufferMinutes: settings.bookingBufferMinutes,
        smsEnabled: settings.smsEnabled,
        googleCalendarId: settings.googleCalendarId || "",
      }
    : {
        businessName: "Gadget Gets IT Done",
        tagline: "Got a tech problem? Call Gadget Gets IT Done.",
        phone: "REPLACE_ME",
        email: "REPLACE_ME@example.com",
        address1: "REPLACE_ME",
        city: "REPLACE_ME",
        state: "REPLACE_ME",
        zip: "REPLACE_ME",
        serviceArea: "",
        timezone: "America/New_York",
        hoursJson: "",
        cancellationPolicy: "",
        depositPercent: 25,
        bookingBufferMinutes: 30,
        smsEnabled: false,
        googleCalendarId: "",
      };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Business settings</h1>
      <p className="text-brand-slate text-sm mb-6">
        Edit contact info, hours, and policies. Saved values are the source of truth for the public site
        (header, footer, contact).
      </p>
      {loadError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError} You can still edit and save to create the default row.
        </p>
      )}
      <SettingsForm initial={initial} />
    </div>
  );
}
