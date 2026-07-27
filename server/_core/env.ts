const positiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const foundryProjectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT?.trim() ?? "";
const foundryAgentEndpoint =
  process.env.FOUNDRY_AGENT_RESPONSES_ENDPOINT?.trim() ?? "";
const hasFoundryAgentCredential = Boolean(
  process.env.FOUNDRY_AGENT_ACCESS_TOKEN?.trim() ||
    (process.env.FOUNDRY_TENANT_ID?.trim() &&
      process.env.FOUNDRY_CLIENT_ID?.trim() &&
      process.env.FOUNDRY_CLIENT_SECRET?.trim())
);

const directOpenAiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
const explicitTtsModel = process.env.CUBIT_TTS_MODEL?.trim() ?? "";
const ttsApiKey =
  process.env.CUBIT_TTS_API_KEY?.trim() ||
  directOpenAiKey ||
  (explicitTtsModel ? process.env.AZURE_OPENAI_API_KEY?.trim() ?? "" : "");
const ttsBaseUrl =
  process.env.CUBIT_TTS_BASE_URL?.trim() ||
  (directOpenAiKey
    ? process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1"
    : explicitTtsModel
      ? process.env.AZURE_OPENAI_ENDPOINT?.trim() ?? ""
      : "");
const ttsApiUrl =
  process.env.CUBIT_TTS_API_URL?.trim() ||
  (ttsBaseUrl ? `${withoutTrailingSlash(ttsBaseUrl)}/audio/speech` : "");
const ttsModel = explicitTtsModel || (directOpenAiKey ? "gpt-4o-mini-tts" : "");
const ttsApiKeyHeader =
  process.env.CUBIT_TTS_API_KEY_HEADER?.trim().toLowerCase() ||
  (ttsApiUrl.includes(".openai.azure.com") ? "api-key" : "authorization");

export const ENV = {
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "cubitlogic",
  cookieSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  aiEnabled: process.env.CUBIT_AI_ENABLED?.trim().toLowerCase() !== "false",
  aiDailySiteLimit: positiveInt(process.env.CUBIT_AI_DAILY_REQUEST_LIMIT, 25),
  aiMaxOutputTokens: positiveInt(process.env.CUBIT_AI_MAX_OUTPUT_TOKENS, 600),
  aiConfigured: foundryAgentEndpoint
    ? hasFoundryAgentCredential
    : Boolean(
        foundryProjectEndpoint &&
        process.env.FOUNDRY_API_KEY?.trim() &&
        process.env.FOUNDRY_MODEL?.trim()
          ? true
          :
              (process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL ?? process.env.AZURE_OPENAI_ENDPOINT ?? (process.env.GEMINI_API_KEY ? "configured" : "")) &&
              (process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.AZURE_OPENAI_API_KEY ?? process.env.GEMINI_API_KEY) &&
              (process.env.LLM_MODEL ?? process.env.OPENAI_MODEL ?? process.env.AZURE_OPENAI_DEPLOYMENT ?? (process.env.GEMINI_API_KEY ? "configured" : ""))
      ),
  llmProtocol:
    foundryAgentEndpoint
      ? "agent-responses"
      : foundryProjectEndpoint &&
    process.env.FOUNDRY_API_KEY?.trim() &&
    process.env.FOUNDRY_MODEL?.trim()
      ? "responses"
      : "chat-completions",
  llmApiUrl:
    foundryAgentEndpoint
      ? foundryAgentEndpoint
      : foundryProjectEndpoint &&
    process.env.FOUNDRY_API_KEY?.trim() &&
    process.env.FOUNDRY_MODEL?.trim()
      ? foundryProjectEndpoint
      :
    process.env.LLM_API_URL ??
    process.env.OPENAI_BASE_URL ??
    process.env.AZURE_OPENAI_ENDPOINT ??
    (process.env.GEMINI_API_KEY
      ? "https://generativelanguage.googleapis.com/v1beta/openai"
      : ""),
  llmApiKey:
    (foundryAgentEndpoint
      ? ""
      : foundryProjectEndpoint &&
    process.env.FOUNDRY_API_KEY?.trim() &&
    process.env.FOUNDRY_MODEL?.trim()
      ? process.env.FOUNDRY_API_KEY
      :
    process.env.LLM_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.AZURE_OPENAI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    ""),
  llmModel:
    (foundryAgentEndpoint
      ? ""
      : foundryProjectEndpoint &&
    process.env.FOUNDRY_API_KEY?.trim() &&
    process.env.FOUNDRY_MODEL?.trim()
      ? process.env.FOUNDRY_MODEL
      :
    process.env.LLM_MODEL ??
    process.env.OPENAI_MODEL ??
    process.env.AZURE_OPENAI_DEPLOYMENT ??
    (process.env.GEMINI_API_KEY ? "gemini-3.1-flash-lite" : "")),
  llmApiKeyHeader:
    process.env.LLM_API_KEY_HEADER ??
    (process.env.FOUNDRY_API_KEY || process.env.AZURE_OPENAI_API_KEY
      ? "api-key"
      : "authorization"),
  ttsEnabled: process.env.CUBIT_TTS_ENABLED?.trim().toLowerCase() !== "false",
  ttsConfigured: Boolean(
    process.env.CUBIT_TTS_ENABLED?.trim().toLowerCase() !== "false" &&
      ttsApiUrl &&
      ttsApiKey &&
      ttsModel
  ),
  ttsApiUrl,
  ttsApiKey,
  ttsApiKeyHeader: ttsApiKeyHeader === "api-key" ? "api-key" : "authorization",
  ttsModel,
  ttsVoice: process.env.CUBIT_TTS_VOICE?.trim() || "marin",
  ttsMaxChars: positiveInt(process.env.CUBIT_TTS_MAX_CHARS, 3000),
  ttsDailySiteLimit: positiveInt(process.env.CUBIT_TTS_DAILY_REQUEST_LIMIT, 50),
  foundryAgentAccessToken: process.env.FOUNDRY_AGENT_ACCESS_TOKEN?.trim() ?? "",
  foundryTenantId: process.env.FOUNDRY_TENANT_ID?.trim() ?? "",
  foundryClientId: process.env.FOUNDRY_CLIENT_ID?.trim() ?? "",
  foundryClientSecret: process.env.FOUNDRY_CLIENT_SECRET?.trim() ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL?.trim().toLowerCase() ?? "",
};
