import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import type { Item } from "@/types/votm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CharacterClassRow = {
  id: string;
  class_name: string;
  subclass_name: string | null;
  class_level: number;
};

type CharacterRow = {
  id: string;
  campaign_id: string;
  name: string;
  race: string | null;
  portrait_url: string | null;
  current_xp: number;
  next_level_xp: number | null;
  owner_profile_id: string | null;
  claim_status: "unclaimed" | "pending" | "approved";
  classes: CharacterClassRow[];
};

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
      return "text-amber-400";
    case "Artifact":
      return "text-orange-400";
    case "Unique":
      return "text-red-400";
    default:
      return "text-zinc-100";
  }
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: characterData, error: characterError } = await supabase
    .from("characters")
    .select(`
      id,
      campaign_id,
      name,
      race,
      portrait_url,
      current_xp,
      next_level_xp,
      owner_profile_id,
      claim_status,
      classes:character_classes (
        id,
        class_name,
        subclass_name,
        class_level
      )
    `)
    .eq("id", id)
    .eq("campaign_id", access.campaignId)
    .single();

  if (characterError || !characterData) {
    notFound();
  }

  const character = characterData as unknown as CharacterRow;

  const canViewCharacter =
    access.isDm || character.owner_profile_id === access.profileId;

  if (!canViewCharacter) {
    redirect("/vault");
  }

  const { data: itemData, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .eq("campaign_id", access.campaignId)
    .eq("holder_character_id", character.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (itemsError) {
    console.error("Character items error:", itemsError);
  }

  const characterItems = (itemData ?? []) as Item[];

  const totalLevel = character.classes.reduce(
    (total, characterClass) => total + characterClass.class_level,
    0,
  );

  const xpProgress =
    character.next_level_xp && character.next_level_xp > 0
      ? Math.min(
          (character.current_xp / character.next_level_xp) * 100,
          100,
        )
      : 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-4xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>
        </header>

        <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-800">
              {character.portrait_url ? (
                <img
                  src={character.portrait_url}
                  alt={character.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-zinc-500">
                  ?
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-red-400">
                Character Profile
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {character.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                {character.race ?? "Unknown race"} · Level {totalLevel}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {character.classes.map((characterClass) => (
                  <span
                    key={characterClass.id}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                  >
                    {characterClass.class_name} {characterClass.class_level}
                    {characterClass.subclass_name
                      ? ` · ${characterClass.subclass_name}`
                      : ""}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <div className="flex justify-between gap-3 text-xs text-zinc-400">
                  <span>
                    {character.current_xp.toLocaleString()} XP
                  </span>

                  <span>
                    {character.next_level_xp
                      ? `${character.next_level_xp.toLocaleString()} XP`
                      : "Next level unset"}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-purple-700 transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Possessions
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Character Items
              </h2>
            </div>

            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {characterItems.length}
            </span>
          </div>

          {characterItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">
                This character carries no recorded items.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {characterItems.map((item) => {
                const itemTitle = item.is_identified
                  ? item.name
                  : item.display_name;

                const itemDescription = item.is_identified
                  ? item.revealed_description ?? item.public_description
                  : item.public_description;

                const itemImageUrl = item.is_identified
                  ? item.identified_image_url
                  : item.unidentified_image_url;

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                  >
                    <div className="flex gap-4">
                      {itemImageUrl && (
                        <Link
                          href={`/vault/items/${item.id}`}
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800"
                        >
                          <img
                            src={itemImageUrl}
                            alt={itemTitle}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link href={`/vault/items/${item.id}`}>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            {item.category}
                          </p>

                          <h3
                            className={[
                              "mt-1 text-lg font-semibold",
                              item.is_identified
                                ? getRarityTitleClass(item.rarity)
                                : "text-zinc-100",
                            ].join(" ")}
                          >
                            {itemTitle}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                            {itemDescription}
                          </p>
                        </Link>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                            {item.is_identified
                              ? item.rarity
                              : "Unidentified"}
                          </span>

                          {item.charges_max !== null && (
                            <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                              Charges {item.charges_current ?? 0}/
                              {item.charges_max}
                            </span>
                          )}

                          {item.is_container && (
                            <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                              Container
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}