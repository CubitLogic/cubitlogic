/*
  CUBIT LOGIC — Navbar
  Design: Dark glass nav, sticky on scroll, cyan accent, Orbitron brand name
  Logo: Cubit Logic sphere icon + wordmark
*/
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Atom, Shield, UserRound } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { trpc } from "@/lib/trpc";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Topics", href: "/topics" },
  { label: "Hardware", href: "/hardware" },
  { label: "Prompt Course", href: "/prompt-engineering" },
  { label: "Blog", href: "/blog" },
  { label: "AI Tutor", href: "/#ai-tutor" },
  { label: "News", href: "/news" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <img
              src="/assets/cubitlogic-logo.png"
              alt="Cubit Logic"
              className="w-9 h-9 object-contain rounded-full"
            />
          </div>
          <span
            className="font-bold text-lg tracking-wider text-gray-900"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Cubit<span style={{ color: "#0099CC" }}>Logic</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                location === link.href ? "text-[#0099CC]" : "text-gray-600 hover:text-gray-900"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user && <NotificationBell />}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              aria-label="Owner dashboard"
              className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:border-amber-300"
            >
              <Shield size={16} />
            </Link>
          )}
          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#0099CC] hover:text-[#0099CC]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <UserRound size={15} />
            {user ? "Account" : "Sign in"}
          </Link>
          <a href="/#ai-tutor" className="btn-primary px-5 py-2 rounded-md text-sm flex items-center gap-2">
            <Atom size={14} />
            Ask Qubit
          </a>
        </div>

        <div className="md:hidden flex items-center gap-1">
          {user && <NotificationBell />}
          <button
            className="text-gray-700 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-3 shadow-lg">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:text-[#0099CC] text-base font-medium py-2 border-b border-gray-100"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-5 py-2 text-sm font-semibold"
          >
            <UserRound size={15} /> {user ? "My account" : "Sign in or register"}
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-800"
            >
              <Shield size={15} /> Owner dashboard
            </Link>
          )}
          <a
            href="/#ai-tutor"
            className="btn-primary px-5 py-2 rounded-md text-sm text-center mt-1"
            onClick={() => setMobileOpen(false)}
          >
            Ask Qubit
          </a>
        </div>
      )}
    </header>
  );
}
