import { redirect } from "next/navigation";

// Login is paused for the prototype. Restore the sign-in screen later:
// import type { Metadata } from "next";
// import { LoginShell } from "@/components/login-shell";
//
// export const metadata: Metadata = {
//   title: "Sign in",
//   description: "Sign in to Potusana's Item Manager.",
// };
//
// export default function LoginPage() {
//   return <LoginShell />;
// }

export default function LoginPage() {
  redirect("/");
}
