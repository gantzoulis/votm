import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CampaignModule, Item } from "@/types/votm";
import { redirect } from "next/navigation";
import { getCampaignAccess } from "@/lib/auth/access";

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
    holder?: string;
    container?: string;
    view?: string;
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

    const viewMode = filters.view === "table" ? "table" : "cards";

  const access = await getCampaignAccess();

    if (!access) {
      redirect("/login");
    }

 /*let itemsQuery = supabase
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
  .eq("campaign_id", campaign.id);*/

  let itemsQuery = supabase
  .from("items")
  .select(`
    *,
    holder:characters (
      id,
      name
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

  if (filters.holder === "stash") {
  itemsQuery = itemsQuery.is("holder_character_id", null);
  } else if (filters.holder) {
    itemsQuery = itemsQuery.eq("holder_character_id", filters.holder);
  }

  if (filters.container) {
    itemsQuery = itemsQuery.eq("parent_item_id", filters.container);
  }

  /*const { data: items, error: itemsError } = await itemsQuery.order("created_at", {
    ascending: false,
  });*/

const { data: items, error: itemsError } = await itemsQuery.order("created_at", {
  ascending: false,
});

if (itemsError) {
  console.error("Items query error:", itemsError);
}

const parentItemIds = [
  ...new Set(
    (items ?? [])
      .map((item) => item.parent_item_id)
      .filter(Boolean),
  ),
] as string[];

const { data: containerItems } =
  parentItemIds.length > 0
    ? await supabase
        .from("items")
        .select("id, name, display_name, is_identified")
        .in("id", parentItemIds)
    : { data: [] };

const containerById = new Map(
  (containerItems ?? []).map((container) => [container.id, container]),
);

const itemsWithContainers = (items ?? []).map((item) => ({
  ...item,
  container: item.parent_item_id
    ? containerById.get(item.parent_item_id) ?? null
    : null,
}));


  /*console.log("campaign id:", campaign.id);
  console.log("Items Error:", itemsError);
  console.log("Items Data:", items);*/

  /*
  if (itemsError) {
  console.error("Items query error:", itemsError);
}*/

  const visibleModules = (modules ?? []) as CampaignModule[];
  const vaultItems = itemsWithContainers as Item[];
  const activeModule = visibleModules.find((m) => m.status === "active");

  const hasFilters = Object.values(filters).some(Boolean);

  function getRarityClass(rarity: string) {
  switch (rarity) {
    case "Common":
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
    case "Uncommon":
      return "border-green-900/70 bg-green-950/40 text-green-300";
    case "Rare":
      return "border-blue-900/70 bg-blue-950/40 text-blue-300";
    case "Very Rare":
      return "border-purple-900/70 bg-purple-950/40 text-purple-300";
    case "Legendary":
      return "border-amber-900/70 bg-amber-950/40 text-amber-300";
    case "Artifact":
      return "border-orange-900/70 bg-orange-950/40 text-orange-300";
    case "Unique":
      return "border-red-900/70 bg-red-950/40 text-red-300";
    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}

    function getRarityTitleClass(rarity: string) {
      switch (rarity) {
        case "Common":
          return "text-zinc-100";

        case "Uncommon":
          return "text-green-400";

        case "Rare":
          return "text-blue-400";

        case "Very Rare":
          return "text-purple-400";

        case "Legendary":
          return "text-amber-400 drop-shadow-sm";

        case "Artifact":
          return "text-orange-400 drop-shadow-sm";

        case "Unique":
           return "text-red-400 drop-shadow-sm";

        default:
          return "text-zinc-100";
      }
    }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-red-400">
            Vault of the Mists (v.0.9626)
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

          {access.isDm && (
            <Link
              href="/vault/log"
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 text-center text-sm font-semibold text-zinc-200"
            >
              View Campaign Log
            </Link>
          )}

          <section className="flex gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2">
            <Link
              href="/vault?view=cards"
              className={[
                "flex-1 rounded-xl px-4 py-2 text-center text-sm",
                viewMode === "cards"
                  ? "bg-red-950/50 text-red-200"
                  : "text-zinc-400",
              ].join(" ")}
            >
              Cards
            </Link>

            <Link
              href="/vault?view=table"
              className={[
                "flex-1 rounded-xl px-4 py-2 text-center text-sm",
                viewMode === "table"
                  ? "bg-red-950/50 text-red-200"
                  : "text-zinc-400",
              ].join(" ")}
            >
              Table
            </Link>
          </section>

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
             
              {filters.holder && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                  Holder Filter
                </span>
              )}

              {filters.container && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                  Container Filter
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
          ) : viewMode === "table" ? (
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
                {vaultItems.map((item) => {
                  const itemTitle = item.is_identified ? item.name : item.display_name;

                  return (
                    <Link
                      key={item.id}
                      href={`/vault/items/${item.id}`}
                      className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p
                          className={[
                            "truncate text-sm font-semibold",
                            item.is_identified
                              ? getRarityTitleClass(item.rarity)
                              : "text-zinc-100",
                          ].join(" ")}
                        >
                          {itemTitle}
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {item.category}
                          {item.holder?.name ? ` · ${item.holder.name}` : " · Party Stash"}
                          {item.parent_item_id ? " · Inside container" : ""}
                        </p>
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full border px-2 py-1 text-xs",
                          item.is_identified
                            ? getRarityClass(item.rarity)
                            : "border-red-900/60 bg-red-950/40 text-red-300",
                        ].join(" ")}
                      >
                        {item.is_identified ? item.rarity : "Unidentified"}
                      </span>
                    </Link>
                  );
                })}
              </section>
          ):
          (
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
                  <div className="flex gap-4">
                    {itemImageUrl && (
                      <Link
                        href={`/vault/items/${item.id}`}
                        className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:h-36 sm:w-36"
                      >
                        <img
                          src={itemImageUrl}
                          alt={itemTitle}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    )}

                    <div className="min-w-0 flex-1">
                      <Link href={`/vault/items/${item.id}`} className="block">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {item.category}
                        </p>

                        <h2
                          className={[
                            "mt-1 text-lg font-semibold",
                            item.is_identified
                              ? getRarityTitleClass(item.rarity)
                              : "text-zinc-100",
                          ].join(" ")}
                        >
                          {itemTitle}
                        </h2>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">
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
                          className={[
                            "rounded-full border px-3 py-1",
                            item.is_identified
                              ? getRarityClass(item.rarity)
                              : "border-red-900/60 bg-red-950/40 text-red-300",
                          ].join(" ")}
                        >
                          {item.is_identified ? item.rarity : "Unidentified"}
                        </Link>

                        <Link
                          href={`/vault?category=${encodeURIComponent(item.category)}`}
                          className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                        >
                          {item.category}
                        </Link>

                        {moduleTitle && (
                          <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                            {moduleTitle}
                          </span>
                        )}

                        <Link
                          href={
                            item.holder
                              ? `/vault?holder=${item.holder.id}`
                              : "/vault?holder=stash"
                          }
                          className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                        >
                          Held by: {item.holder?.name ?? "Party Stash"}
                        </Link>

                        {item.is_container && (
                          <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                            Container
                          </span>
                        )}

                        {item.container && (
                          <Link
                            href={`/vault?container=${item.parent_item_id}`}
                            className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                          >
                            Inside:{" "}
                            {item.container.is_identified
                              ? item.container.name
                              : item.container.display_name}
                          </Link>
                        )}

                        {item.requires_attunement && (
                          <Link
                            href="/vault?attunement=true"
                            className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"
                          >
                            Requires attunement
                          </Link>
                        )}

                        {item.charges_max !== null && (
                          <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                            Charges {item.charges_current ?? 0}/{item.charges_max}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/vault/items/${item.id}`}
                        className="mt-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                      >
                        View Item
                      </Link>
                    </div>
                  </div>
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