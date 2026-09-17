"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.includes("@") || password.length < 8) {
      setError("Enter a valid email and a password with at least 8 characters.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@warehouse.co"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 outline-none ring-brand/30 transition placeholder:text-zinc-400 focus:border-brand focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Password
          </label>
          {mode === "login" ? <span className="text-xs text-zinc-500">New here? Create an account below.</span> : null}
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-16 text-base text-zinc-900 outline-none ring-brand/30 transition placeholder:text-zinc-400 focus:border-brand focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="size-4 rounded border-zinc-300 accent-brand"
        />
        Keep me signed in on this device
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand dark:text-ink dark:hover:bg-brand-dark"
      >
        {pending ? (mode === "login" ? "Signing in…" : "Creating account…") : (mode === "login" ? "Sign in to Potusana's Item Manager" : "Create your account")}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {mode === "login" ? "New workspace?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setError("");
          }}
          className="font-semibold text-brand hover:text-brand-dark"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
