import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CampaignModule, Item } from "@/types/votm";
import { toggleIdentify } from "./actions";
import {
  increaseCharges,
  decreaseCharges,
} from "./actions";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getModuleDisplayTitle(campaignModule: CampaignModule) {
  return campaignModule.status === "completed"
    ? campaignModule.title
    : campaignModule.player_title;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

  const vaultItem = item as Item;

  const { data: campaignModule } = await supabase
    .from("campaign_modules")
    .select("*")
    .eq("id", vaultItem.module_id)
    .maybeSingle();

  const moduleData = campaignModule as CampaignModule | null;

  const itemTitle = vaultItem.is_identified
    ? vaultItem.name
    : vaultItem.display_name;

  const itemImageUrl = vaultItem.is_identified
    ? vaultItem.identified_image_url
    : vaultItem.unidentified_image_url;

  const itemDescription = vaultItem.is_identified
    ? vaultItem.revealed_description ?? vaultItem.public_description
    : vaultItem.public_description;

  const { data: holderCharacter } = vaultItem.holder_character_id
    ? await supabase
        .from("characters")
        .select("*")
        .eq("id", vaultItem.holder_character_id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <p className="mt-4 text-xs uppercase tracking-[0.28em] text-zinc-500">
            {vaultItem.category}
          </p>

          <h1 className="mt-1 text-2xl font-bold">{itemTitle}</h1>
        </header>
        <form
          action={toggleIdentify.bind(
            null,
            vaultItem.id,
            vaultItem.is_identified
          )}
        >
          <button
            className="
              mt-3
              rounded-full
              border
              border-red-900/60
              bg-red-950/40
              px-4
              py-2
              text-sm
              text-red-200
            "
          >
            {vaultItem.is_identified
              ? "Hide Identity"
              : "Reveal Item"}
          </button>
        </form>
        <Link
          href={`/dm/items/${vaultItem.id}/edit`}
          className="mt-3 inline-flex rounded-full border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-200"
        >
          Edit Item
        </Link>
        <div className="mt-5 space-y-4">
          {itemImageUrl && (
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
              <img
                src={itemImageUrl}
                alt={itemTitle}
                className="aspect-[4/3] w-full object-cover"
              />
            </section>
          )}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-red-300">
                {vaultItem.is_identified ? vaultItem.rarity : "Unidentified"}
              </span>

              {vaultItem.requires_attunement && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  Requires attunement
                </span>
              )}

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  Held by: {holderCharacter?.name ?? "Party Stash"}
              </span>
            </div>
{vaultItem.charges_max !== null && (
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Charges
                </p>

                <div className="mt-4 flex items-center justify-center gap-4">
                  <form
                    action={decreaseCharges.bind(
                      null,
                      vaultItem.id,
                      vaultItem.charges_current ?? 0
                    )}
                  >
                    <button
                      className="
                        h-10
                        w-10
                        rounded-full
                        bg-zinc-800
                        text-lg
                      "
                    >
                      −
                    </button>
                  </form>

                  <span className="text-xl font-semibold">
                    {vaultItem.charges_current ?? 0}
                    /
                    {vaultItem.charges_max}
                  </span>

                  <form
                    action={increaseCharges.bind(
                      null,
                      vaultItem.id,
                      vaultItem.charges_current ?? 0,
                      vaultItem.charges_max
                    )}
                  >
                    <button
                      className="
                        h-10
                        w-10
                        rounded-full
                        bg-zinc-800
                        text-lg
                      "
                    >
                      +
                    </button>
                  </form>
                </div>

                {vaultItem.recharges_on && (
                  <p className="mt-4 text-center text-sm text-zinc-400">
                    Recharges on {vaultItem.recharges_on}
                  </p>
                )}
              </section>
            )}
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {itemDescription}
            </p>
          </section>

          {moduleData && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Found in
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {getModuleDisplayTitle(moduleData)}
              </h2>

              {vaultItem.discovery_note && (
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {vaultItem.discovery_note}
                </p>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Player Notes
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Personal and party notes will appear here.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}