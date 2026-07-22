const positiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const foundryProjectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT?.trim() ?? "";
const foundryAgentEndpoint =
  process.env.FOUNDRY_AGENT_RESPONSES_ENDPOINT?.trim() ?? "";
const hasFoundryAgentCredential = Boolean(
  process.env.FOUNDRY_AGENT_ACCESS_TOKEN?.trim() ||
    (process.env.FOUNDRY_TENANT_ID?.trim() &&
      process.env.FOUNDRY_CLIENT_ID?.trim() &&
      process.env.FOUNDRY_CLIENT_SECRET?.trim())
);

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
  // A server-side kill switch means CubitAI can be paused immediately without
  // changing the page, navigation, or deployed client bundle.
  aiEnabled: process.env.CUBIT_AI_ENABLED?.trim().toLowerCase() !== "false",
  // This is an application-level spending guard for a single app process. Set
  // it lower in GoDaddy during a trial; use Azure budgets for an account-level
  // financial limit.
  aiDailySiteLimit: positiveInt(
    process.env.CUBIT_AI_DAILY_REQUEST_LIMIT,
    25
  ),
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
  // A Foundry project uses the OpenAI-compatible Responses API. This takes
  // precedence only when all three Foundry settings are supplied.
  llmProtocol:
    foundryAgentEndpoint
      ? "agent-responses"
      : foundryProjectEndpoint &&
    process.env.FOUNDRY_API_KEY?.trim() &&
    process.env.FOUNDRY_MODEL?.trim()
      ? "responses"
      : "chat-completions",
  // The AI Tutor accepts any OpenAI-compatible provider. Gemini is the
  // default when GEMINI_API_KEY is set; generic LLM settings still override
  // it for a future provider change.
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
  // Azure OpenAI accepts API keys in an `api-key` header. Other
  // OpenAI-compatible providers, including Gemini, use Bearer auth.
  llmApiKeyHeader:
    process.env.LLM_API_KEY_HEADER ??
    (process.env.FOUNDRY_API_KEY || process.env.AZURE_OPENAI_API_KEY
      ? "api-key"
      : "authorization"),
  foundryAgentAccessToken: process.env.FOUNDRY_AGENT_ACCESS_TOKEN?.trim() ?? "",
  foundryTenantId: process.env.FOUNDRY_TENANT_ID?.trim() ?? "",
  foundryClientId: process.env.FOUNDRY_CLIENT_ID?.trim() ?? "",
  foundryClientSecret: process.env.FOUNDRY_CLIENT_SECRET?.trim() ?? "",
  // Retained only for optional legacy helper endpoints that return a clear
  // configuration error when no storage/notification service is attached.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL?.trim().toLowerCase() ?? "",
};
