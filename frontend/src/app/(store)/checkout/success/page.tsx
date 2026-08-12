"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const [orderCode] = useState(() => `APD${String(100000 + Math.floor(Math.random() * 899999))}`);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-success-500/40 bg-success-600/15">
        <CheckCircle2 className="h-10 w-10 text-success-700" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Order Placed!</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Thank you for shopping with ApnarDokan. Your order{" "}
        <span className="font-mono font-semibold text-foreground">{orderCode}</span> has been confirmed.
      </p>
      <Card className="mt-6 p-5 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[var(--muted)]">Payment</span><span className="font-medium">bKash · Paid</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted)]">Delivery</span><span className="font-medium">2-5 business days</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted)]">Tracking</span><span className="font-medium">Available in My Orders</span></div>
        </div>
      </Card>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/track-order">Track Order <Package className="h-4 w-4" /></Button>
        <Button href="/" variant="outline">Continue Shopping <Home className="h-4 w-4" /></Button>
      </div>
      <p className="mt-6 text-xs text-[var(--muted)]">
        A confirmation email & SMS has been sent to your registered contact.
      </p>
      <Link href="/account/orders" className="mt-2 block text-sm font-medium text-primary-800 hover:text-primary-800">
        View all my orders →
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
