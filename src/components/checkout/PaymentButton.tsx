import { useState } from "react";
import { toast } from "sonner";

interface PaymentButtonProps {
  amount: number; // in rupees
  orderDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({ amount, orderDetails, onSuccess, onFailure }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order in backend
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount,
          currency: "INR"
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error("Failed to create payment order");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: data.keyId, // Your Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "TESEZ",
        description: "Order Payment",
        image: "/logo.png",
        order_id: data.orderId,
        prefill: {
          name: orderDetails.name,
          email: orderDetails.email,
          contact: orderDetails.phone,
        },
        notes: {
          address: orderDetails.address,
        },
        theme: {
          color: "#000000",
        },
        handler: function (response: any) {
          // Payment success
          onSuccess(response.razorpay_payment_id);
          toast.success("Payment successful!");
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled");
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      onFailure(error instanceof Error ? error.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-noir text-paper py-4 eyebrow hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
}