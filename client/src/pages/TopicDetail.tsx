/*
  CUBIT LOGIC — Topic Detail Page
  Individual lesson page for /topics/:id
*/
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, BarChart2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { topics } from "@/lib/content";

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const topic = topics.find((t) => t.id === id);
  const topicIndex = topics.findIndex((t) => t.id === id);
  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;

  if (!topic) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <Navbar />
        <div className="text-center pt-24">
          <h1 className="text-3xl font-black text-gray-900 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>Topic Not Found</h1>
          <Link href="/topics" className="text-[#0099CC] hover:underline">← Back to all topics</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      <div className="relative z-10 pt-28 pb-24">
        <div className="container max-w-3xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Link href="/topics" className="hover:text-[#0099CC] transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              All Topics
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">{topic.title}</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{topic.icon}</span>
              <span
                className="text-xs px-3 py-1 rounded-full border font-semibold"
                style={{
                  color: topic.color,
                  borderColor: topic.color + "40",
                  backgroundColor: topic.color + "10",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {topic.difficulty}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {topic.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {topic.subtitle}
            </p>
            <div className="flex items-center gap-5 text-sm text-gray-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {topic.readTime} read</span>
              <span className="flex items-center gap-1.5"><BarChart2 size={13} /> {topic.difficulty}</span>
            </div>
          </div>

          {/* Summary box */}
          <div
            className="rounded-xl p-5 mb-10 border-l-4"
            style={{ backgroundColor: topic.color + "08", borderColor: topic.color }}
          >
            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <strong className="text-gray-900">Overview: </strong>{topic.summary}
            </p>
          </div>

          {/* Full body */}
          <div className="prose-quantum" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {topic.body.trim().split("\n").map((line, j) => {
              if (line.startsWith("## ")) return (
                <h2 key={j} className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {line.replace("## ", "")}
                </h2>
              );
              if (line.startsWith("**") && line.endsWith("**")) return (
                <p key={j} className="font-semibold text-[#0099CC] mt-5 mb-1">{line.replace(/\*\*/g, "")}</p>
              );
              if (line.startsWith("- ")) return (
                <li key={j} className="text-gray-600 leading-relaxed ml-5 list-disc mb-1">{line.replace("- ", "")}</li>
              );
              if (line.startsWith("`") && line.endsWith("`")) return (
                <code key={j} className="block bg-gray-50 border border-[#0099CC]/20 rounded-lg px-5 py-4 text-[#0099CC] text-sm my-5 font-mono">
                  {line.replace(/`/g, "")}
                </code>
              );
              if (line.trim() === "") return <div key={j} className="h-3" />;
              return <p key={j} className="text-gray-600 leading-relaxed mb-2">{line}</p>;
            })}
          </div>

          {/* Ask AI Tutor CTA */}
          <div className="mt-12 rounded-xl p-6 bg-gradient-to-r from-[#0099CC]/8 to-[#6B21FF]/8 border border-[#0099CC]/20">
            <h3 className="text-gray-900 font-bold mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Have a question about this topic?
            </h3>
            <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The AI Tutor can answer follow-up questions, explain the math in more depth, or give you a different analogy.
            </p>
            <a
              href="/#ai-tutor"
              className="btn-primary px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2"
            >
              Ask the AI Tutor
            </a>
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            {prevTopic ? (
              <Link
                href={`/topics/${prevTopic.id}`}
                className="glass-card rounded-xl p-4 group hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-xs text-gray-400 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>← Previous</span>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-[#0099CC] transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {prevTopic.title}
                </span>
              </Link>
            ) : <div />}
            {nextTopic ? (
              <Link
                href={`/topics/${nextTopic.id}`}
                className="glass-card rounded-xl p-4 group hover:-translate-y-0.5 transition-transform text-right"
              >
                <span className="text-xs text-gray-400 mb-1 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Next →</span>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-[#0099CC] transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {nextTopic.title}
                </span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
