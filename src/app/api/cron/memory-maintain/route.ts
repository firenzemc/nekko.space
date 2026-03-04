import { NextResponse } from "next/server";
import { flushStore, store } from "@/lib/core/store";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const compacted = store.events.length;
  store.events = store.events.slice(0, 120);
  flushStore();

  return NextResponse.json({
    ok: true,
    message: "记忆维护完成（MVP: 保留最近120条事件）",
    before: compacted,
    after: store.events.length,
  });
}
