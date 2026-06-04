import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createItem } from "./actions";
import type { CampaignModule } from "@/types/votm";

export default async function NewItemPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .eq("name", "Dinner with the Devil")
    .limit(1);

  const campaign = campaigns?.[0];

  if (!campaign) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
        Campaign not found.
      </main>
    );
  }

  const { data: modules } = await supabase
    .from("campaign_modules")
    .select("*")
    .eq("campaign_id", campaign.id)
    .in("status", ["active", "completed"])
    .order("module_order", { ascending: true });

  const visibleModules = (modules ?? []) as CampaignModule[];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <header>
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-2 text-2xl font-bold">Add New Item</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Add a relic, cursed object, or forgotten treasure to the Vault.
          </p>
        </header>

        <form action={createItem} className="mt-6 space-y-5">
          <input type="hidden" name="campaignId" value={campaign.id} />

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">True Item Name</label>
            <input
              name="name"
              required
              type="text"
              placeholder="Lantern of the Watchers"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Unidentified Display Name
            </label>
            <input
              name="displayName"
              required
              type="text"
              placeholder="Tarnished Iron Lantern"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Unidentified Image URL
            </label>
            <input
              name="unidentifiedImageUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Identified Image URL
            </label>
            <input
              name="identifiedImageUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm text-zinc-300">
                Category
              </label>

              <select
                id="category"
                name="category"
                defaultValue="Wondrous Item"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                <option value="Weapon">Weapon</option>
                <option value="Armor">Armor</option>
                <option value="Wondrous Item">Wondrous Item</option>
                <option value="Potion">Potion</option>
                <option value="Scroll">Scroll</option>
                <option value="Ring">Ring</option>
                <option value="Rod">Rod</option>
                <option value="Staff">Staff</option>
                <option value="Wand">Wand</option>
                <option value="Coin / Currency">Coin / Currency</option>
                <option value="Gem / Art Object">Gem / Art Object</option>
                <option value="Quest Item">Quest Item</option>
                <option value="Document / Clue">Document / Clue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="rarity" className="text-sm text-zinc-300">
                Rarity
              </label>

              <select
                id="rarity"
                name="rarity"
                defaultValue="Unknown"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                <option value="Unknown">Unknown</option>
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Very Rare">Very Rare</option>
                <option value="Legendary">Legendary</option>
                <option value="Artifact">Artifact</option>
                <option value="Unique">Unique</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="moduleId" className="text-sm text-zinc-300">Found In Chapter</label>
            <select
              id="moduleId"
              name="moduleId"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              defaultValue=""
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
            <label className="text-sm text-zinc-300">Public Description</label>
            <textarea
              name="publicDescription"
              required
              rows={5}
              placeholder="Describe what the players see..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Secret DM Notes</label>
            <textarea
              name="secretDescription"
              rows={5}
              placeholder="Hidden curse, mechanics, whispers..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Discovery Note</label>
            <textarea
              name="discoveryNote"
              rows={3}
              placeholder="Where and how was this found?"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="chargesCurrent" className="text-sm text-zinc-300">Current Charges</label>
              <input
                id="chargesCurrent"
                name="chargesCurrent"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="chargesMax" className="text-sm text-zinc-300">Max Charges</label>
              <input
                id="chargesMax"
                name="chargesMax"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rechargesOn" className="text-sm text-zinc-300">
                Recharges On
              </label>

              <select
                id="rechargesOn"
                name="rechargesOn"
                defaultValue=""
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              >
                <option value="">No recharge</option>
                <option value="Dawn">Dawn</option>
                <option value="Dusk">Dusk</option>
                <option value="Midnight">Midnight</option>
                <option value="Long Rest">Long Rest</option>
                <option value="Short Rest">Short Rest</option>
                <option value="Daily">Daily</option>
                <option value="Never">Never</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <label className="flex items-center gap-3 text-sm">
              <input name="isIdentified" type="checkbox" />
              Item is identified
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input name="isCursed" type="checkbox" />
              Item is cursed
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input name="requiresAttunement" type="checkbox" />
              Requires attunement
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-red-800 px-4 py-4 text-sm font-semibold transition hover:bg-red-700"
          >
            Add Item to the Vault
          </button>
        </form>
      </section>
    </main>
  );
}