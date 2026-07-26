import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Brain, CheckCircle, Heart, Server } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Success() {
  const capturePayPal = trpc.paypal.captureSubscription.useMutation();
  const attemptedPayPalCapture = useRef(false);
  const [supporterMessage, setSupporterMessage] = useState(
    "Your payment provider is confirming your voluntary monthly support.",
  );

  useEffect(() => {
    if (attemptedPayPalCapture.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "paypal") return;
    const subscriptionId = params.get("subscription_id") || params.get("token");
    if (!subscriptionId) {
      setSupporterMessage("PayPal returned without a subscription ID. Please contact support so we can verify your contribution.");
      return;
    }

    attemptedPayPalCapture.current = true;
    void capturePayPal.mutateAsync({ subscriptionId })
      .then(() => setSupporterMessage("Your PayPal support is confirmed and supporter access is active on your account."))
      .catch(() => setSupporterMessage("PayPal confirmation is still pending. Public learning remains available; contact support if your account does not update."));
  }, [capturePayPal]);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      <section className="pt-24 pb-20">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0099CC20, #6B21FF20)" }}
            >
              <CheckCircle size={48} style={{ color: "#0099CC" }} />
            </div>
          </div>

          <h1
            className="text-3xl md:text-4xl font-black text-gray-900 mb-3"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Thank you for supporting CubitLogic
          </h1>
          <p className="text-lg text-gray-500 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {supporterMessage}
          </p>
          <p className="text-sm text-gray-400 mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            You should receive a receipt or confirmation from the payment provider when it is complete.
          </p>

          <div className="rounded-2xl border border-[#0099CC]/20 bg-gradient-to-br from-[#0099CC]/5 to-[#6B21FF]/5 p-6 mb-10 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={18} className="text-[#0099CC]" />
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Your donation helps fund
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Server, title: "Site hosting" },
                { icon: Brain, title: "AI compute" },
                { icon: BookOpen, title: "Free lessons" },
              ].map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 p-3">
                  <Icon size={16} className="text-[#0099CC] shrink-0" />
                  <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Public CubitLogic learning remains free. Once payment confirmation is linked to your account,
            supporter status and enhanced account tools stay active while your monthly support remains active.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0099CC 0%, #6B21FF 100%)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Continue Learning
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/support"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Review Donation Details
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            To stop future monthly donations or get help with a payment, contact your payment provider or email{" "}
            <a href="mailto:support@cubitlogic.com" className="text-[#0099CC] hover:underline">
              support@cubitlogic.com
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
