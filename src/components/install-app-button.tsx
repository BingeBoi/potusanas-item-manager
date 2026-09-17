"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    if (!standalone) window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    setPrompt(null);
    if (choice.outcome === "accepted") setMessage("Potusana's Item Manager was installed.");
  }

  if (message) return <p className="text-xs font-medium text-brand">{message}</p>;
  if (prompt) return <button type="button" onClick={install} className="h-9 rounded-lg border border-brand px-3 text-sm font-semibold text-brand hover:bg-teal-50 dark:hover:bg-teal-500/10">Install app</button>;
  return null;
}
