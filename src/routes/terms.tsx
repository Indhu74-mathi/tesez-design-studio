import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — TESEZ" }]}),
  component: () => (
    <PolicyPage
      title="Terms & Conditions."
      intro="The fine print, in plain language."
      sections={[
        ["Use of the site", "You agree to use TESEZ for lawful purposes and not to upload artwork that infringes third-party rights."],
        ["Orders", "All orders are subject to acceptance and availability. Customised orders are non-cancellable once production begins."],
        ["Pricing", "Prices are in INR and inclusive of GST unless stated otherwise."],
        ["Intellectual property", "All site content, designs and TESEZ marks belong to us. Artwork you upload remains yours."],
        ["Limitation of liability", "We are not liable for indirect damages arising from use of the site beyond the value of the order."],
      ]}
    />
  ),
});
