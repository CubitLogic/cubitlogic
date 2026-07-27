import { motion } from "framer-motion";
import { Atom, Binary, BrainCircuit, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export type ArticleSlug =
  | "what-is-quantum-intelligence"
  | "qubits-vs-bits-explained"
  | "post-quantum-cryptography";

type CubitArticleVisualProps = {
  slug: ArticleSlug;
};

const nodes = Array.from({ length: 9 }, (_, index) => index);
const bits = ["0", "1", "1", "0", "1", "0", "0", "1"];

export default function CubitArticleVisual({ slug }: CubitArticleVisualProps) {
  if (slug === "qubits-vs-bits-explained") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 via-[#081c3b] to-[#102c65]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(0,229,255,.24),transparent_28%)]" />
        <div className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-center border-r border-white/10 bg-black/10">
          <div className="grid grid-cols-4 gap-2 opacity-80">
            {bits.map((bit, index) => (
              <motion.span
                key={`${bit}-${index}`}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.12 }}
                className="font-mono text-xl font-bold text-cyan-100"
              >
                {bit}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-200/50"
            style={{ boxShadow: "0 0 40px rgba(0,229,255,.38), inset 0 0 26px rgba(107,33,255,.35)" }}
          >
            <div className="absolute inset-3 rounded-full border border-violet-300/40" />
            <Atom className="text-white" size={42} />
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white backdrop-blur-sm">
          <Binary size={12} /> BITS VS QUBITS
        </div>
      </div>
    );
  }

  if (slug === "post-quantum-cryptography") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#071827] via-[#083b4c] to-[#0d695e]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {nodes.map((node) => (
          <motion.span
            key={node}
            animate={{ opacity: [0.18, 0.7, 0.18], scale: [0.8, 1.25, 0.8] }}
            transition={{ duration: 2.2 + (node % 3) * 0.4, repeat: Infinity, delay: node * 0.15 }}
            className="absolute h-1.5 w-1.5 rounded-full bg-emerald-200"
            style={{
              left: `${12 + ((node * 31) % 78)}%`,
              top: `${14 + ((node * 23) % 70)}%`,
              boxShadow: "0 0 10px rgba(167,243,208,.9)",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-emerald-200/40 bg-emerald-300/10 backdrop-blur-sm"
            style={{ boxShadow: "0 0 50px rgba(16,185,129,.32), inset 0 0 24px rgba(255,255,255,.12)" }}
          >
            <ShieldCheck size={66} className="text-emerald-100" />
            <LockKeyhole size={24} className="absolute text-white" />
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-4 rounded-full border border-emerald-200/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-emerald-50 backdrop-blur-sm">
          POST-QUANTUM SECURITY
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#070b2b] via-[#24106b] to-[#006a91]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,229,255,.28),transparent_34%)]" />
      {nodes.map((node) => {
        const angle = (node / nodes.length) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 37;
        const y = 50 + Math.sin(angle) * 37;
        return (
          <motion.span
            key={node}
            animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.7 + (node % 4) * 0.25, repeat: Infinity, delay: node * 0.1 }}
            className="absolute h-2 w-2 rounded-full bg-white"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              boxShadow:
                node % 2
                  ? "0 0 14px rgba(123,47,255,.95)"
                  : "0 0 14px rgba(0,229,255,.95)",
            }}
          />
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/35"
          style={{
            background:
              "radial-gradient(circle at 35% 28%, #fff 0%, #bff7ff 10%, #31bce8 35%, #6b21ff 70%, #071027 100%)",
            boxShadow:
              "0 0 50px rgba(0,229,255,.38), 0 0 85px rgba(107,33,255,.28), inset 0 0 30px rgba(255,255,255,.45)",
          }}
        >
          <BrainCircuit size={54} className="text-white" />
          <Sparkles size={20} className="absolute right-3 top-3 text-cyan-100" />
        </motion.div>
      </div>
      <div className="absolute bottom-3 left-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white backdrop-blur-sm">
        QUANTUM INTELLIGENCE
      </div>
    </div>
  );
}
