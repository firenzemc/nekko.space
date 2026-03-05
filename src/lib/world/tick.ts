import { flushStore, hydrateStore, store } from "@/lib/core/store";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { runVillagerTurn } from "@/lib/agents/villager-agent";
import { planDailyHeadline } from "@/lib/agents/director-agent";
import { generateDailyReport } from "@/lib/agents/reporter-agent";
import { runLlmTask } from "@/lib/llm/router";

const maybeSendVillagerMail = async () => {
  if (Math.random() > 0.28) return;
  if (store.world.villagers.length === 0) return;

  const villager =
    store.world.villagers[Math.floor(Math.random() * store.world.villagers.length)];
  if (!villager) return;

  const affinity = store.affinities.find((item) => item.villagerId === villager.id);
  const prompt = `你是${villager.nameZh}（${villager.personality}）。请给岛主写一封简短中文信件（2-3句），分享你在${store.world.timeSlot}、${store.world.weather}天气里的小见闻，并带一句温暖问候。`;
  const reply = await runLlmTask({
    taskKey: "villager.letter",
    scope: `villager:${villager.id}`,
    prompt,
  });

  store.mails.unshift({
    id: `mail_auto_${Date.now()}`,
    fromType: "villager",
    fromId: villager.id,
    toType: "user",
    toId: "user",
    villagerId: villager.id,
    subject: `${villager.nameZh}的来信`,
    content: reply.text,
    createdAt: new Date().toISOString(),
  });
  store.mails = store.mails.slice(0, 300);

  if (affinity) {
    affinity.score = Math.max(0, Math.min(100, affinity.score + 1));
    affinity.lastInteractionAt = new Date().toISOString();
  }

  store.events.unshift({
    id: `evt_auto_mail_${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `${villager.nameZh}寄来了一封信`,
    detail: `${villager.nameZh}主动给岛主寄了一封信，分享了今天的小岛见闻。`,
    actors: [villager.id],
    importance: 5,
  });
};

export const runWorldTick = async () => {
  await hydrateStore();

  const now = new Date();
  const nowIso = now.toISOString();

  store.world.timeSlot = deriveTimeSlot(now.getHours());
  store.world.weather = nextWeather();
  store.world.lastUpdatedAt = nowIso;

  const villagers = await Promise.all(
    store.world.villagers.map((villager) =>
      runVillagerTurn(villager, {
        timeSlot: store.world.timeSlot,
        weather: store.world.weather,
        nowIso,
      })
    )
  );

  store.world.villagers = villagers.map((item) => item.villager);
  store.events.unshift(...villagers.map((item) => item.event));
  store.events = store.events.slice(0, 200);

  await maybeSendVillagerMail();

  store.world.headline = await planDailyHeadline(store.world);
  await flushStore();

  return {
    world: store.world,
    eventsCreated: villagers.length,
  };
};

export const runDailyReportTick = async () => {
  await hydrateStore();

  const report = await generateDailyReport(store.world, store.events);
  store.reports.unshift(report);
  store.reports = store.reports.slice(0, 30);
  await flushStore();
  return report;
};
