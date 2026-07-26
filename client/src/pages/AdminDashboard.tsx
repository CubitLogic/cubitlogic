import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Activity, Atom, Check, ClipboardCopy, Crown, RefreshCw, Shield, ToggleLeft, ToggleRight, Users } from "lucide-react";
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
  aiAccess: "automatic" | "enabled" | "disabled";
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
    supporterMembers: number;
    administrators: number;
    aiRequestsToday: number;
    aiEnabled: boolean;
    foundryConfigured: boolean;
    currentUserIsOwner: boolean;
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

function buildChatGptHandoff(data: AdminData): string {
  return `CUBIT LOGIC PROJECT HANDOFF

Website: https://cubitlogic.com
GitHub: https://github.com/CubitLogic/cubitlogic

Non-negotiable access rules:
- Anyone may create a free account. No invitation or payment is required.
- Public educational content remains available without payment.
- Standard, supporter, and administrator status are separate.
- A successful linked Stripe or PayPal recurring contribution activates supporter status.
- Qubit AI access is controlled per member as Automatic, On (unlimited), or Off.
- Automatic gives standard members the normal allowance and active supporters enhanced access.
- A donation never grants administrator access.
- Only the configured Cubit Logic owner may approve or remove administrators.
- Approved administrators cannot create additional administrators.
- Never expose credentials, payment details, database values, or hosting secrets.

Current owner-dashboard snapshot:
- Members: ${data.summary.totalMembers}
- Supporters: ${data.summary.supporterMembers}
- Administrators: ${data.summary.administrators}
- Qubit AI requests today: ${data.summary.aiRequestsToday}
- Qubit AI global switch: ${data.summary.aiEnabled ? "ON" : "OFF"}
- Microsoft Foundry connection: ${data.summary.foundryConfigured ? "configured" : "not configured"}

Current direction:
- Build a step-by-step course on designing an AI with Microsoft Foundry and Azure.
- Develop sponsor relationships that fit independent AI and quantum education.
- Add carefully selected affiliate income with clear, nearby disclosures.

Working rules for ChatGPT:
- Treat GitHub main as the code source of truth.
- Distinguish local, pushed, merged, deployed, and live-verified status.
- Do not say a feature is live until https://cubitlogic.com has been checked.
- Keep recommendations educationally independent and clearly label paid relationships.
- Ask Bryon before any external message, purchase, account application, or public commitment.`;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [handoffCopied, setHandoffCopied] = useState(false);

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

  async function updateAiAccess(member: AdminUser, mode: AdminUser["aiAccess"]) {
    const key = `ai-access-${member.id}`;
    setSaving(key);
    setError("");
    try {
      await apiRequest(`/api/admin/users/${member.id}/ai-access`, {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Member Qubit AI access could not be updated.");
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

  async function copyChatGptHandoff() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(buildChatGptHandoff(data));
      setHandoffCopied(true);
      window.setTimeout(() => setHandoffCopied(false), 2500);
    } catch {
      setError("The handoff could not be copied automatically. Please try again.");
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
                  { label: "Supporters", value: data.summary.supporterMembers, icon: Crown, color: "text-[#6B21FF]" },
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

              <section className="mt-6 overflow-hidden rounded-2xl border border-violet-300 bg-gradient-to-br from-violet-950 via-[#32106b] to-[#6B21FF] p-6 text-white shadow-lg shadow-violet-950/15">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                      <ClipboardCopy size={15} /> ChatGPT handoff
                    </div>
                    <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Carry the project context with you</h2>
                    <p className="mt-2 text-sm leading-relaxed text-violet-100">
                      Copy a sanitized project brief for regular ChatGPT. It includes the access rules, live dashboard counts, repository links, and next priorities—but never credentials, payment data, or hosting secrets.
                    </p>
                  </div>
                  <button
                    onClick={() => void copyChatGptHandoff()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-900 shadow-sm transition hover:bg-violet-50"
                  >
                    {handoffCopied ? <Check size={18} /> : <ClipboardCopy size={18} />}
                    {handoffCopied ? "Copied" : "Copy for ChatGPT"}
                  </button>
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-6">
                  <h2 className="text-xl font-black" style={{ fontFamily: "'Orbitron', sans-serif" }}>Member access</h2>
                  <p className="mt-1 text-sm text-gray-500">The latest 100 accounts are shown. Support status, Qubit AI access, and administrator approval are separate server-side controls.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Support status</th>
                        <th className="px-5 py-3">Qubit AI</th>
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
                              <option value="free">Standard</option>
                              <option value="pro">Supporter</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={member.aiAccess}
                              disabled={saving === `ai-access-${member.id}`}
                              onChange={event => void updateAiAccess(member, event.target.value as AdminUser["aiAccess"])}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              <option value="automatic">Automatic</option>
                              <option value="enabled">On (unlimited)</option>
                              <option value="disabled">Off</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={member.role}
                              disabled={!data.summary.currentUserIsOwner || saving === `role-${member.id}` || member.id === user?.id}
                              onChange={event => void updateRole(member, event.target.value as "user" | "admin")}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {!data.summary.currentUserIsOwner && (
                              <p className="mt-1 text-xs text-gray-400">Owner approval required</p>
                            )}
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
