import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";

type CharacterRow = {
  id: string;
  name: string;
  portrait_url: string | null;
  claim_status: "unclaimed" | "pending" | "approved";
  claim_rejection_reason: string | null;
  owner: {
    display_name: string;
  } | null;
  claimant: {
    display_name: string;
  } | null;
};

export default async function CharactersPage() {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("characters")
    .select(`
      id,
      name,
      portrait_url,
      claim_status,
      claim_rejection_reason,
      owner:profiles!characters_owner_profile_id_fkey (
        display_name
      ),
      claimant:profiles!characters_claimed_by_profile_id_fkey (
        display_name
      )
    `)
    .eq("campaign_id", access.campaignId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Characters query error:", error);
  }

  const characters = (data ?? []) as unknown as CharacterRow[];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-4xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-red-400">
                Dungeon Master
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                Characters
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Manage the souls bound to this campaign.
              </p>
            </div>

            <Link
              href="/dm/characters/new"
              className="shrink-0 rounded-xl bg-red-900 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-800"
            >
              + New Character
            </Link>
          </div>
        </header>

        <div className="mt-5 space-y-3">
          {characters.length === 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold">
                No characters yet
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Create the first character profile for the campaign.
              </p>
            </section>
          ) : (
            characters.map((character) => {
              const statusClass =
                character.claim_status === "approved"
                  ? "bg-green-950/50 text-green-300"
                  : character.claim_status === "pending"
                    ? "bg-amber-950/50 text-amber-300"
                    : "bg-zinc-800 text-zinc-300";

              return (
                <article
                  key={character.id}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                    {character.portrait_url ? (
                      <img
                        src={character.portrait_url}
                        alt={character.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-zinc-500">
                        ?
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {character.name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${statusClass}`}
                      >
                        {character.claim_status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-400">
                      Owner:{" "}
                      {character.owner?.display_name ??
                        character.claimant?.display_name ??
                        "Unassigned"}
                    </p>

                    {character.claim_rejection_reason && (
                      <p className="mt-2 text-sm text-red-300">
                        Last rejection: {character.claim_rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {character.claim_status === "pending" && (
                      <Link
                        href="/dm/claims"
                        className="rounded-xl border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-center text-sm text-amber-300"
                      >
                        Review
                      </Link>
                    )}

                    <Link
                      href={`/dm/characters/${character.id}/edit`}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-center text-sm text-zinc-200"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}