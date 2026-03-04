import { NextResponse } from "next/server";
import {
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
  const models = TASKS.map((taskKey) => ({
    taskKey,
    config: getModelConfig(taskKey),
  }));

  return NextResponse.json({ models, runtimeOverrides: getRuntimeOverrides() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { overrides?: ModelOverride[] };
  setRuntimeOverrides(body.overrides ?? []);
  return NextResponse.json({ ok: true });
}
