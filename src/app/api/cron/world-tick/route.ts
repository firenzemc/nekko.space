import { NextResponse } from "next/server";
import { runWorldTick } from "@/lib/world/tick";
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

  const result = await runWorldTick();
  return NextResponse.json({ ok: true, ...result });
}
