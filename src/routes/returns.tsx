import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns & Refunds — TESEZ" }]}),
  component: () => (
    <PolicyPage
      title="Returns & Refunds."
      intro="If something isn't right, we'll make it right."
      sections={[
        ["Window", "7 days from delivery on stock items. Items must be unwashed, unworn, with tags."],
        ["Customised orders", "Non-returnable except in case of manufacturing defect or print error."],
        ["Process", "Email returns@tesez.com with your order ID. We'll arrange pickup at no cost."],
        ["Refunds", "Processed within 5–7 working days of receiving the return at our atelier, to the original payment method."],
        ["Exchanges", "Free size exchanges on stock items within the 7-day window."],
      ]}
    />
  ),
});
