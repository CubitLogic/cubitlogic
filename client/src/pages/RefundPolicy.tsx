import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="container max-w-3xl mx-auto pt-28 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Refund and Cancellation Policy
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Refund and Cancellation Policy
        </h1>
        <div className="space-y-5 text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <p>Last updated: July 17, 2026</p>
          <p>Voluntary monthly donations may be cancelled at any time. Cancellation stops future donations and does not change your access to Cubit Logic because donations do not purchase membership, content, or special features.</p>
          <p>If you donated by mistake or had a technical problem with a payment, contact support@cubitlogic.com with the email address used for the donation.</p>
          <p>Refund requests are reviewed case by case. Cubit Logic will make a reasonable effort to correct billing problems quickly and fairly.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
