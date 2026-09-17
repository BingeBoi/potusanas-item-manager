import { LoginForm } from "@/components/login-form";

const surfaces = [
  "Web dashboard",
  "Mobile app",
  "Browser extension",
];

export function LoginShell() {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="relative order-2 flex flex-1 flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-zinc-100 sm:px-10 lg:order-1 lg:max-w-[52%] lg:px-14 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.16),transparent_38%)]"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-lg font-bold text-white">
              IM
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-teal-200">POTUSANA’S ITEM MANAGER</p>
              <p className="text-xs text-zinc-400">Inventory across every surface</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-16">
            One catalog for the website, mobile app, and extension.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-zinc-300">
            Sign in to track stock, locations, and item status from a shared workspace that stays in sync wherever your team works.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {surfaces.map((surface) => (
              <li
                key={surface}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200"
              >
                {surface}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-2 lg:mt-0">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-teal-200">Live shelf</p>
            <p className="mt-2 text-lg font-semibold">Aisle B / Bin 14</p>
            <p className="mt-1 text-sm text-zinc-400">24 SKUs in this location</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-amber-200">Extension</p>
            <p className="mt-2 text-lg font-semibold">Quick add from any tab</p>
            <p className="mt-1 text-sm text-zinc-400">Capture items while you browse</p>
          </article>
        </div>
      </aside>

      <main className="order-1 flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:order-2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold text-brand">Potusana’s Item Manager</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Sign in</h2>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Use the same account on web, mobile, and the browser extension.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">
            Your session is stored securely in this browser.
          </p>
        </div>
      </main>
    </div>
  );
}
