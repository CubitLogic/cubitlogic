import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Power, Volume2 } from "lucide-react";

const waveformBars = Array.from({ length: 15 }, (_, index) => index);
const orbitParticles = Array.from({ length: 6 }, (_, index) => index);

const QUBIT_GREETING =
  "Hello. I'm Qubit. I can guide you through lessons, explain quantum concepts, and answer your questions. Select Ask Qubit when you're ready.";

function selectNaturalVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferences = [
    "Microsoft Aria Online (Natural)",
    "Microsoft Jenny Online (Natural)",
    "Microsoft Ava Online (Natural)",
    "Microsoft Emma Online (Natural)",
    "Microsoft Sonia Online (Natural)",
    "Microsoft Aria",
    "Microsoft Jenny",
    "Google UK English Female",
    "Google US English",
    "Samantha",
    "Microsoft Zira",
  ];

  for (const name of preferences) {
    const match = english.find((voice) => voice.name.includes(name));
    if (match) return match;
  }

  return english.find((voice) => voice.lang.toLowerCase() === "en-us") ?? english[0] ?? voices[0];
}

type SpeechResponse = {
  available?: boolean;
  audioBase64?: string;
  mimeType?: string;
};

export default function QubitHeroVisual() {
  const [activated, setActivated] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [naturalReady, setNaturalReady] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const naturalAudioRef = useRef<string | null>(null);
  const preloadPromiseRef = useRef<Promise<string | null> | null>(null);

  const stopCurrentVoice = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    utteranceRef.current = null;
    setSpeaking(false);
  }, []);

  const loadNaturalVoice = useCallback(async (): Promise<string | null> => {
    if (naturalAudioRef.current) return naturalAudioRef.current;
    if (preloadPromiseRef.current) return preloadPromiseRef.current;

    preloadPromiseRef.current = fetch("/api/qubit/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: QUBIT_GREETING, emotion: "encouraging" }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as SpeechResponse;
        if (!data.available || !data.audioBase64) return null;
        const audioUrl = `data:${data.mimeType || "audio/mpeg"};base64,${data.audioBase64}`;
        naturalAudioRef.current = audioUrl;
        setNaturalReady(true);
        return audioUrl;
      })
      .catch(() => null)
      .finally(() => {
        preloadPromiseRef.current = null;
      });

    return preloadPromiseRef.current;
  }, []);

  useEffect(() => {
    const browserVoiceAvailable =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setVoiceSupported(browserVoiceAvailable || naturalReady);
    void loadNaturalVoice();
    return () => stopCurrentVoice();
  }, [loadNaturalVoice, naturalReady, stopCurrentVoice]);

  const speakWithBrowserVoice = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceSupported(false);
      setPreparing(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(QUBIT_GREETING);
    const voice = selectNaturalVoice(window.speechSynthesis.getVoices());
    utterance.voice = voice ?? null;
    utterance.lang = voice?.lang || "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1.01;
    utterance.volume = 1;
    utterance.onstart = () => {
      setPreparing(false);
      setSpeaking(true);
    };
    utterance.onend = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setPreparing(false);
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const activateQubit = useCallback(async () => {
    setActivated(true);
    setPreparing(true);
    stopCurrentVoice();

    const audioUrl = await loadNaturalVoice();
    if (!audioUrl) {
      speakWithBrowserVoice();
      return;
    }

    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.onplay = () => {
      setPreparing(false);
      setSpeaking(true);
    };
    audio.onended = () => {
      audioRef.current = null;
      setSpeaking(false);
    };
    audio.onerror = () => {
      audioRef.current = null;
      setSpeaking(false);
      speakWithBrowserVoice();
    };
    audioRef.current = audio;

    try {
      await audio.play();
    } catch {
      audioRef.current = null;
      speakWithBrowserVoice();
    }
  }, [loadNaturalVoice, speakWithBrowserVoice, stopCurrentVoice]);

  const askQubit = useCallback(() => {
    if (typeof document === "undefined") return;
    const tutor = document.querySelector<HTMLElement>("#ai-tutor");
    tutor?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      tutor?.querySelector<HTMLInputElement>("input")?.focus();
    }, 700);
  }, []);

  const status = preparing
    ? "Preparing Qubit's voice"
    : speaking
      ? "Qubit is speaking"
      : activated
        ? naturalReady
          ? "Qubit is active — natural AI-generated voice"
          : voiceSupported
            ? "Qubit is active and ready"
            : "Qubit is active; voice is unavailable in this browser"
        : naturalReady
          ? "Activate Qubit — natural AI-generated voice ready"
          : "Activate Qubit to hear an introduction";

  return (
    <div className="relative mx-auto aspect-square w-[min(86vw,460px)]" aria-label="Interactive Qubit intelligence orb">
      <motion.div
        className="pointer-events-none absolute inset-[4%] rounded-full"
        animate={{
          scale: speaking ? [1, 1.09, 1] : activated ? [1, 1.055, 1] : [1, 1.035, 1],
          opacity: speaking ? [0.62, 1, 0.62] : activated ? [0.56, 0.9, 0.56] : [0.5, 0.82, 0.5],
        }}
        transition={{ duration: speaking ? 0.72 : activated ? 2.2 : 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: activated
            ? "radial-gradient(circle, rgba(0,229,255,.28), rgba(107,33,255,.14) 55%, transparent 72%)"
            : "radial-gradient(circle, rgba(0,229,255,.18), rgba(107,33,255,.08) 55%, transparent 72%)",
          boxShadow: speaking ? "0 0 120px rgba(0,153,204,.48)" : "0 0 90px rgba(0,153,204,.24)",
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-[8%] rounded-full border border-[#0099CC]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: speaking ? 10 : activated ? 18 : 26, repeat: Infinity, ease: "linear" }}
      >
        {orbitParticles.map((particle) => {
          const angle = (particle / orbitParticles.length) * Math.PI * 2;
          const x = 50 + Math.cos(angle) * 50;
          const y = 50 + Math.sin(angle) * 50;
          return (
            <motion.span
              key={particle}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              animate={{ scale: speaking ? [1, 1.7, 1] : activated ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.8 + particle * 0.08, repeat: Infinity, ease: "easeInOut" }}
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
        className="pointer-events-none absolute inset-[16%] rounded-full border border-white/70"
        animate={{ rotate: -360, scale: speaking ? [1, 1.025, 1] : 1 }}
        transition={{ duration: speaking ? 8 : 18, repeat: Infinity, ease: "linear" }}
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
          transition={{ duration: speaking ? 6 : 12, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <button
        type="button"
        onClick={activateQubit}
        className="absolute inset-[16%] z-20 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#00E5FF]/50"
        aria-label={activated ? "Replay Qubit's introduction" : "Activate Qubit"}
      />

      <div className="pointer-events-none absolute inset-[32%] z-10 flex items-center justify-center gap-[5px] overflow-hidden rounded-full">
        {waveformBars.map((bar) => {
          const activeHigh = 22 + ((bar * 17) % 52);
          const idleHigh = 12 + ((bar * 9) % 20);
          const low = 7 + (bar % 4) * 3;
          return (
            <motion.span
              key={bar}
              className="block w-[4px] rounded-full bg-white"
              animate={{
                height: speaking
                  ? [low, activeHigh, low + 4]
                  : activated
                    ? [low, idleHigh, low + 2]
                    : [low, low + 5, low],
                opacity: speaking ? [0.76, 1, 0.8] : [0.62, 0.86, 0.66],
              }}
              transition={{
                duration: speaking ? 0.34 + (bar % 5) * 0.045 : activated ? 0.8 + (bar % 4) * 0.1 : 1.5,
                repeat: Infinity,
                repeatType: "mirror",
                delay: bar * 0.028,
                ease: "easeInOut",
              }}
              style={{ boxShadow: "0 0 9px rgba(255,255,255,.9)" }}
            />
          );
        })}
      </div>

      <div className="absolute bottom-[1%] left-1/2 z-30 w-[min(94%,360px)] -translate-x-1/2 rounded-2xl border border-[#0099CC]/20 bg-white/94 px-4 py-3 text-center shadow-xl backdrop-blur-md">
        <div
          className="text-[10px] font-bold tracking-[0.28em] text-[#6B21FF]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          QUBIT
        </div>
        <p className="mt-1 text-[11px] text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }} aria-live="polite">
          {status}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={activateQubit}
            disabled={preparing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6B21FF] to-[#0099CC] px-3 py-2 text-[11px] font-bold text-white transition-transform active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {speaking ? <Volume2 size={13} /> : <Power size={13} />}
            {preparing ? "Preparing" : speaking ? "Speaking" : activated ? "Hear Qubit again" : "Activate Qubit"}
          </button>
          <button
            type="button"
            onClick={askQubit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0099CC]/30 bg-white px-3 py-2 text-[11px] font-bold text-[#006B93] transition-colors hover:border-[#0099CC]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <MessageCircle size={13} /> Ask Qubit
          </button>
        </div>
      </div>
    </div>
  );
}
