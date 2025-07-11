import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "@/db/relations";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  var sql: ReturnType<typeof postgres> | undefined;
  var db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

if (!global.db) {
  if (!global.sql) {
    global.sql = postgres(process.env.DATABASE_URL);
  }

  global.db = drizzle({
    client: global.sql,
    schema: { ...schema, ...relations },
    logger: false,
  });
}

// biome-ignore lint/suspicious/noRedeclare: idk why but it works!
export const db = global.db;
export * from "@/db/schema";
