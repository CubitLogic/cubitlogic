import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Activity, Atom, Crown, RefreshCw, Shield, ToggleLeft, ToggleRight, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import { useAuth } from "@/_core/hooks/useAuth";

type AdminUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  membership: "free" | "pro";
  loginMethod: string | null;
  createdAt: string;
  lastSignedIn: string;
};

type AuditItem = {
  id: number;
  actorUserId: number;
  action: string;
  targetUserId: number | null;
  metadata: string | null;
  createdAt: string;
};

type AdminData = {
  summary: {
    totalMembers: number;
    proMembers: number;
    administrators: number;
    aiRequestsToday: number;
    aiEnabled: boolean;
    foundryConfigured: boolean;
  };
  users: AdminUser[];
  auditLog: AuditItem[];
};

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The administration request failed.");
  return body;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    setError("");
    try {
      setData(await apiRequest("/api/admin/dashboard") as AdminData);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The owner dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateMembership(member: AdminUser, membership: "free" | "pro") {
    const key = `membership-${member.id}`;
    setSaving(key);
    setError("");
    try {
      await apiRequest(`/api/admin/users/${member.id}/membership`, {
        method: "POST",
        body: JSON.stringify({ membership }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Membership could not be updated.");
    } finally {
      setSaving(null);
    }
  }

  async function updateRole(member: AdminUser, role: "user" | "admin") {
    const key = `role-${member.id}`;
    setSaving(key);
    setError("");
    try {
      await apiRequest(`/api/admin/users/${member.id}/role`, {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Role could not be updated.");
    } finally {
      setSaving(null);
    }
  }

  async function setAiEnabled(enabled: boolean) {
    setSaving("ai");
    setError("");
    try {
      await apiRequest("/api/admin/ai-enabled", {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Qubit AI control could not be updated.");
    } finally {
      setSaving(null);
    }
  }

  if (!authLoading && user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container max-w-xl mx-auto pt-32 pb-20 text-center">
          <Shield className="mx-auto mb-4 text-amber-600" size={38} />
          <h1 className="text-3xl font-black">Owner access required</h1>
          <p className="mt-3 text-gray-500">This area is restricted to Cubit Logic administrators.</p>
          <Link href="/account" className="mt-6 inline-block rounded-lg bg-[#0099CC] px-5 py-3 font-semibold text-white">Return to your account</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ParticleField />
      <Navbar />
      <main className="relative z-10 pt-28 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                <Shield size={15} /> Owner administration
              </div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Cubit Logic control center</h1>
              <p className="mt-2 text-gray-500">Members, access levels, Qubit AI health, and safety controls.</p>
            </div>
            <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-60">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
          {(authLoading || loading) && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-500">Loading owner controls…</div>}

          {!loading && data && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Members", value: data.summary.totalMembers, icon: Users, color: "text-[#0099CC]" },
                  { label: "Pro members", value: data.summary.proMembers, icon: Crown, color: "text-[#6B21FF]" },
                  { label: "Administrators", value: data.summary.administrators, icon: Shield, color: "text-amber-600" },
                  { label: "AI requests today", value: data.summary.aiRequestsToday, icon: Activity, color: "text-emerald-600" },
                  { label: "Foundry", value: data.summary.foundryConfigured ? "Configured" : "Not configured", icon: Atom, color: data.summary.foundryConfigured ? "text-emerald-600" : "text-red-600" },
                ].map(card => (
                  <article key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <card.icon className={`mb-3 ${card.color}`} size={22} />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
                    <p className="mt-1 text-2xl font-black">{card.value}</p>
                  </article>
                ))}
              </section>

              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Emergency Qubit AI control</h2>
                    <p className="mt-1 text-sm text-gray-500">This persistent server-side switch blocks new Qubit requests without exposing credentials or changing the website.</p>
                  </div>
                  <button
                    onClick={() => void setAiEnabled(!data.summary.aiEnabled)}
                    disabled={saving === "ai"}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-60 ${data.summary.aiEnabled ? "bg-emerald-600" : "bg-red-600"}`}
                  >
                    {data.summary.aiEnabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    Qubit AI is {data.summary.aiEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-6">
                  <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Member access</h2>
                  <p className="mt-1 text-sm text-gray-500">The latest 100 accounts are shown. Membership and administrative privileges are enforced by the server.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Membership</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Last sign-in</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.users.map(member => (
                        <tr key={member.id}>
                          <td className="px-5 py-4">
                            <p className="font-semibold">{member.name || "Unnamed member"}</p>
                            <p className="text-xs text-gray-500">{member.email || `User ${member.id}`}</p>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={member.membership}
                              disabled={saving === `membership-${member.id}`}
                              onChange={event => void updateMembership(member, event.target.value as "free" | "pro")}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={member.role}
                              disabled={saving === `role-${member.id}` || member.id === user?.id}
                              onChange={event => void updateRole(member, event.target.value as "user" | "admin")}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{new Date(member.lastSignedIn).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Recent administrative activity</h2>
                <div className="mt-4 space-y-3">
                  {data.auditLog.length === 0 && <p className="text-sm text-gray-500">No administrative changes have been recorded yet.</p>}
                  {data.auditLog.map(item => (
                    <div key={item.id} className="rounded-xl bg-gray-50 p-4 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold">{item.action}</p>
                        <time className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</time>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Actor #{item.actorUserId}{item.targetUserId ? ` · Target #${item.targetUserId}` : ""}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
