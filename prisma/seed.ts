import { PrismaClient, PaymentMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessName: "Gadget Gets It Done",
      tagline: "Got a tech problem? Call Gadget Gets It Done.",
      phone: "REPLACE_ME",
      email: "REPLACE_ME@example.com",
      address1: "REPLACE_ME",
      city: "REPLACE_ME",
      state: "REPLACE_ME",
      zip: "REPLACE_ME",
      serviceArea: "REPLACE_ME metro area",
      hoursJson: JSON.stringify({
        mon: "9-17",
        tue: "9-17",
        wed: "9-17",
        thu: "9-17",
        fri: "9-17",
        sat: "10-14",
        sun: "closed",
      }),
      cancellationPolicy: "REPLACE_ME — cancel 24h ahead when possible.",
    },
    update: {},
  });

  for (let day = 1; day <= 5; day++) {
    await prisma.availability.upsert({
      where: { dayOfWeek_startTime: { dayOfWeek: day, startTime: "09:00" } },
      create: { dayOfWeek: day, startTime: "09:00", endTime: "17:00" },
      update: { active: true },
    });
  }

  const cats = [
    { name: "Wi-Fi & Networking", slug: "wifi-networking", icon: "wifi", sortOrder: 1 },
    { name: "Smart Home", slug: "smart-home", icon: "home", sortOrder: 2 },
    { name: "TV & Streaming", slug: "tv-streaming", icon: "tv", sortOrder: 3 },
    { name: "Computers & Printers", slug: "computers-printers", icon: "laptop", sortOrder: 4 },
    { name: "Small Business", slug: "small-business", icon: "building", sortOrder: 5 },
  ];

  for (const c of cats) {
    await prisma.serviceCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }

  const wifi = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "wifi-networking" } });
  const smart = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "smart-home" } });
  const tv = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "tv-streaming" } });
  const comps = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "computers-printers" } });
  const biz = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "small-business" } });

  const services: Array<{
    categoryId: string;
    name: string;
    slug: string;
    shortDesc: string;
    description: string;
    basePriceCents: number;
    depositCents?: number;
    paymentMode: PaymentMode;
    durationMinutes: number;
    featured?: boolean;
  }> = [
    {
      categoryId: wifi.id,
      name: "Whole-Home Wi-Fi Tune-Up",
      slug: "wifi-tune-up",
      shortDesc: "Coverage, mesh, and dead-zone fixes.",
      description: "Assess coverage, optimize channels, and set up or tune mesh systems.",
      basePriceCents: 14900,
      paymentMode: "PAY_NOW",
      durationMinutes: 90,
      featured: true,
    },
    {
      categoryId: smart.id,
      name: "Smart Home Starter Setup",
      slug: "smart-home-starter",
      shortDesc: "Hubs, lights, locks, and routines.",
      description: "Install and connect devices, name them clearly, create starter routines.",
      basePriceCents: 19900,
      depositCents: 5000,
      paymentMode: "DEPOSIT",
      durationMinutes: 120,
      featured: true,
    },
    {
      categoryId: tv.id,
      name: "TV & Streaming Setup",
      slug: "tv-streaming-setup",
      shortDesc: "Apps, accounts, and remotes that make sense.",
      description: "Connect displays, sign into services, declutter remotes and inputs.",
      basePriceCents: 12900,
      paymentMode: "PAY_NOW",
      durationMinutes: 90,
    },
    {
      categoryId: comps.id,
      name: "Computer & Printer Setup",
      slug: "computer-printer-setup",
      shortDesc: "New devices, printers, backups — not shop repair.",
      description: "Set up PCs/Macs, printers, cloud backups, and basic security hygiene.",
      basePriceCents: 11900,
      paymentMode: "PAY_AFTER",
      durationMinutes: 90,
    },
    {
      categoryId: biz.id,
      name: "Small Business Network Visit",
      slug: "biz-network-visit",
      shortDesc: "Shop/office Wi-Fi, guest nets, printers.",
      description: "Stabilize business Wi-Fi, guest access, and shared devices.",
      basePriceCents: 24900,
      depositCents: 7500,
      paymentMode: "DEPOSIT",
      durationMinutes: 150,
    },
    {
      categoryId: smart.id,
      name: "Custom Project",
      slug: "custom-project",
      shortDesc: "Tell us what you need — we will quote it.",
      description: "Multi-room, specialty gear, or unclear scope. Quote required before scheduling.",
      basePriceCents: 0,
      paymentMode: "QUOTE_REQUIRED",
      durationMinutes: 60,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: {
        name: s.name,
        shortDesc: s.shortDesc,
        description: s.description,
        basePriceCents: s.basePriceCents,
        depositCents: s.depositCents,
        paymentMode: s.paymentMode,
        durationMinutes: s.durationMinutes,
        featured: s.featured || false,
      },
    });
  }

  const wifiSvc = await prisma.service.findUniqueOrThrow({ where: { slug: "wifi-tune-up" } });
  await prisma.serviceQuestion.deleteMany({ where: { serviceId: wifiSvc.id } });
  await prisma.serviceQuestion.createMany({
    data: [
      { serviceId: wifiSvc.id, label: "Approx square footage", fieldType: "text", required: false, sortOrder: 1 },
      { serviceId: wifiSvc.id, label: "Do you already have mesh nodes?", fieldType: "select", required: true, optionsJson: JSON.stringify(["Yes", "No", "Not sure"]), sortOrder: 2 },
    ],
  });

  const plans = [
    {
      name: "Home Care",
      slug: "home-care",
      description: "Priority scheduling and remote check-ins for one household.",
      priceCents: 4900,
      featuresJson: JSON.stringify(["Priority scheduling", "Remote check-ins", "Member rates"]),
      visitsPerPeriod: 0,
      sortOrder: 1,
    },
    {
      name: "Family Plus",
      slug: "family-plus",
      description: "Cover parents or a second home with supported households.",
      priceCents: 8900,
      featuresJson: JSON.stringify(["Supported household", "Priority scheduling", "Visit credit"]),
      visitsPerPeriod: 1,
      sortOrder: 2,
    },
    {
      name: "Business Essentials",
      slug: "business-essentials",
      description: "On-call tech guy for shop, office, or studio.",
      priceCents: 14900,
      featuresJson: JSON.stringify(["On-call support", "Priority visits", "Invoice-friendly"]),
      visitsPerPeriod: 1,
      sortOrder: 3,
    },
  ];

  for (const p of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
