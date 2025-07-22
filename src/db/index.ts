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

// Create a fresh connection with better configuration
const createConnection = () => {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 20, // Maximum number of connections
    idle_timeout: 20,
    connect_timeout: 60,
    ssl: process.env.NODE_ENV === "production" ? "require" : "prefer",
  });

  return drizzle({
    client: sql,
    schema: { ...schema, ...relations },
    logger: process.env.NODE_ENV === "development",
  });
};

if (!global.db) {
  global.db = createConnection();
}

// biome-ignore lint/suspicious/noRedeclare: idk why but it works!
// biome-ignore lint/style/noNonNullAssertion: aa aa
export const db = global.db!;
export * from "@/db/schema";
