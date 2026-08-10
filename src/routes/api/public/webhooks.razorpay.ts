import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret missing", { status: 500 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(body);
        const event = payload.event as string;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          if (event === "payment.captured" || event === "order.paid") {
            const p = payload.payload?.payment?.entity ?? {};
            await supabaseAdmin.from("orders").update({
              payment_id: p.id ?? null,
              payment_status: "paid",
              status: "payment_confirmed" as any,
              payment_method: p.method ?? null,
              transaction_date: new Date().toISOString(),
            }).eq("razorpay_order_id", p.order_id);
          } else if (event === "payment.failed") {
            const p = payload.payload?.payment?.entity ?? {};
            await supabaseAdmin.from("orders").update({
              payment_id: p.id ?? null,
              payment_status: "failed",
              notes: p.error_description ?? p.error_reason ?? null,
            }).eq("razorpay_order_id", p.order_id);
          } else if (event === "refund.created") {
            const r = payload.payload?.refund?.entity ?? {};
            await supabaseAdmin.from("orders").update({
              payment_status: "refunded",
              status: "cancelled" as any,
            }).eq("payment_id", r.payment_id);
          }
        } catch (err) {
          console.error("Webhook handler error", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
