import type { VillagerProfile } from "@/lib/data/villagers";
import type {
  IslandEvent,
  IslandTimeSlot,
  IslandWeather,
  VillagerDecision,
} from "@/lib/core/types";
import { runLlmTask } from "@/lib/llm/router";
import { getRandomLocation } from "@/lib/data/locations";

const randomMoodDelta = () => Math.floor(Math.random() * 9) - 4;

const selectActionAndLocation = (villager: VillagerProfile, timeSlot: IslandTimeSlot): { action: string; location: string } => {
  if (villager.personality === "jock" && (timeSlot === "清晨" || timeSlot === "上午")) {
    return { action: "在海边进行冲刺训练", location: "海边跑道" };
  }
  if (villager.personality === "lazy" && (timeSlot === "下午" || timeSlot === "深夜")) {
    return { action: "在树荫下打盹并讨论点心", location: "森林" };
  }
  if (villager.personality === "sisterly") {
    return { action: "巡岛并关心其他村民状态", location: getRandomLocation() };
  }
  if (villager.personality === "smug") {
    return { action: "在广场和大家分享旅行灵感", location: "咖啡摊" };
  }
  // normal personality - random activities
  const activities = [
    { action: "打理花园并邀请朋友喝下午茶", location: "花园" },
    { action: "在广场休息看风景", location: "广场" },
    { action: "去海边捡贝壳", location: "海滩" },
    { action: "在码头钓鱼", location: "码头" },
    { action: "准备美味的甜点", location: "烘焙小屋" },
  ];
  return activities[Math.floor(Math.random() * activities.length)];
};

export const runVillagerTurn = async (
  villager: VillagerProfile,
  options: {
    timeSlot: IslandTimeSlot;
    weather: IslandWeather;
    nowIso: string;
  }
): Promise<{ villager: VillagerProfile; event: IslandEvent; decision: VillagerDecision }> => {
  const { action, location } = selectActionAndLocation(villager, options.timeSlot);
  const prompt = `${villager.nameZh}（${villager.personality}）在${options.timeSlot}、天气${options.weather}时${action}，用一句日报风格描述。`;
  const narration = await runLlmTask({
    taskKey: "villager.dialogue",
    scope: `villager:${villager.id}`,
    prompt,
  });

  const moodBefore = villager.mood;
  const mood = Math.max(0, Math.min(100, villager.mood + randomMoodDelta()));
  const updatedVillager: VillagerProfile = {
    ...villager,
    mood,
    location,
  };

  return {
    villager: updatedVillager,
    event: {
      id: `evt_${villager.id}_${Date.now()}`,
      timestamp: options.nowIso,
      title: `${villager.nameZh}的岛上动态`,
      detail: narration.text,
      actors: [villager.id],
      importance: Math.floor(Math.random() * 4) + 4,
    },
    decision: {
      villagerId: villager.id,
      villagerName: villager.nameZh,
      action,
      narration: narration.text,
      moodBefore,
      moodAfter: mood,
      provider: narration.provider,
      model: narration.model,
      isMockFallback: narration.isMockFallback,
    },
  };
};
