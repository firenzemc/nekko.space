import { NextResponse } from "next/server";
import { hydrateStore, store } from "@/lib/core/store";
import { runWorldTick } from "@/lib/world/tick";

const MIN_INTERVAL_MS = 30_000; // 30 seconds cooldown

export async function POST() {
  await hydrateStore();

  // Rate limit check
  const lastUpdated = store.world.lastUpdatedAt;
  if (lastUpdated) {
    const elapsed = Date.now() - new Date(lastUpdated).getTime();
    if (elapsed < MIN_INTERVAL_MS) {
      const remaining = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
      return NextResponse.json(
        {
          ok: false,
          error: `请等待 ${remaining} 秒后再推进`,
          cooldownSeconds: remaining,
        },
        { status: 429 }
      );
    }
  }

  const result = await runWorldTick();

  return NextResponse.json({
    ok: true,
    timeSlot: result.world.timeSlot,
    weather: result.world.weather,
    headline: result.world.headline,
    eventsCreated: result.eventsCreated,
  });
}
