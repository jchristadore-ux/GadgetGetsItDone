"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await signIn("resend", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        setError("Could not send the sign-in email. Check the address and try again.");
        return;
      }
      window.location.href = "/login?verify=1";
    } catch {
      setError("Could not send the sign-in email. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Email me a magic link"}
      </Button>
      <p className="text-xs text-slate-500">
        Tip: check spam/promotions for mail from onboarding@resend.dev until a custom domain is verified.
      </p>
    </form>
  );
}
