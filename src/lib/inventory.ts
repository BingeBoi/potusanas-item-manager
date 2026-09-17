import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertPersistentStore, getSql, usesOnlineDatabase } from "@/lib/db";
import type { InventoryItem, InventoryItemInput } from "@/lib/inventory-types";

type InventoryStore = Record<string, InventoryItem[]>;
const inventoryFile = path.join(process.cwd(), "data", "inventory.json");
export const GUEST_USER_ID = "prototype-guest";

async function getStore(): Promise<InventoryStore> {
  try {
    return JSON.parse(await readFile(inventoryFile, "utf8")) as InventoryStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function saveStore(store: InventoryStore) {
  await mkdir(path.dirname(inventoryFile), { recursive: true });
  await writeFile(inventoryFile, JSON.stringify(store, null, 2), "utf8");
}

export function validateItem(input: unknown): InventoryItemInput {
  const data = input as Partial<InventoryItemInput>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const sku = typeof data.sku === "string" ? data.sku.trim() : "";
  const location = typeof data.location === "string" ? data.location.trim() : "";
  const quantity = typeof data.quantity === "number" ? data.quantity : Number(data.quantity);
  if (!name) throw new Error("Item name is required.");
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Quantity must be a whole number of zero or more.");
  return { name, sku, location, quantity };
}

function toItem(row: Record<string, unknown>): InventoryItem {
  const updatedAt = row.updatedAt ?? row.updated_at;
  return {
    id: String(row.id),
    name: String(row.name),
    sku: String(row.sku ?? ""),
    location: String(row.location ?? ""),
    quantity: Number(row.quantity),
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt),
  };
}

export async function getItems(userId: string) {
  assertPersistentStore();
  if (usesOnlineDatabase()) {
    const sql = await getSql();
    const rows = await sql`
      SELECT id, name, sku, location, quantity, updated_at AS "updatedAt"
      FROM items
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return rows.map(toItem);
  }
  return (await getStore())[userId] ?? [];
}

export async function addItem(userId: string, input: InventoryItemInput) {
  const item: InventoryItem = { id: randomBytes(12).toString("hex"), ...input, updatedAt: new Date().toISOString() };
  assertPersistentStore();
  if (usesOnlineDatabase()) {
    const sql = await getSql();
    await sql`
      INSERT INTO items (id, user_id, name, sku, location, quantity, updated_at)
      VALUES (${item.id}, ${userId}, ${item.name}, ${item.sku}, ${item.location}, ${item.quantity}, ${item.updatedAt})
    `;
    return item;
  }
  const store = await getStore();
  store[userId] = [item, ...(store[userId] ?? [])];
  await saveStore(store);
  return item;
}

export async function updateItem(userId: string, id: string, input: InventoryItemInput) {
  assertPersistentStore();
  if (usesOnlineDatabase()) {
    const sql = await getSql();
    const updatedAt = new Date().toISOString();
    const rows = await sql`
      UPDATE items
      SET name = ${input.name}, sku = ${input.sku}, location = ${input.location}, quantity = ${input.quantity}, updated_at = ${updatedAt}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, name, sku, location, quantity, updated_at AS "updatedAt"
    `;
    return rows[0] ? toItem(rows[0]) : null;
  }
  const store = await getStore();
  const items = store[userId] ?? [];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const item = { ...items[index], ...input, updatedAt: new Date().toISOString() };
  items[index] = item;
  store[userId] = items;
  await saveStore(store);
  return item;
}

export async function deleteItem(userId: string, id: string) {
  assertPersistentStore();
  if (usesOnlineDatabase()) {
    const sql = await getSql();
    const rows = await sql`
      DELETE FROM items
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    return rows.length > 0;
  }
  const store = await getStore();
  const items = store[userId] ?? [];
  if (!items.some((item) => item.id === id)) return false;
  store[userId] = items.filter((item) => item.id !== id);
  await saveStore(store);
  return true;
}
