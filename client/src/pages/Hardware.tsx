import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, DollarSign, Factory, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hardwareItems, hardwareCategories } from "@/lib/hardwareContent";

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#0099CC",
  Advanced: "#f59e0b",
  Expert: "#ef4444",
};

export default function Hardware() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? hardwareItems
      : hardwareItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: "#0099CC" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Hardware & Equipment
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              The Physical Machines Behind Quantum & AI
            </h1>
            <p
              className="text-lg text-gray-500 leading-relaxed max-w-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Every qubit needs a refrigerator. Every AI model needs a GPU. This is the hardware — what it
              costs, who makes it, how it works, and why it matters.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {hardwareCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-200 hover:border-gray-400 bg-white"
                }`}
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: cat.color, borderColor: cat.color, fontFamily: "'Space Grotesk', sans-serif" }
                    : { fontFamily: "'Space Grotesk', sans-serif" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/hardware/${item.id}`}
                className="group block rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Color bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: item.color }} />

                <div className="p-6">
                  {/* Icon + category */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        color: DIFFICULTY_COLORS[item.difficulty],
                        backgroundColor: DIFFICULTY_COLORS[item.difficulty] + "15",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Name + tagline */}
                  <h2
                    className="font-black text-gray-900 group-hover:text-[#0099CC] transition-colors mb-2 leading-snug"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem" }}
                  >
                    {item.name}
                  </h2>
                  <p
                    className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {item.tagline}
                  </p>

                  {/* Cost + subcategory */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-gray-400" />
                      <span
                        className="text-xs text-gray-500 font-medium"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.estimatedCost.split(" ")[0] === "Not" ? "Not for sale" : item.estimatedCost.split("–")[0].trim()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Factory size={12} className="text-gray-400" />
                      <span
                        className="text-xs text-gray-400"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.manufacturers.length} maker{item.manufacturers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#0099CC] opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ChevronRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
