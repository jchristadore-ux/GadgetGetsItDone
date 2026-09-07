import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

const cols = [
  {
    title: "Services",
    links: [
      { href: "/services", label: "All Services" },
      { href: "/memberships", label: "Memberships" },
      { href: "/book", label: "Book a Visit" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/new-home-setup", label: "New Home Setup" },
      { href: "/tech-support-for-parents", label: "Tech for Parents" },
      { href: "/small-business", label: "Small Business" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cancellation", label: "Cancellation" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4">
            <Image
              src={brand.logoPath}
              alt={brand.name}
              width={1024}
              height={1024}
              className="h-28 w-auto object-contain rounded-lg bg-white p-2"
            />
          </div>
          <p className="text-sm text-slate-300">{brand.tagline}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold mb-3 text-brand-yellow">{col.title}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {brand.name}. Local tech setup, fix, connect & maintain — not a computer repair shop.
      </div>
    </footer>
  );
}
