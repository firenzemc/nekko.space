import { NextResponse } from "next/server";
import { store } from "@/lib/core/store";

export async function GET() {
  return NextResponse.json({
    world: store.world,
    latestEvents: store.events.slice(0, 10),
    reports: store.reports.slice(0, 5),
  });
}
