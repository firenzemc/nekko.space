import type { VillagerProfile } from "@/lib/data/villagers";
import type { IslandEvent, WorldState } from "@/lib/core/types";
import { runLlmTask } from "@/lib/llm/router";

export const generateGossip = async (
  speaker: VillagerProfile,
  listener: VillagerProfile,
  world: WorldState,
  recentEvents: IslandEvent[]
): Promise<string | null> => {
  // 1. 过滤出可以作为谈资的事件（排除太普通的日常或者自己和对方的单人无聊事件，尽量找有其他人参与的，或者用户触发的）
  const candidates = recentEvents.filter(
    (e) => e.importance >= 5 && !e.title.includes("的岛上动态") // 排除纯常规tick动作，优先选信件、送礼、约会
  );

  if (candidates.length === 0) return null;

  // 2. 随机选取一个事件作为“八卦源”
  const sourceEvent = candidates[Math.floor(Math.random() * candidates.length)];

  // 3. 生成聊天内容
  const prompt = `现在是${world.timeSlot}，天气${world.weather}。
你是${speaker.nameZh}（${speaker.personality}性格）。你正在和${listener.nameZh}聊天。
你们聊到了最近发生的一件事：
【${sourceEvent.detail}】

请你用符合你性格的口吻，把这件事当作“八卦”或“闲谈”说给${listener.nameZh}听。
要求：
- 口语化，生动，字数在30字以内。
- 必须要提到这件事，但可以加入你自己的主观情绪（比如羡慕、吐槽、开心等）。
- 不要带任何格式或前缀，直接输出你说的话。`;

  const response = await runLlmTask({
    taskKey: "villager.dialogue",
    scope: `villager:${speaker.id}`,
    prompt,
  });

  return response.text;
};
