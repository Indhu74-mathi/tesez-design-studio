import { createFileRoute } from "@tanstack/react-router";

function PolicyPage({ title, intro, sections }: { title: string; intro: string; sections: [string, string][] }) {
  return (
    <div className="container-luxe pt-16 pb-32 max-w-3xl">
      <div className="eyebrow text-muted-foreground">Policy</div>
      <h1 className="display-xl mt-4">{title}</h1>
      <p className="mt-8 text-lg text-muted-foreground">{intro}</p>
      <div className="mt-12 space-y-10">
        {sections.map(([h, b]) => (
          <section key={h}>
            <h2 className="font-display text-3xl">{h}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">{b}</p>
          </section>
        ))}
      </div>
      <p className="mt-16 text-xs text-muted-foreground">Last updated: June 2026</p>
    </div>
  );
}

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — TESEZ" }]}),
  component: () => (
    <PolicyPage
      title="Privacy Policy."
      intro="We collect only what we need to fulfil your order and improve your experience. Nothing more."
      sections={[
        ["What we collect", "Name, email, phone, shipping address, payment details (via Razorpay), and basic browsing analytics."],
        ["How we use it", "To process orders, communicate updates, and improve our service. We never sell your data."],
        ["Cookies", "We use essential cookies for cart and session, and anonymous analytics to understand site usage."],
        ["Your rights", "Request access, correction, or deletion of your data anytime via privacy@tesez.com."],
        ["Contact", "Questions? Write to privacy@tesez.com."],
      ]}
    />
  ),
});
export { PolicyPage };
