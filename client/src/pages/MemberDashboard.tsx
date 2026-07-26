import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Atom, CalendarDays, Gauge, LogOut, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { useAuth } from "@/_core/hooks/useAuth";

type DashboardData = {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    role: "user" | "admin";
    membership: "free" | "pro";
    supporter: boolean;
    loginMethod: string | null;
    createdAt: string;
    lastSignedIn: string;
  };
  aiUsage: {
    date: string;
    usedToday: number;
    accessMode: "automatic" | "enabled" | "disabled";
    enabled: boolean;
    source: "free" | "supporter" | "owner_enabled" | "owner_disabled";
    limit: number | null;
    remaining: number | null;
  };
};

export default function MemberDashboard() {
  const { user, loading: authLoading, logout } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetch("/api/member/dashboard", { credentials: "include" })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "Account details could not be loaded.");
        return body as DashboardData;
      })
      .then(body => {
        if (!cancelled) setData(body);
      })
      .catch(reason => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Account details could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function signOut() {
    await logout();
    window.location.assign("/");
  }

  const busy = authLoading || loading;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ParticleField />
      <Navbar />
      <main className="relative z-10 pt-28 pb-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0099CC]">
                <UserRound size={15} /> Member account
              </div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Welcome, {data?.user.name || user?.name || "member"}
              </h1>
              <p className="mt-2 text-gray-500">Your Cubit Logic account, support status, and Qubit AI access in one place.</p>
            </div>
            <button onClick={signOut} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-red-300 hover:text-red-600">
              <LogOut size={16} /> Sign out
            </button>
          </div>

          {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
          {busy && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-500">Loading your account…</div>}

          {!busy && data && (
            <>
              <section className="grid gap-5 md:grid-cols-3">
                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <ShieldCheck className="mb-4 text-[#0099CC]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Support status</p>
                  <p className="mt-2 text-2xl font-black">{data.user.supporter ? "Supporter" : "Standard"}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {data.user.supporter ? "Active recurring support is recorded on this account." : "All public lessons remain available without payment."}
                  </p>
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <Gauge className="mb-4 text-[#6B21FF]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Qubit usage today</p>
                  <p className="mt-2 text-2xl font-black">
                    {data.aiUsage.usedToday}{data.aiUsage.limit === null ? "" : ` / ${data.aiUsage.limit}`}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {!data.aiUsage.enabled
                      ? "Access is turned off for this account"
                      : data.aiUsage.remaining === null
                        ? data.aiUsage.source === "supporter" ? "Enhanced supporter access" : "Owner-enabled access"
                        : `${data.aiUsage.remaining} questions remaining today`}
                  </p>
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <CalendarDays className="mb-4 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Member since</p>
                  <p className="mt-2 text-xl font-black">{new Date(data.user.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-gray-500">Signed in with {data.user.loginMethod || "your Cubit Logic account"}.</p>
                </article>
              </section>

              <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    <Atom size={20} className="text-[#0099CC]" /> Account details
                  </h2>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <dt className="text-xs uppercase tracking-wider text-gray-400">Name</dt>
                      <dd className="mt-1 font-semibold">{data.user.name || "Not provided"}</dd>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <dt className="text-xs uppercase tracking-wider text-gray-400">Email</dt>
                      <dd className="mt-1 break-all font-semibold">{data.user.email || "Not provided"}</dd>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <dt className="text-xs uppercase tracking-wider text-gray-400">Role</dt>
                      <dd className="mt-1 font-semibold capitalize">{data.user.role}</dd>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <dt className="text-xs uppercase tracking-wider text-gray-400">Last sign-in</dt>
                      <dd className="mt-1 font-semibold">{new Date(data.user.lastSignedIn).toLocaleString()}</dd>
                    </div>
                  </dl>
                </article>

                <article className="rounded-2xl border border-[#0099CC]/25 bg-gradient-to-br from-[#0099CC]/10 to-[#6B21FF]/10 p-6">
                  <Sparkles className="mb-4 text-[#6B21FF]" />
                  <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Continue learning</h2>
                  <div className="mt-5 flex flex-col gap-3">
                    {data.aiUsage.enabled && (
                      <a href="/#ai-tutor" className="rounded-lg bg-gradient-to-r from-[#0099CC] to-[#6B21FF] px-4 py-3 text-center font-semibold text-white">Open Qubit AI</a>
                    )}
                    <Link href="/topics" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center font-semibold">Browse topics</Link>
                    <Link href="/support" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center font-semibold">Support Cubit Logic</Link>
                    {data.user.role === "admin" && (
                      <Link href="/admin" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-800">Open owner dashboard</Link>
                    )}
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
