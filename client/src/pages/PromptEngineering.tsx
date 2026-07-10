import { Link } from "wouter";
import { Check, ChevronRight, Clock, Lock, Sparkles, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courseModules, courseSummary } from "@/lib/promptCourseContent";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function PromptEngineering() {
  const { user, isAuthenticated } = useAuth();
  const { data: subData } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isPro = subData?.isPro ?? false;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: "#6B21FF" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase text-[#6B21FF]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Course
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {courseSummary.title}
            </h1>
            <p
              className="text-xl font-semibold mb-4"
              style={{ color: "#6B21FF", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {courseSummary.subtitle}
            </p>
            <p
              className="text-lg text-gray-500 leading-relaxed mb-8 max-w-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {courseSummary.description}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-8">
              {[
                { label: "Modules", value: `${courseSummary.totalModules} total` },
                { label: "Free", value: `${courseSummary.freeModules} modules` },
                { label: "Duration", value: courseSummary.totalDuration },
                { label: "Level", value: courseSummary.level },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-lg font-black text-gray-900"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs text-gray-400 uppercase tracking-wide"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!isPro && (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/prompt-engineering/how-ai-reads-you"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#6B21FF", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Zap size={15} />
                  Start Free (Module 1)
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:border-gray-400 transition-all duration-200 bg-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Unlock All 7 Modules — $5/mo
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
            {isPro && (
              <Link
                href="/prompt-engineering/how-ai-reads-you"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#6B21FF", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Zap size={15} />
                Start Course
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <h2
            className="text-2xl font-black text-gray-900 mb-8"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            What You'll Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "How AI actually processes your input (tokens, context, probability)",
              "Role prompting, chain-of-thought, and step-by-step decomposition",
              "Format control, length control, and reusable output templates",
              "How to fix bad outputs without rewriting from scratch",
              "Few-shot examples and system prompt design",
              "Managing complex multi-turn conversations",
              "Real-world templates for writing, coding, research, and image generation",
              "The most common mistakes and how to avoid them",
              "How to spot and prevent AI hallucinations",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "#6B21FF15" }}
                >
                  <Check size={11} style={{ color: "#6B21FF" }} />
                </div>
                <span
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module list */}
      <section className="py-16">
        <div className="container">
          <h2
            className="text-2xl font-black text-gray-900 mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Course Modules
          </h2>
          <p
            className="text-gray-500 mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Modules 1–2 are free. Modules 3–7 require a Pro subscription.
          </p>

          <div className="space-y-3">
            {courseModules.map((mod) => {
              const isLocked = mod.isPro && !isPro;
              const href = `/prompt-engineering/${mod.id}`;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isLocked
                      ? "border-gray-100 bg-gray-50 opacity-75"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer"
                  }`}
                >
                  <div className="h-1 w-full" style={{ backgroundColor: mod.color }} />
                  <div className="p-5 flex items-center gap-5">
                    {/* Number */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: mod.color, fontFamily: "'Orbitron', sans-serif" }}
                    >
                      {mod.number}
                    </div>

                    {/* Icon + title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{mod.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-black text-gray-900 text-sm"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                          >
                            {mod.title}
                          </span>
                          {!mod.isPro && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                color: "#10b981",
                                backgroundColor: "#10b98115",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              Free
                            </span>
                          )}
                          {mod.isPro && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                color: "#6B21FF",
                                backgroundColor: "#6B21FF15",
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              Pro
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs text-gray-400 truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Clock size={12} className="text-gray-400" />
                      <span
                        className="text-xs text-gray-400"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {mod.duration}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Lock size={14} />
                          <span
                            className="text-xs font-semibold hidden sm:block"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            Pro
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={href}
                          className="flex items-center gap-1 text-xs font-semibold transition-colors"
                          style={{ color: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Start <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          {!isPro && (
            <div
              className="mt-8 rounded-2xl p-8 text-center border"
              style={{ backgroundColor: "#6B21FF08", borderColor: "#6B21FF30" }}
            >
              <Lock size={24} style={{ color: "#6B21FF" }} className="mx-auto mb-3" />
              <h3
                className="text-xl font-black text-gray-900 mb-2"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Unlock All 7 Modules
              </h3>
              <p
                className="text-gray-500 mb-5 max-w-md mx-auto text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Get full access to the complete Prompt Engineering Masterclass plus unlimited AI Tutor
                access for $5/month.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#6B21FF", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Zap size={15} />
                Upgrade to Pro — $5/month
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
