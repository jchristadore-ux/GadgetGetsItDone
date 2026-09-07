export const brand = {
  name: "Gadget Gets It Done",
  tagline: "Got a tech problem? Call Gadget Gets It Done.",
  messaging: {
    smartHome: "Your house is smart. Your tech guy should be too.",
    smallBiz:
      "Your business has a plumber, electrician and accountant. Now it has a tech guy.",
    newHome: "Move in. We make the technology work.",
    parents: "Stop being your parents' tech support.",
  },
  colors: {
    navy: "#0B1F3A",
    blue: "#1A3A6B",
    orange: "#F15A29",
    orangeDark: "#D94A1F",
    yellow: "#F5C518",
    offwhite: "#F7F9FB",
    slate: "#243447",
  },
  logoPath: "/brand/logo.jpeg",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "REPLACE_ME",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@REPLACE_ME.com",
} as const;
