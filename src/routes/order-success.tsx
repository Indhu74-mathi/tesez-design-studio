import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package, Clock, Mail } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: (search.order as string) || undefined,
  }),
  head: () => ({ 
    meta: [
      { title: "Order Confirmed — TESEZ" },
      { name: "description", content: "Your order has been confirmed. Thank you for shopping with TESEZ." },
    ] 
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const search = Route.useSearch();
  const orderNumber = search.order || "";

  return (
    <div className="bg-cream min-h-screen">
      <div className="container-luxe py-32">
        <div className="max-w-2xl mx-auto bg-paper border border-border p-12 shadow-soft text-center">
          {/* Success Icon */}
          <div className="mx-auto h-20 w-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-200">
            <Check className="h-10 w-10" />
          </div>

          {/* Title */}
          <div className="eyebrow text-muted-foreground mt-6">Order Confirmed</div>
          <h1 className="display-lg mt-3">Thank you for your order!</h1>
          
          {/* Order Number */}
          {orderNumber && (
            <div className="mt-3 text-sm text-muted-foreground">
              Order #<span className="font-mono font-medium text-foreground">{orderNumber}</span>
            </div>
          )}

          {/* Message */}
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md mx-auto">
            We've received your order and will start preparing it right away. 
            You'll receive a confirmation email with your order details shortly.
          </p>

          {/* Order Details Cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-cream p-4 rounded-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Processing</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your order is being prepared</p>
            </div>
            <div className="bg-cream p-4 rounded-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">48 Hours</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Estimated dispatch time</p>
            </div>
            <div className="bg-cream p-4 rounded-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium">Email Sent</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Check your inbox</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-10 border-t border-border pt-8">
            <h3 className="font-display text-lg">What's next?</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-0.5">1.</span>
                <span>We'll send you a confirmation email with your order details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-0.5">2.</span>
                <span>Your order will be dispatched within 48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground mt-0.5">3.</span>
                <span>You'll receive a tracking link once your order is shipped</span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/account" 
              className="inline-block bg-noir text-paper px-8 py-4 eyebrow hover:opacity-90 transition"
            >
              View My Orders
            </Link>
            <Link 
              to="/products" 
              className="inline-block border border-foreground px-8 py-4 eyebrow hover:bg-foreground hover:text-paper transition"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help */}
          <p className="mt-8 text-xs text-muted-foreground">
            Need help? <Link to="/contact" className="text-foreground hover:underline">Contact us</Link> or call +91 90477 87569
          </p>
        </div>
      </div>
    </div>
  );
}