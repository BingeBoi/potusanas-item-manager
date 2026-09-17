import { NextRequest, NextResponse } from "next/server";
import { deleteItem, GUEST_USER_ID, updateItem, validateItem } from "@/lib/inventory";

// Login is paused for the prototype. Restore session checks later:
// import { getUserFromSession } from "@/lib/auth";
// function currentUser(request: NextRequest) {
//   return getUserFromSession(request.cookies.get("item-manager-session")?.value);
// }

function workspaceUserId() {
  return GUEST_USER_ID;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const item = await updateItem(workspaceUserId(), (await params).id, validateItem(await request.json()));
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Item not found." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update item." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return (await deleteItem(workspaceUserId(), (await params).id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Item not found." }, { status: 404 });
}
