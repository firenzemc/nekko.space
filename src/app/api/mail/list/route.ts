import { NextResponse } from "next/server";
import { hydrateStore, store } from "@/lib/core/store";

export async function GET(request: Request) {
  await hydrateStore();

  const { searchParams } = new URL(request.url);
  const villagerId = searchParams.get("villagerId");

  const mails = villagerId
    ? store.mails.filter((mail) => mail.villagerId === villagerId)
    : store.mails;

  return NextResponse.json({
    ok: true,
    total: mails.length,
    mails: mails.slice(0, 100),
  });
}
