import { DEFAULT_VILLAGERS } from "@/lib/data/villagers";
import type { DailyReport, IslandEvent, WorldState } from "@/lib/core/types";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { loadPersistedState, persistState } from "@/lib/core/persistence";

type MemoryStore = {
  world: WorldState;
  events: IslandEvent[];
  reports: DailyReport[];
};

declare global {
  var __islandStore: MemoryStore | undefined;
}

const createInitialState = (): MemoryStore => {
  const persisted = loadPersistedState();
  if (persisted) return persisted;

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
  };
};

export const store: MemoryStore = globalThis.__islandStore ?? createInitialState();

if (!globalThis.__islandStore) {
  globalThis.__islandStore = store;
}

export const flushStore = () => {
  persistState(store);
};
