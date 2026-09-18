"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setStatus("idle");
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: String(fd.get("message") || "").slice(0, 5000),
        }),
      });
      if (!res.ok) {
        setStatus("err");
        setError(
          res.status === 429
            ? "Too many messages sent — wait a minute and try again."
            : "Something went wrong. Try again."
        );
        return;
      }
      try {
        form.reset();
      } catch {
        // Ignore reset failures after React re-render / detached node
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <Button type="submit">Send</Button>
      {status === "ok" && (
        <p className="text-sm text-green-700">Thanks — we got your message and will reply soon.</p>
      )}
      {status === "err" && error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
