import { fetchJsonWithTimeout } from "@/lib/llm/providers/http";

type OpenAICompatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export const callOpenAICompatible = async (options: {
  baseUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  systemPrompt?: string;
}): Promise<string | null> => {
  const messages = options.systemPrompt
    ? [
        { role: "system" as const, content: options.systemPrompt },
        { role: "user" as const, content: options.prompt },
      ]
    : [{ role: "user" as const, content: options.prompt }];

  try {
    const endpoint = `${options.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const response = await fetchJsonWithTimeout(
      endpoint,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
      }),
      },
      15000
    );

    if (!response?.ok) return null;
    const data = (await response.json()) as OpenAICompatResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};
