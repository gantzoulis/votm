import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import { approveClaim, rejectClaim } from "./actions";
import { SubmitButton } from "@/components/forms/SubmitButton";


 type ClaimRow = {
  id: string;
  name: string;
  claim_status: string;
  claimant: { display_name: string } | null;
};


export default async function ClaimsPage() {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

   
    function getClaimantName(claimant: ClaimRow["claimant"]) {
    if (!claimant) return "Unknown";

    if (Array.isArray(claimant)) {
        return claimant[0]?.display_name ?? "Unknown";
    }

    return claimant.display_name;
    }

  const supabase = await createClient();

  const { data: claims } = await supabase
    .from("characters")
    .select(`
      id,
      name,
      claim_status,
      claimant:profiles!characters_claimed_by_profile_id_fkey (
        display_name
      )
    `)
    .eq("campaign_id", access.campaignId)
    .eq("claim_status", "pending")
    .order("name", { ascending: true });

    const pendingClaims = (claims ?? []) as unknown as ClaimRow[];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5">
        <header>
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-2 text-2xl font-bold">Character Claims</h1>
        </header>

        <div className="mt-6 space-y-3">
          {(claims ?? []).length === 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-sm text-zinc-400">No pending claims.</p>
            </section>
          ) : (
            (pendingClaims.map((claim) => (
              <article
                key={claim.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <h2 className="text-lg font-semibold">{claim.name}</h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Claimed by: {claim.claimant?.display_name ?? "Unknown"}
                </p>

                <div className="mt-4 flex gap-2">
                  
                    <form action={approveClaim.bind(null, claim.id)}>
                      <SubmitButton
                        label="Approve"
                        pendingLabel="Approving..."
                        variant="success"
                      />
                    </form>
                  
                    <form action={rejectClaim.bind(null, claim.id)}>
                      <SubmitButton
                        label="Reject"
                        pendingLabel="Rejecting..."
                        variant="secondary"
                      />
                    </form>
                  
                </div>
              </article>
            ))
          ))}
        </div>
      </section>
    </main>
  );
}