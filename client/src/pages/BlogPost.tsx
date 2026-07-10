/*
  CUBIT LOGIC — Blog Post Page
  Full article with formatted content
*/
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { blogPosts } from "@/lib/content";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>Article Not Found</h1>
          <Link href="/blog" className="text-[#0099CC] hover:underline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      <div className="relative z-10 pt-24">
        {/* Hero image */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        </div>

        <div className="container pb-24">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0099CC] transition-colors mb-8 mt-8 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <ArrowLeft size={14} /> Back to Blog
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#6B21FF]/10 border border-[#6B21FF]/30 text-[#B090FF]">
                <Tag size={10} /> {post.category}
              </span>
              <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} read</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {post.title}
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {post.subtitle}
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[#0099CC]/30 via-[#6B21FF]/30 to-transparent mb-10" />

            {/* Article body */}
            <article>
              {post.body.trim().split("\n").map((line, i) => {
                if (line.startsWith("## ")) return (
                  <h2 key={i} className="text-2xl font-bold text-gray-900 mt-12 mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {line.replace("## ", "")}
                  </h2>
                );
                if (line.startsWith("**") && line.endsWith("**")) return (
                  <p key={i} className="font-semibold text-[#0099CC] mt-6 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
                if (line.match(/^\*\*(.+?)\*\*/)) {
                  const parts = line.split(/\*\*(.+?)\*\*/g);
                  return (
                    <p key={i} className="text-gray-600 leading-relaxed mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-gray-900 font-semibold">{part}</strong> : part)}
                    </p>
                  );
                }
                if (line.startsWith("- ")) return (
                  <li key={i} className="text-gray-600 leading-relaxed ml-6 mb-2 list-disc" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {line.replace("- ", "")}
                  </li>
                );
                if (line.startsWith("`") && line.endsWith("`")) return (
                  <code key={i} className="block bg-gray-50 border border-[#0099CC]/20 rounded-lg px-5 py-4 text-[#0099CC] my-6 font-mono text-sm">
                    {line.replace(/`/g, "")}
                  </code>
                );
                if (line.trim() === "") return <div key={i} className="h-4" />;
                return (
                  <p key={i} className="text-gray-600 leading-relaxed mb-3 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {line}
                  </p>
                );
              })}
            </article>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#0099CC]/20 to-transparent my-16" />

            {/* Related posts */}
            {related.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>Continue Reading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {related.map((rp) => (
                    <Link key={rp.slug} href={`/blog/${rp.slug}`} className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                      <div className="h-36 overflow-hidden relative">
                        <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-gray-900 text-sm font-bold group-hover:text-[#0099CC] transition-colors leading-snug" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                          {rp.title}
                        </h4>
                        <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{rp.readTime} read</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
