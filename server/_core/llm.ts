import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string;
  thinking?: Record<string, unknown>;
  reasoning?: Record<string, unknown>;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = (path: string) => {
  const base = ENV.llmApiUrl.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("AI Tutor provider URL is not configured");
  }
  // Gemini's OpenAI-compatible endpoint already includes its version segment
  // (`.../v1beta/openai`), so appending `/v1` would produce an invalid URL.
  const versionedBase = base.endsWith("/v1") || base.endsWith("/openai")
    ? base
    : `${base}/v1`;
  return `${versionedBase}/${path}`;
};

const resolveResponsesApiUrl = (path: string) => {
  const base = ENV.llmApiUrl.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("AI Tutor provider URL is not configured");
  }
  const versionedBase = base.endsWith("/openai/v1")
    ? base
    : `${base}/openai/v1`;
  return `${versionedBase}/${path}`;
};

const assertApiKey = () => {
  if (!ENV.llmApiKey) {
    throw new Error("AI Tutor provider key is not configured");
  }
};

const providerAuthHeaders = (): Record<string, string> => {
  const header = ENV.llmApiKeyHeader.trim().toLowerCase();
  if (header === "api-key") {
    return { "api-key": ENV.llmApiKey };
  }
  return { authorization: `Bearer ${ENV.llmApiKey}` };
};

let foundryAgentTokenCache: { value: string; expiresAt: number } | undefined;

const foundryAgentHeaders = async (): Promise<Record<string, string>> => {
  if (ENV.foundryAgentAccessToken) {
    return { authorization: `Bearer ${ENV.foundryAgentAccessToken}` };
  }

  if (
    !ENV.foundryTenantId ||
    !ENV.foundryClientId ||
    !ENV.foundryClientSecret
  ) {
    throw new Error("Foundry agent credentials are not configured");
  }

  if (
    foundryAgentTokenCache &&
    foundryAgentTokenCache.expiresAt > Date.now() + 60_000
  ) {
    return { authorization: `Bearer ${foundryAgentTokenCache.value}` };
  }

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(ENV.foundryTenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: ENV.foundryClientId,
        client_secret: ENV.foundryClientSecret,
        grant_type: "client_credentials",
        scope: "https://ai.azure.com/.default",
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error(
      `Foundry token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`
    );
  }

  const token = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!token.access_token) {
    throw new Error("Foundry token response did not include an access token");
  }
  foundryAgentTokenCache = {
    value: token.access_token,
    expiresAt: Date.now() + Math.max(60, token.expires_in ?? 300) * 1000,
  };
  return { authorization: `Bearer ${token.access_token}` };
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

const RETRY_MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 30_000;

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
};

// Equal-jitter exponential backoff. The cap/2 floor guarantees a minimum
// delay so a misbehaving caller loop slows down instead of hammering the
// upstream while it keeps returning errors.
const computeBackoffDelay = (
  attempt: number,
  retryAfterMs?: number
): number => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};

// Retries non-2xx responses and network errors with exponential backoff, then
// returns the final Response so callers keep their existing error handling.
const fetchWithBackoff = async (
  url: string,
  init: FetchInit
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      // Do not retry client-side configuration or content errors. In
      // particular, retrying a rejected request wastes time and can make a
      // quota problem look more expensive than it is.
      const retryable =
        response.status === 408 || response.status === 429 || response.status >= 500;
      if (response.ok || !retryable || attempt === RETRY_MAX_RETRIES) {
        return response;
      }

      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
        // Body already settled; nothing to clean up.
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("LLM request failed after exhausting retries");
};

const messageToText = (message: Message): string =>
  ensureArray(message.content)
    .map(part => (typeof part === "string" ? part : part.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join("\n");

type ResponsesApiPayload = {
  id?: string;
  created_at?: number;
  model?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

const responseText = (response: ResponsesApiPayload) => {
  if (response.output_text) return response.output_text;
  return (response.output ?? [])
    .flatMap(item => item.content ?? [])
    .filter(item => item.type === "output_text" && typeof item.text === "string")
    .map(item => item.text as string)
    .join("\n");
};

const invokeResponsesApi = async (params: InvokeParams): Promise<InvokeResult> => {
  const resolvedModel = params.model ?? ENV.llmModel;
  if (!resolvedModel) {
    throw new Error("AI Tutor model is not configured");
  }

  const systemInstruction = params.messages
    .filter(message => message.role === "system")
    .map(messageToText)
    .filter(Boolean)
    .join("\n\n");
  const input = params.messages
    .filter(message => message.role === "user" || message.role === "assistant")
    .map(message => ({ role: message.role, content: messageToText(message) }))
    .filter(message => message.content);

  const maxOutputTokens =
    params.max_tokens ?? params.maxTokens ?? ENV.aiMaxOutputTokens;
  const response = await fetchWithBackoff(resolveResponsesApiUrl("responses"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...providerAuthHeaders(),
    },
    body: JSON.stringify({
      model: resolvedModel,
      input,
      ...(systemInstruction ? { instructions: systemInstruction } : {}),
      max_output_tokens: maxOutputTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Foundry Responses invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = (await response.json()) as ResponsesApiPayload;
  return {
    id: result.id ?? "foundry-response",
    created: result.created_at ?? Math.floor(Date.now() / 1000),
    model: result.model ?? resolvedModel,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: responseText(result) },
        finish_reason: "stop",
      },
    ],
  };
};

const agentConversationInput = (messages: Message[]) =>
  messages
    .filter(message => message.role === "user" || message.role === "assistant")
    .map(message => `${message.role === "assistant" ? "Tutor" : "Learner"}: ${messageToText(message)}`)
    .filter(Boolean)
    .join("\n\n");

const resolveFoundryAgentUrl = () => {
  const endpoint = ENV.llmApiUrl.trim();
  if (!endpoint) throw new Error("Foundry agent endpoint is not configured");
  return endpoint.includes("?")
    ? `${endpoint}&api-version=v1`
    : `${endpoint}?api-version=v1`;
};

const invokeFoundryAgent = async (params: InvokeParams): Promise<InvokeResult> => {
  const response = await fetchWithBackoff(resolveFoundryAgentUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(await foundryAgentHeaders()),
    },
    // The Foundry agent owns its own instructions/model. The site only sends
    // the learner's transcript, so updating the Foundry agent stays separate
    // from deploying the website.
    body: JSON.stringify({
      input: agentConversationInput(params.messages),
      stream: false,
      store: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Foundry agent invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = (await response.json()) as ResponsesApiPayload;
  return {
    id: result.id ?? "foundry-agent-response",
    created: result.created_at ?? Math.floor(Date.now() / 1000),
    model: result.model ?? "foundry-agent",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: responseText(result) },
        finish_reason: "stop",
      },
    ],
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (ENV.llmProtocol === "agent-responses") {
    return invokeFoundryAgent(params);
  }

  assertApiKey();

  if (ENV.llmProtocol === "responses") {
    return invokeResponsesApi(params);
  }

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens,
  } = params;

  const payload: Record<string, unknown> = {
    messages: messages.map(normalizeMessage),
  };

  const resolvedModel = model ?? ENV.llmModel;
  if (!resolvedModel) {
    throw new Error("AI Tutor model is not configured");
  }
  payload.model = resolvedModel;

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }

  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetchWithBackoff(resolveApiUrl("chat/completions"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...providerAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

export type ModelInfo = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

export type ModelsResponse = {
  object: string;
  data: ModelInfo[];
};

export async function listLLMModels(): Promise<ModelsResponse> {
  if (ENV.llmProtocol === "agent-responses") {
    throw new Error("The Foundry agent endpoint does not expose a model list");
  }
  assertApiKey();

  const url =
    ENV.llmProtocol === "responses"
      ? resolveResponsesApiUrl("models")
      : resolveApiUrl("models");

  const response = await fetchWithBackoff(url, {
    headers: providerAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `List LLM models failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as ModelsResponse;
}
