import { NextResponse } from "next/server";
import { createSessionToken, verifyUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password, remember = true } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const user = await verifyUser(email, password);
  if (!user) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  const { token, expiresAt } = createSessionToken(user, Boolean(remember));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("item-manager-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return response;
}
