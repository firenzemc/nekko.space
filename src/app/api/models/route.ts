import { NextResponse } from "next/server";
import {
  ensureRuntimeOverridesLoaded,
  getModelConfig,
  getRuntimeOverrides,
  setRuntimeOverrides,
} from "@/lib/llm/model-registry";
import type { LlmTaskKey, ModelOverride } from "@/lib/llm/types";

const TASKS: LlmTaskKey[] = [
  "villager.dialogue",
  "villager.letter",
  "director.daily-plan",
  "reporter.daily",
  "memory.compress",
  "decision.light",
];

export async function GET() {
  await ensureRuntimeOverridesLoaded();
  const models = await Promise.all(
    TASKS.map(async (taskKey) => ({
      taskKey,
      config: await getModelConfig(taskKey),
    }))
  );

  return NextResponse.json({ models, runtimeOverrides: getRuntimeOverrides() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { overrides?: ModelOverride[] };
  await setRuntimeOverrides(body.overrides ?? []);
  return NextResponse.json({ ok: true });
}
