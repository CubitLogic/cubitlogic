import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="container max-w-3xl mx-auto pt-28 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Privacy Policy
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Privacy Policy
        </h1>
        <div className="space-y-5 text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <p>Last updated: July 10, 2026</p>
          <p>Cubit Logic collects only the information needed to operate the site, provide account access, process supporter subscriptions, deliver AI tutor features, and manage newsletter signups.</p>
          <p>Account information may include your name, email address, sign-in provider identifier, subscription status, and basic usage records such as daily AI tutor usage counts.</p>
          <p>Payments are processed by third-party payment providers such as Stripe and PayPal. Cubit Logic does not store full credit card numbers.</p>
          <p>Newsletter email addresses are used to send Cubit Logic updates. You may request removal by contacting support@cubitlogic.com.</p>
          <p>For privacy questions or deletion requests, contact support@cubitlogic.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
