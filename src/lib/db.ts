import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let sql: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function usesOnlineDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function assertPersistentStore() {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured in production.");
  }
}

export async function getSql() {
  assertPersistentStore();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  sql ??= neon(process.env.DATABASE_URL);
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL
    )
  `.then(async () => {
    await sql!`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        sku TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        quantity INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `;
    await sql!`CREATE INDEX IF NOT EXISTS items_user_id_idx ON items (user_id)`;
  });
  await schemaReady;
  return sql;
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";
}
