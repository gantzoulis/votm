import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CampaignModule, Item } from "@/types/votm";
import { updateItem } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) notFound();

  const vaultItem = item as Item;

  const { data: modules } = await supabase
    .from("campaign_modules")
    .select("*")
    .eq("campaign_id", vaultItem.campaign_id)
    .in("status", ["active", "completed"])
    .order("module_order", { ascending: true });

  const visibleModules = (modules ?? []) as CampaignModule[];

  const updateItemWithId = updateItem.bind(null, vaultItem.id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <header>
          <Link href={`/vault/items/${vaultItem.id}`} className="text-sm text-red-300">
            ← Back to Item
          </Link>

          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-2 text-2xl font-bold">Edit Item</h1>
        </header>

        <form action={updateItemWithId} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-zinc-300">
              True Item Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={vaultItem.name}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm text-zinc-300">
              Unidentified Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              defaultValue={vaultItem.display_name}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="moduleId" className="text-sm text-zinc-300">
              Found In Chapter
            </label>
            <select
              id="moduleId"
              name="moduleId"
              defaultValue={vaultItem.module_id ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            >
              <option value="">No chapter selected</option>
              {visibleModules.map((campaignModule) => (
                <option key={campaignModule.id} value={campaignModule.id}>
                  {campaignModule.status === "completed"
                    ? campaignModule.title
                    : campaignModule.player_title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm text-zinc-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={vaultItem.category}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                {[
                  "Weapon",
                  "Armor",
                  "Wondrous Item",
                  "Potion",
                  "Scroll",
                  "Ring",
                  "Rod",
                  "Staff",
                  "Wand",
                  "Coin / Currency",
                  "Gem / Art Object",
                  "Quest Item",
                  "Document / Clue",
                  "Other",
                ].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="rarity" className="text-sm text-zinc-300">
                Rarity
              </label>
              <select
                id="rarity"
                name="rarity"
                defaultValue={vaultItem.rarity}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                {[
                  "Unknown",
                  "Common",
                  "Uncommon",
                  "Rare",
                  "Very Rare",
                  "Legendary",
                  "Artifact",
                  "Unique",
                ].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="unidentifiedImageUrl" className="text-sm text-zinc-300">
              Unidentified Image URL
            </label>
            <input
              id="unidentifiedImageUrl"
              name="unidentifiedImageUrl"
              type="url"
              defaultValue={vaultItem.unidentified_image_url ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="identifiedImageUrl" className="text-sm text-zinc-300">
              Identified Image URL
            </label>
            <input
              id="identifiedImageUrl"
              name="identifiedImageUrl"
              type="url"
              defaultValue={vaultItem.identified_image_url ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="publicDescription" className="text-sm text-zinc-300">
              Public Description
            </label>
            <textarea
              id="publicDescription"
              name="publicDescription"
              required
              rows={5}
              defaultValue={vaultItem.public_description}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="revealedDescription" className="text-sm text-zinc-300">
              Revealed Description
            </label>

            <textarea
              id="revealedDescription"
              name="revealedDescription"
              defaultValue={vaultItem.revealed_description ?? ""}
              rows={5}
              placeholder="What the players learn after identifying the item..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="secretDescription" className="text-sm text-zinc-300">
              Secret DM Notes
            </label>
            <textarea
              id="secretDescription"
              name="secretDescription"
              rows={5}
              defaultValue={vaultItem.secret_description ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="chargesCurrent" className="text-sm text-zinc-300">
                Current Charges
              </label>
              <input
                id="chargesCurrent"
                name="chargesCurrent"
                type="number"
                min="0"
                defaultValue={vaultItem.charges_current ?? ""}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="chargesMax" className="text-sm text-zinc-300">
                Max Charges
              </label>
              <input
                id="chargesMax"
                name="chargesMax"
                type="number"
                min="0"
                defaultValue={vaultItem.charges_max ?? ""}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rechargesOn" className="text-sm text-zinc-300">
                Recharges On
              </label>
              <select
                id="rechargesOn"
                name="rechargesOn"
                defaultValue={vaultItem.recharges_on ?? ""}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                {["", "Dawn", "Dusk", "Midnight", "Long Rest", "Short Rest", "Daily", "Never", "Special"].map((value) => (
                  <option key={value || "none"} value={value}>
                    {value || "No recharge"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-3">
              <input id="isIdentified" name="isIdentified" type="checkbox" defaultChecked={vaultItem.is_identified} />
              <label htmlFor="isIdentified" className="text-sm">Item is identified</label>
            </div>

            <div className="flex items-center gap-3">
              <input id="isCursed" name="isCursed" type="checkbox" defaultChecked={vaultItem.is_cursed} />
              <label htmlFor="isCursed" className="text-sm">Item is cursed</label>
            </div>

            <div className="flex items-center gap-3">
              <input id="requiresAttunement" name="requiresAttunement" type="checkbox" defaultChecked={vaultItem.requires_attunement} />
              <label htmlFor="requiresAttunement" className="text-sm">Requires attunement</label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-red-800 px-4 py-4 text-sm font-semibold transition hover:bg-red-700"
          >
            Save Changes
          </button>
        </form>
      </section>
    </main>
  );
}