import type { LlmTaskKey, ModelConfig, ModelOverride } from "@/lib/llm/types";
import { loadPersistedOverrides, persistOverrides } from "@/lib/core/persistence";

const DEFAULT_CONFIG: Record<LlmTaskKey, ModelConfig> = {
  "villager.dialogue": {
    provider: "vercel_gateway",
    model: "minimax/minimax-m2-her",
    temperature: 0.9,
    maxTokens: 420,
    topP: 0.95,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
  "villager.letter": {
    provider: "vercel_gateway",
    model: "minimax/minimax-m2-her",
    temperature: 0.85,
    maxTokens: 520,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
  "director.daily-plan": {
    provider: "vercel_gateway",
    model: "openai/gpt-4o-mini",
    temperature: 0.4,
    maxTokens: 800,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
  "reporter.daily": {
    provider: "vercel_gateway",
    model: "openai/gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 900,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
  "memory.compress": {
    provider: "vercel_gateway",
    model: "openai/gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 750,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
  "decision.light": {
    provider: "vercel_gateway",
    model: "openai/gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 320,
    fallback: {
      provider: "minimax",
      model: "minimax-m2-her",
    },
  },
};

const parseEnvOverride = (): ModelOverride[] => {
  const raw = process.env.MODEL_OVERRIDES_JSON;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ModelOverride[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let runtimeOverrides: ModelOverride[] = loadPersistedOverrides();

export const setRuntimeOverrides = (overrides: ModelOverride[]) => {
  runtimeOverrides = overrides;
  persistOverrides(runtimeOverrides);
};

export const getRuntimeOverrides = (): ModelOverride[] => runtimeOverrides;

export const getModelConfig = (
  taskKey: LlmTaskKey,
  scope: "global" | `villager:${string}` = "global"
): ModelConfig => {
  const base = DEFAULT_CONFIG[taskKey];
  const allOverrides = [...parseEnvOverride(), ...runtimeOverrides];

  const scoped = allOverrides.find(
    (override) => override.taskKey === taskKey && override.scope === scope
  );
  const global = allOverrides.find(
    (override) => override.taskKey === taskKey && override.scope === "global"
  );

  return {
    ...base,
    ...global?.config,
    ...scoped?.config,
  };
};
