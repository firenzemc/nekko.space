import { NextResponse } from "next/server";
import { runLlmTask } from "@/lib/llm/router";

const hasEnv = (name: string) => Boolean(process.env[name] && process.env[name]?.length);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probe = searchParams.get("probe") === "1";

  const envStatus = {
    AI_GATEWAY_API_KEY: hasEnv("AI_GATEWAY_API_KEY"),
    AI_GATEWAY_BASE_URL: hasEnv("AI_GATEWAY_BASE_URL"),
    CUSTOM_LLM_BASE_URL: hasEnv("CUSTOM_LLM_BASE_URL"),
    CUSTOM_LLM_API_KEY: hasEnv("CUSTOM_LLM_API_KEY"),
    MINIMAX_API_KEY: hasEnv("MINIMAX_API_KEY"),
    CRON_SECRET: hasEnv("CRON_SECRET"),
  };

  if (!probe) {
    return NextResponse.json({
      ok: true,
      mode: "config-only",
      envStatus,
      hint: "Append ?probe=1 to run low-cost LLM health probes.",
    });
  }

  const checks = await Promise.all([
    runLlmTask({
      taskKey: "decision.light",
      prompt: "健康检查：只返回 好。",
    }),
    runLlmTask({
      taskKey: "villager.dialogue",
      scope: "villager:merengue",
      prompt: "健康检查：用一句简短中文问候。",
    }),
  ]);

  const [decisionCheck, villagerCheck] = checks;

  return NextResponse.json({
    ok: true,
    mode: "probe",
    envStatus,
    checks: {
      decision: {
        provider: decisionCheck.provider,
        model: decisionCheck.model,
        isMockFallback: decisionCheck.isMockFallback,
        preview: decisionCheck.text.slice(0, 80),
      },
      villager: {
        provider: villagerCheck.provider,
        model: villagerCheck.model,
        isMockFallback: villagerCheck.isMockFallback,
        preview: villagerCheck.text.slice(0, 80),
      },
    },
  });
}
