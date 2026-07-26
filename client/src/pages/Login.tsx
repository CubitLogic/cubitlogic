import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { Atom, LoaderCircle } from "lucide-react";

type Mode = "signin" | "register";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode === "signin" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(mode === "signin" ? { email, password } : { name, email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Please try again.");
        return;
      }
      window.location.assign("/account");
    } catch {
      setError("We could not reach Cubit Logic. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const registering = mode === "register";
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-cyan-950/5">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2 text-slate-900">
          <img src="/assets/cubitlogic-logo.png" alt="Cubit Logic" className="h-10 w-10 rounded-full" />
          <span className="font-bold text-xl tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Cubit<span className="text-[#0099CC]">Logic</span>
          </span>
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0099CC]/10 text-[#0099CC]"><Atom size={20} /></div>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {registering ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {registering ? "Anyone can create a free account—no invitation or payment required." : "Sign in to your member dashboard."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {registering && (
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input value={name} onChange={event => setName(event.target.value)} required autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/15" />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input value={email} onChange={event => setEmail(event.target.value)} required type="email" autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/15" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input value={password} onChange={event => setPassword(event.target.value)} required minLength={registering ? 8 : undefined} type="password" autoComplete={registering ? "new-password" : "current-password"} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#0099CC] focus:ring-2 focus:ring-[#0099CC]/15" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0099CC] to-[#6B21FF] px-4 py-3 font-semibold text-white disabled:opacity-60">
            {submitting && <LoaderCircle size={16} className="animate-spin" />}
            {registering ? "Create account" : "Sign in"}
          </button>
        </form>

        {!registering && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Password recovery will be activated with the site email service. For immediate account help, use the <Link href="/support" className="font-semibold text-[#0099CC] hover:underline">support page</Link>.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          {registering ? "Already have an account?" : "New to Cubit Logic?"}{" "}
          <button onClick={() => { setMode(registering ? "signin" : "register"); setError(""); }} className="font-semibold text-[#0099CC] hover:underline">
            {registering ? "Sign in" : "Create one"}
          </button>
        </p>
      </section>
    </main>
  );
}
