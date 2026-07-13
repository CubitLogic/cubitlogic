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
  // OpenAI-compatible provider used by the AI Tutor. Configure all three in
  // GoDaddy Secrets; no retired builder credential is required.
  llmApiUrl: process.env.LLM_API_URL ?? process.env.OPENAI_BASE_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? process.env.OPENAI_MODEL ?? "",
  // Retained only for optional legacy helper endpoints that return a clear
  // configuration error when no storage/notification service is attached.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL?.trim().toLowerCase() ?? "",
};
