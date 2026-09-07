import { cache } from "react";
import type { BusinessSettings } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DEFAULT_SETTINGS_ID = "default";

const DEFAULT_HOURS = {
  mon: "9-17",
  tue: "9-17",
  wed: "9-17",
  thu: "9-17",
  fri: "9-17",
  sat: "10-14",
  sun: "closed",
};

export function isPlaceholder(value?: string | null): boolean {
  if (!value || !value.trim()) return true;
  return value.includes("REPLACE_ME");
}

export type PublicContact = {
  businessName: string;
  tagline: string;
  phone: string | null;
  email: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  serviceArea: string | null;
  cancellationPolicy: string | null;
  hours: Record<string, string> | null;
  timezone: string;
  formattedAddress: string | null;
};

function parseHours(hoursJson?: string | null): Record<string, string> | null {
  if (!hoursJson) return null;
  try {
    const parsed = JSON.parse(hoursJson);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    /* ignore */
  }
  return null;
}

function formatAddress(s: Pick<BusinessSettings, "address1" | "city" | "state" | "zip">): string | null {
  const line1 = !isPlaceholder(s.address1) ? s.address1 : null;
  const city = !isPlaceholder(s.city) ? s.city : null;
  const state = !isPlaceholder(s.state) ? s.state : null;
  const zip = !isPlaceholder(s.zip) ? s.zip : null;
  if (!line1 && !city && !state && !zip) return null;
  const cityState = [city, state].filter(Boolean).join(", ");
  const cityStateZip = [cityState, zip].filter(Boolean).join(" ");
  return [line1, cityStateZip].filter(Boolean).join(", ");
}

/** Ensures a single default BusinessSettings row exists and returns it. */
export const getBusinessSettings = cache(async (): Promise<BusinessSettings> => {
  const existing = await prisma.businessSettings.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.businessSettings.create({
    data: {
      id: DEFAULT_SETTINGS_ID,
      businessName: "Gadget Gets IT Done",
      tagline: "Got a tech problem? Call Gadget Gets IT Done.",
      phone: "REPLACE_ME",
      email: "REPLACE_ME@example.com",
      address1: "REPLACE_ME",
      city: "REPLACE_ME",
      state: "REPLACE_ME",
      zip: "REPLACE_ME",
      serviceArea: "REPLACE_ME metro area",
      hoursJson: JSON.stringify(DEFAULT_HOURS),
      cancellationPolicy: "REPLACE_ME — cancel 24h ahead when possible.",
      timezone: "America/New_York",
      depositPercent: 25,
      bookingBufferMinutes: 30,
      smsEnabled: false,
    },
  });
});

/** NAP + contact for public pages: DB first, then NEXT_PUBLIC_* env fallbacks. */
export const getPublicContact = cache(async (): Promise<PublicContact> => {
  let settings: BusinessSettings | null = null;
  try {
    settings = await getBusinessSettings();
  } catch {
    settings = null;
  }

  const envPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || null;
  const envEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || null;

  const phone =
    settings && !isPlaceholder(settings.phone)
      ? settings.phone
      : envPhone && !isPlaceholder(envPhone)
        ? envPhone
        : null;

  const email =
    settings && !isPlaceholder(settings.email)
      ? settings.email
      : envEmail && !isPlaceholder(envEmail)
        ? envEmail
        : null;

  return {
    businessName: settings?.businessName || "Gadget Gets IT Done",
    tagline: settings?.tagline || "Got a tech problem? Call Gadget Gets IT Done.",
    phone,
    email,
    address1: settings && !isPlaceholder(settings.address1) ? settings.address1 : null,
    city: settings && !isPlaceholder(settings.city) ? settings.city : null,
    state: settings && !isPlaceholder(settings.state) ? settings.state : null,
    zip: settings && !isPlaceholder(settings.zip) ? settings.zip : null,
    serviceArea: settings && !isPlaceholder(settings.serviceArea) ? settings.serviceArea : null,
    cancellationPolicy:
      settings && !isPlaceholder(settings.cancellationPolicy) ? settings.cancellationPolicy : null,
    hours: settings ? parseHours(settings.hoursJson) : null,
    timezone: settings?.timezone || "America/New_York",
    formattedAddress: settings ? formatAddress(settings) : null,
  };
});

export type SettingsInput = {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  serviceArea: string;
  timezone: string;
  hoursJson: string;
  cancellationPolicy: string;
  depositPercent: number;
  bookingBufferMinutes: number;
  smsEnabled: boolean;
  googleCalendarId: string;
};

export async function upsertBusinessSettings(input: SettingsInput): Promise<BusinessSettings> {
  const existing = await prisma.businessSettings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const data = {
    businessName: input.businessName.trim() || "Gadget Gets IT Done",
    tagline: input.tagline.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    address1: input.address1.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    zip: input.zip.trim(),
    serviceArea: input.serviceArea.trim() || null,
    timezone: input.timezone.trim() || "America/New_York",
    hoursJson: input.hoursJson.trim() || null,
    cancellationPolicy: input.cancellationPolicy.trim() || null,
    depositPercent: Number.isFinite(input.depositPercent) ? input.depositPercent : 25,
    bookingBufferMinutes: Number.isFinite(input.bookingBufferMinutes)
      ? input.bookingBufferMinutes
      : 30,
    smsEnabled: Boolean(input.smsEnabled),
    googleCalendarId: input.googleCalendarId.trim() || null,
  };

  if (existing) {
    return prisma.businessSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.businessSettings.create({
    data: { id: DEFAULT_SETTINGS_ID, ...data },
  });
}
