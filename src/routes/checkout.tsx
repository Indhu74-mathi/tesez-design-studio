import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments.functions";
import { GST_RATE, FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/lib/payments.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — TESEZ" }] }),
  component: Checkout,
});

type Address = {
  full_name: string; email: string; phone: string;
  line1: string; line2?: string; city: string; state: string; pincode: string; country: string;
};

function Checkout() {
  const nav = useNavigate();
  const { items, clear } = useCart();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [address, setAddress] = useState<Address>({
    full_name: "", email: "", phone: "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "India",
  });
  const [coupon, setCoupon] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
        setAddress((a) => ({ ...a, email: a.email || data.user!.email || "" }));
      }
    });
    // Razorpay SDK
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const taxable = subtotal;
  const tax = Math.round(taxable * GST_RATE);
  const shipping = taxable >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = taxable + tax + shipping;

  async function placeOrder() {
    if (!items.length) return toast.error("Your bag is empty");
    for (const k of ["full_name", "email", "phone", "line1", "city", "state", "pincode"] as const) {
      if (!address[k]) return toast.error(`Please enter your ${k.replace("_", " ")}`);
    }
    setPlacing(true);
    try {
      console.log("Creating order with items:", items.length);
      
      const created = await createRazorpayOrder({
        data: {
          items: items.map((i) => ({
            product_id: null,
            product_name: i.name,
            product_image: i.image ?? null,
            size: i.size ?? null,
            color: i.color ?? null,
            quantity: i.qty,
            unit_price: i.price,
            customization: i.customDesign ?? null,
          })),
          address,
          coupon_code: coupon || null,
          user_id: user?.id ?? null,
        },
      });

      console.log("Order created:", created);

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh and try again.");
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new Razorpay({
          key: created.razorpay_key_id,
          amount: created.amount,
          currency: created.currency,
          name: "TESEZ",
          description: `Order ${created.order_number}`,
          order_id: created.razorpay_order_id,
          prefill: { 
            name: address.full_name, 
            email: address.email, 
            contact: address.phone 
          },
          theme: { color: "#0b0b0b" },
          handler: async (resp: any) => {
            try {
              await verifyRazorpayPayment({
                data: {
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  payment_method: resp.method,
                },
              });
              clear();
              toast.success("Payment confirmed! Order placed successfully.");
              nav({ to: "/order-success", search: { order: created.order_number } as any });
              resolve();
            } catch (err: any) {
              toast.error(err?.message ?? "Payment verification failed");
              reject(err);
            }
          },
          modal: { 
            ondismiss: () => { 
              setPlacing(false); 
              resolve(); 
            } 
          },
        });
        rzp.on("payment.failed", (resp: any) => {
          toast.error(resp.error?.description ?? "Payment failed");
          setPlacing(false);
        });
        rzp.open();
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err?.message || "Couldn't start payment. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (!items.length) {
    return (
      <div className="container-luxe py-32 text-center">
        <div className="eyebrow text-muted-foreground">Bag empty</div>
        <h1 className="display-lg mt-3">Nothing to check out.</h1>
        <Link to="/products" className="inline-block mt-8 eyebrow border-b border-foreground pb-1">Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16 grid lg:grid-cols-[1fr_420px] gap-16">
      <div>
        <div className="eyebrow text-muted-foreground">Checkout</div>
        <h1 className="display-lg mt-3 mb-10">Delivery details.</h1>

        <div className="grid sm:grid-cols-2 gap-5">
          <F label="Full name" value={address.full_name} onChange={(v) => setAddress({ ...address, full_name: v })} />
          <F label="Phone" type="tel" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
          <F label="Email" type="email" value={address.email} onChange={(v) => setAddress({ ...address, email: v })} className="sm:col-span-2" />
          <F label="Address line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} className="sm:col-span-2" />
          <F label="Address line 2 (optional)" value={address.line2 ?? ""} onChange={(v) => setAddress({ ...address, line2: v })} className="sm:col-span-2" />
          <F label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
          <F label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
          <F label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
          <F label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} />
        </div>
      </div>

      <aside className="bg-paper border border-border p-6 h-fit sticky top-28">
        <div className="eyebrow text-muted-foreground">Summary</div>
        <div className="mt-4 divide-y divide-border text-sm">
          {items.map((i, idx) => (
            <div key={idx} className="py-3 flex gap-3">
              {i.image && <img src={i.image} alt="" className="w-12 h-14 object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="truncate">{i.name}</div>
                <div className="text-xs text-muted-foreground">{i.size} · {i.color} · ×{i.qty}</div>
              </div>
              <div>{formatINR(i.price * i.qty)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Coupon code" className="flex-1 border border-border bg-paper px-3 py-2 text-sm" />
        </div>

        <div className="mt-5 text-sm space-y-2 border-t border-border pt-4">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>{formatINR(tax)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          <div className="flex justify-between font-display text-2xl pt-3 border-t border-border"><span>Total</span><span>{formatINR(total)}</span></div>
          {coupon && <div className="text-xs text-muted-foreground">Coupon applied at payment step.</div>}
        </div>

        <button 
          onClick={placeOrder} 
          disabled={placing}
          className="w-full bg-noir text-paper py-4 eyebrow mt-6 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placing ? "Processing..." : `Pay ₹${total}`}
        </button>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Secure payment via Razorpay
        </p>
      </aside>
    </div>
  );
}

function F({
  label, value, onChange, type = "text", className = "",
}: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-crimson transition" />
    </label>
  );
}