export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  updatedAt: string;
};

export type InventoryItemInput = Pick<InventoryItem, "name" | "sku" | "location" | "quantity">;
