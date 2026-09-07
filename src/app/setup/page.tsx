import { AdminSetupForm } from "@/components/admin/setup-form";

export const metadata = { title: "Admin Setup" };

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Admin bootstrap</h1>
      <p className="text-brand-slate mb-6 text-sm">
        One-time setup using ADMIN_BOOTSTRAP_TOKEN. After the first admin exists, further use is blocked.
      </p>
      <AdminSetupForm />
    </div>
  );
}
