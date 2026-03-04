import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    villagerId?: string;
    content?: string;
  };

  return NextResponse.json({
    ok: true,
    message: "信件系统将在 MVP2 接入真实收发逻辑。",
    received: body,
  });
}
