import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { BookOpen, Brain, CreditCard, Heart, Server } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
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

const DONATION_USES = [
  {
    icon: Server,
    title: "Hosting and reliability",
    text: "Helps keep the site available and the learning tools running.",
  },
  {
    icon: Brain,
    title: "AI compute",
    text: "Helps cover the cost of providing the AI tutor to learners.",
  },
  {
    icon: BookOpen,
    title: "New free lessons",
    text: "Supports the research and work behind new educational content.",
  },
];

export default function Pricing() {
  const ref = useFadeUp();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const checkoutMutation = trpc.subscription.createCheckout.useMutation();
  const paypalMutation = trpc.paypal.createSubscription.useMutation();
  const { data: authUser } = trpc.auth.me.useQuery();

  const handleDonation = async () => {
    if (paymentMethod === "stripe") {
      const toastId = toast.loading("Opening secure donation checkout...");
      try {
        const result = await checkoutMutation.mutateAsync();
        if (!result.url) throw new Error("Stripe did not return a checkout URL");
        window.location.assign(result.url);
      } catch {
        toast.error("Donation checkout is not available right now. Please try again later.", { id: toastId });
      }
      return;
    }

    if (!authUser) {
      toast.error("PayPal donations require an account. Please sign in, then return to the Support page.");
      return;
    }

    const toastId = toast.loading("Redirecting to PayPal...");
    try {
      const result = await paypalMutation.mutateAsync();
      if (!result.url) throw new Error("PayPal did not return a checkout URL");
      window.location.assign(result.url);
    } catch {
      toast.error("Donation checkout is not available right now. Please try again later.", { id: toastId });
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
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart size={14} style={{ color: "#0099CC" }} />
                <span
                  className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  Support CubitLogic
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Learning stays free for everyone.
              </h1>
              <p
                className="text-gray-500 text-lg max-w-2xl mx-auto"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                CubitLogic does not charge for membership or educational access. If the site helps you,
                please consider a voluntary donation to support its ongoing costs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 max-w-4xl mx-auto items-start">
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-3"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  What your donation supports
                </h2>
                <p
                  className="text-sm text-gray-500 leading-relaxed mb-7"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Donations help cover the practical costs of keeping CubitLogic useful, independent,
                  and available to anyone who wants to learn.
                </p>

                <div className="space-y-5">
                  {DONATION_USES.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0099CC]/10 text-[#0099CC] flex items-center justify-center shrink-0">
                        <Icon size={19} />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-gray-900 mb-1"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {title}
                        </h3>
                        <p
                          className="text-sm text-gray-500 leading-relaxed"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/"
                  className="inline-flex mt-8 text-sm font-semibold text-[#0099CC] hover:underline"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Continue learning free →
                </Link>
              </div>

              <div className="rounded-2xl border border-[#0099CC]/30 bg-gradient-to-b from-[#0099CC]/10 to-[#6B21FF]/10 backdrop-blur-sm p-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#0099CC] to-transparent" />

                <div className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Voluntary monthly donation
                </div>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>$5</span>
                  <span className="text-gray-500 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>/month</span>
                </div>
                <p
                  className="text-sm text-gray-600 leading-relaxed mb-6"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  This recurring donation is completely optional. It does not buy a membership,
                  unlock content, provide priority service, or change your access to CubitLogic.
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Choose a payment provider
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      aria-label="Donate monthly with a credit card through Stripe"
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === "stripe"
                          ? "border-[#0099CC] bg-[#0099CC]/10 text-[#0099CC]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <CreditCard size={13} />
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      aria-label={`Donate monthly with PayPal${!authUser ? "; CubitLogic sign-in required" : ""}`}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === "paypal"
                          ? "border-[#003087] bg-[#003087]/10 text-[#003087]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.82l-1.35 8.548h3.109c.457 0 .845-.332.917-.784l.038-.196.728-4.617.047-.254a.932.932 0 0 1 .917-.784h.578c3.741 0 6.67-1.52 7.525-5.914.358-1.838.173-3.372-.707-4.594z" />
                      </svg>
                      PayPal{!authUser ? " · Sign in" : ""}
                    </button>
                  </div>
                </div>

                {paymentMethod === "paypal" && !authUser ? (
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-6 rounded-lg font-semibold text-sm transition-all active:scale-[0.97] text-white"
                    style={{
                      background: "linear-gradient(135deg, #003087 0%, #009cde 100%)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Sign In to Continue with PayPal →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleDonation}
                    disabled={isPending}
                    aria-label={`Donate five dollars monthly with ${paymentMethod === "stripe" ? "credit card" : "PayPal"}`}
                    className="block w-full text-center py-3 px-6 rounded-lg font-semibold text-sm transition-all active:scale-[0.97]"
                    style={{
                      background: paymentMethod === "paypal"
                        ? "linear-gradient(135deg, #003087 0%, #009cde 100%)"
                        : "linear-gradient(135deg, #0099CC 0%, #6B21FF 100%)",
                      color: "#ffffff",
                      fontFamily: "'Space Grotesk', sans-serif",
                      opacity: isPending ? 0.7 : 1,
                    }}
                  >
                    {isPending ? "Redirecting..." : "Donate $5 Monthly →"}
                  </button>
                )}

                <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Recurs monthly until canceled. Payment is handled by {paymentMethod === "stripe" ? "Stripe" : "PayPal"}.
                  Cancel through your payment provider or contact support@cubitlogic.com.
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-2xl mx-auto">
              <h2
                className="text-xl font-bold text-gray-900 text-center mb-8"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Common Questions
              </h2>
              <div className="space-y-5">
                {[
                  {
                    q: "Do I have to donate to use CubitLogic?",
                    a: "No. CubitLogic's educational content remains free whether or not you donate.",
                  },
                  {
                    q: "Does a donation unlock anything?",
                    a: "No. A donation is voluntary support, not a purchase. It does not create a membership or provide special access, features, or priority service.",
                  },
                  {
                    q: "What does my donation support?",
                    a: "Donations help with hosting, AI compute, site maintenance, and the creation of new free educational material.",
                  },
                  {
                    q: "Can I stop the monthly donation?",
                    a: "Yes. Cancel future donations through your payment provider or contact support@cubitlogic.com for help.",
                  },
                ].map((item) => (
                  <div key={item.q} className="rounded-xl border border-gray-200 bg-white/80 p-5">
                    <div className="font-semibold text-gray-900 mb-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.q}
                    </div>
                    <div className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
