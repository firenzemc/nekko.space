import { fetchJsonWithTimeout } from "@/lib/llm/providers/http";

type AiHubMixResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export const callAiHubMix = async (options: {
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}): Promise<string | null> => {
  const apiKey = process.env.AIHUBMIX_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetchJsonWithTimeout(
      "https://aihubmix.com/v1/chat/completions",
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
    const data = (await response.json()) as AiHubMixResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};
