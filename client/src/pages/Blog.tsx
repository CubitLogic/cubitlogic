/*
  CUBIT LOGIC — Blog Page
  Article listing with category filters
*/
import { Link } from "wouter";
import { ArrowRight, Clock, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { blogPosts } from "@/lib/content";

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ParticleField />
      <Navbar />

      <div className="relative z-10 pt-28 pb-24">
        <div className="container">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#6B21FF] mb-3 block" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              The Cubit Logic Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Deep dives.<br />
              <span className="animate-shimmer">No fluff.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quantum computing, quantum AI, and the science shaping the next decade — written for curious minds at every level.
            </p>
          </div>

          {/* Featured post */}
          <Link href={`/blog/${blogPosts[0].slug}`} className="block glass-card rounded-2xl overflow-hidden mb-8 group hover:-translate-y-1 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-auto overflow-hidden relative">
                <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent md:hidden" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0099CC]/10 border border-[#0099CC]/30 text-[#0099CC]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Featured
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#6B21FF]/10 border border-[#6B21FF]/30 text-[#B090FF]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {blogPosts[0].category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#0099CC] transition-colors leading-snug" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {blogPosts[0].readTime}</span>
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-[#0099CC]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Read <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                <div className="h-48 overflow-hidden relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    <Tag size={10} style={{ color: "#B090FF" }} />
                    <span className="text-xs text-[#B090FF]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{post.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-gray-900 font-bold mb-2 group-hover:text-[#0099CC] transition-colors leading-snug" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem" }}>
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
