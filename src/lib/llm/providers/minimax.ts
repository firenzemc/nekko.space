import { fetchJsonWithTimeout } from "@/lib/llm/providers/http";

type MiniMaxMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type MiniMaxResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export const callMiniMax = async (options: {
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  systemPrompt?: string;
}): Promise<string | null> => {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return null;

  const messages: MiniMaxMessage[] = options.systemPrompt
    ? [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.prompt },
      ]
    : [{ role: "user", content: options.prompt }];

  try {
    const response = await fetchJsonWithTimeout(
      "https://api.minimax.io/v1/text/chatcompletion_v2",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
    const data = (await response.json()) as MiniMaxResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};
