export const ENV = {
  // GoDaddy does not inject the former builder's identifiers. A stable app ID
  // is enough for locally issued sessions; JWT_SECRET remains a deployment
  // secret and is configured in GoDaddy's Secrets screen.
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "cubitlogic",
  cookieSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // The AI Tutor accepts any OpenAI-compatible provider. Gemini is the
  // default when GEMINI_API_KEY is set; generic LLM settings still override
  // it for a future provider change.
  llmApiUrl:
    process.env.LLM_API_URL ??
    process.env.OPENAI_BASE_URL ??
    process.env.AZURE_OPENAI_ENDPOINT ??
    (process.env.GEMINI_API_KEY
      ? "https://generativelanguage.googleapis.com/v1beta/openai"
      : ""),
  llmApiKey:
    process.env.LLM_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.AZURE_OPENAI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    "",
  llmModel:
    process.env.LLM_MODEL ??
    process.env.OPENAI_MODEL ??
    process.env.AZURE_OPENAI_DEPLOYMENT ??
    (process.env.GEMINI_API_KEY ? "gemini-3.1-flash-lite" : ""),
  // Azure OpenAI accepts API keys in an `api-key` header. Other
  // OpenAI-compatible providers, including Gemini, use Bearer auth.
  llmApiKeyHeader:
    process.env.LLM_API_KEY_HEADER ??
    (process.env.AZURE_OPENAI_API_KEY ? "api-key" : "authorization"),
  // Retained only for optional legacy helper endpoints that return a clear
  // configuration error when no storage/notification service is attached.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL?.trim().toLowerCase() ?? "",
};
