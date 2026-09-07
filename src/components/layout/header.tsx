"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/memberships", label: "Memberships" },
  { href: "/new-home-setup", label: "New Home" },
  { href: "/tech-support-for-parents", label: "For Parents" },
  { href: "/small-business", label: "Small Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <Image
            src={brand.logoPath}
            alt={brand.name}
            width={1024}
            height={1024}
            className="h-12 w-auto sm:h-14 object-contain"
            priority
          />
          <span className="sr-only">{brand.name}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-brand-slate">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-orange transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {brand.phone !== "REPLACE_ME" && (
            <a
              href={`tel:${brand.phone}`}
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand-navy"
            >
              <Phone className="h-4 w-4 text-brand-orange" />
              {brand.phone}
            </a>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/book">Book Now</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <button
            type="button"
            className="lg:hidden p-2 text-brand-navy"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block font-medium text-brand-navy"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/book" className="block font-semibold text-brand-orange" onClick={() => setOpen(false)}>
            Book Now
          </Link>
          <Link href="/login" className="block text-brand-slate" onClick={() => setOpen(false)}>
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
