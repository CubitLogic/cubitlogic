import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <main className="container max-w-3xl mx-auto pt-28 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          About Cubit Logic
        </p>
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Quantum and AI education, built for real humans.
        </h1>
        <div className="space-y-5 text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <p>
            Cubit Logic exists to make quantum computing, artificial intelligence, prompt engineering, and next-generation computing hardware easier to understand without sanding off the technical truth.
          </p>
          <p>
            The site combines clear lessons, a focused AI tutor, curated science and technology news, and practical course material for people who want to learn how modern intelligent systems actually work.
          </p>
          <p>
            Public learning content is free, and anyone can create an account. Voluntary monthly supporters help cover hosting, AI compute, site maintenance, and new educational material while receiving enhanced account tools.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
