import Link from "next/link";
import { notFound } from "next/navigation";
import { items, modules } from "@/data/votm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getModuleDisplayTitle(module: (typeof modules)[number]) {
  return module.status === "completed" ? module.title : module.playerTitle;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  const item = items.find((item) => item.id === id);

  if (!item) {
    notFound();
  }

  const campaignModule = modules.find((module) => module.id === item.moduleId);

  const moduleDisplayTitle = campaignModule
  ? getModuleDisplayTitle(campaignModule)
  : null;

    const itemImageUrl = item.isIdentified
    ? item.identifiedImageUrl
    : item.unidentifiedImageUrl;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <p className="mt-4 text-xs uppercase tracking-[0.28em] text-zinc-500">
            {item.category}
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            {item.isIdentified ? item.name : item.displayName}
          </h1>
        </header>

        <div className="mt-5 space-y-4">
            {itemImageUrl && (
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
                <img
                src={itemImageUrl}
                alt={item.isIdentified ? item.name : item.displayName}
                className="aspect-[4/3] w-full object-cover"
                />
            </section>
            )}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-red-300">
                {item.isIdentified ? item.rarity : "Unidentified"}
              </span>

              {item.requiresAttunement && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  Requires attunement
                </span>
              )}

              {item.chargesMax !== undefined && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                    Charges {item.chargesCurrent ?? 0}/{item.chargesMax}
                </span>
                )}

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                {item.holder ?? "Party stash"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {item.publicDescription}
            </p>
          </section>

          {module && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Found in
              </p>
              {moduleDisplayTitle && (
                <h2 className="mt-1 text-lg font-semibold">{moduleDisplayTitle}</h2>
                )}
              {item.discoveryNote && (
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {item.discoveryNote}
                </p>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Status
            </p>

            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <p>Identified: {item.isIdentified ? "Yes" : "No"}</p>
              <p>Cursed: {item.isCursed ? "Yes" : "Unknown"}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}