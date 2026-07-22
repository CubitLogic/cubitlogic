/*
  CUBIT LOGIC — Home Page
  Design: Bioluminescent Quantum Field theme
  Sections: Hero, Stats, Topics Preview, Blog Preview, AI Tutor, Newsletter
*/
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, Atom, BookOpen, Brain, ChevronRight, Rss, Send, Sparkles, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { heroContent, topics, blogPosts, aiTutorIntro } from "@/lib/content";

/* ── Intersection Observer hook for fade-up animations ── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s cubic-bezier(0.23,1,0.32,1), transform 0.7s cubic-bezier(0.23,1,0.32,1)";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── AI Tutor Chat ── */
function AiTutorSection() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; isLimitNotice?: boolean; isFallback?: boolean }[]>([
    { role: "ai", text: "Hello. I'm the Cubit Logic AI Tutor. Ask me anything about quantum computing, quantum mechanics, or quantum AI — at any level." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ref = useFadeUp();

  const chatMutation = trpc.ai.chat.useMutation();

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages
        .filter((m) => m.role !== "ai" || newMessages.indexOf(m) > 0)
        .slice(-10)
        .map((m) => ({ role: m.role === "user" ? "user" as const : "assistant" as const, content: m.text }));
      const result = await chatMutation.mutateAsync({ message: userMsg, history: history.slice(0, -1) });
      if (result.limitReached) {
        setMessages((m) => [...m, { role: "ai", text: "", isLimitNotice: true }]);
      } else {
        setMessages((m) => [...m, {
          role: "ai",
          text: result.reply ?? "CubitAI is temporarily unavailable. Your learning resources are still here.",
          isFallback: !result.reply,
        }]);
      }
    } catch {
      setMessages((m) => [...m, {
        role: "ai",
        text: "CubitAI is temporarily unavailable. Your learning resources are still here.",
        isFallback: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length <= 1) return; // don't scroll on initial load
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  return (
    <section id="ai-tutor" className="relative z-10 py-24 bg-gray-50">
      <div className="container">
        <div ref={ref} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Brain size={18} style={{ color: "#6B21FF" }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#6B21FF]" style={{ fontFamily: "'Orbitron', sans-serif" }}>AI Tutor</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {aiTutorIntro.title}
          </h2>
          <p className="text-gray-500 mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {aiTutorIntro.description}
          </p>

          {/* Chat window */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0099CC] animate-pulse-glow" />
              <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cubit Logic Quantum Tutor — Online</span>
            </div>
            <div className="h-80 overflow-y-auto p-5 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0099CC]/10 border border-[#0099CC]/20 text-gray-900"
                      : msg.isLimitNotice
                        ? "bg-gradient-to-br from-[#6B21FF]/8 to-[#0099CC]/8 border border-[#0099CC]/25 text-gray-800"
                        : "bg-gray-100 border border-gray-200 text-gray-800"
                  }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {msg.role === "ai" && <span className="text-[#6B21FF] font-semibold text-xs block mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>CUBIT AI</span>}
                    {msg.isLimitNotice ? (
                      <div>
                        <p className="mb-3">⚡ You've reached today's 5-question AI Tutor limit.</p>
                        <p className="mb-3 text-gray-600">The limit helps manage AI costs and keep CubitLogic free for everyone. Optional donations help us maintain and improve the site.</p>
                        <Link href="/support" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#050A1A] transition-all active:scale-[0.97]" style={{ background: "linear-gradient(135deg, #00E5FF 0%, #7B2FFF 100%)" }}>Support CubitLogic →</Link>
                      </div>
                    ) : msg.isFallback ? (
                      <div>
                        <p className="mb-3">{msg.text}</p>
                        <a
                          href="https://cubitlogic.com"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#050A1A] transition-all active:scale-[0.97]"
                          style={{ background: "linear-gradient(135deg, #00E5FF 0%, #7B2FFF 100%)" }}
                        >
                          Explore CubitLogic.com →
                        </a>
                      </div>
                    ) : msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#6B21FF]" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={aiTutorIntro.placeholder}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0099CC] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
              <button onClick={send} className="btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm">
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mt-5 flex flex-wrap gap-2">
            {aiTutorIntro.examples.slice(0, 4).map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:text-[#0099CC] hover:border-[#0099CC]/50 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Newsletter Section ── */
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setSubmitted(true);
      setEmail("");
    },
    onError: () => {
      setMessage("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email: email.trim() });
  };

  return (
    <section className="relative z-10 py-24">
      <div className="container max-w-2xl mx-auto text-center">
        <div className="glass-card rounded-2xl p-10 border border-[#00E5FF]/15">
          <Atom size={32} className="mx-auto mb-5 text-[#0099CC]" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Weekly Quantum Breakdowns
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            One quantum concept, explained clearly, every week. No hype, no paywalls. Just the science — from qubits to quantum supremacy.
          </p>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-green-700 font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ✓ {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0099CC] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="btn-primary px-6 py-3 rounded-lg text-sm whitespace-nowrap disabled:opacity-60"
              >
                {subscribe.isPending ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
          {message && !submitted && (
            <p className="text-red-500 text-sm mt-3">{message}</p>
          )}
          <p className="text-xs text-gray-400 mt-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

/* ── News Preview Section ── */
function NewsPreviewSection() {
  const { data } = trpc.news.getFeed.useQuery({ limit: 6 }, { refetchOnWindowFocus: false });
  const items = data?.items ?? [];
  const CAT_COLORS: Record<string, string> = {
    ai: "#6B21FF", quantum: "#0099CC", it: "#0ea5e9",
    security: "#ef4444", space: "#f59e0b", tech: "#10b981",
  };
  const fadeRef = useFadeUp();
  return (
    <section className="relative z-10 py-24 bg-gray-50">
      <div className="container">
        <div ref={fadeRef}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Rss size={16} style={{ color: "#0099CC" }} />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Live News</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>Latest in AI & Quantum</h2>
              <p className="text-gray-500 mt-2 max-w-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Auto-updated hourly from the world's top sources.</p>
            </div>
            <Link href="/news" className="hidden md:flex items-center gap-2 text-sm text-[#0099CC] hover:gap-3 transition-all" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              All News <ArrowRight size={14} />
            </Link>
          </div>
          {items.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="group rounded-xl border border-gray-100 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 block">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: CAT_COLORS[item.category] ?? "#6b7280", backgroundColor: (CAT_COLORS[item.category] ?? "#6b7280") + "15", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.source}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#0099CC] transition-colors leading-snug line-clamp-2"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem" }}>{item.title}</h3>
                </a>
              ))}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-[#0099CC]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              View All News <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main Home Page ── */
export default function Home() {
  const heroRef = useFadeUp();
  const statsRef = useFadeUp();
  const topicsRef = useFadeUp();
  const blogRef = useFadeUp();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-[80vh] md:min-h-screen flex items-center pt-16">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/assets/hero-bg.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
            opacity: 0.35,
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/90 to-transparent" />

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <div ref={heroRef}>
              <div className="flex items-center gap-2 mb-6">
                <Atom size={14} style={{ color: "#0099CC" }} />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {heroContent.eyebrow}
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-black leading-none mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className="text-gray-900">{heroContent.headline}</span>
              </h1>
              <h2 className="text-3xl md:text-6xl font-black leading-none mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className="animate-shimmer">{heroContent.subheadline}</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {heroContent.body}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/topics" className="btn-primary px-7 py-3.5 rounded-lg text-sm flex items-center gap-2">
                  <Zap size={15} />
                  {heroContent.cta_primary}
                </Link>
                <a href="#ai-tutor" className="btn-outline-cyan px-7 py-3.5 rounded-lg text-sm flex items-center gap-2">
                  <Brain size={15} />
                  {heroContent.cta_secondary}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-10 bg-gradient-to-b from-[#0099CC] to-transparent" />
          <span className="text-xs text-gray-400 tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SCROLL</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-16 border-y border-gray-200 bg-gray-50">
        <div className="container">
          <div ref={statsRef} className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {heroContent.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-black text-[#0099CC] mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{stat.value}</div>
                <div className="text-xs text-gray-500 tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOPICS PREVIEW ── */}
      <section className="relative z-10 py-24">
        <div className="container">
          <div ref={topicsRef}>
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} style={{ color: "#0099CC" }} />
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#0099CC]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Core Topics</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Start with the fundamentals.
                </h2>
                <p className="text-gray-500 mt-2 max-w-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Every concept explained from first principles — with the math available for those who want it.
                </p>
              </div>
              <Link href="/topics" className="hidden md:flex items-center gap-2 text-sm text-[#0099CC] hover:gap-3 transition-all" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                All Topics <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.slice(0, 6).map((topic, i) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="glass-card rounded-xl p-6 group transition-all duration-300 hover:-translate-y-1 block"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{topic.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium`}
                      style={{
                        color: topic.color,
                        borderColor: topic.color + "40",
                        backgroundColor: topic.color + "10",
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <h3 className="text-gray-900 font-bold mb-2 group-hover:text-[#0099CC] transition-colors" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem" }}>
                    {topic.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {topic.subtitle}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{topic.readTime} read</span>
                    <ChevronRight size={14} style={{ color: topic.color }} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED QUOTE ── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B21FF]/6 via-transparent to-[#0099CC]/6" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            "Anyone who is not shocked by quantum theory has not understood it."
          </blockquote>
          <cite className="block mt-4 text-gray-500 text-sm not-italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            — Niels Bohr, Father of Quantum Mechanics
          </cite>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="relative z-10 py-24 bg-gray-50">
        <div className="container">
          <div ref={blogRef}>
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} style={{ color: "#6B21FF" }} />
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#6B21FF]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Latest Articles</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Deep dives, no fluff.
                </h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm text-[#6B21FF] hover:gap-3 transition-all" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                All Articles <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 block" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="h-44 overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-white/90 border border-[#6B21FF]/30 text-[#6B21FF] font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-gray-900 font-bold mb-2 group-hover:text-[#0099CC] transition-colors leading-snug" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem" }}>
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span>{post.date}</span>
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI TUTOR ── */}
      <AiTutorSection />

      {/* ── NEWSLETTER ── */}
      <NewsletterSection />

      {/* ── NEWS PREVIEW ── */}
      <NewsPreviewSection />

      <Footer />
    </div>
  );
}
