import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DailyReport, IslandEvent, WorldState } from "@/lib/core/types";
import type { ModelOverride } from "@/lib/llm/types";

type PersistedState = {
  world: WorldState;
  events: IslandEvent[];
  reports: DailyReport[];
};

const DATA_DIR = join(process.cwd(), ".data");
const STATE_FILE = join(DATA_DIR, "state.json");
const OVERRIDES_FILE = join(DATA_DIR, "model-overrides.json");

const ensureDir = () => {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
};

export const loadPersistedState = (): PersistedState | null => {
  try {
    if (!existsSync(STATE_FILE)) return null;
    const content = readFileSync(STATE_FILE, "utf8");
    const data = JSON.parse(content) as PersistedState;
    return data;
  } catch {
    return null;
  }
};

export const persistState = (state: PersistedState) => {
  try {
    ensureDir();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Vercel Serverless 可能不允许写入，失败时静默回退到内存。
  }
};

export const loadPersistedOverrides = (): ModelOverride[] => {
  try {
    if (!existsSync(OVERRIDES_FILE)) return [];
    const content = readFileSync(OVERRIDES_FILE, "utf8");
    const data = JSON.parse(content) as ModelOverride[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const persistOverrides = (overrides: ModelOverride[]) => {
  try {
    ensureDir();
    writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf8");
  } catch {
    // ignore
  }
};
