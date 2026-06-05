import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CampaignModule, Item } from "@/types/votm";

function getModuleDisplayTitle(campaignModule: CampaignModule) {
  return campaignModule.status === "completed"
    ? campaignModule.title
    : campaignModule.player_title;
}

type PageProps = {
  searchParams: Promise<{
    rarity?: string;
    category?: string;
    identified?: string;
    attunement?: string;
  }>;
};

export default async function VaultPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const supabase = await createClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug")
    .eq("slug", "dinner-with-the-devil")
    .single();

  if (campaignError) {
    console.error("Campaign query error:", campaignError);
  }

  if (!campaign) {
    return <main className="p-6 text-white">Campaign not found.</main>;
  }

  const { data: modules } = await supabase
    .from("campaign_modules")
    .select("*")
    .eq("campaign_id", campaign.id)
    .in("status", ["active", "completed"])
    .order("module_order", { ascending: true });

 let itemsQuery = supabase
  .from("items")
  .select(`
    *,
    holder:characters (
      id,
      name
    ),
    container:items!items_parent_item_id_fkey (
      id,
      name,
      display_name,
      is_identified
    )
  `)
  .eq("campaign_id", campaign.id);

  if (filters.rarity) {
    itemsQuery = itemsQuery.eq("rarity", filters.rarity);
  }

  if (filters.category) {
    itemsQuery = itemsQuery.eq("category", filters.category);
  }

  if (filters.identified === "true") {
    itemsQuery = itemsQuery.eq("is_identified", true);
  }

  if (filters.identified === "false") {
    itemsQuery = itemsQuery.eq("is_identified", false);
  }

  if (filters.attunement === "true") {
    itemsQuery = itemsQuery.eq("requires_attunement", true);
  }

  const { data: items } = await itemsQuery.order("created_at", {
    ascending: false,
  });

  const visibleModules = (modules ?? []) as CampaignModule[];
  const vaultItems = (items ?? []) as Item[];
  const activeModule = visibleModules.find((m) => m.status === "active");

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-red-400">
            Vault of the Mists
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {campaign.name}
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
                {activeModule.player_title}
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Its true name remains hidden within the Mists.
              </p>
            </section>
          )}

          <section className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {visibleModules.map((campaignModule) => (
              <button
                key={campaignModule.id}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                  campaignModule.status === "active"
                    ? "border-red-700 bg-red-950/50 text-red-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400",
                ].join(" ")}
              >
                {getModuleDisplayTitle(campaignModule)}
              </button>
            ))}
          </section>

          <Link
            href="/dm/items/new"
            className="block rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-4 text-center text-sm font-semibold text-red-200"
          >
            + Add New Item
          </Link>

          {hasFilters && (
            <section className="flex flex-wrap gap-2">
              {filters.rarity && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  Rarity: {filters.rarity}
                </span>
              )}

              {filters.category && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  Category: {filters.category}
                </span>
              )}

              {filters.identified && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {filters.identified === "true"
                    ? "Identified"
                    : "Unidentified"}
                </span>
              )}

              {filters.attunement && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  Requires attunement
                </span>
              )}
             
              <Link
                href="/vault"
                className="rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-xs text-red-300"
              >
                Clear filters
              </Link>
            </section>
          )}

          {vaultItems.length === 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <h2 className="text-lg font-semibold">The Vault is empty</h2>
              <p className="mt-2 text-sm text-zinc-400">
                No treasures have been recorded yet.
              </p>
            </section>
          ) : (
            <section className="space-y-3">
              {vaultItems.map((item) => {
                const campaignModule = visibleModules.find(
                  (m) => m.id === item.module_id,
                );

                const moduleTitle = campaignModule
                  ? getModuleDisplayTitle(campaignModule)
                  : null;

                const itemTitle = item.is_identified
                  ? item.name
                  : item.display_name;

                const itemImageUrl = item.is_identified
                  ? item.identified_image_url
                  : item.unidentified_image_url;

                  const itemDescription = item.is_identified
                    ? item.revealed_description ?? item.public_description
                    : item.public_description;

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-lg"
                  >
                    <Link href={`/vault/items/${item.id}`} className="block">
                      {itemImageUrl && (
                        <img
                          src={itemImageUrl}
                          alt={itemTitle}
                          className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                        />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            {item.category}
                          </p>

                          <h2 className="mt-1 text-lg font-semibold">
                            {itemTitle}
                          </h2>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                         {itemDescription}
                      </p>
                    </Link>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <Link
                        href={
                          item.is_identified
                            ? `/vault?rarity=${encodeURIComponent(item.rarity)}`
                            : "/vault?identified=false"
                        }
                        className="rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-red-300"
                      >
                        {item.is_identified ? item.rarity : "Unidentified"}
                      </Link>

                      <Link
                        href={`/vault?category=${encodeURIComponent(
                          item.category,
                        )}`}
                        className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                      >
                        {item.category}
                      </Link>

                      {moduleTitle && (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          {moduleTitle}
                        </span>
                        
                      )}
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          Held by: {item.holder?.name ?? "Party Stash"}
                      </span>
                      {item.requires_attunement && (
                        <Link
                          href="/vault?attunement=true"
                          className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                        >
                          Requires attunement
                        </Link>
                      )}

                      {item.is_container && (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          Container
                        </span>
                      )}

                      {item.container && (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          Inside:{" "}
                          {item.container.is_identified
                            ? item.container.name
                            : item.container.display_name}
                        </span>
                      )}

                      {item.charges_max !== null && (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                          Charges {item.charges_current ?? 0}/
                          {item.charges_max}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/vault/items/${item.id}`}
                      className="mt-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                    >
                      View Item
                    </Link>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}