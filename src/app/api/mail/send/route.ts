import { NextResponse } from "next/server";
import { runLlmTask } from "@/lib/llm/router";
import { flushStore, hydrateStore, store } from "@/lib/core/store";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";

const userName = "岛主";

const getAffinityDelta = (content: string): number => {
  const positive = ["谢谢", "喜欢", "开心", "请", "辛苦", "好吃", "一起"];
  const negative = ["讨厌", "笨", "生气", "无聊", "走开", "不想"];

  const text = content.toLowerCase();
  let delta = 1;

  for (const token of positive) {
    if (text.includes(token)) delta += 1;
  }
  for (const token of negative) {
    if (text.includes(token)) delta -= 2;
  }

  return Math.max(-6, Math.min(8, delta));
};

export async function POST(request: Request) {
  await hydrateStore();

  const body = (await request.json()) as {
    villagerId?: string;
    subject?: string;
    content?: string;
  };

  const villagerId = body.villagerId?.trim();
  const content = body.content?.trim();
  const subject = body.subject?.trim() || "来自岛主的来信";

  if (!villagerId || !content) {
    return NextResponse.json(
      {
        ok: false,
        error: "villagerId 和 content 必填。",
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

  const now = new Date().toISOString();
  const userMail = {
    id: `mail_user_${Date.now()}`,
    fromType: "user" as const,
    fromId: "user",
    toType: "villager" as const,
    toId: villagerId,
    villagerId,
    subject,
    content,
    createdAt: now,
  };

  const bio = VILLAGER_BIOS[villagerId];
  const reply = await runLlmTask({
    taskKey: "villager.letter",
    scope: `villager:${villagerId}`,
    systemPrompt: bio?.systemPromptCore,
    prompt: `岛主来信主题：${subject}，内容：${content}。请回一封温暖、简短、有角色感的中文回信（2-4句）。`,
  });

  const villagerMail = {
    id: `mail_villager_${Date.now()}`,
    fromType: "villager" as const,
    fromId: villagerId,
    toType: "user" as const,
    toId: "user",
    villagerId,
    subject: `${villager.nameZh}的回信`,
    content: reply.text,
    createdAt: new Date().toISOString(),
  };

  store.mails.unshift(villagerMail, userMail);
  store.mails = store.mails.slice(0, 300);

  const affinity = store.affinities.find((item) => item.villagerId === villagerId);
  if (affinity) {
    affinity.score = Math.max(0, Math.min(100, affinity.score + getAffinityDelta(content)));
    affinity.lastInteractionAt = new Date().toISOString();
  }

  store.events.unshift({
    id: `evt_mail_${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `${villager.nameZh}收到了来信`,
    detail: `${userName}给${villager.nameZh}写了一封信，${villager.nameZh}已回复。`,
    actors: [villagerId],
    importance: 6,
  });

  await flushStore();

  return NextResponse.json({
    ok: true,
    villager: villager.nameZh,
    reply,
    affinity: affinity ?? null,
  });
}
