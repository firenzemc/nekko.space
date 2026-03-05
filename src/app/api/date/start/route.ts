import { NextResponse } from "next/server";
import { runLlmTask } from "@/lib/llm/router";
import { flushStore, hydrateStore, store } from "@/lib/core/store";

export async function POST(request: Request) {
  await hydrateStore();

  const body = (await request.json()) as {
    villagerId?: string;
    location?: string;
    activity?: string;
  };

  const villagerId = body.villagerId?.trim();
  const location = body.location?.trim();
  const activity = body.activity?.trim();

  if (!villagerId || !location || !activity) {
    return NextResponse.json(
      {
        ok: false,
        error: "villagerId, location, and activity 都是必填项。",
      },
      { status: 400 }
    );
  }

  const villager = store.world.villagers.find((item) => item.id === villagerId);
  if (!villager) {
    return NextResponse.json(
      {
        ok: false,
        error: "未找到对应村民。",
      },
      { status: 404 }
    );
  }

  const prompt = `岛主邀请${villager.nameZh}（${villager.personality}）去【${location}】进行【${activity}】。
请作为${villager.nameZh}，基于你的性格特点，生成一句你们在约会过程中的生动对话或反应。
要求：
- 符合角色性格。
- 简短自然（1-3句话）。
- 表现出你们正在一起进行这个活动。`;

  const reply = await runLlmTask({
    taskKey: "date.interact",
    scope: `villager:${villagerId}`,
    prompt,
  });

  const affinity = store.affinities.find((item) => item.villagerId === villagerId);
  if (affinity) {
    affinity.score = Math.max(0, Math.min(100, affinity.score + 5));
    affinity.lastInteractionAt = new Date().toISOString();
  }
  
  const moodDelta = Math.floor(Math.random() * 5) + 3; // +3 to +7
  villager.mood = Math.max(0, Math.min(100, villager.mood + moodDelta));

  store.events.unshift({
    id: `evt_date_${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `与${villager.nameZh}的特别约会`,
    detail: `岛主和${villager.nameZh}一起去${location}进行了${activity}。${villager.nameZh}非常开心！`,
    actors: [villagerId],
    importance: 8,
  });

  await flushStore();

  return NextResponse.json({
    ok: true,
    villager: villager.nameZh,
    reply,
    affinity,
    newMood: villager.mood
  });
}
