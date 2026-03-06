import { DEFAULT_VILLAGERS } from "@/lib/data/villagers";
import type {
  DailyReport,
  IslandEvent,
  MailMessage,
  TickLog,
  VillagerAffinity,
  VillagerRelationship,
  WorldState,
} from "@/lib/core/types";
import { deriveTimeSlot, nextWeather } from "@/lib/world/clock";
import { loadPersistedState, persistState } from "@/lib/core/persistence";
import type { LocationFurniture } from "@/lib/data/locations";
import { VILLAGER_BIOS } from "@/lib/data/villager-profiles";

type MemoryStore = {
  world: WorldState;
  events: IslandEvent[];
  reports: DailyReport[];
  mails: MailMessage[];
  affinities: VillagerAffinity[];
  tickLogs: TickLog[];
  furniture: Record<string, LocationFurniture[]>;
  villagerRelationships: VillagerRelationship[];
};

declare global {
  var __islandStore: MemoryStore | undefined;
}

const buildInitialRelationships = (): VillagerRelationship[] => {
  const now = new Date().toISOString();
  const relationships: VillagerRelationship[] = [];
  const seen = new Set<string>();

  for (const bio of Object.values(VILLAGER_BIOS)) {
    for (const [otherId, rel] of Object.entries(bio.relationships)) {
      const key = [bio.id, otherId].sort().join(":");
      if (seen.has(key)) continue;
      seen.add(key);
      relationships.push({
        villagerA: bio.id,
        villagerB: otherId,
        score: rel.baseScore,
        label: rel.label,
        lastUpdatedAt: now,
      });
    }
  }

  return relationships;
};

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
    tickLogs: [],
    furniture: {},
    villagerRelationships: buildInitialRelationships(),
  };
};

export const store: MemoryStore = globalThis.__islandStore ?? createInitialState();

if (!globalThis.__islandStore) {
  globalThis.__islandStore = store;
}

export const hydrateStore = async () => {
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
  store.tickLogs = persisted.tickLogs ?? [];
  store.furniture = persisted.furniture ?? {};
  store.villagerRelationships =
    persisted.villagerRelationships && persisted.villagerRelationships.length > 0
      ? persisted.villagerRelationships
      : buildInitialRelationships();
};

export const flushStore = async () => {
  await persistState(store);
};
