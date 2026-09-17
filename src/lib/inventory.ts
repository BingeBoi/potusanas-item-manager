import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InventoryItem, InventoryItemInput } from "@/lib/inventory-types";

type InventoryStore = Record<string, InventoryItem[]>;
const inventoryFile = path.join(process.cwd(), "data", "inventory.json");

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

export async function getItems(userId: string) {
  return (await getStore())[userId] ?? [];
}

export async function addItem(userId: string, input: InventoryItemInput) {
  const store = await getStore();
  const item: InventoryItem = { id: randomBytes(12).toString("hex"), ...input, updatedAt: new Date().toISOString() };
  store[userId] = [item, ...(store[userId] ?? [])];
  await saveStore(store);
  return item;
}

export async function updateItem(userId: string, id: string, input: InventoryItemInput) {
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
  const store = await getStore();
  const items = store[userId] ?? [];
  if (!items.some((item) => item.id === id)) return false;
  store[userId] = items.filter((item) => item.id !== id);
  await saveStore(store);
  return true;
}
