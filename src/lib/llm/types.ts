export type LlmProvider =
  | "minimax"
  | "deepseek"
  | "glm"
  | "aihubmix"
  | "openai_compatible"
  | "vercel_gateway";

export type LlmTaskKey =
  | "villager.dialogue"
  | "villager.letter"
  | "director.daily-plan"
  | "reporter.daily"
  | "memory.compress"
  | "decision.light";

export type ModelConfig = {
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  baseUrl?: string;
  apiKeyEnv?: string;
  fallback?: {
    provider: LlmProvider;
    model: string;
  };
};

export type ModelOverride = {
  taskKey: LlmTaskKey;
  scope: "global" | `villager:${string}`;
  config: Partial<ModelConfig>;
};
