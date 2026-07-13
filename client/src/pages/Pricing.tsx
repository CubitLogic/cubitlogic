import { useRef, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Atom, Brain, Check, Zap, BookOpen, Sparkles, Lock, CreditCard, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s cubic-bezier(0.23,1,0.32,1), transform 0.7s cubic-bezier(0.23,1,0.32,1)";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const FREE_FEATURES = [
  { icon: Brain, text: "5 AI Tutor questions per day" },
  { icon: BookOpen, text: "All 6 core quantum topics" },
  { icon: Sparkles, text: "Full blog access" },
  { icon: Atom, text: "Quantum concept library" },
];

const SUPPORTER_FEATURES = [
  { icon: Brain, text: "Unlimited AI Tutor questions — ask as many as you want, all day" },
  { icon: BookOpen, text: "Full Prompt Engineering Masterclass (Modules 3–7 unlocked)" },
  { icon: Sparkles, text: "All core quantum topics, blog articles, and hardware lab" },
  { icon: Atom, text: "Deeper AI explanations — ask follow-ups, request math, get analogies" },
  { icon: Zap, text: "Priority AI responses — no rate limiting or wait queues" },
  { icon: Lock, text: "Early access to new courses, quizzes, and learning paths" },
];

export default function Pricing() {
  const ref = useFadeUp();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const checkoutMutation = trpc.subscription.createCheckout.useMutation();
  const paypalMutation = trpc.paypal.createSubscription.useMutation();
  const { data: authUser } = trpc.auth.me.useQuery();

  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/fZu7sK34z1WPcGUgu4cAo01";

  const handleUpgrade = async () => {
    if (paymentMethod === "stripe") {
      // Direct Stripe Payment Link — no login required
      window.open(STRIPE_PAYMENT_LINK, "_blank");
      toast.success("Opening secure checkout in a new tab...");
    } else {
      // PayPal still requires auth for subscription linking
      if (!authUser) {
        toast.error("Please sign in first to support via PayPal.");
        return;
      }
      try {
        toast.loading("Redirecting to PayPal...");
        const result = await paypalMutation.mutateAsync();
        if (result.url) window.open(result.url, "_blank");
      } catch {
        toast.error("Failed to start checkout. Please try again.");
      }
    }
  };

  const isPending = checkoutMutation.isPending || paypalMutation.isPending;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      <section className="relative z-10 pt-32 pb-24">
        <div className="container max-w-5xl mx-auto">
          <div ref={ref}>
            {/* Header */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart size={14} style={{ color: "#0099CC" }} />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Support the Mission
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Free to learn. Free to stay.
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                CubitLogic is and always will be free. If you find value here and want to help keep the lights on —
                server costs, AI compute, and new content — a small monthly contribution goes a long way.
                No pressure, ever.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

              {/* Free */}
              <div className="rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-sm p-8 flex flex-col">
                <div className="mb-6">
                  <div className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Free — Always
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>$0</span>
                    <span className="text-gray-500 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>/month</span>
                  </div>
                  <p className="text-sm text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Everything you need to start learning quantum and AI — no card required, no catch.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-gray-600"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <Check size={14} style={{ color: "#0099CC" }} className="shrink-0" />
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Link href="/"
                  className="block text-center py-3 px-6 rounded-lg border border-gray-200 text-gray-900 text-sm font-semibold hover:border-[#0099CC]/50 hover:text-[#0099CC] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Start Learning Free
                </Link>
              </div>

              {/* Supporter */}
              <div className="rounded-2xl border border-[#0099CC]/30 bg-gradient-to-b from-[#0099CC]/10 to-[#6B21FF]/10 backdrop-blur-sm p-8 flex flex-col relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#0099CC] to-transparent" />

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      Supporter
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0099CC]/20 border border-[#0099CC]/30 text-[#0099CC]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Help Keep It Free
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>$5</span>
                    <span className="text-gray-500 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>/month</span>
                  </div>
                  <p className="text-sm text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    A cup of coffee a month helps cover server costs, AI compute, and new content — and unlocks everything as a thank-you.
                  </p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {SUPPORTER_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-gray-600"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <Check size={14} style={{ color: "#0099CC" }} className="shrink-0" />
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* Payment method selector */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Contribute with:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("stripe")}
                      aria-label="Contribute with credit card via Stripe"
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === "stripe"
                          ? "border-[#0099CC] bg-[#0099CC]/10 text-[#0099CC]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <CreditCard size={13} />
                      Credit Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod("paypal")}
                      aria-label="Contribute with PayPal"
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === "paypal"
                          ? "border-[#003087] bg-[#003087]/10 text-[#003087]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.82l-1.35 8.548h3.109c.457 0 .845-.332.917-.784l.038-.196.728-4.617.047-.254a.932.932 0 0 1 .917-.784h.578c3.741 0 6.67-1.52 7.525-5.914.358-1.838.173-3.372-.707-4.594z"/>
                      </svg>
                      PayPal
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isPending}
                  aria-label={`Support CubitLogic with ${paymentMethod === "stripe" ? "credit card" : "PayPal"}`}
                  className="block w-full text-center py-3 px-6 rounded-lg font-semibold text-sm transition-all active:scale-[0.97]"
                  style={{
                    background: paymentMethod === "paypal"
                      ? "linear-gradient(135deg, #003087 0%, #009cde 100%)"
                      : "linear-gradient(135deg, #0099CC 0%, #6B21FF 100%)",
                    color: "#ffffff",
                    fontFamily: "'Space Grotesk', sans-serif",
                    opacity: isPending ? 0.7 : 1,
                  }}>
                  {isPending
                    ? "Redirecting..."
                    : paymentMethod === "paypal"
                      ? "❤️ Support with PayPal →"
                      : "❤️ Support CubitLogic →"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {paymentMethod === "stripe"
                    ? "Secured by Stripe · Cancel anytime · No commitment"
                    : "Secured by PayPal · Cancel anytime · No commitment"}
                </p>
              </div>
            </div>

            {/* Mission statement */}
            <div className="mt-12 max-w-2xl mx-auto text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <Heart size={18} className="mx-auto mb-3" style={{ color: "#0099CC" }} />
              <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                CubitLogic was built to be the place where anyone — regardless of background or budget — can understand
                what AI and quantum computing are really about. Every contribution directly funds server costs, AI compute,
                and new free content for everyone. Thank you for being part of it.
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-16 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-8"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Common Questions
              </h2>
              <div className="space-y-5">
                {[
                  {
                    q: "Is the site really free?",
                    a: "Yes, completely. You never have to pay anything to use CubitLogic. The Supporter tier is purely optional — a way to help keep the site running if you want to."
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Absolutely. Cancel from your account settings at any time. You keep Supporter access until the end of your billing period, then revert to the free tier."
                  },
                  {
                    q: "What does my contribution actually pay for?",
                    a: "Server hosting, AI compute costs for the tutor, and time spent building new free content. Nothing fancy — just keeping the lights on."
                  },
                  {
                    q: "What payment methods are accepted?",
                    a: "All major credit and debit cards via Stripe, and PayPal. Both are fully secure and encrypted."
                  },
                ].map((item) => (
                  <div key={item.q} className="rounded-xl border border-gray-200 bg-white/5 p-5">
                    <div className="font-semibold text-gray-900 mb-2 text-sm"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.q}
                    </div>
                    <div className="text-gray-500 text-sm leading-relaxed"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
