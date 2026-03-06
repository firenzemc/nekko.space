import { NextResponse } from "next/server";
import { flushStore, hydrateStore, store } from "@/lib/core/store";
import { runLlmTask } from "@/lib/llm/router";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";

export async function POST(request: Request) {
  await hydrateStore();

  const body = (await request.json()) as {
    villagerId?: string;
    giftName?: string;
  };

  const villagerId = body.villagerId?.trim();
  const giftName = body.giftName?.trim();

  if (!villagerId || !giftName) {
    return NextResponse.json(
      {
        ok: false,
        error: "villagerId 和 giftName 必填。",
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

  const affinity = store.affinities.find((item) => item.villagerId === villagerId);
  if (!affinity) {
    return NextResponse.json({ ok: false, error: "关系数据异常。" }, { status: 500 });
  }

  const bio = VILLAGER_BIOS[villagerId];
  const likeKeywords = bio?.likes ?? ["蛋糕", "水果", "咖啡", "花", "围巾", "乐器", "点心", "料理"];
  const matched = likeKeywords.some((keyword) => giftName.includes(keyword));
  const delta = matched ? 5 : 2;

  affinity.score = Math.max(0, Math.min(100, affinity.score + delta));
  affinity.lastInteractionAt = new Date().toISOString();

  // Generate personalized reaction via LLM
  let reaction = `${villager.nameZh}看起来${matched ? "非常开心" : "还不错"}。`;
  if (bio) {
    try {
      const result = await runLlmTask({
        taskKey: "villager.dialogue",
        scope: `villager:${villagerId}`,
        systemPrompt: bio.systemPromptCore,
        prompt: `岛主送给你一份礼物：${giftName}。${matched ? "这是你喜欢的东西！" : "这不太是你平时喜欢的东西。"}请用符合你性格的口吻，用1-2句话表达你的反应。不要加任何格式或前缀。`,
      });
      reaction = result.text;
    } catch {
      // fallback to default reaction
    }
  }

  store.events.unshift({
    id: `evt_gift_${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `${villager.nameZh}收到了礼物`,
    detail: `岛主送给${villager.nameZh}一份礼物：${giftName}。${reaction}`,
    actors: [villagerId],
    importance: matched ? 7 : 5,
  });

  await flushStore();

  return NextResponse.json({
    ok: true,
    villager: villager.nameZh,
    giftName,
    affinity,
    reaction,
  });
}
