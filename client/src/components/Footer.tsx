/*
  CUBIT LOGIC — Footer
  Light theme with real navigation links and accessible social icons
*/
import { Atom, Twitter, Github, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-gray-200 bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/cubitlogic-logo.png"
                alt="Cubit Logic logo"
                className="w-8 h-8 object-contain rounded-full"
              />
              <span
                className="font-bold text-lg text-gray-900 tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Cubit<span style={{ color: "#0099CC" }}>Logic</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The clearest path into quantum intelligence. Explore quantum mechanics, AI, and the future of computing — explained for humans.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a
                href="https://twitter.com/cubitlogic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Cubit Logic on Twitter"
                className="text-gray-400 hover:text-[#0099CC] transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com/cubitlogic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cubit Logic on GitHub"
                className="text-gray-400 hover:text-[#0099CC] transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:admin@cubitlogic.com"
                aria-label="Email Cubit Logic at admin@cubitlogic.com"
                className="text-gray-400 hover:text-[#0099CC] transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-gray-900 text-sm font-semibold mb-4 tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>Learn</h4>
            <ul className="space-y-2">
              <li><Link href="/topics/qubits" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What is a Qubit?</Link></li>
              <li><Link href="/topics/superposition" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Superposition Explained</Link></li>
              <li><Link href="/topics/entanglement" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quantum Entanglement</Link></li>
              <li><Link href="/topics/quantum-ml" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quantum ML 101</Link></li>
              <li><Link href="/topics/quantum-algorithms" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quantum Algorithms</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-gray-900 text-sm font-semibold mb-4 tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Blog</Link></li>
              <li><a href="/#ai-tutor" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Tutor</a></li>
              <li><Link href="/news" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>News Feed</Link></li>
              <li><Link href="/hardware" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hardware Lab</Link></li>
              <li><Link href="/prompt-engineering" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Prompt Course</Link></li>
              <li><Link href="/pricing" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>❤️ Support Us</Link></li>
              <li><a href="mailto:admin@cubitlogic.com" className="text-gray-500 hover:text-[#0099CC] text-sm transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            © 2026 Cubit Logic. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Atom size={12} className="text-[#0099CC]" />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Where quantum theory meets machine learning.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
