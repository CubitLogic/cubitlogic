import { motion } from "framer-motion";

const waveformBars = Array.from({ length: 15 }, (_, index) => index);
const orbitParticles = Array.from({ length: 6 }, (_, index) => index);

export default function QubitHeroVisual() {
  return (
    <div
      className="relative mx-auto aspect-square w-[min(86vw,460px)]"
      role="img"
      aria-label="Animated Qubit intelligence orb"
    >
      <motion.div
        className="absolute inset-[4%] rounded-full"
        animate={{ scale: [1, 1.035, 1], opacity: [0.5, 0.82, 0.5] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, rgba(0,229,255,.18), rgba(107,33,255,.08) 55%, transparent 72%)",
          boxShadow: "0 0 90px rgba(0,153,204,.24)",
        }}
      />

      <motion.div
        className="absolute inset-[8%] rounded-full border border-[#0099CC]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {orbitParticles.map((particle) => {
          const angle = (particle / orbitParticles.length) * Math.PI * 2;
          const x = 50 + Math.cos(angle) * 50;
          const y = 50 + Math.sin(angle) * 50;
          return (
            <span
              key={particle}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                boxShadow:
                  particle % 2 === 0
                    ? "0 0 14px rgba(0,229,255,.95)"
                    : "0 0 14px rgba(123,47,255,.95)",
              }}
            />
          );
        })}
      </motion.div>

      <motion.div
        className="absolute inset-[16%] rounded-full border border-white/70"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "radial-gradient(circle at 32% 24%, #ffffff 0%, #d9fbff 8%, #59d8ff 24%, #1b8ee8 43%, #6b21ff 68%, #050a1a 100%)",
          boxShadow:
            "inset 0 0 38px rgba(255,255,255,.68), inset -18px -24px 45px rgba(5,10,26,.58), 0 0 55px rgba(0,153,204,.48), 0 0 95px rgba(107,33,255,.25)",
        }}
      >
        <div
          className="absolute inset-[7%] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at 68% 73%, transparent 0 34%, rgba(255,255,255,.88) 36%, transparent 39%)",
          }}
        />
        <motion.div
          className="absolute inset-[10%] rounded-full border border-white/35"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <div className="absolute inset-[32%] flex items-center justify-center gap-[5px] overflow-hidden rounded-full">
        {waveformBars.map((bar) => {
          const high = 18 + ((bar * 17) % 48);
          const low = 7 + (bar % 4) * 3;
          return (
            <motion.span
              key={bar}
              className="block w-[4px] rounded-full bg-white"
              animate={{ height: [low, high, low + 4], opacity: [0.7, 1, 0.76] }}
              transition={{
                duration: 0.6 + (bar % 5) * 0.08,
                repeat: Infinity,
                repeatType: "mirror",
                delay: bar * 0.035,
                ease: "easeInOut",
              }}
              style={{ boxShadow: "0 0 9px rgba(255,255,255,.9)" }}
            />
          );
        })}
      </div>

      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 rounded-full border border-[#0099CC]/20 bg-white/90 px-5 py-2 text-center shadow-lg backdrop-blur-md">
        <div
          className="text-[10px] font-bold tracking-[0.28em] text-[#6B21FF]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          QUBIT
        </div>
        <div
          className="mt-0.5 text-[11px] text-gray-500"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Learn. Ask. Explore.
        </div>
      </div>
    </div>
  );
}
