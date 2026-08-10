import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping Policy — TESEZ" }]}),
  component: () => (
    <PolicyPage
      title="Shipping Policy."
      intro="Dispatched from our atelier in Bengaluru. India-wide delivery."
      sections={[
        ["Timelines", "Stock items: dispatched in 48 hours, delivered in 4–6 working days.\nCustomised pieces: 5–7 working days production + delivery."],
        ["Charges", "Flat ₹99 below ₹2,499. Complimentary on orders ₹2,499 and above."],
        ["Tracking", "A tracking link is emailed once dispatched. Track anytime at /track-order."],
        ["International", "Currently shipping within India only. International coming soon."],
      ]}
    />
  ),
});
