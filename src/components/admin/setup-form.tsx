"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSetupForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || (res.ok ? "Done" : "Failed"));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
      <div>
        <Label htmlFor="email">Admin email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="token">Bootstrap token</Label>
        <Input id="token" type="password" required value={token} onChange={(e) => setToken(e.target.value)} />
      </div>
      <Button type="submit" className="w-full">Create admin</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
