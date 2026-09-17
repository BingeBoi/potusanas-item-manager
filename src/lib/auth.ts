import "server-only";

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { assertPersistentStore, getSql, isUniqueViolation, usesOnlineDatabase } from "@/lib/db";

const scrypt = promisify(scryptCallback);
const usersFile = path.join(process.cwd(), "data", "users.json");
const sessionDuration = 7 * 24 * 60 * 60 * 1000;
// This is only used on a local development machine. Production requires the
// SESSION_SECRET environment variable, so deploys never use this value.
const developmentSessionSecret = "item-manager-local-development-session-secret";

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

export type CurrentUser = Pick<StoredUser, "id" | "email">;

async function getUsers(): Promise<StoredUser[]> {
  try {
    return JSON.parse(await readFile(usersFile, "utf8")) as StoredUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveUsers(users: StoredUser[]) {
  await mkdir(path.dirname(usersFile), { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validCredentials(email: string, password: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8;
}

async function findUser(email: string): Promise<StoredUser | undefined> {
  assertPersistentStore();
  if (usesOnlineDatabase()) {
    const sql = await getSql();
    const [user] = await sql`
      SELECT id, email, password_hash AS "passwordHash", password_salt AS "passwordSalt"
      FROM users
      WHERE email = ${email}
    `;
    return user as StoredUser | undefined;
  }
  return (await getUsers()).find((candidate) => candidate.email === email);
}

export async function createUser(email: string, password: string): Promise<CurrentUser> {
  const normalizedEmail = normalizeEmail(email);
  if (!validCredentials(normalizedEmail, password)) {
    throw new Error("Use a valid email and a password with at least 8 characters.");
  }

  if (await findUser(normalizedEmail)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }

  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = ((await scrypt(password, passwordSalt, 64)) as Buffer).toString("hex");
  const user: StoredUser = {
    id: randomBytes(16).toString("hex"),
    email: normalizedEmail,
    passwordHash,
    passwordSalt,
  };

  if (usesOnlineDatabase()) {
    try {
      const sql = await getSql();
      await sql`
        INSERT INTO users (id, email, password_hash, password_salt)
        VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.passwordSalt})
      `;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new Error("An account with this email already exists. Sign in instead.");
      }
      throw error;
    }
  } else {
    await saveUsers([...(await getUsers()), user]);
  }

  return { id: user.id, email: user.email };
}

export async function verifyUser(email: string, password: string): Promise<CurrentUser | null> {
  const user = await findUser(normalizeEmail(email));
  if (!user) return null;

  const attemptedHash = (await scrypt(password, user.passwordSalt, 64)) as Buffer;
  const storedHash = Buffer.from(user.passwordHash, "hex");
  if (!timingSafeEqual(attemptedHash, storedHash)) return null;
  return { id: user.id, email: user.email };
}

function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return developmentSessionSecret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: CurrentUser, remember: boolean) {
  const expiresAt = Date.now() + (remember ? sessionDuration : 24 * 60 * 60 * 1000);
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, expiresAt })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function getUserFromSession(token?: string): CurrentUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const receivedSignature = Buffer.from(signature);
  const expectedSignature = Buffer.from(sign(payload));
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CurrentUser & { expiresAt: number };
    if (!session.id || !session.email || session.expiresAt < Date.now()) return null;
    return { id: session.id, email: session.email };
  } catch {
    return null;
  }
}
