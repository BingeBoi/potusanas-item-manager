import "server-only";

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

let sql: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function usesOnlineDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function isNextProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function assertPersistentStore() {
  // `next build` sets NODE_ENV=production. Do not require DATABASE_URL while
  // pages are compiled; Vercel only needs it when the live app reads/writes data.
  if (isNextProductionBuild()) {
    return;
  }
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured in production.");
  }
}

function neonSql(databaseUrl: string): Sql {
  const parsed = new URL(databaseUrl);
  const endpoint = `${parsed.protocol}//${parsed.host}/sql`;

  return async (strings, ...values) => {
    let query = strings[0] ?? "";
    const params: unknown[] = [];
    values.forEach((value, index) => {
      params.push(value);
      query += `$${index + 1}${strings[index + 1] ?? ""}`;
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "neon-connection-string": databaseUrl,
      },
      body: JSON.stringify({ query, params }),
    });

    const result = (await response.json()) as {
      rows?: Record<string, unknown>[];
      message?: string;
      code?: string;
      error?: string;
    };

    if (!response.ok) {
      const error = new Error(result.message ?? result.error ?? "Database query failed.") as Error & { code?: string };
      error.code = result.code;
      throw error;
    }

    return result.rows ?? [];
  };
}

export async function getSql() {
  assertPersistentStore();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  sql ??= neonSql(process.env.DATABASE_URL);
  schemaReady ??= (async () => {
    await sql!`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL
      )
    `;
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
  })();
  await schemaReady;
  return sql;
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";
}
