import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBookCta } from "@/components/layout/mobile-book-cta";
import { brand } from "@/lib/brand";
import { getPublicContact } from "@/lib/business-settings";

export const dynamic = "force-dynamic";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: `${brand.name} | Local Tech Setup, Fix & Connect`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Got a tech problem? Call Gadget Gets IT Done. Local home and business tech setup, fix, connect, and maintain — your personal tech guy.",
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    images: [{ url: brand.logoPath, width: 512, height: 512, alt: brand.name }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: brand.name,
    description: brand.tagline,
    images: [brand.logoPath],
  },
  icons: {
    icon: brand.logoPath,
    apple: brand.logoPath,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contact = await getPublicContact();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: contact.businessName || brand.name,
    description: contact.tagline || brand.tagline,
    image: brand.logoPath,
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    priceRange: "$$",
    areaServed: contact.serviceArea || undefined,
    address: contact.formattedAddress
      ? {
          "@type": "PostalAddress",
          streetAddress: contact.address1 || undefined,
          addressLocality: contact.city || undefined,
          addressRegion: contact.state || undefined,
          postalCode: contact.zip || undefined,
        }
      : undefined,
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans pb-16 sm:pb-0`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header phone={contact.phone} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer contact={contact} />
        <MobileBookCta />
      </body>
    </html>
  );
}
