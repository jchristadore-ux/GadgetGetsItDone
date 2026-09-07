"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = ["Service", "Details", "Schedule", "Confirm"] as const;

const CATALOG = [
  { slug: "wifi-tune-up", name: "Whole-Home Wi-Fi Tune-Up", paymentMode: "PAY_NOW" },
  { slug: "smart-home-starter", name: "Smart Home Starter Setup", paymentMode: "DEPOSIT" },
  { slug: "tv-streaming-setup", name: "TV & Streaming Setup", paymentMode: "PAY_NOW" },
  { slug: "custom-project", name: "Custom Project (Quote)", paymentMode: "QUOTE_REQUIRED" },
];

export function BookingWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(params.get("service") || CATALOG[0].slug);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
    date: "",
    time: "10:00",
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => CATALOG.find((c) => c.slug === service) || CATALOG[0], [service]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug: service, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setResult(data.message || "Booking received");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Step {step + 1}: {STEPS[step]}
        </CardTitle>
        <div className="flex gap-2 mt-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded ${i <= step ? "bg-brand-orange" : "bg-slate-200"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            {CATALOG.map((c) => (
              <label key={c.slug} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${service === c.slug ? "border-brand-orange bg-orange-50" : ""}`}>
                <input type="radio" name="service" checked={service === c.slug} onChange={() => setService(c.slug)} />
                <span>
                  <span className="font-semibold block">{c.name}</span>
                  <span className="text-xs text-brand-slate">{c.paymentMode.replaceAll("_", " ")}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            {(["name", "email", "phone", "address1", "city", "state", "zip"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={k}>{k}</Label>
                <Input id={k} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required />
              </div>
            ))}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">Preferred date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="time">Preferred time</Label>
              <Input id="time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-sm space-y-2">
            <p><strong>Service:</strong> {selected.name}</p>
            <p><strong>Mode:</strong> {selected.paymentMode.replaceAll("_", " ")}</p>
            <p><strong>Contact:</strong> {form.name} · {form.email}</p>
            <p><strong>When:</strong> {form.date || "TBD"} {form.time}</p>
            <p className="text-brand-slate">Final pricing is computed on the server from the service catalog.</p>
            {result && <p className="text-green-700 font-medium">{result}</p>}
            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button type="button" disabled={busy || !!result} onClick={submit}>
              {busy ? "Submitting…" : selected.paymentMode === "QUOTE_REQUIRED" ? "Request quote" : "Confirm booking"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
