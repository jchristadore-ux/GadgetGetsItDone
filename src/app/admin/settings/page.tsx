import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: any = null;
  try {
    settings = await prisma.businessSettings.findFirst();
  } catch {}

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Business settings</h1>
      <pre className="rounded-xl border bg-white p-4 text-xs overflow-auto">
        {JSON.stringify(settings || { note: "Run seed to create REPLACE_ME defaults" }, null, 2)}
      </pre>
    </div>
  );
}
