import type { DailyReport, IslandEvent, WorldState } from "@/lib/core/types";
import { runLlmTask } from "@/lib/llm/router";

export const generateDailyReport = async (
  world: WorldState,
  events: IslandEvent[]
): Promise<DailyReport> => {
  const latest = events.slice(0, 8).map((event) => `- ${event.detail}`).join("\n");
  const prompt = `请为小岛写一份日报。\n天气：${world.weather}\n时段：${world.timeSlot}\n事件：\n${latest || "- 岛上一天平静但温暖"}`;

  const lead = await runLlmTask({
    taskKey: "reporter.daily",
    prompt,
  });

  return {
    id: `report_${Date.now()}`,
    date: world.dayKey,
    title: `《小岛日报》${world.dayKey}`,
    sections: [
      {
        heading: "今日头条",
        body: lead.text,
      },
      {
        heading: "村民纪要",
        body: events
          .slice(0, 5)
          .map((event) => `${event.title}：${event.detail}`)
          .join("\n"),
      },
      {
        heading: "明日预告",
        body: "岛上将继续推进建设计划，居民们会自发准备周末主题活动。",
      },
    ],
  };
};
