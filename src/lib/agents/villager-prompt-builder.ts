import type { VillagerProfile } from "@/lib/data/villagers";
import type { VillagerBio } from "@/lib/data/villager-profiles";
import type {
  IslandEvent,
  IslandTimeSlot,
  IslandWeather,
  VillagerAffinity,
  VillagerRelationship,
} from "@/lib/core/types";
import { ISLAND_LOCATIONS } from "@/lib/data/locations";

const describeMood = (mood: number): string => {
  if (mood >= 80) return "心情很好，更愿意社交和尝试新事物";
  if (mood >= 50) return "心情还不错";
  if (mood >= 30) return "有点低落，不太想社交";
  return "很沮丧，只想独处或找信赖的人倾诉";
};

const describeAffinity = (score: number): string => {
  if (score >= 80) return "挚友，会分享秘密和心里话";
  if (score >= 60) return "友好热情，乐于互动";
  if (score >= 40) return "正常交流，保持礼貌";
  return "礼貌但不会主动靠近";
};

export const buildVillagerTurnPrompt = (
  villager: VillagerProfile,
  bio: VillagerBio,
  options: {
    timeSlot: IslandTimeSlot;
    weather: IslandWeather;
    recentEvents?: IslandEvent[];
    affinity?: VillagerAffinity;
    villagerRelationships?: VillagerRelationship[];
    plotHook?: string;
  }
): { systemPrompt: string; userPrompt: string } => {
  const { timeSlot, weather, recentEvents, affinity, plotHook } = options;

  const systemPrompt = `${bio.systemPromptCore}\n说话风格：${bio.speechStyle}`;

  const affinityScore = affinity?.score ?? 60;
  const moodDesc = describeMood(villager.mood);
  const affinityDesc = describeAffinity(affinityScore);

  const locationList = ISLAND_LOCATIONS.map((l) => l.name).join("、");
  const routineHint = bio.dailyRoutineHints[timeSlot] ?? "自由活动";

  let eventsBlock = "";
  if (recentEvents && recentEvents.length > 0) {
    const items = recentEvents
      .slice(0, 5)
      .map((e) => `- ${e.detail}`)
      .join("\n");
    eventsBlock = `\n最近发生的事：\n${items}\n`;
  }

  const plotBlock = plotHook ? `\n今日剧情线索：${plotHook}\n` : "";

  const userPrompt = `现在是${timeSlot}，天气${weather}。

你的状态：心情${villager.mood}/100，在${villager.location}。
与岛主好感度：${affinityScore}/100（${affinityDesc}）。
${moodDesc}
${eventsBlock}${plotBlock}
岛上可去的地方：${locationList}
你在${timeSlot}通常会：${routineHint}

请决定接下来做什么，用以下格式回复：
【地点】地点名称
【行动】你要做的事（一句话）
【心情变化】+N或-N（-5到+5），原因
【旁白】用第三人称描述这个场景（2-3句）`;

  return { systemPrompt, userPrompt };
};
