import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, Zap, Brain, BookOpen, Rss, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Success() {
  const utils = trpc.useUtils();
  const capturePaypalMutation = trpc.paypal.captureSubscription.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  // Refresh auth state so the Pro badge shows immediately.
  // PayPal approval redirects back here with a subscription id; capture it so the DB is upgraded to Pro.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const subscriptionId = params.get("subscription_id") || params.get("subscriptionId");

    if (payment === "paypal" && subscriptionId) {
      capturePaypalMutation.mutate({ subscriptionId });
      return;
    }

    utils.auth.me.invalidate();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      <section className="pt-24 pb-20">
        <div className="container max-w-2xl mx-auto text-center">

          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0099CC20, #6B21FF20)" }}>
              <CheckCircle size={48} style={{ color: "#0099CC" }} />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Welcome to Cubit Logic Pro
          </h1>
          <p className="text-lg text-gray-500 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your subscription is active. You now have unlimited access to the AI Tutor and all Pro features.
          </p>
          <p className="text-sm text-gray-400 mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            A confirmation receipt has been sent to your email address.
          </p>

          {/* What's included */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            {[
              { icon: Brain, title: "Unlimited AI Tutor", desc: "Ask as many questions as you want — no daily cap.", color: "#6B21FF" },
              { icon: BookOpen, title: "Full Topic Library", desc: "Every quantum and AI concept, from beginner to advanced.", color: "#0099CC" },
              { icon: Rss, title: "Personalized News Feed", desc: "Customize your AI, quantum, and tech news sources.", color: "#10b981" },
              { icon: Zap, title: "Priority Updates", desc: "New content and features delivered to Pro members first.", color: "#f59e0b" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20" }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem" }}>{title}</div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#ai-tutor"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0099CC 0%, #6B21FF 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Brain size={16} />
              Start with the AI Tutor
            </Link>
            <Link
              href="/news"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Rss size={16} />
              Explore News Feed
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Manage subscription note */}
          <p className="mt-8 text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            To manage or cancel your subscription, email{" "}
            <a href="mailto:support@cubitlogic.com" className="text-[#0099CC] hover:underline">support@cubitlogic.com</a>
            {" "}or visit your Stripe billing portal.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
