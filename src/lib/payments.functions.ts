import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";

// Pricing helpers
export const GST_RATE = 0.05;
export const FREE_SHIPPING_OVER = 999;
export const SHIPPING_FEE = 99;

// 🔴 LIVE KEYS - Read from environment
const RAZORPAY_KEY_ID = process.env.RAZORPAY_LIVE_KEY_ID || "rzp_live_TJISCrPoZa2A3F";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_LIVE_KEY_SECRET || "gARPyfT70SK4vHpvrWJU2C1";

function calcTotals(subtotal: number, discount: number) {
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * GST_RATE);
  const shipping = taxable >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = taxable + tax + shipping;
  return { tax, shipping, total };
}

// Input schemas
const cartItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string(),
  product_image: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  customization: z.any().optional(),
});

const addressSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  country: z.string().default("India"),
});

// ---------- Create Razorpay order ----------
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      items: z.array(cartItemSchema).min(1),
      address: addressSchema,
      coupon_code: z.string().optional().nullable(),
      user_id: z.string().uuid().optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    console.log("🔵 Creating Razorpay order...");
    console.log("🔑 Using Key ID:", RAZORPAY_KEY_ID);
    console.log("📌 Mode: 🔴 LIVE");
    console.warn("⚠️ REAL MONEY will be charged!");
    
    try {
      const subtotal = data.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const { tax, shipping, total } = calcTotals(subtotal, 0);
      const amountPaise = Math.round(total * 100);

      console.log("💰 Order total:", total, "INR");

      // Verify keys are present
      if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes("YOUR")) {
        throw new Error("Razorpay Key ID not set properly");
      }
      if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET.includes("YOUR")) {
        throw new Error("Razorpay Key Secret not set properly");
      }

      // Call Razorpay API
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
      
      console.log("📡 Calling Razorpay API...");
      
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Basic ${auth}` 
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `tesez_${Date.now()}`,
          notes: { 
            email: data.address.email, 
            phone: data.address.phone,
          },
        }),
      });
      
      const rzp = await rzpRes.json();
      
      console.log("📦 Razorpay Response Status:", rzpRes.status);
      
      if (!rzpRes.ok) {
        console.error("❌ Razorpay Error:", rzp);
        
        if (rzpRes.status === 401) {
          throw new Error(`❌ Authentication failed!
            Please check:
            1. Your Razorpay account is in LIVE Mode
            2. Key ID: ${RAZORPAY_KEY_ID}
            3. Key Secret is correct
            4. Website is approved: https://demo.graxitechs.com/
            
            If all looks correct, regenerate Live keys from dashboard.`);
        } else if (rzpRes.status === 400) {
          throw new Error(rzp?.error?.description || "Invalid request. Check order details.");
        } else if (rzpRes.status === 403) {
          throw new Error(`❌ Access forbidden! 
            Your website (${process.env.APP_URL || "localhost"}) may not be approved.
            Add your website in: Settings → Websites & API keys → Add website/app`);
        } else {
          throw new Error(rzp?.error?.description || `Razorpay error: ${rzpRes.status}`);
        }
      }

      console.log("✅ Razorpay order created:", rzp.id);

      return {
        razorpay_order_id: rzp.id,
        razorpay_key_id: RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: "INR",
        order_number: `TESEZ-${Date.now().toString().slice(-6)}`,
        summary: { subtotal, discount: 0, tax, shipping, total, coupon: null },
      };
      
    } catch (error: any) {
      console.error("❌ Payment creation error:", error);
      throw new Error(error.message || "Failed to create payment order");
    }
  });

// ---------- Verify payment signature ----------
export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
      payment_method: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    console.log("🔵 Verifying payment...");
    
    try {
      const expected = createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
        .digest("hex");
      
      const sig = Buffer.from(data.razorpay_signature);
      const exp = Buffer.from(expected);
      
      if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
        throw new Error("Invalid payment signature");
      }

      console.log("✅ Payment verified successfully!");
      return { ok: true };
      
    } catch (error: any) {
      console.error("❌ Verification error:", error);
      throw new Error(error.message || "Payment verification failed");
    }
  });