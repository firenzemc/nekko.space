import { flushStore, hydrateStore, store } from "@/lib/core/store";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { runVillagerTurn } from "@/lib/agents/villager-agent";
import { planDailyPlot } from "@/lib/agents/director-agent";
import { generateDailyReport } from "@/lib/agents/reporter-agent";
import {
  generateGossip,
  updateRelationshipAfterGossip,
} from "@/lib/agents/gossip/engine";
import { runLlmTask } from "@/lib/llm/router";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";

const maybeSendVillagerMail = async () => {
  if (Math.random() > 0.28) return;
  if (store.world.villagers.length === 0) return;

  const villager =
    store.world.villagers[Math.floor(Math.random() * store.world.villagers.length)];
  if (!villager) return;

  const affinity = store.affinities.find((item) => item.villagerId === villager.id);
  const bio = VILLAGER_BIOS[villager.id];
  const affinityScore = affinity?.score ?? 60;
  const toneHint =
    affinityScore >= 80
      ? "语气亲密，像对好朋友一样"
      : affinityScore >= 60
        ? "语气友好热情"
        : "语气礼貌但保持距离";
  const prompt = `请给岛主写一封简短中文信件（2-3句），分享你在${store.world.timeSlot}、${store.world.weather}天气里的小见闻，并带一句温暖问候。${toneHint}。`;
  const reply = await runLlmTask({
    taskKey: "villager.letter",
    scope: `villager:${villager.id}`,
    systemPrompt: bio?.systemPromptCore,
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
        recentEvents: store.events.slice(0, 5),
        affinity: store.affinities.find((a) => a.villagerId === villager.id),
        villagerRelationships: store.villagerRelationships,
        plotHook: store.world.plotHook,
      })
    )
  );

  store.world.villagers = villagers.map((item) => item.villager);
  store.events.unshift(...villagers.map((item) => item.event));
  store.events = store.events.slice(0, 200);

  // Gossip system: random chance for two villagers to chat about recent events
  if (store.world.villagers.length >= 2 && Math.random() > 0.6) {
    const shuffled = [...store.world.villagers].sort(() => Math.random() - 0.5);
    const speaker = shuffled[0];
    const listener = shuffled[1];
    const gossipText = await generateGossip(
      speaker,
      listener,
      store.world,
      store.events,
      store.villagerRelationships
    );
    if (gossipText) {
      store.events.unshift({
        id: `evt_gossip_${Date.now()}`,
        timestamp: nowIso,
        title: `${speaker.nameZh}和${listener.nameZh}的悄悄话`,
        detail: `${speaker.nameZh}对${listener.nameZh}说：”${gossipText}”`,
        actors: [speaker.id, listener.id],
        importance: 5,
      });
      updateRelationshipAfterGossip(
        speaker.id,
        listener.id,
        store.villagerRelationships
      );
    }
  }

  await maybeSendVillagerMail();

  const dailyPlot = await planDailyPlot(store.world, store.events);
  store.world.headline = dailyPlot.headline;
  store.world.plotHook = dailyPlot.plotHook;

  store.tickLogs.unshift({
    id: `tick_${Date.now()}`,
    timestamp: nowIso,
    timeSlot: store.world.timeSlot,
    weather: store.world.weather,
    headline: store.world.headline,
    decisions: villagers.map((item) => item.decision),
  });
  store.tickLogs = store.tickLogs.slice(0, 120);

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
