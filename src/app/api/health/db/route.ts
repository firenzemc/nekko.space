import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db/client";
import { kvStore } from "@/lib/db/schema";

const HEALTH_KEY = "_db_health";

const detectConnectionSource = () => {
  if (process.env.DATABASE_URL) return "DATABASE_URL";
  if (process.env.POSTGRES_URL) return "POSTGRES_URL";
  if (process.env.POSTGRES_URL_NON_POOLING) return "POSTGRES_URL_NON_POOLING";
  return "none";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probe = searchParams.get("probe") === "1";

  const envStatus = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
  };

  if (!probe) {
    return NextResponse.json({
      ok: true,
      mode: "config-only",
      hasDatabase,
      connectionSource: detectConnectionSource(),
      envStatus,
      hint: "Append ?probe=1 to run a read/write database check.",
    });
  }

  if (!hasDatabase || !db) {
    return NextResponse.json(
      {
        ok: false,
        mode: "probe",
        hasDatabase,
        connectionSource: detectConnectionSource(),
        envStatus,
        error: "No database connection string found in runtime env.",
      },
      { status: 500 }
    );
  }

  try {
    await db.execute(sql`select 1`);
    await db.execute(sql`
      create table if not exists kv_store (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      )
    `);

    const payload = {
      ts: new Date().toISOString(),
      status: "ok",
    };

    await db
      .insert(kvStore)
      .values({
        key: HEALTH_KEY,
        value: payload,
      })
      .onConflictDoUpdate({
        target: kvStore.key,
        set: {
          value: payload,
          updatedAt: sql`now()`,
        },
      });

    const rows = await db
      .select({ value: kvStore.value, updatedAt: kvStore.updatedAt })
      .from(kvStore)
      .where(eq(kvStore.key, HEALTH_KEY))
      .limit(1);

    return NextResponse.json({
      ok: true,
      mode: "probe",
      hasDatabase,
      connectionSource: detectConnectionSource(),
      envStatus,
      check: {
        wroteAndRead: Boolean(rows[0]),
        rowUpdatedAt: rows[0]?.updatedAt ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode: "probe",
        hasDatabase,
        connectionSource: detectConnectionSource(),
        envStatus,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
