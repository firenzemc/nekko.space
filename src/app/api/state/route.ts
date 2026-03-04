import { NextResponse } from "next/server";
import { hydrateStore, store } from "@/lib/core/store";

export async function GET() {
  await hydrateStore();

  return NextResponse.json({
    world: store.world,
    latestEvents: store.events.slice(0, 10),
    reports: store.reports.slice(0, 5),
  });
}
