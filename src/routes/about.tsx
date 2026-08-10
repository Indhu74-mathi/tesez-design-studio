import { createFileRoute, Link } from "@tanstack/react-router";
import lifestyle from "@/assets/lifestyle-1.jpg";
import about1 from "@/assets/about-1.png";
import about2 from "@/assets/about-2.png";
import hero from "@/assets/about-main.png";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — TESEZ" },
    { name: "description", content: "TESEZ is a custom apparel house built around restraint, weight and the quiet authority of a garment made properly." },
    { property: "og:title", content: "About TESEZ" },
    { property: "og:image", content: hero },
  ]}),
  component: () => (
    <div>
      {/* Hero Section */}
      <section className="container-luxe pt-20 pb-12 max-w-4xl">
        <div className="eyebrow text-muted-foreground">About Us</div>
        <h1 className="display-xl mt-4">Crafted for <span className="italic">you.</span></h1>
        <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          TESEZ is a custom apparel house. We make t-shirts and hoodies the way they should be made: with weight, with restraint, and with respect for the person who will wear them.
        </p>
      </section>

      {/* Hero Image */}
      <section className="relative h-[100vh] overflow-hidden">
        <img src={hero} alt="TESEZ Collection" className="absolute inset-0 h-full w-full object-cover" />
      </section>

      {/* Our Story Section */}
      <section className="container-luxe py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow text-muted-foreground">Our Story</div>
            <h2 className="display-lg mt-3">Who We Are</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Tesez started in Tiruppur, the heart of global textile craftsmanship. For decades, the same premium fabrics and skilled manufacturing that supply international brands have been hidden behind foreign tags and inflated prices.
                <br /><br />
                This brand exists to change that narrative — to bring world-class fabric, fit, and finish straight to the Indian consumer without compromise. We believe quality shouldn’t be conditional or expensive — it should be standard.
                <br /><br />
                We come from the land that stitches the world’s favorite garments. Now, the world’s premium quality belongs to India — created in Tiruppur, but built for everyone who values refined comfort and purposeful design. 
                <br /><br />
              </p>
              <p>
                ✨ Global standards, delivered locally. <br /><br />
                ✨ Premium fabric and fit without inflated costs <br /><br />
                ✨ Designed to feel good, fit well, and last long.
              </p>
            </div>
          </div>
          <div className="bg-cream aspect-[4/5] flex items-center justify-center">
            <img src={about1} alt="Our story" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-cream py-24">
        <div className="container-luxe">
          <div className="text-center max-w-3xl mx-auto">
            <div className="eyebrow text-muted-foreground">What We Stand For</div>
            <h2 className="display-lg mt-3">Our Values</h2>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              ["Quality First", "Every garment is made with premium fabrics and attention to detail. We never compromise on quality."],
              ["Sustainable Craft", "We believe in slow fashion. Our pieces are designed to last, not to be discarded."],
              ["Custom For You", "Your style, your design. We bring your vision to life with precision and care."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-paper p-8 shadow-soft">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="container-luxe py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="eyebrow text-muted-foreground">How We Work</div>
            <h2 className="display-lg mt-3">Our Process</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                At TESEZ, every product begins with intention — the intention to elevate everyday wear into something meaningful. We obsess over the details that most people never notice but always feel: the density of the cotton, the fall of the fabric, the precision of the stitch, and the honesty of the price. We design with a mindset that premium isn’t defined by a logo, but by the experience it delivers.
                <br /><br />
                Our approach is simple: better materials, better construction, better comfort. From high-GSM fabrics to long-lasting prints and modern silhouettes, every TESEZ piece is crafted to meet global standards while staying rooted in practicality and ease. This is clothing engineered to breathe, to move, and to stay with you — season after season.
                <br /><br />
                TESEZ isn’t just about making garments; it’s about creating a new expectation for what quality in India should feel like. When you choose TESEZ, you’re choosing longevity, authenticity, and a brand built on purpose.
                <br /><br />
              </p>
              <p>
                ✨ Crafted with purpose and attention to detail. <br /><br />
                ✨ Breathable, durable, and suited for everyday wear. <br /><br />
                ✨ Quality that stays consistent, wash after wash. <br />
              </p>
            </div>
            <Link to="/customize" className="mt-8 inline-block bg-noir text-paper px-7 py-4 eyebrow">
              Start Customizing →
            </Link>
          </div>
          <div className="order-1 lg:order-2 bg-cream aspect-[4/5] flex items-center justify-center">
            <img src={about2} alt="Our process" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-cream py-24">
        <div className="container-luxe">
          <div className="text-center max-w-3xl mx-auto">
            <div className="eyebrow text-muted-foreground">Why TESEZ</div>
            <h2 className="display-lg mt-3">Made Different</h2>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            {[
              ["Premium Quality", "100% combed cotton with a perfect fit that lasts."],
              ["Custom Design", "Upload your artwork or choose from our library."],
              ["Fast Delivery", "Dispatched within 48 hours, delivered to your door."],
            ].map(([title, desc]) => (
              <div key={title}>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-luxe py-24 text-center">
        <div className="eyebrow text-muted-foreground">Get Started</div>
        <h2 className="display-lg mt-4 max-w-3xl mx-auto">
          Ready to create <br />
          <span className="italic">something unique?</span>
        </h2>
        <Link to="/customize" className="mt-10 inline-block bg-noir text-paper px-12 py-4 eyebrow">
          Start Your Design →
        </Link>
      </section>
    </div>
  ),
});