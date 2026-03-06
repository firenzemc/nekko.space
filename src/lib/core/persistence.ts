import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq, sql } from "drizzle-orm";
import type {
  DailyReport,
  IslandEvent,
  MailMessage,
  TickLog,
  VillagerAffinity,
  VillagerRelationship,
  WorldState,
} from "@/lib/core/types";
import { db, hasDatabase } from "@/lib/db/client";
import { kvStore } from "@/lib/db/schema";
import type { ModelOverride } from "@/lib/llm/types";
import type { LocationFurniture } from "@/lib/data/locations";

type PersistedState = {
  world: WorldState;
  events: IslandEvent[];
  reports: DailyReport[];
  mails?: MailMessage[];
  affinities?: VillagerAffinity[];
  tickLogs?: TickLog[];
  furniture?: Record<string, LocationFurniture[]>;
  villagerRelationships?: VillagerRelationship[];
};

const STATE_KEY = "island_state";
const MODEL_OVERRIDES_KEY = "model_overrides";

const DATA_DIR = join(process.cwd(), ".data");
const STATE_FILE = join(DATA_DIR, "state.json");
const OVERRIDES_FILE = join(DATA_DIR, "model-overrides.json");

let databaseReady: Promise<boolean> | null = null;

const ensureDatabase = async (): Promise<boolean> => {
  if (!hasDatabase || !db) return false;

  if (!databaseReady) {
    databaseReady = db
      .execute(sql`
        create table if not exists kv_store (
          key text primary key,
          value jsonb not null,
          updated_at timestamptz not null default now()
        )
      `)
      .then(() => true)
      .catch(() => false);
  }

  return databaseReady;
};

const ensureDir = () => {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
};

export const loadPersistedState = async (): Promise<PersistedState | null> => {
  if (await ensureDatabase()) {
    const rows = await db!
      .select({ value: kvStore.value })
      .from(kvStore)
      .where(eq(kvStore.key, STATE_KEY))
      .limit(1);
    const value = rows[0]?.value as PersistedState | undefined;
    if (value) return value;
  }

  try {
    if (!existsSync(STATE_FILE)) return null;
    const content = readFileSync(STATE_FILE, "utf8");
    const data = JSON.parse(content) as PersistedState;
    return data;
  } catch {
    return null;
  }
};

export const persistState = async (state: PersistedState) => {
  if (await ensureDatabase()) {
    await db!
      .insert(kvStore)
      .values({ key: STATE_KEY, value: state })
      .onConflictDoUpdate({
        target: kvStore.key,
        set: {
          value: state,
          updatedAt: sql`now()`,
        },
      });
    return;
  }

  try {
    ensureDir();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Vercel Serverless 可能不允许写入，失败时静默回退到内存。
  }
};

export const loadPersistedOverrides = async (): Promise<ModelOverride[]> => {
  if (await ensureDatabase()) {
    const rows = await db!
      .select({ value: kvStore.value })
      .from(kvStore)
      .where(eq(kvStore.key, MODEL_OVERRIDES_KEY))
      .limit(1);
    const value = rows[0]?.value as ModelOverride[] | undefined;
    return Array.isArray(value) ? value : [];
  }

  try {
    if (!existsSync(OVERRIDES_FILE)) return [];
    const content = readFileSync(OVERRIDES_FILE, "utf8");
    const data = JSON.parse(content) as ModelOverride[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const persistOverrides = async (overrides: ModelOverride[]) => {
  if (await ensureDatabase()) {
    await db!
      .insert(kvStore)
      .values({ key: MODEL_OVERRIDES_KEY, value: overrides })
      .onConflictDoUpdate({
        target: kvStore.key,
        set: {
          value: overrides,
          updatedAt: sql`now()`,
        },
      });
    return;
  }

  try {
    ensureDir();
    writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf8");
  } catch {
    // ignore
  }
};
