import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import lifestyle from "@/assets/lifestyle-1.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — TESEZ" }] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) nav({ to: "/account" });
    });
  }, [nav]);

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.name },
          },
        });
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          // User already exists
          toast.error("User already exists. Please sign in.");
          setLoading(false);
          return;
        }

        // Show popup with confirmation message (stays for 10 seconds)
        setPopupMessage(
          `✅ Account created successfully, ${form.name || 'User'}! 
          📧 Please check your email (${form.email}) to confirm your account then sign in.`
        );
        setShowPopup(true);
        
        // Clear form after signup
        setForm({ name: "", email: "", password: "" });
        setLoading(false);
        
        // Don't navigate - user needs to confirm email first
        return;
        
      } else if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast.error("Please confirm your email first. Check your inbox for the confirmation link.");
            setLoading(false);
            return;
          }
          throw error;
        }
        
        toast.success("Welcome back.");
        nav({ to: "/account" });
        
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your inbox.");
        setForm({ ...form, email: "" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Popup overlay component
  function ConfirmationPopup() {
    if (!showPopup) return null;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white max-w-lg w-full p-8 shadow-2xl rounded-lg border-2 border-crimson animate-in fade-in zoom-in duration-500">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-foreground">Account Created! 🎉</h3>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                {popupMessage}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This popup will auto-close in 10 seconds</span>
              </div>
              <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-crimson rounded-full animate-[shrink_10s_linear]"></div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 text-sm text-crimson hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
      {/* Popup */}
      <ConfirmationPopup />
      
      {/* Background Image */}
      <div className="relative hidden lg:block overflow-hidden">
        <img src={lifestyle} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/80 to-transparent" />
        <div className="absolute bottom-14 left-14 text-paper max-w-md">
          <div className="eyebrow opacity-60">Members</div>
          <h2 className="display-lg mt-3">Early drops. Saved looks.</h2>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="eyebrow text-muted-foreground link-underline">← TESEZ</Link>
          <div className="eyebrow text-muted-foreground mt-8">
            {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Welcome back"}
          </div>
          <h1 className="display-lg mt-3">
            {mode === "signup" ? "Join TESEZ." : mode === "forgot" ? "Send reset link." : "Sign in."}
          </h1>

          <form onSubmit={submit} className="mt-10 space-y-5">
            {mode === "signup" && (
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            )}
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            {mode !== "forgot" && (
              <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
            )}
            <button 
              type="submit"
              disabled={loading || showPopup} 
              className="w-full bg-noir text-paper py-4 eyebrow mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90"
            >
              {loading ? "…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send link" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground space-y-2">
            {mode === "signin" && (
              <>
                <button onClick={() => setMode("forgot")} className="link-underline block">Forgot password?</button>
                <div>
                  New here?{" "}
                  <button onClick={() => setMode("signup")} className="text-foreground link-underline">
                    Create an account
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                Have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-foreground link-underline">
                  Sign in
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("signin")} className="link-underline">
                ← Back to sign in
              </button>
            )}
          </div>

          {/* Info message for email confirmation */}
          {mode === "signup" && (
            <div className="mt-6 p-4 bg-cream border border-border text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-lg">📧</span>
                <span>After creating your account, you'll receive a confirmation email. 
                Click the link in the email to activate your account before signing in.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, required,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-foreground bg-transparent py-3 outline-none focus:border-crimson transition"
      />
    </label>
  );
}