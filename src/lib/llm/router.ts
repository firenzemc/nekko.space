import { getModelConfig } from "@/lib/llm/model-registry";
import type { LlmTaskKey } from "@/lib/llm/types";
import { callMiniMax } from "@/lib/llm/providers/minimax";
import { callDeepSeek } from "@/lib/llm/providers/deepseek";
import { callGlm } from "@/lib/llm/providers/glm";
import { callAiHubMix } from "@/lib/llm/providers/aihubmix";
import { callOpenAICompatible } from "@/lib/llm/providers/openai-compatible";

type RouteOptions = {
  taskKey: LlmTaskKey;
  scope?: "global" | `villager:${string}`;
  prompt: string;
};

export type LlmRouteResult = {
  text: string;
  model: string;
  provider: string;
  isMockFallback: boolean;
};

export const runLlmTask = async ({
  taskKey,
  scope = "global",
  prompt,
}: RouteOptions): Promise<LlmRouteResult> => {
  const config = await getModelConfig(taskKey, scope);

  const common = {
    model: config.model,
    prompt,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    topP: config.topP,
  };

  let text: string | null = null;

  const callByProvider = async (provider: string, model: string): Promise<string | null> => {
    const params = {
      ...common,
      model,
    };

    if (provider === "minimax") return callMiniMax(params);
    if (provider === "deepseek") return callDeepSeek(params);
    if (provider === "glm") return callGlm(params);
    if (provider === "aihubmix") return callAiHubMix(params);

    if (provider === "vercel_gateway") {
      const apiKey = process.env.AI_GATEWAY_API_KEY;
      if (!apiKey) return null;
      return callOpenAICompatible({
        ...params,
        baseUrl: process.env.AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1",
        apiKey,
      });
    }

    if (provider === "openai_compatible") {
      const baseUrl = config.baseUrl ?? process.env.CUSTOM_LLM_BASE_URL;
      const apiKeyName = config.apiKeyEnv ?? "CUSTOM_LLM_API_KEY";
      const apiKey = process.env[apiKeyName];
      if (!baseUrl || !apiKey) return null;
      return callOpenAICompatible({
        ...params,
        baseUrl,
        apiKey,
      });
    }

    return null;
  };

  text = await callByProvider(config.provider, config.model);

  if (!text && config.fallback) {
    text = await callByProvider(config.fallback.provider, config.fallback.model);
  }

  if (!text) {
    text = `[${config.provider}/${config.model}] ${prompt.slice(0, 120)}`;
  }

  return {
    text,
    model: config.model,
    provider: config.provider,
    isMockFallback: text.startsWith(`[${config.provider}/${config.model}] `),
  };
};
