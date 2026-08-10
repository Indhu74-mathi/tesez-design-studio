import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, MapPin, Instagram, Twitter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — TESEZ" },
    { name: "description", content: "Reach the TESEZ atelier. Email, phone, WhatsApp, bulk orders." },
  ]}),
  component: ContactPage,
});

const WHATSAPP_NUMBER = "919047787569";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

function ContactPage() {
  // State for the main contact form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // State for bulk order form
  const [bulkForm, setBulkForm] = useState({
    company: "",
    quantity: "",
    email: "",
    phone: "",
  });

  // Handle main contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `New Contact Message:
Name: ${contactForm.name}
Email: ${contactForm.email}
Subject: ${contactForm.subject}
Message: ${contactForm.message}`;
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Handle bulk order form submission
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Bulk Order Request:
Company: ${bulkForm.company}
Quantity: ${bulkForm.quantity}
Email: ${bulkForm.email}
Phone: ${bulkForm.phone}`;
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="container-luxe pt-16 pb-32">
      <div className="eyebrow text-muted-foreground">Get in touch</div>
      <h1 className="display-xl mt-4 max-w-3xl">Let's talk.</h1>

      <div className="mt-16 grid lg:grid-cols-2 gap-16">
        {/* Main Contact Form */}
        <form onSubmit={handleContactSubmit} className="space-y-5 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="eyebrow text-muted-foreground">Name</span>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
                required
              />
            </label>
            <label className="block">
              <span className="eyebrow text-muted-foreground">Email</span>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
                required
              />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Subject</span>
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Message</span>
            <textarea
              rows={5}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none resize-none"
              required
            />
          </label>
          <button
            type="submit"
            className="bg-noir text-paper px-8 py-4 eyebrow"
          >
            Send Message →
          </button>
        </form>

        {/* Contact details (Email, Phone, WhatsApp, Address) */}
        <div className="space-y-8">
          <Block
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value="hello@tesez.com"
            href="mailto:hello@tesez.com"
          />
          <Block
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value="+91 90477 87569"
            href="tel:+919047787569"
          />
          <Block
            icon={<MessageCircle className="h-4 w-4" />}
            label="WhatsApp"
            value="+91 90477 87569"
            href={`${WHATSAPP_URL}?text=Hi%20TESEZ%2C%20I%20have%20a%20question.`}
          />
          <Block
            icon={<MapPin className="h-4 w-4" />}
            label="Atelier"
            value="Indiranagar, Bengaluru — 560038"
            // no link
          />
          <div>
            <div className="eyebrow text-muted-foreground mb-3">Follow</div>
            <div className="flex gap-4"><Instagram className="h-5 w-5" /><Twitter className="h-5 w-5" /></div>
          </div>
          <div className="aspect-video bg-cream border border-border flex items-center justify-center text-muted-foreground text-sm">
            Map embed
          </div>
        </div>
      </div>

      {/* Bulk Orders section */}
      <section className="mt-32 bg-cream p-10 md:p-16">
        <div className="eyebrow text-muted-foreground">Bulk Orders</div>
        <h2 className="display-lg mt-3 max-w-2xl">Outfit your team.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">From 25 pieces to 2,500. Tiered pricing, dedicated production, white-glove delivery.</p>
        <form onSubmit={handleBulkSubmit} className="mt-8 grid md:grid-cols-2 gap-4 max-w-2xl">
          <label className="block">
            <span className="eyebrow text-muted-foreground">Company</span>
            <input
              type="text"
              value={bulkForm.company}
              onChange={(e) => setBulkForm({ ...bulkForm, company: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Estimated quantity</span>
            <input
              type="text"
              value={bulkForm.quantity}
              onChange={(e) => setBulkForm({ ...bulkForm, quantity: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Work email</span>
            <input
              type="email"
              value={bulkForm.email}
              onChange={(e) => setBulkForm({ ...bulkForm, email: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Phone</span>
            <input
              type="tel"
              value={bulkForm.phone}
              onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })}
              className="block w-full mt-2 bg-transparent border-b border-border focus:border-foreground py-2 outline-none"
              required
            />
          </label>
          <button
            type="submit"
            className="md:col-span-2 bg-noir text-paper px-8 py-4 eyebrow md:w-fit"
          >
            Request a Quote →
          </button>
        </form>
      </section>
    </div>
  );
}

function Block({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-display text-2xl hover:underline"
    >
      {value}
    </a>
  ) : (
    <div className="font-display text-2xl">{value}</div>
  );
  return (
    <div>
      <div className="eyebrow text-muted-foreground mb-2 flex items-center gap-2">
        {icon} {label}
      </div>
      {content}
    </div>
  );
}