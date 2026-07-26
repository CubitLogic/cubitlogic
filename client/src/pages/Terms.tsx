import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="container max-w-3xl mx-auto pt-28 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Terms of Use
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Terms of Use
        </h1>
        <div className="space-y-5 text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <p>Last updated: July 17, 2026</p>
          <p>Cubit Logic provides educational content, AI-assisted explanations, curated news, and related learning resources. The content is for education and general information only.</p>
          <p>You agree not to abuse the AI tutor, attempt unauthorized access, interfere with site operation, scrape content at abusive rates, or use the service for unlawful activity.</p>
          <p>Cubit Logic may accept voluntary monthly support to help fund hosting, AI compute, maintenance, and new educational content. A successfully linked recurring contribution may activate supporter status and enhanced account-based tools. Public educational content remains available without payment.</p>
          <p>Recurring support continues until you cancel it through the payment provider or ask Cubit Logic support for help. When recurring support becomes inactive, supporter status and related account tools may return to the standard level. The site owner may also enable or disable account features for safety, support, or operational reasons.</p>
          <p>The site is provided as-is without a guarantee that every explanation, external feed item, or AI response is complete or error-free. Verify high-stakes technical, financial, medical, or legal decisions independently. Yes, reality remains annoyingly non-optional.</p>
          <p>Questions may be sent to support@cubitlogic.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
