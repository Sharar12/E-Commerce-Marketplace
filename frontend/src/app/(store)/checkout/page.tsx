"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Truck, CreditCard, Smartphone, Banknote, Check, ChevronLeft, PackageCheck, ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectCartItems, clearCart, toggleCart } from "@/features/cart/cartSlice";
import { useGetProductsQuery, useCreateOrderMutation } from "@/features/api/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Checkbox as Ck } from "@/components/ui/Input";
import { ProductImage } from "@/components/shared/ProductImage";
import { Price } from "@/components/shared/Price";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatBDT, cn } from "@/lib/utils";
import type { PaymentMethod, Address } from "@/types";

type Step = "address" | "shipping" | "payment" | "review";

const steps: { id: Step; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const items = useAppSelector(selectCartItems);
  const authUser = useAppSelector((s) => s.auth.user);
  const [placeOrderApi] = useCreateOrderMutation();
  const [step, setStep] = useState<Step>("address");

  const address: Address = {
    id: "addr-work",
    label: "Work",
    name: "Rahim Uddin",
    phone: "+8801712345678",
    line1: "Level 4, House 42, Road 11",
    area: "Banani",
    city: "Dhaka",
    postalCode: "1213",
    isDefault: true,
  };
  const [selectedAddress, setSelectedAddress] = useState(address.id);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [codConsent, setCodConsent] = useState(false);
  const [placing, setPlacing] = useState(false);

  const { data } = useGetProductsQuery({ pageSize: 100 }, { skip: items.length === 0 });
  const allProducts = data?.items ?? [];
  const lineItems = items
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as { productId: string; quantity: number; variantLabel?: string; product: (typeof allProducts)[number] }[];

  const subtotal = lineItems.reduce((s, li) => s + li.product.price * li.quantity, 0);
  const shippingFee = shippingMethod === "express" ? 149 : shippingMethod === "same_day" ? 199 : subtotal >= 499 ? 0 : 60;
  const total = subtotal + shippingFee;

  if (lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <PackageCheck className="mx-auto h-14 w-14 text-[var(--muted)]" />
        <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">Cart empty</h1>
        <p className="mt-1 font-mono text-xs tracking-wider text-[var(--muted)]">ADD ITEMS BEFORE CHECKING OUT.</p>
        <Button href="/" className="mt-6">ENTER MARKET</Button>
      </div>
    );
  }

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await placeOrderApi({
        customerId: authUser?.id ?? "cus-01",
        customerName: authUser?.name ?? "Rahim Uddin",
        customerPhone: authUser?.phone ?? "+8801711111111",
        customerEmail: authUser?.email ?? "rahim.uddin@gmail.com",
        sellerId: lineItems[0]?.product.sellerId ?? "sel-techpoint",
        items: lineItems.map((li) => ({
          productId: li.product.id,
          name: li.product.name,
          image: li.product.images[0]?.url,
          quantity: li.quantity,
          price: li.product.price,
          variantLabel: li.variantLabel,
          sellerId: li.product.sellerId,
        })),
        address: {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          area: address.area,
          city: address.city,
          postalCode: address.postalCode,
          label: address.label,
          isDefault: address.isDefault,
        },
        payment: { method: paymentMethod },
        totals: { subtotal, shippingFee, total },
      }).unwrap();
      dispatch(clearCart());
      dispatch(toggleCart(false));
      setPlacing(false);
      success("Order placed!", "Your order has been confirmed. Track it from your account.");
      router.push("/checkout/success");
    } catch {
      setPlacing(false);
      error("Order failed", "Could not place the order. Try again.");
    }
  };

  const next = () => {
    const order: Step[] = ["address", "shipping", "payment", "review"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary-800">
        <span className="bg-[var(--line-strong)] h-1.5 w-1.5 rounded-[1px]" />
        CHECKOUT // SECURE CHANNEL
      </p>
      <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-foreground">Checkout</h1>

      {/* Stepper */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {steps.map((s, i) => {
          const idx = steps.findIndex((x) => x.id === step);
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.id} className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => i < idx && setStep(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-xs tracking-wider transition-all",
                  active
                    ? "border-primary-500/60 bg-primary-500/25 text-primary-800 shadow-[0_0_14px_rgb(240_106_0/0.25)]"
                    : done
                      ? "border-success-500/40 bg-success-500/10 text-success-700"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]",
                )}
              >
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-bold", active ? "bg-primary-500 text-ink" : "")}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s.label.toUpperCase()}
              </button>
              {i < steps.length - 1 ? <div className={cn("h-px w-8", i < idx ? "bg-success-500" : "bg-[var(--line)]")} /> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Address */}
          {step === "address" ? (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em] text-primary-800">
                <MapPin className="h-4.5 w-4.5 text-primary-800" /> DELIVERY ADDRESS
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-primary-700/50 bg-primary-500/20 p-4">
                  <input type="radio" checked readOnly className="mt-1 h-4 w-4 accent-primary-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{address.label} · {address.name}</p>
                      <Badge tone="primary">{address.isDefault ? "DEFAULT" : "SELECTED"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {address.line1}, {address.area}, {address.city} {address.postalCode}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wider text-[var(--muted)]">PHONE: {address.phone}</p>
                  </div>
                </div>
                <button className="w-full rounded-lg border border-dashed border-[var(--line)] py-3.5 font-mono text-xs tracking-widest text-[var(--muted)] transition-colors hover:border-primary-700/50 hover:text-primary-800">
                  + ADD NEW ADDRESS
                </button>
              </div>
              <Button size="lg" className="mt-5 w-full" onClick={next}>CONTINUE TO SHIPPING</Button>
            </Card>
          ) : null}

          {/* Shipping */}
          {step === "shipping" ? (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em] text-primary-800">
                <Truck className="h-4.5 w-4.5 text-primary-800" /> SHIPPING METHOD
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { id: "standard", label: "Standard Delivery", desc: "2-5 business days", price: subtotal >= 499 ? 0 : 60 },
                  { id: "express", label: "Express Delivery", desc: "1-2 business days", price: 149 },
                  { id: "same_day", label: "Same-Day Delivery (Dhaka)", desc: "Order before 2 PM", price: 199 },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setShippingMethod(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all",
                      shippingMethod === m.id ? "border-primary-700/50 bg-primary-500/20" : "border-[var(--line)] hover:border-primary-700/50",
                    )}
                  >
                    <input type="radio" checked={shippingMethod === m.id} readOnly className="h-4 w-4 accent-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{m.desc.toUpperCase()}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary-800">{m.price === 0 ? "FREE" : formatBDT(m.price)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setStep("address")}><ChevronLeft className="h-4 w-4" /> BACK</Button>
                <Button size="lg" className="flex-1" onClick={next}>CONTINUE TO PAYMENT</Button>
              </div>
            </Card>
          ) : null}

          {/* Payment */}
          {step === "payment" ? (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em] text-primary-800">
                <CreditCard className="h-4.5 w-4.5 text-primary-800" /> PAYMENT METHOD
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { id: "bkash" as PaymentMethod, label: "bKash", desc: "Instant payment via mobile wallet", icon: <Smartphone className="h-5 w-5 text-danger-500" /> },
                  { id: "nagad" as PaymentMethod, label: "Nagad", desc: "Instant payment via mobile wallet", icon: <Smartphone className="h-5 w-5 text-danger-500" /> },
                  { id: "card" as PaymentMethod, label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex", icon: <CreditCard className="h-5 w-5 text-info-700" /> },
                  { id: "cod" as PaymentMethod, label: "Cash on Delivery", desc: "Pay when you receive your order", icon: <Banknote className="h-5 w-5 text-success-700" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all",
                      paymentMethod === m.id ? "border-primary-700/50 bg-primary-500/20" : "border-[var(--line)] hover:border-primary-700/50",
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface-2)]">{m.icon}</span>
                    <input type="radio" checked={paymentMethod === m.id} readOnly className="h-4 w-4 accent-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">{m.desc.toUpperCase()}</p>
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === "bkash" || paymentMethod === "nagad" ? (
                <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 p-4">
                  <p className="text-sm font-medium text-foreground">You'll receive a payment request on your {paymentMethod} number</p>
                  <p className="mt-1 font-mono text-[10px] tracking-wider text-[var(--muted)]">ENTER YOUR {paymentMethod.toUpperCase()} NUMBER TO RECEIVE THE REQUEST:</p>
                  <Input className="mt-2 h-10" placeholder="01XXXXXXXXX" />
                </div>
              ) : null}
              {paymentMethod === "card" ? (
                <div className="mt-4 space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 p-4">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" className="h-10" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Expiry" placeholder="MM/YY" className="h-10" />
                    <Input label="CVV" placeholder="•••" className="h-10" />
                  </div>
                  <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">DEMO ONLY — NO REAL PAYMENT IS PROCESSED.</p>
                </div>
              ) : null}
              {paymentMethod === "cod" ? (
                <Ck
                  className="mt-4"
                  label="I'll pay with cash upon delivery"
                  description="Keep ৳ ready when the delivery partner arrives."
                  checked={codConsent}
                  onChange={(e) => setCodConsent(e.target.checked)}
                />
              ) : null}

              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setStep("shipping")}><ChevronLeft className="h-4 w-4" /> BACK</Button>
                <Button size="lg" className="flex-1" onClick={next}>
                  REVIEW ORDER
                </Button>
              </div>
            </Card>
          ) : null}

          {/* Review */}
          {step === "review" ? (
            <Card className="p-6">
              <h2 className="font-mono text-sm font-bold tracking-[0.2em] text-primary-800">REVIEW & PLACE ORDER</h2>
              <div className="mt-4 divide-y divide-white/5">
                {lineItems.map((li) => (
                  <div key={li.productId} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)]">
                      <ProductImage src={li.product.images[0]?.url} alt={li.product.name} sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{li.product.name}</p>
                      <p className="font-mono text-[10px] tracking-wider text-[var(--muted)]">QTY: {li.quantity} {li.variantLabel ? `· ${li.variantLabel.toUpperCase()}` : ""}</p>
                    </div>
                    <Price price={li.product.price * li.quantity} size="sm" />
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2 border-t border-[var(--line)] pt-4 font-mono text-xs tracking-wider">
                <div className="flex justify-between text-[var(--muted)]"><span>DELIVER TO</span><span className="max-w-[60%] text-right font-medium text-foreground">{address.line1}, {address.area}, {address.city}</span></div>
                <div className="flex justify-between text-[var(--muted)]"><span>SHIPPING</span><span className="text-foreground">{shippingMethod === "standard" ? "STANDARD" : shippingMethod === "express" ? "EXPRESS" : "SAME-DAY"}</span></div>
                <div className="flex justify-between text-[var(--muted)]"><span>PAYMENT</span><span className="text-foreground uppercase">{paymentMethod === "cod" ? "CASH ON DELIVERY" : paymentMethod}</span></div>
                <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-bold text-primary-800"><span>TOTAL</span><span>{formatBDT(total)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-success-500/40 bg-success-500/10 p-3 font-mono text-[10px] tracking-wider text-success-700">
                <ShieldCheck className="h-4 w-4 shrink-0" /> PROTECTED BY APNARDOKAN BUYER PROTECTION — FULL REFUND IF NOT AS DESCRIBED.
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setStep("payment")}><ChevronLeft className="h-4 w-4" /> BACK</Button>
                <Button size="lg" className="flex-1" loading={placing} onClick={placeOrder}>
                  PLACE ORDER · {formatBDT(total)}
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        {/* Summary rail */}
        <Card className="h-fit p-5">
          <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-primary-800">ORDER SUMMARY</h3>
          <div className="mt-3 space-y-2 font-mono text-xs tracking-wider">
            <div className="flex justify-between text-[var(--muted)]"><span>SUBTOTAL</span><span className="text-foreground">{formatBDT(subtotal)}</span></div>
            <div className="flex justify-between text-[var(--muted)]"><span>SHIPPING</span><span className="text-foreground">{shippingFee === 0 ? "FREE" : formatBDT(shippingFee)}</span></div>
            <div className="flex justify-between border-t border-[var(--line)] pt-3 font-mono text-base font-bold text-primary-800"><span>TOTAL</span><span>{formatBDT(total)}</span></div>
          </div>
          <Link href="/cart" className="mt-4 block text-center font-mono text-[10px] tracking-widest text-[var(--muted)] hover:text-primary-800">
            EDIT CART
          </Link>
        </Card>
      </div>
    </div>
  );
}
