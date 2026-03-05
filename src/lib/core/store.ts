import { DEFAULT_VILLAGERS } from "@/lib/data/villagers";
import type {
  DailyReport,
  IslandEvent,
  MailMessage,
  VillagerAffinity,
  WorldState,
} from "@/lib/core/types";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { loadPersistedState, persistState } from "@/lib/core/persistence";

type MemoryStore = {
  world: WorldState;
  events: IslandEvent[];
  reports: DailyReport[];
  mails: MailMessage[];
  affinities: VillagerAffinity[];
};

declare global {
  var __islandStore: MemoryStore | undefined;
}

const createInitialState = (): MemoryStore => {
  const now = new Date();
  return {
    world: {
      dayKey: now.toISOString().slice(0, 10),
      timeSlot: deriveTimeSlot(now.getHours()),
      weather: nextWeather(),
      headline: "岛屿一切安好，居民们正在开始新一天。",
      villagers: DEFAULT_VILLAGERS,
      lastUpdatedAt: now.toISOString(),
    },
    events: [],
    reports: [],
    mails: [],
    affinities: DEFAULT_VILLAGERS.map((villager) => ({
      villagerId: villager.id,
      score: 60,
      lastInteractionAt: now.toISOString(),
    })),
  };
};

export const store: MemoryStore = globalThis.__islandStore ?? createInitialState();

if (!globalThis.__islandStore) {
  globalThis.__islandStore = store;
}

let hydratePromise: Promise<void> | null = null;

export const hydrateStore = async () => {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      const persisted = await loadPersistedState();
      if (!persisted) return;
      store.world = persisted.world;
      store.events = persisted.events;
      store.reports = persisted.reports;
      store.mails = persisted.mails ?? [];
      store.affinities =
        persisted.affinities ??
        store.world.villagers.map((villager) => ({
          villagerId: villager.id,
          score: 60,
          lastInteractionAt: new Date().toISOString(),
        }));
    })();
  }

  await hydratePromise;
};

export const flushStore = async () => {
  await persistState(store);
};
