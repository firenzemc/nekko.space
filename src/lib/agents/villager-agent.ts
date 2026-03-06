import type { VillagerProfile } from "@/lib/data/villagers";
import type {
  IslandEvent,
  IslandTimeSlot,
  IslandWeather,
  VillagerAffinity,
  VillagerDecision,
  VillagerRelationship,
} from "@/lib/core/types";
import { runLlmTask } from "@/lib/llm/router";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";
import { buildVillagerTurnPrompt } from "@/lib/agents/villager-prompt-builder";
import { parseVillagerResponse } from "@/lib/agents/villager-response-parser";

const isAsleep = (
  villagerId: string,
  timeSlot: IslandTimeSlot,
  currentHour: number
): boolean => {
  const bio = VILLAGER_BIOS[villagerId];
  if (!bio) return false;

  const wake = parseInt(bio.wakeTime.split(":")[0], 10);
  const sleep = parseInt(bio.sleepTime.split(":")[0], 10);

  // Handle wrap-around (e.g., sleep=3:00 wake=9:30)
  if (sleep > wake) {
    // Normal case: wake at 6, sleep at 23
    return currentHour >= sleep || currentHour < wake;
  }
  // Wrap case: wake at 9, sleep at 3
  return currentHour >= sleep && currentHour < wake;
};

export const runVillagerTurn = async (
  villager: VillagerProfile,
  options: {
    timeSlot: IslandTimeSlot;
    weather: IslandWeather;
    nowIso: string;
    recentEvents?: IslandEvent[];
    affinity?: VillagerAffinity;
    villagerRelationships?: VillagerRelationship[];
    plotHook?: string;
  }
): Promise<{
  villager: VillagerProfile;
  event: IslandEvent;
  decision: VillagerDecision;
}> => {
  const bio = VILLAGER_BIOS[villager.id];
  const currentHour = new Date(options.nowIso).getHours();

  // Sleep check: if asleep, skip LLM call
  if (bio && isAsleep(villager.id, options.timeSlot, currentHour)) {
    const moodBefore = villager.mood;
    return {
      villager: { ...villager },
      event: {
        id: `evt_${villager.id}_${Date.now()}`,
        timestamp: options.nowIso,
        title: `${villager.nameZh}正在睡觉`,
        detail: `${villager.nameZh}正在家中安睡，发出轻轻的鼾声。`,
        actors: [villager.id],
        importance: 2,
      },
      decision: {
        villagerId: villager.id,
        villagerName: villager.nameZh,
        action: "睡觉",
        narration: `${villager.nameZh}正在家中安睡，发出轻轻的鼾声。`,
        moodBefore,
        moodAfter: moodBefore,
        provider: "sleep-skip",
        model: "none",
        isMockFallback: false,
        moodReason: "正在睡觉",
      },
    };
  }

  // If no bio data, fall back to a simple prompt
  if (!bio) {
    const prompt = `${villager.nameZh}（${villager.personality}）在${options.timeSlot}、天气${options.weather}时的岛上活动，用一句日报风格描述。`;
    const narration = await runLlmTask({
      taskKey: "villager.behavior",
      scope: `villager:${villager.id}`,
      prompt,
    });
    const moodBefore = villager.mood;
    const moodDelta = Math.floor(Math.random() * 5) - 2;
    const mood = Math.max(0, Math.min(100, villager.mood + moodDelta));
    return {
      villager: { ...villager, mood },
      event: {
        id: `evt_${villager.id}_${Date.now()}`,
        timestamp: options.nowIso,
        title: `${villager.nameZh}的岛上动态`,
        detail: narration.text,
        actors: [villager.id],
        importance: 4,
      },
      decision: {
        villagerId: villager.id,
        villagerName: villager.nameZh,
        action: "自由活动",
        narration: narration.text,
        moodBefore,
        moodAfter: mood,
        provider: narration.provider,
        model: narration.model,
        isMockFallback: narration.isMockFallback,
      },
    };
  }

  // Build structured prompts
  const { systemPrompt, userPrompt } = buildVillagerTurnPrompt(
    villager,
    bio,
    options
  );

  // Call LLM with system prompt
  const result = await runLlmTask({
    taskKey: "villager.behavior",
    scope: `villager:${villager.id}`,
    systemPrompt,
    prompt: userPrompt,
  });

  // Parse structured response
  const fallbackAction =
    bio.dailyRoutineHints[options.timeSlot] ?? "自由活动";
  const parsed = parseVillagerResponse(
    result.text,
    villager.location,
    fallbackAction
  );

  const moodBefore = villager.mood;
  const mood = Math.max(0, Math.min(100, villager.mood + parsed.moodDelta));

  const updatedVillager: VillagerProfile = {
    ...villager,
    mood,
    location: parsed.location,
  };

  return {
    villager: updatedVillager,
    event: {
      id: `evt_${villager.id}_${Date.now()}`,
      timestamp: options.nowIso,
      title: `${villager.nameZh}的岛上动态`,
      detail: parsed.narration,
      actors: [villager.id],
      importance: Math.floor(Math.random() * 3) + 5,
    },
    decision: {
      villagerId: villager.id,
      villagerName: villager.nameZh,
      action: parsed.action,
      narration: parsed.narration,
      moodBefore,
      moodAfter: mood,
      provider: result.provider,
      model: result.model,
      isMockFallback: result.isMockFallback,
      moodReason: parsed.moodReason,
    },
  };
};
