import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronRight, Clock, DollarSign, ExternalLink, Factory, Globe, Lightbulb, PlayCircle, Wrench, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHardwareItem, hardwareItems } from "@/lib/hardwareContent";

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#0099CC",
  Advanced: "#f59e0b",
  Expert: "#ef4444",
};

const CATEGORY_LABELS: Record<string, string> = {
  quantum: "Quantum Processors",
  ai: "AI Hardware",
  cryogenic: "Cryogenic Systems",
  photonic: "Photonics",
  classical: "Classical Computing",
};

export default function HardwareDetail() {
  const params = useParams<{ id: string }>();
  const item = getHardwareItem(params.id);

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Hardware Not Found
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              That piece of equipment doesn't exist in our database yet.
            </p>
            <Link href="/hardware" className="text-[#0099CC] font-semibold hover:underline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Back to Hardware
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const related = item.relatedItems
    .map((id) => hardwareItems.find((h) => h.id === id))
    .filter(Boolean) as typeof hardwareItems;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12" style={{ borderBottom: `3px solid ${item.color}20` }}>
        <div className="container max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Link href="/hardware" className="hover:text-[#0099CC] transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Hardware
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: item.color }}>{CATEGORY_LABELS[item.category] ?? item.category}</span>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ backgroundColor: item.color + "15" }}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    color: item.color,
                    backgroundColor: item.color + "15",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {item.subcategory}
                </span>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    color: DIFFICULTY_COLORS[item.difficulty],
                    backgroundColor: DIFFICULTY_COLORS[item.difficulty] + "15",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {item.difficulty}
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {item.name}
              </h1>
              <p
                className="text-lg font-medium mb-3"
                style={{ color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item.tagline}
              </p>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: main content */}
            <div className="lg:col-span-2 space-y-10">

              {/* How it works */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: item.color }} />
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    How It Works
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.howItWorks}
                </p>
              </div>

              {/* Why it matters */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={16} style={{ color: item.color }} />
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Why It Matters
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.whyItMatters}
                </p>
              </div>

              {/* Challenges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wrench size={16} style={{ color: item.color }} />
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Engineering Challenges
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.challenges}
                </p>
              </div>

              {/* Fun fact */}
              <div
                className="rounded-2xl p-6 border"
                style={{ backgroundColor: item.color + "08", borderColor: item.color + "30" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} style={{ color: item.color }} />
                  <span className="text-sm font-bold" style={{ color: item.color, fontFamily: "'Orbitron', sans-serif" }}>
                    Fun Fact
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.funFact}
                </p>
              </div>

              {/* Manufacturers */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Factory size={16} style={{ color: item.color }} />
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Who Makes It
                  </h2>
                </div>
                <div className="space-y-3">
                  {item.manufacturers.map((mfr) => (
                    <div
                      key={mfr.name}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white"
                          style={{ backgroundColor: item.color, fontFamily: "'Orbitron', sans-serif" }}
                        >
                          {mfr.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {mfr.name}
                          </span>
                          <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {mfr.country}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {mfr.notable}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                          {/* Watch & Learn videos */}
              {item.videos && item.videos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <PlayCircle size={16} style={{ color: item.color }} />
                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      Watch &amp; Learn
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {item.videos.map((vid) => (
                      <a
                        key={vid.url}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white transition-all group"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: item.color + "15" }}
                        >
                          <PlayCircle size={18} style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#0099CC] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {vid.title}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{vid.channel}</span>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock size={10} />
                              <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{vid.duration}</span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={13} className="text-gray-300 group-hover:text-[#0099CC] transition-colors flex-shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Right: sidebar */}
            <div className="space-y-6">

              {/* Cost card */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={15} style={{ color: item.color }} />
                  <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Estimated Cost
                  </span>
                </div>
                <div
                  className="text-xl font-black mb-2"
                  style={{ color: item.color, fontFamily: "'Orbitron', sans-serif" }}
                >
                  {item.estimatedCost}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.costNote}
                </p>
              </div>

              {/* Specs table */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Key Specifications
                </h3>
                <div className="space-y-2.5">
                  {item.specs.map((spec) => (
                    <div key={spec.label} className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {spec.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related hardware */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    Related Hardware
                  </h3>
                  <div className="space-y-2">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/hardware/${rel.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-xl">{rel.icon}</span>
                        <span
                          className="text-sm font-semibold text-gray-700 group-hover:text-[#0099CC] transition-colors flex-1 leading-snug"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {rel.name}
                        </span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0099CC] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Back to hardware */}
      <section className="pb-16">
        <div className="container max-w-4xl">
          <Link
            href="/hardware"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0099CC] transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <ArrowLeft size={14} />
            Back to all hardware
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
