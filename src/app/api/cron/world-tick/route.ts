import { NextResponse } from "next/server";
import { runWorldTick } from "@/lib/world/tick";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runWorldTick();
  return NextResponse.json({ ok: true, ...result });
}
