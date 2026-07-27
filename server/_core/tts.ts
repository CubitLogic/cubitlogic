import { createHash } from "node:crypto";
import { ENV } from "./env";

export type QubitSpeechEmotion =
  | "calm"
  | "curious"
  | "encouraging"
  | "confident"
  | "excited"
  | "concerned"
  | "reflective"
  | "urgent";

type SpeechResult = {
  audioBase64: string;
  mimeType: string;
};

const speechCache = new Map<string, SpeechResult>();
const MAX_CACHE_ENTRIES = 32;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

const EMOTION_INSTRUCTIONS: Record<QubitSpeechEmotion, string> = {
  calm: "Use a calm, reassuring cadence with gentle emphasis.",
  curious: "Sound genuinely curious and inviting, with light upward inflection on questions.",
  encouraging: "Sound warm, optimistic, animated, and sincerely encouraging.",
  confident: "Sound clear and assured without becoming forceful or formal.",
  excited: "Use lively energy and enthusiasm while remaining natural and controlled.",
  concerned: "Sound caring and attentive, slowing slightly around important cautions.",
  reflective: "Use a thoughtful, measured rhythm with natural pauses.",
  urgent: "Sound focused and direct, but never panicked or harsh.",
};

function cacheKey(text: string, emotion: QubitSpeechEmotion) {
  return createHash("sha256")
    .update(`${ENV.ttsModel}|${ENV.ttsVoice}|${emotion}|${text}`)
    .digest("hex");
}

function remember(key: string, value: SpeechResult) {
  if (speechCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = speechCache.keys().next().value;
    if (oldest) speechCache.delete(oldest);
  }
  speechCache.set(key, value);
}

export async function synthesizeQubitSpeech(
  text: string,
  emotion: QubitSpeechEmotion
): Promise<SpeechResult | null> {
  if (!ENV.ttsConfigured || !ENV.aiEnabled) return null;

  const normalized = text.replace(/\s+/g, " ").trim().slice(0, ENV.ttsMaxChars);
  if (!normalized) return null;

  const key = cacheKey(normalized, emotion);
  const cached = speechCache.get(key);
  if (cached) return cached;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (ENV.ttsApiKeyHeader === "api-key") {
    headers["api-key"] = ENV.ttsApiKey;
  } else {
    headers.Authorization = `Bearer ${ENV.ttsApiKey}`;
  }

  const instructions = [
    "Speak as Qubit, a friendly educational AI guide.",
    "Use a warm, animated, earnest, conversational delivery with natural phrasing, subtle vocal variation, and relaxed pauses.",
    "Avoid a robotic, synthetic, announcer-like, or overly formal cadence.",
    "Do not imitate or claim to be any named person or product voice.",
    EMOTION_INSTRUCTIONS[emotion],
  ].join(" ");

  try {
    const response = await fetch(ENV.ttsApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: ENV.ttsModel,
        voice: ENV.ttsVoice,
        input: normalized,
        instructions,
        response_format: "mp3",
        speed: 1,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      console.error(`Qubit TTS failed (${response.status}): ${detail}`);
      return null;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_AUDIO_BYTES) {
      console.error(`Qubit TTS returned an invalid audio size: ${bytes.length}`);
      return null;
    }

    const result = {
      audioBase64: bytes.toString("base64"),
      mimeType: response.headers.get("content-type")?.split(";")[0] || "audio/mpeg",
    };
    remember(key, result);
    return result;
  } catch (error) {
    console.error("Qubit TTS request failed", error);
    return null;
  }
}
