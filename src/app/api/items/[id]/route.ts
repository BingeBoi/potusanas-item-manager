import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { deleteItem, updateItem, validateItem } from "@/lib/inventory";

function currentUser(request: NextRequest) {
  return getUserFromSession(request.cookies.get("item-manager-session")?.value);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = currentUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const item = await updateItem(user.id, (await params).id, validateItem(await request.json()));
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Item not found." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update item." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = currentUser(request);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return (await deleteItem(user.id, (await params).id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Item not found." }, { status: 404 });
}
