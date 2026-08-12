"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { success } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    success("Message sent!", "Our team will get back to you within 24 hours.");
    setName(""); setEmail(""); setSubject(""); setMessage("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
      <p className="mt-2 text-[var(--muted)]">We'd love to hear from you. Reach out any time.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {[
            { icon: <Phone className="h-4.5 w-4.5" />, title: "Hotline", desc: "09678-123456 (10am – 10pm)" },
            { icon: <Mail className="h-4.5 w-4.5" />, title: "Email", desc: "support@apnardokan.com" },
            { icon: <MapPin className="h-4.5 w-4.5" />, title: "Head Office", desc: "Level 8, Gulshan Avenue, Dhaka 1212" },
            { icon: <Clock className="h-4.5 w-4.5" />, title: "Support Hours", desc: "Every day, 9am – 11pm" },
          ].map((c, i) => (
            <Card key={i} hover className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/25 text-primary-800">{c.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.title}</p>
                <p className="text-sm text-[var(--muted)]">{c.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <MessageSquare className="h-4.5 w-4.5 text-primary-800" /> Send us a message
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
            <Button type="submit" size="lg" className="w-full">Send Message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
