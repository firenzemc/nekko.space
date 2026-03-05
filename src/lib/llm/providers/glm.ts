import { fetchJsonWithTimeout } from "@/lib/llm/providers/http";

type GlmResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export const callGlm = async (options: {
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}): Promise<string | null> => {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetchJsonWithTimeout(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: "user", content: options.prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
      }),
      },
      15000
    );

    if (!response?.ok) return null;
    const data = (await response.json()) as GlmResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};
