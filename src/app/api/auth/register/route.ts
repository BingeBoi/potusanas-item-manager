import { NextResponse } from "next/server";
import { createSessionToken, createUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password, remember = true } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  try {
    const user = await createUser(email, password);
    const { token, expiresAt } = createSessionToken(user, Boolean(remember));
    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set("item-manager-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create your account." }, { status: 400 });
  }
}
