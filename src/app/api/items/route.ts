import { NextRequest, NextResponse } from "next/server";
import { addItem, GUEST_USER_ID, getItems, validateItem } from "@/lib/inventory";

// Login is paused for the prototype. Restore session checks later:
// import { getUserFromSession } from "@/lib/auth";
// function currentUser(request: NextRequest) {
//   return getUserFromSession(request.cookies.get("item-manager-session")?.value);
// }

function workspaceUserId() {
  return GUEST_USER_ID;
}

export async function GET() {
  return NextResponse.json({ items: await getItems(workspaceUserId()) });
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ item: await addItem(workspaceUserId(), validateItem(await request.json())) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add item." }, { status: 400 });
  }
}
