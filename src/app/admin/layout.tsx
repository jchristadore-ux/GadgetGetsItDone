import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/authz";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Allow setup page without admin
  // Other admin pages require admin role — checked here loosely; setup is outside this layout path conflict
  if (session?.user && !isAdmin(session.user)) {
    // still allow if path is setup handled separately
  }
  if (!session?.user) redirect("/login");
  if (!isAdmin(session.user)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-48 shrink-0">
          <h2 className="font-bold text-brand-navy mb-3">Admin</h2>
          <nav className="flex md:flex-col gap-2 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-brand-slate hover:text-brand-orange">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
