/*
  CUBIT LOGIC — Topics Page
  All quantum topics with expandable full content
*/
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, BarChart2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { topics } from "@/lib/content";

export default function Topics() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      <div className="relative z-10 pt-28 pb-24">
        <div className="container">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC] mb-3 block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Core Topics
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Quantum Intelligence,<br />
              <span className="animate-shimmer">from the ground up.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Every concept explained from first principles. Accessible enough for a curious beginner. Precise enough for a physicist. The math is always available — but never required to understand the idea.
            </p>
          </div>

          {/* Difficulty legend */}
          <div className="flex flex-wrap gap-4 mb-10">
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${level === "Beginner" ? "bg-[#0099CC]" : level === "Intermediate" ? "bg-[#6B21FF]" : "bg-orange-400"}`} />
                <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{level}</span>
              </div>
            ))}
          </div>

          {/* Topics list */}
          <div className="space-y-4">
            {topics.map((topic, i) => (
              <div
                key={topic.id}
                className="glass-card rounded-xl overflow-hidden transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Topic header — always visible */}
                <button
                  className="w-full text-left p-6 flex items-start gap-5 group"
                  onClick={() => setExpanded(expanded === topic.id ? null : topic.id)}
                >
                  <span className="text-4xl flex-shrink-0 mt-1">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-gray-900 font-bold group-hover:text-[#0099CC] transition-colors" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.05rem" }}>
                        {topic.title}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={{ color: topic.color, borderColor: topic.color + "40", backgroundColor: topic.color + "10", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {topic.subtitle}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {topic.readTime}</span>
                      <span className="flex items-center gap-1"><BarChart2 size={11} /> {topic.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1 text-gray-500">
                    {expanded === topic.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Expanded content */}
                {expanded === topic.id && (
                  <div className="border-t border-gray-200 px-6 pb-8 pt-6">
                    {/* Summary box */}
                    <div className="rounded-lg p-4 mb-8 border-l-2" style={{ backgroundColor: topic.color + "08", borderColor: topic.color }}>
                      <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <strong className="text-gray-900">Summary: </strong>{topic.summary}
                      </p>
                    </div>

                    {/* Full body rendered as formatted text */}
                    <div className="prose-quantum" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {topic.body.trim().split("\n").map((line, j) => {
                        if (line.startsWith("## ")) return (
                          <h3 key={j} className="text-xl font-bold text-gray-900 mt-8 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {line.replace("## ", "")}
                          </h3>
                        );
                        if (line.startsWith("**") && line.endsWith("**")) return (
                          <p key={j} className="font-semibold text-[#0099CC] mt-4 mb-1 text-sm">{line.replace(/\*\*/g, "")}</p>
                        );
                        if (line.startsWith("- ")) return (
                          <li key={j} className="text-gray-600 text-sm leading-relaxed ml-4 list-disc">{line.replace("- ", "")}</li>
                        );
                        if (line.startsWith("`") && line.endsWith("`")) return (
                          <code key={j} className="block bg-gray-50 border border-[#0099CC]/20 rounded-lg px-4 py-3 text-[#0099CC] text-sm my-4 font-mono">
                            {line.replace(/`/g, "")}
                          </code>
                        );
                        if (line.trim() === "") return <div key={j} className="h-3" />;
                        return <p key={j} className="text-gray-600 text-sm leading-relaxed">{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
