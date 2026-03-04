import { runLlmTask } from "@/lib/llm/router";
import type { WorldState } from "@/lib/core/types";

export const planDailyHeadline = async (world: WorldState): Promise<string> => {
  const prompt = `今天是${world.dayKey}，天气${world.weather}，时段${world.timeSlot}。为小岛生成一句剧情导语，语气温暖，20字以内。`;
  const result = await runLlmTask({
    taskKey: "director.daily-plan",
    prompt,
  });

  return result.text;
};
