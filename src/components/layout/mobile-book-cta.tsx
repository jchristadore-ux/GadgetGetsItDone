"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBookCta() {
  const pathname = usePathname();
  if (pathname?.startsWith("/book") || pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-slate-200 bg-white p-3 safe-pb">
      <Link
        href="/book"
        className="flex h-12 w-full items-center justify-center rounded-md bg-brand-orange text-white font-semibold shadow-lg"
      >
        Book Now
      </Link>
    </div>
  );
}
