import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import { claimCharacter } from "./actions";

export default async function OnboardingPage() {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: ownedCharacter } = await supabase
    .from("characters")
    .select("id")
    .eq("campaign_id", access.campaignId)
    .eq("owner_profile_id", access.profileId)
    .maybeSingle();

  if (ownedCharacter || access.isDm) {
    redirect("/vault");
  }

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, claim_status, claimed_by_profile_id")
    .eq("campaign_id", access.campaignId)
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10">
        <p className="text-xs uppercase tracking-[0.28em] text-red-400">
          Vault of the Mists
        </p>

        <h1 className="mt-3 text-3xl font-bold">Choose your character</h1>

        <p className="mt-3 text-sm text-zinc-400">
          Select your character and wait for DM approval.
        </p>

        <div className="mt-6 space-y-3">
          {(characters ?? []).map((character) => {
            const isMinePending =
              character.claim_status === "pending" &&
              character.claimed_by_profile_id === access.profileId;

            return (
              <article
                key={character.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <h2 className="text-lg font-semibold">{character.name}</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Status: {character.claim_status}
                </p>

                {character.claim_status === "unclaimed" && (
                  <form
                    action={claimCharacter.bind(null, character.id)}
                    className="mt-4"
                  >
                    <button className="rounded-xl bg-red-900 px-4 py-3 text-sm font-semibold text-red-100">
                      Claim character
                    </button>
                  </form>
                )}

                {isMinePending && (
                  <p className="mt-4 text-sm text-amber-300">
                    Your claim is pending DM approval.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}