import { NextResponse } from "next/server";
import { hydrateStore, store } from "@/lib/core/store";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await hydrateStore();

  const villagerId = request.nextUrl.searchParams.get("villagerId");

  const events = villagerId
    ? store.events.filter((e) => e.actors.includes(villagerId)).slice(0, 30)
    : store.events.slice(0, 30);

  return NextResponse.json({
    world: store.world,
    latestEvents: events,
    reports: store.reports.slice(0, 5),
    mails: store.mails.slice(0, 20),
    affinities: store.affinities,
    tickLogs: store.tickLogs.slice(0, 20),
    villagerRelationships: store.villagerRelationships,
  });
}
