import type { Metadata } from "next";
import { LoginShell } from "@/components/login-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Potusana's Item Manager.",
};

export default function LoginPage() {
  return <LoginShell />;
}
