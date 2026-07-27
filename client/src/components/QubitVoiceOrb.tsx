import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Square, Volume2 } from "lucide-react";

export type QubitEmotion =
  | "calm"
  | "curious"
  | "encouraging"
  | "confident"
  | "excited"
  | "concerned"
  | "reflective"
  | "urgent";

type VoiceState = "idle" | "speaking" | "paused";
type Palette = {
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  soft: string;
};

const EMOTION_PALETTES: Record<QubitEmotion, Palette> = {
  calm: { label: "Calm", primary: "#0099CC", secondary: "#00E5FF", accent: "#DDFBFF", glow: "rgba(0,153,204,.48)", soft: "rgba(0,153,204,.10)" },
  curious: { label: "Curious", primary: "#6B21FF", secondary: "#A56BFF", accent: "#F0E8FF", glow: "rgba(107,33,255,.48)", soft: "rgba(107,33,255,.10)" },
  encouraging: { label: "Encouraging", primary: "#0E9F8A", secondary: "#35D6BC", accent: "#F2C94C", glow: "rgba(14,159,138,.48)", soft: "rgba(14,159,138,.10)" },
  confident: { label: "Confident", primary: "#1769E0", secondary: "#67B7FF", accent: "#FFFFFF", glow: "rgba(23,105,224,.50)", soft: "rgba(23,105,224,.10)" },
  excited: { label: "Excited", primary: "#00B8D9", secondary: "#7B2FFF", accent: "#F0E8FF", glow: "rgba(79,74,255,.52)", soft: "rgba(79,74,255,.10)" },
  concerned: { label: "Concerned", primary: "#D97706", secondary: "#F5B942", accent: "#FFF4D6", glow: "rgba(217,119,6,.48)", soft: "rgba(217,119,6,.10)" },
  reflective: { label: "Reflective", primary: "#214A8A", secondary: "#4E7AC7", accent: "#DCE9FF", glow: "rgba(33,74,138,.48)", soft: "rgba(33,74,138,.10)" },
  urgent: { label: "Urgent", primary: "#C62828", secondary: "#EF5350", accent: "#FFE5E5", glow: "rgba(198,40,40,.52)", soft: "rgba(198,40,40,.10)" },
};

const keywordScore = (text: string, words: string[]) =>
  words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);

export function inferQubitEmotion(text: string): QubitEmotion {
  const normalized = text.toLowerCase();
  const scores: Record<QubitEmotion, number> = {
    calm: 1,
    curious: keywordScore(normalized, ["why", "how", "explore", "imagine", "curious", "question"]),
    encouraging: keywordScore(normalized, ["good job", "well done", "you can", "let's", "great work", "i can help", "we can"]),
    confident: keywordScore(normalized, ["exactly", "definitely", "the answer is", "this means", "clearly"]),
    excited: keywordScore(normalized, ["exciting", "amazing", "breakthrough", "remarkable", "incredible", "wow"]),
    concerned: keywordScore(normalized, ["careful", "caution", "concern", "risk", "unsafe", "important to note"]),
    reflective: keywordScore(normalized, ["reflect", "consider", "history", "remember", "perspective", "in the past"]),
    urgent: keywordScore(normalized, ["warning", "danger", "urgent", "error", "failed", "unavailable", "disabled", "stop immediately"]),
  };

  return (Object.entries(scores) as [QubitEmotion, number][]).reduce(
    (best, current) => current[1] > best[1] ? current : best,
    ["calm", scores.calm]
  )[0];
}

function cleanSpeechText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitForSpeech(value: string): string[] {
  const text = cleanSpeechText(value);
  if (!text) return [];

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current} ${sentence.trim()}`.trim();
    if (next.length <= 240) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    current = "";

    for (const word of sentence.trim().split(/\s+/)) {
      const wordNext = `${current} ${word}`.trim();
      if (wordNext.length > 220 && current) {
        chunks.push(current);
        current = word;
      } else {
        current = wordNext;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function preferredVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferences = [
    "Microsoft Guy Online",
    "Microsoft Ryan Online",
    "Microsoft David",
    "Microsoft Mark",
    "Google US English",
  ];

  for (const preferred of preferences) {
    const match = english.find((voice) => voice.name.includes(preferred));
    if (match) return match;
  }
  return english.find((voice) => voice.lang.toLowerCase() === "en-us") ?? english[0] ?? voices[0];
}

export type QubitVoiceOrbProps = {
  text: string;
  title?: string;
  emotion?: QubitEmotion;
  autoSpeak?: boolean;
  compact?: boolean;
  className?: string;
};

export default function QubitVoiceOrb({
  text,
  title = "Qubit",
  emotion,
  autoSpeak = false,
  compact = false,
  className = "",
}: QubitVoiceOrbProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [boundaryTick, setBoundaryTick] = useState(0);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const sessionRef = useRef(0);
  const lastAutoSpokenTextRef = useRef("");
  const speakChunkRef = useRef<(index: number, session: number) => void>(() => undefined);

  const resolvedEmotion = emotion ?? inferQubitEmotion(text);
  const palette = EMOTION_PALETTES[resolvedEmotion];

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakChunk = useCallback((index: number, session: number): void => {
    if (typeof window === "undefined" || session !== sessionRef.current) return;
    const chunk = chunksRef.current[index];
    if (!chunk) {
      utteranceRef.current = null;
      setVoiceState("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.voice = preferredVoice(voices) ?? null;
    utterance.lang = utterance.voice?.lang || "en-US";
    utterance.rate = resolvedEmotion === "urgent" ? 1.02 : resolvedEmotion === "reflective" ? 0.88 : 0.94;
    utterance.pitch = resolvedEmotion === "excited" ? 1.04 : 0.96;
    utterance.volume = 1;
    utterance.onstart = () => setVoiceState("speaking");
    utterance.onpause = () => setVoiceState("paused");
    utterance.onresume = () => setVoiceState("speaking");
    utterance.onboundary = () => setBoundaryTick((tick) => tick + 1);
    utterance.onerror = () => {
      if (session === sessionRef.current) setVoiceState("idle");
    };
    utterance.onend = () => {
      if (session !== sessionRef.current) return;
      const nextIndex = index + 1;
      if (nextIndex < chunksRef.current.length) {
        speakChunkRef.current(nextIndex, session);
      } else {
        utteranceRef.current = null;
        setVoiceState("idle");
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [resolvedEmotion, voices]);

  useEffect(() => {
    speakChunkRef.current = speakChunk;
  }, [speakChunk]);

  const start = useCallback(() => {
    if (!supported || typeof window === "undefined") return;
    const chunks = splitForSpeech(text);
    if (chunks.length === 0) return;

    sessionRef.current += 1;
    const session = sessionRef.current;
    window.speechSynthesis.cancel();
    chunksRef.current = chunks;
    setBoundaryTick(0);
    speakChunkRef.current(0, session);
  }, [supported, text]);

  const togglePause = useCallback(() => {
    if (!supported || typeof window === "undefined") return;
    if (voiceState === "idle") start();
    else if (voiceState === "paused") {
      window.speechSynthesis.resume();
      setVoiceState("speaking");
    } else {
      window.speechSynthesis.pause();
      setVoiceState("paused");
    }
  }, [start, supported, voiceState]);

  const stop = useCallback(() => {
    if (!supported || typeof window === "undefined") return;
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    chunksRef.current = [];
    setVoiceState("idle");
  }, [supported]);

  useEffect(() => {
    if (!autoSpeak || !text.trim() || text === lastAutoSpokenTextRef.current) return;
    lastAutoSpokenTextRef.current = text;
    start();
  }, [autoSpeak, start, text]);

  const bars = useMemo(() => Array.from({ length: compact ? 9 : 13 }, (_, index) => index), [compact]);
  const active = voiceState === "speaking";
  const orbSize = compact ? 74 : 104;
  const stateLabel = !supported
    ? "Voice is not supported in this browser"
    : active
      ? "Qubit is speaking"
      : voiceState === "paused"
        ? "Narration paused"
        : "Ready to narrate";

  return (
    <div
      className={`rounded-2xl border p-4 ${compact ? "flex items-center gap-4" : "flex flex-col sm:flex-row items-center gap-5"} ${className}`}
      style={{ borderColor: palette.primary + "33", background: `linear-gradient(135deg, ${palette.soft}, rgba(255,255,255,.96))` }}
    >
      <div className="relative flex-shrink-0" style={{ width: orbSize, height: orbSize }} aria-hidden="true">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: active ? [1, 1.13, 1] : [1, 1.045, 1], opacity: active ? [0.42, 0.75, 0.42] : [0.26, 0.42, 0.26] }}
          transition={{ duration: active ? 0.9 : 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: `0 0 ${compact ? 24 : 38}px ${palette.glow}` }}
        />
        <motion.div
          className="absolute inset-[8%] rounded-full overflow-hidden border"
          animate={{ rotate: active ? 360 : 0 }}
          transition={{ duration: active ? 12 : 28, repeat: Infinity, ease: "linear" }}
          style={{
            borderColor: palette.accent + "99",
            background: `radial-gradient(circle at 35% 28%, #fff 0%, ${palette.accent} 12%, ${palette.secondary} 38%, ${palette.primary} 70%, #050A1A 100%)`,
            boxShadow: `inset 0 0 22px rgba(255,255,255,.55), 0 0 20px ${palette.glow}`,
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 70% 72%, transparent 0 35%, rgba(255,255,255,.65) 37%, transparent 40%)" }} />
        </motion.div>

        <div className="absolute inset-[20%] flex items-center justify-center gap-[3px] overflow-hidden rounded-full">
          {bars.map((index) => {
            const activeHeight = 10 + ((boundaryTick * 7 + index * 11) % (compact ? 28 : 42));
            const idleHeight = 5 + (index % 3) * 2;
            return (
              <motion.span
                key={index}
                className="block rounded-full"
                animate={{ height: active ? [idleHeight, activeHeight, idleHeight + 3] : idleHeight, opacity: active ? [0.72, 1, 0.78] : 0.72 }}
                transition={{ duration: active ? 0.34 + (index % 4) * 0.05 : 0.45, repeat: active ? Infinity : 0, repeatType: "mirror", delay: index * 0.018, ease: "easeInOut" }}
                style={{ width: compact ? 2 : 3, maxHeight: compact ? 35 : 48, background: index % 3 === 0 ? palette.accent : "rgba(255,255,255,.94)", boxShadow: "0 0 6px rgba(255,255,255,.85)" }}
              />
            );
          })}
        </div>
      </div>

      <div className={`min-w-0 flex-1 ${compact ? "" : "text-center sm:text-left"}`}>
        <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
          <Volume2 size={15} style={{ color: palette.primary }} />
          <span className="text-sm font-black text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>{title}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ color: palette.primary, backgroundColor: palette.soft, fontFamily: "'Space Grotesk', sans-serif" }}>
            {palette.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }} aria-live="polite">{stateLabel}</p>

        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <button
            type="button"
            onClick={togglePause}
            disabled={!supported || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97]"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`, fontFamily: "'Space Grotesk', sans-serif" }}
            aria-label={active ? "Pause Qubit narration" : voiceState === "paused" ? "Resume Qubit narration" : "Play Qubit narration"}
          >
            {active ? <Pause size={14} /> : <Play size={14} />}
            {active ? "Pause" : voiceState === "paused" ? "Resume" : "Read aloud"}
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={!supported || voiceState === "idle"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:border-gray-400"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            aria-label="Stop Qubit narration"
          >
            <Square size={12} fill="currentColor" /> Stop
          </button>
        </div>
      </div>
    </div>
  );
}
