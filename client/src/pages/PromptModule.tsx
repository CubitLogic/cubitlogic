import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, Lock, Sparkles, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCourseModule, courseModules } from "@/lib/promptCourseContent";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function PromptModule() {
  const params = useParams<{ id: string }>();
  const mod = getCourseModule(params.id);
  const { isAuthenticated } = useAuth();
  const { data: subData } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isPro = subData?.isPro ?? false;

  if (!mod) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Module Not Found
            </h1>
            <Link href="/prompt-engineering" className="text-[#6B21FF] font-semibold hover:underline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Back to Course
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isLocked = mod.isPro && !isPro;
  const currentIndex = courseModules.findIndex((m) => m.id === mod.id);
  const prevModule = currentIndex > 0 ? courseModules[currentIndex - 1] : null;
  const nextModule = currentIndex < courseModules.length - 1 ? courseModules[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10" style={{ borderBottom: `3px solid ${mod.color}20` }}>
        <div className="container max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 flex-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Link href="/prompt-engineering" className="hover:text-[#6B21FF] transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Prompt Engineering
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: mod.color }}>Module {mod.number}</span>
          </div>

          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: mod.color + "15" }}
            >
              {mod.icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Module {mod.number} of {courseModules.length}
                </span>
                {!mod.isPro && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: "#10b981", backgroundColor: "#10b98115", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Free
                  </span>
                )}
                {mod.isPro && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: "#6B21FF", backgroundColor: "#6B21FF15", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Pro
                  </span>
                )}
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} />
                  <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{mod.duration}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {mod.title}
              </h1>
              <p className="text-base font-semibold mb-3" style={{ color: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {mod.subtitle}
              </p>
              <p className="text-gray-500 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {mod.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Locked state */}
      {isLocked ? (
        <section className="py-20">
          <div className="container max-w-2xl text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#6B21FF15" }}>
              <Lock size={32} style={{ color: "#6B21FF" }} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Pro Module
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              This module is part of the Pro curriculum. Upgrade to unlock all 7 modules, plus unlimited AI Tutor access and the full personalized news feed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#6B21FF", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Zap size={15} />
                Upgrade to Pro — $5/month
              </Link>
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:border-gray-400 transition-all bg-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <ArrowLeft size={14} />
                Back to Course
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Module content */
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="space-y-12">
              {mod.sections.map((section, sIdx) => (
                <div key={sIdx}>
                  <h2 className="text-xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {section.body}
                  </p>

                  {/* Examples */}
                  {section.examples && section.examples.map((ex, eIdx) => (
                    <div key={eIdx} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={13} style={{ color: mod.color }} />
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                          Example: {ex.label}
                        </span>
                      </div>
                      {ex.bad && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-red-500 mb-1.5 flex items-center gap-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            ✗ Weak prompt
                          </div>
                          <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                            <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono leading-relaxed">{ex.bad}</pre>
                          </div>
                        </div>
                      )}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          ✓ Strong prompt
                        </div>
                        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                          <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono leading-relaxed">{ex.good}</pre>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Why it works</span>
                        <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ex.explanation}</p>
                      </div>
                    </div>
                  ))}

                  {/* Tips */}
                  {section.tips && (
                    <div className="rounded-2xl border p-5" style={{ backgroundColor: mod.color + "08", borderColor: mod.color + "25" }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        Quick Tips
                      </div>
                      <ul className="space-y-2">
                        {section.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span style={{ color: mod.color }} className="mt-0.5 flex-shrink-0">→</span>
                            <span className="text-sm text-gray-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Key Takeaways */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="font-black text-gray-900 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  {mod.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-black"
                        style={{ backgroundColor: mod.color, fontFamily: "'Orbitron', sans-serif" }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Challenge */}
              <div className="rounded-2xl border p-6" style={{ backgroundColor: mod.color + "08", borderColor: mod.color + "30" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} style={{ color: mod.color }} />
                  <span className="font-black text-sm" style={{ color: mod.color, fontFamily: "'Orbitron', sans-serif" }}>
                    Practice Challenge
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {mod.practiceChallenge}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
              {prevModule ? (
                <Link
                  href={`/prompt-engineering/${prevModule.id}`}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <ArrowLeft size={14} />
                  <div>
                    <div className="text-xs text-gray-400">Previous</div>
                    <div>{prevModule.title}</div>
                  </div>
                </Link>
              ) : <div />}

              {nextModule ? (
                <Link
                  href={`/prompt-engineering/${nextModule.id}`}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    nextModule.isPro && !isPro ? "text-gray-400 cursor-default" : "hover:opacity-80"
                  }`}
                  style={{ color: nextModule.isPro && !isPro ? undefined : mod.color, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Next</div>
                    <div className="flex items-center gap-1">
                      {nextModule.title}
                      {nextModule.isPro && !isPro && <Lock size={11} />}
                    </div>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  href="/prompt-engineering"
                  className="flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: mod.color, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Finished!</div>
                    <div>Back to Course</div>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
