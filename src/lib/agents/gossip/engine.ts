import type { VillagerProfile } from "@/lib/data/villagers";
import type { IslandEvent, VillagerRelationship, WorldState } from "@/lib/core/types";
import { runLlmTask } from "@/lib/llm/router";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";

const getRelationshipContext = (
  speakerId: string,
  listenerId: string,
  relationships?: VillagerRelationship[]
): string => {
  if (!relationships) return "";
  const rel = relationships.find(
    (r) =>
      (r.villagerA === speakerId && r.villagerB === listenerId) ||
      (r.villagerA === listenerId && r.villagerB === speakerId)
  );
  if (!rel) return "";
  return `你和对方的关系：${rel.label}（好感${rel.score}/100）`;
};

export const generateGossip = async (
  speaker: VillagerProfile,
  listener: VillagerProfile,
  world: WorldState,
  recentEvents: IslandEvent[],
  villagerRelationships?: VillagerRelationship[]
): Promise<string | null> => {
  // Low mood villagers don't gossip
  if (speaker.mood < 30) return null;

  // Filter gossip-worthy events
  const candidates = recentEvents.filter(
    (e) => e.importance >= 5 && !e.title.includes("的岛上动态")
  );

  if (candidates.length === 0) return null;

  const sourceEvent =
    candidates[Math.floor(Math.random() * candidates.length)];

  const bio = VILLAGER_BIOS[speaker.id];
  const systemPrompt = bio?.systemPromptCore;
  const relationshipContext = getRelationshipContext(
    speaker.id,
    listener.id,
    villagerRelationships
  );

  const prompt = `现在是${world.timeSlot}，天气${world.weather}。
你正在和${listener.nameZh}聊天。
${relationshipContext}

你们聊到了最近发生的一件事：
【${sourceEvent.detail}】

请你用符合你性格的口吻，把这件事当作"八卦"或"闲谈"说给${listener.nameZh}听。
要求：
- 口语化，生动，字数在30字以内。
- 必须要提到这件事，但可以加入你自己的主观情绪（比如羡慕、吐槽、开心等）。
- 不要带任何格式或前缀，直接输出你说的话。`;

  const response = await runLlmTask({
    taskKey: "villager.dialogue",
    scope: `villager:${speaker.id}`,
    prompt,
    systemPrompt,
  });

  return response.text;
};

export const updateRelationshipAfterGossip = (
  speakerId: string,
  listenerId: string,
  relationships: VillagerRelationship[]
): void => {
  const rel = relationships.find(
    (r) =>
      (r.villagerA === speakerId && r.villagerB === listenerId) ||
      (r.villagerA === listenerId && r.villagerB === speakerId)
  );
  if (rel) {
    rel.score = Math.min(100, rel.score + 1);
    rel.lastUpdatedAt = new Date().toISOString();
  }
};
