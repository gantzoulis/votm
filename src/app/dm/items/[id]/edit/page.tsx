import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CampaignModule, Item, Character } from "@/types/votm";
import { updateItem } from "./actions";
import { ImageUploadField } from "@/components/ImageUploadField";

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

    const { data: characters } = await supabase
      .from("characters")
      .select("*")
      .eq("campaign_id", vaultItem.campaign_id)
      .order("name", { ascending: true });

   const { data: containerItems } = await supabase
      .from("items")
      .select("id, name, display_name, is_identified")
      .eq("campaign_id", vaultItem.campaign_id)
      .eq("is_container", true)
      .neq("id", vaultItem.id)
      .order("name", { ascending: true });

  const visibleModules = (modules ?? []) as CampaignModule[];

  const updateItemWithId = updateItem.bind(null, vaultItem.id);

  const campaignCharacters = (characters ?? []) as Character[];

  const containers = containerItems ?? [];

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

          <div className="space-y-2">
            <label htmlFor="holderCharacterId" className="text-sm text-zinc-300">
              Held By
            </label>

            <select
              id="holderCharacterId"
              name="holderCharacterId"
              defaultValue={vaultItem.holder_character_id ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            >
              <option value="">Party Stash</option>

              {campaignCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-3">
              <input
                id="isContainer"
                name="isContainer"
                type="checkbox"
                defaultChecked={vaultItem.is_container}
                className="h-4 w-4"
              />

              <label htmlFor="isContainer" className="text-sm">
                This item can contain other items
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="parentItemId" className="text-sm text-zinc-300">
              Contained In
            </label>

            <select
              id="parentItemId"
              name="parentItemId"
              defaultValue={vaultItem.parent_item_id ?? ""}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
            >
              <option value="">Not inside another item</option>

              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.is_identified ? container.name : container.display_name}
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
              Unidentified Image
            </label>
            <ImageUploadField
              id="unidentifiedImageUrl"
              name="unidentifiedImageUrl"
              label="Unidentified Image"
              folder="unidentified"
              defaultValue={vaultItem.unidentified_image_url}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="identifiedImageUrl" className="text-sm text-zinc-300">
              Identified Image URL
            </label>
            <ImageUploadField
              id="identifiedImageUrl"
              name="identifiedImageUrl"
              label="Identified Image"
              folder="identified"
              defaultValue={vaultItem.identified_image_url}
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