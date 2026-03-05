import { NextResponse } from "next/server";
import { flushStore, hydrateStore, store } from "@/lib/core/store";
import { isAuthorizedCronRequest } from "@/lib/api/cron-auth";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "Use Authorization Bearer CRON_SECRET or Vercel Cron internal header.",
      },
      { status: 401 }
    );
  }

  await hydrateStore();

  const compacted = store.events.length;
  store.events = store.events.slice(0, 120);
  await flushStore();

  return NextResponse.json({
    ok: true,
    message: "记忆维护完成（MVP: 保留最近120条事件）",
    before: compacted,
    after: store.events.length,
  });
}
