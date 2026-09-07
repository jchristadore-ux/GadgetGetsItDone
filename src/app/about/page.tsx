import Image from "next/image";
import { brand } from "@/lib/brand";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Image src={brand.logoPath} alt={brand.name} width={96} height={96} className="rounded-full object-cover" />
        <h1 className="text-4xl font-bold">About {brand.name}</h1>
      </div>
      <div className="prose prose-slate max-w-none space-y-4 text-brand-slate">
        <p>
          We are your local tech guy for home and small business — setup, fix, connect, and maintain.
          We are not a computer repair shop, not Geek Squad, and not a managed service provider.
        </p>
        <p>{brand.tagline}</p>
        <p>Service area and hours: REPLACE_ME — update in admin business settings before launch.</p>
      </div>
    </div>
  );
}
