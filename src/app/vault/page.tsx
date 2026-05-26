import { items, modules } from "@/data/votm";
import Link from "next/link";

function getModuleDisplayTitle(module: (typeof modules)[number]) {
  return module.status === "completed" ? module.title : module.playerTitle;
}

export default function VaultPage() {
  const visibleModules = modules
    .filter((module) => module.status === "active" || module.status === "completed")
    .sort((a, b) => a.order - b.order);

  const activeModule = modules.find((module) => module.status === "active");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-red-400">
            Vault of the Mists
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Dinner with the Devil
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Party treasury & discovered relics
          </p>
        </header>

        <div className="mt-5 space-y-5">
          {activeModule && (
            <section className="rounded-2xl border border-red-900/60 bg-red-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-300">
                Current Chapter
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {activeModule.playerTitle}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Its true name remains hidden within the Mists.
              </p>
            </section>
          )}

          <section className="flex gap-2 overflow-x-auto pb-1">
            {visibleModules.map((module) => {
              const isActive = module.status === "active";
              const title = getModuleDisplayTitle(module);

              return (
                <button
                  key={module.id}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-red-700 bg-red-950/50 text-red-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400",
                  ].join(" ")}
                >
                  {title}
                </button>
              );
            })}
          </section>

          <section className="space-y-3">
            {items.map((item) => {
              const campaignModule = modules.find((m) => m.id === item.moduleId);
              const moduleTitle = campaignModule ? getModuleDisplayTitle(campaignModule) : null;

              return (
                <Link
                    key={item.id}
                    href={`/vault/items/${item.id}`}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-lg transition active:scale-[0.99]"
                    >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {item.category}
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        {item.isIdentified ? item.name : item.displayName}
                      </h2>
                    </div>

                    <span className="rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-xs text-red-300">
                      {item.isIdentified ? item.rarity : "Unidentified"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {item.publicDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {moduleTitle && (
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        {moduleTitle}
                      </span>
                    )}

                    {item.requiresAttunement && (
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                        Requires attunement
                      </span>
                    )}

                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                      {item.holder ?? "Party stash"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
}