import { runLlmTask } from "@/lib/llm/router";
import type { IslandEvent, WorldState } from "@/lib/core/types";
import { DEFAULT_VILLAGERS } from "@/lib/data/villagers";

type DailyPlot = {
  headline: string;
  theme: string;
  involvedVillagers: string[];
  plotHook: string;
};

const parseDailyPlot = (raw: string, fallbackHeadline: string): DailyPlot => {
  const extractField = (tag: string): string | null => {
    const re = new RegExp(`【${tag}】\\s*([^【\\n]+)`);
    const m = raw.match(re);
    return m?.[1]?.trim() ?? null;
  };

  const headline = extractField("标题") || fallbackHeadline;
  const theme = extractField("主题") || "日常";
  const villagersRaw = extractField("相关村民") || "";
  const plotHook = extractField("剧情线索") || "";

  const villagerIds = DEFAULT_VILLAGERS.filter((v) =>
    villagersRaw.includes(v.nameZh)
  ).map((v) => v.id);

  return {
    headline,
    theme,
    involvedVillagers: villagerIds.length > 0 ? villagerIds : DEFAULT_VILLAGERS.map((v) => v.id),
    plotHook,
  };
};

export const planDailyPlot = async (
  world: WorldState,
  events: IslandEvent[]
): Promise<DailyPlot> => {
  const recentSummary =
    events.length > 0
      ? events
          .slice(0, 8)
          .map((e) => `- ${e.detail}`)
          .join("\n")
      : "暂无特别事件";

  // Birthday check
  const today = world.dayKey.slice(5); // "MM-DD"
  const birthdayVillagers = DEFAULT_VILLAGERS.filter(
    (v) => v.birthday === today
  );
  const birthdayNote =
    birthdayVillagers.length > 0
      ? `今天是${birthdayVillagers.map((v) => v.nameZh).join("和")}的生日！`
      : "";

  const villagerNames = DEFAULT_VILLAGERS.map((v) => v.nameZh).join("、");

  const prompt = `今天是${world.dayKey}，天气${world.weather}，时段${world.timeSlot}。
${birthdayNote}

岛上的村民有：${villagerNames}

最近发生的事：
${recentSummary}

请为今天的小岛规划一个有趣的剧情方向。用以下格式输出：
【标题】今日剧情导语（20字以内，温暖有趣）
【主题】剧情主题（如：友情考验、甜品大赛、音乐之夜、探险日等）
【相关村民】主要参与的村民名字（1-3个）
【剧情线索】给村民们的剧情提示（1-2句话，描述今天可能发生什么有趣的事）`;

  const result = await runLlmTask({
    taskKey: "director.daily-plan",
    prompt,
  });

  return parseDailyPlot(result.text, result.text.slice(0, 20));
};

// Backward-compatible export
export const planDailyHeadline = async (world: WorldState): Promise<string> => {
  const plot = await planDailyPlot(world, []);
  return plot.headline;
};
