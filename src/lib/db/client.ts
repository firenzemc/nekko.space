import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

export const hasDatabase = Boolean(databaseUrl);

export const db = hasDatabase
  ? drizzle(neon(databaseUrl as string), { schema })
  : null;
