import { flushStore, store } from "@/lib/core/store";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { runVillagerTurn } from "@/lib/agents/villager-agent";
import { planDailyHeadline } from "@/lib/agents/director-agent";
import { generateDailyReport } from "@/lib/agents/reporter-agent";

export const runWorldTick = async () => {
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

  store.world.headline = await planDailyHeadline(store.world);
  flushStore();

  return {
    world: store.world,
    eventsCreated: villagers.length,
  };
};

export const runDailyReportTick = async () => {
  const report = await generateDailyReport(store.world, store.events);
  store.reports.unshift(report);
  store.reports = store.reports.slice(0, 30);
  flushStore();
  return report;
};
