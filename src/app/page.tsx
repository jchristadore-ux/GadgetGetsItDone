import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, Users, Building2, Wrench, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { brand } from "@/lib/brand";

const categories = [
  { title: "Wi‑Fi & Networking", desc: "Mesh, coverage, guest networks, and rock-solid connections.", icon: Smartphone },
  { title: "Smart Home", desc: "Hubs, cameras, locks, speakers — set up the right way.", icon: Home },
  { title: "TV & Streaming", desc: "Mounts, surround, apps, and remotes that make sense.", icon: Wrench },
  { title: "Computers & Printers", desc: "Setup, sync, backups — not a repair shop visit.", icon: Shield },
];

const memberships = [
  { name: "Home Care", price: "$49/mo", blurb: "Priority scheduling and remote check-ins for your household." },
  { name: "Family Plus", price: "$89/mo", blurb: "Cover parents or a second home with supported households." },
  { name: "Business Essentials", price: "$149/mo", blurb: "Your on-call tech guy for the shop, office, or studio." },
];

const faqs = [
  {
    q: "Are you a computer repair shop?",
    a: "No. We set up, connect, fix, and maintain the tech in your home or business so it just works — more personal tech guy than Geek Squad.",
  },
  {
    q: "Do you work with memberships?",
    a: "Yes. Memberships give you priority scheduling and ongoing support. One-time visits are always available too.",
  },
  {
    q: "Can I book tech help for my parents?",
    a: "Absolutely. You can purchase support for their household while keeping accounts and privacy isolated.",
  },
  {
    q: "What areas do you serve?",
    a: "Service area details are listed on Contact. Placeholder: REPLACE_ME — update in business settings.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-orange font-semibold mb-3 tracking-wide uppercase text-sm">
              Local tech that just works
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Got a tech problem?
              <span className="block text-brand-orange">Call Gadget Gets IT Done.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              {brand.messaging.smartHome} Setup, fix, connect, and maintain — for home and small business.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/book">Book a Visit <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-navy">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-2xl bg-white p-3 md:p-4 shadow-2xl ring-2 ring-brand-orange/50">
              <Image
                src={brand.logoPath}
                alt={brand.name}
                width={1024}
                height={1024}
                className="h-auto w-56 sm:w-64 md:w-72 object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-brand-navy mb-2">What we handle</h2>
        <p className="text-brand-slate mb-8">Configurable services from our catalog — not a one-size repair counter.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Card key={c.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <c.icon className="h-8 w-8 text-brand-orange mb-2" />
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/services" className="font-semibold text-brand-orange inline-flex items-center gap-1">
            See all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold mb-2">Memberships</h2>
          <p className="text-brand-slate mb-8">Your house is smart. Your tech guy should be too.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {memberships.map((m) => (
              <Card key={m.name} className="border-2 border-transparent hover:border-brand-orange">
                <CardHeader>
                  <CardTitle>{m.name}</CardTitle>
                  <p className="text-2xl font-bold text-brand-orange">{m.price}</p>
                  <CardDescription>{m.blurb}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/memberships">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Home className="h-8 w-8 text-brand-orange mb-2" />
            <CardTitle>New Home Setup</CardTitle>
            <CardDescription>{brand.messaging.newHome}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/new-home-setup">Learn more</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-brand-orange mb-2" />
            <CardTitle>Mom & Dad Support</CardTitle>
            <CardDescription>{brand.messaging.parents}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/tech-support-for-parents">Learn more</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Building2 className="h-8 w-8 text-brand-orange mb-2" />
            <CardTitle>Small Business</CardTitle>
            <CardDescription>{brand.messaging.smallBiz}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/small-business">Learn more</Link></Button>
          </CardContent>
        </Card>
      </section>

      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 className="text-3xl font-bold mb-3">Your personal tech guy</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6">
            Not an MSP. Not a big-box counter. A local pro who shows up, explains things clearly, and leaves your tech working.
          </p>
          <Button asChild size="lg"><Link href="/about">About us</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-brand-navy list-none flex justify-between">
                {f.q}
                <span className="text-brand-orange group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-brand-slate text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/faq" className="text-brand-orange font-semibold">Full FAQ →</Link>
        </div>
      </section>

      <section className="bg-brand-orange">
        <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h2 className="text-2xl font-bold">Ready when you are</h2>
            <p className="opacity-90">Book online in a few steps — or ask for a quote first.</p>
          </div>
          <Button asChild size="lg" variant="navy">
            <Link href="/book">Book Now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
