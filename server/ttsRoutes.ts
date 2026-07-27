import { createHash } from "node:crypto";
import type { Express, Request } from "express";
import { ENV } from "./_core/env";
import {
  synthesizeQubitSpeech,
  type QubitSpeechEmotion,
} from "./_core/tts";

const ALLOWED_EMOTIONS = new Set<QubitSpeechEmotion>([
  "calm",
  "curious",
  "encouraging",
  "confident",
  "excited",
  "concerned",
  "reflective",
  "urgent",
]);

const CLIENT_COOLDOWN_MS = 2_500;
const clientLastRequest = new Map<string, number>();
let dailyUsage = { date: "", count: 0 };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clientKey(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const source = Array.isArray(forwarded)
    ? forwarded[0] ?? req.ip ?? "unknown"
    : forwarded?.split(",")[0]?.trim() || req.ip || "unknown";
  return createHash("sha256").update(source).digest("hex");
}

function reserveProviderCall(req: Request) {
  const date = today();
  if (dailyUsage.date !== date) dailyUsage = { date, count: 0 };
  if (dailyUsage.count >= ENV.ttsDailySiteLimit) return false;

  const key = clientKey(req);
  const now = Date.now();
  const last = clientLastRequest.get(key) ?? 0;
  if (now - last < CLIENT_COOLDOWN_MS) return false;

  clientLastRequest.set(key, now);
  dailyUsage.count += 1;
  return true;
}

export function registerTtsRoutes(app: Express) {
  app.post("/api/qubit/speech", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const requestedEmotion = req.body?.emotion;
    const emotion: QubitSpeechEmotion = ALLOWED_EMOTIONS.has(requestedEmotion)
      ? requestedEmotion
      : "encouraging";

    if (!text || text.length > ENV.ttsMaxChars) {
      res.status(400).json({ available: false, error: "Invalid speech text" });
      return;
    }

    if (!ENV.ttsConfigured || !ENV.aiEnabled) {
      res.json({ available: false });
      return;
    }

    if (!reserveProviderCall(req)) {
      res.status(429).json({ available: false });
      return;
    }

    const result = await synthesizeQubitSpeech(text, emotion);
    if (!result) {
      res.json({ available: false });
      return;
    }

    res.setHeader("Cache-Control", "private, max-age=3600");
    res.json({
      available: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
    });
  });
}
