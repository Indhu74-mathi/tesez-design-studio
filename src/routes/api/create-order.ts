import { createFileRoute } from "@tanstack/react-router";
import Razorpay from "razorpay";

export const Route = createFileRoute("/api/create-order")({
  method: "POST",
  handler: async ({ request }) => {
    try {
      const { amount, currency = "INR" } = await request.json();

      // Initialize Razorpay with your keys
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      
      return new Response(JSON.stringify({ 
        success: true, 
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to create order" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
});