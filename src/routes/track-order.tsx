import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const STEPS = ["Order Received", "Processing", "Printing", "Quality Check", "Packed", "Shipped", "Delivered"];

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — TESEZ" }]}),
  component: Track,
});

function Track() {
  const [id, setId] = useState("");
  const [shown, setShown] = useState(false);
  const current = 4; // demo

  return (
    <div className="container-luxe py-16 pb-32 max-w-3xl mx-auto">
      <div className="eyebrow text-muted-foreground">Track Your Order</div>
      <h1 className="display-lg mt-3">Where it is.</h1>

      <form onSubmit={(e) => { e.preventDefault(); setShown(true); }} className="mt-10 flex border-b border-foreground">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Order ID e.g. TZ-12345" className="flex-1 bg-transparent py-3 outline-none" />
        <button className="eyebrow ml-4">Track →</button>
      </form>

      {shown && (
        <div className="mt-16">
          <div className="eyebrow text-muted-foreground">Order #{id || "TZ-12345"}</div>
          <ol className="mt-8 space-y-6">
            {STEPS.map((s, i) => {
              const done = i <= current;
              return (
                <li key={s} className="flex gap-5 items-start">
                  <div className={`mt-1 h-3 w-3 rounded-full border-2 ${done ? "bg-foreground border-foreground" : "border-border"}`} />
                  <div className="flex-1 pb-6 border-b border-border">
                    <div className={`font-medium ${done ? "" : "text-muted-foreground"}`}>{s}</div>
                    {done && <div className="text-xs text-muted-foreground mt-1">Updated today</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
