import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { addItem, getItems, validateItem } from "@/lib/inventory";

function currentUser(request: NextRequest) {
  return getUserFromSession(request.cookies.get("item-manager-session")?.value);
}

export async function GET(request: NextRequest) {
  const user = currentUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return NextResponse.json({ items: await getItems(user.id) });
}

export async function POST(request: NextRequest) {
  const user = currentUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    return NextResponse.json({ item: await addItem(user.id, validateItem(await request.json())) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add item." }, { status: 400 });
  }
}
