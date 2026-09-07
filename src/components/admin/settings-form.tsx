"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type SettingsFormValues = {
  id?: string;
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

function prettyHours(raw?: string | null): string {
  if (!raw) {
    return JSON.stringify(
      { mon: "9-17", tue: "9-17", wed: "9-17", thu: "9-17", fri: "9-17", sat: "10-14", sun: "closed" },
      null,
      2
    );
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [form, setForm] = useState<SettingsFormValues>({
    ...initial,
    hoursJson: prettyHours(initial.hoursJson),
    serviceArea: initial.serviceArea || "",
    cancellationPolicy: initial.cancellationPolicy || "",
    googleCalendarId: initial.googleCalendarId || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function setField<K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          depositPercent: Number(form.depositPercent),
          bookingBufferMinutes: Number(form.bookingBufferMinutes),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Save failed" });
      } else {
        setMessage({ type: "ok", text: data.message || "Settings saved" });
        if (data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
            hoursJson: prettyHours(data.settings.hoursJson),
            serviceArea: data.settings.serviceArea || "",
            cancellationPolicy: data.settings.cancellationPolicy || "",
            googleCalendarId: data.settings.googleCalendarId || "",
          }));
        }
      }
    } catch {
      setMessage({ type: "err", text: "Network error — could not save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {message && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Brand</CardTitle>
          <CardDescription>Public business name and tagline for Gadget Gets IT Done.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              required
              value={form.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact (NAP)</CardTitle>
          <CardDescription>
            Phone, email, and address shown on the site. Replace REPLACE_ME placeholders — values sync to
            header, footer, and contact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="(555) 555-5555"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address1">Street address</Label>
            <Input id="address1" value={form.address1} onChange={(e) => setField("address1", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={form.zip} onChange={(e) => setField("zip", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="serviceArea">Service area</Label>
            <Textarea
              id="serviceArea"
              rows={3}
              placeholder="Metro area / towns you cover"
              value={form.serviceArea}
              onChange={(e) => setField("serviceArea", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hours and policy</CardTitle>
          <CardDescription>Hours are stored as JSON. Cancellation policy appears on the cancellation page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="America/New_York"
              value={form.timezone}
              onChange={(e) => setField("timezone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hoursJson">Hours (JSON)</Label>
            <Textarea
              id="hoursJson"
              rows={8}
              className="font-mono text-xs"
              value={form.hoursJson}
              onChange={(e) => setField("hoursJson", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cancellationPolicy">Cancellation policy</Label>
            <Textarea
              id="cancellationPolicy"
              rows={5}
              value={form.cancellationPolicy}
              onChange={(e) => setField("cancellationPolicy", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking and ops</CardTitle>
          <CardDescription>Deposit percent, buffer, SMS, and calendar id.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="depositPercent">Deposit percent</Label>
              <Input
                id="depositPercent"
                type="number"
                min={0}
                max={100}
                value={form.depositPercent}
                onChange={(e) => setField("depositPercent", Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="bookingBufferMinutes">Booking buffer (minutes)</Label>
              <Input
                id="bookingBufferMinutes"
                type="number"
                min={0}
                max={1440}
                value={form.bookingBufferMinutes}
                onChange={(e) => setField("bookingBufferMinutes", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="smsEnabled"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
              checked={form.smsEnabled}
              onChange={(e) => setField("smsEnabled", e.target.checked)}
            />
            <Label htmlFor="smsEnabled">SMS notifications enabled</Label>
          </div>
          <div>
            <Label htmlFor="googleCalendarId">Google Calendar ID (optional)</Label>
            <Input
              id="googleCalendarId"
              value={form.googleCalendarId}
              onChange={(e) => setField("googleCalendarId", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {message?.type === "ok" && <span className="text-sm text-green-700">{message.text}</span>}
      </div>
    </form>
  );
}
