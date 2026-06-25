"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";

export async function claimCharacter(characterId: string) {
  const supabase = await createClient();
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("characters")
    .update({
      claim_status: "pending",
      claimed_by_profile_id: access.profileId,
    })
    .eq("id", characterId)
    .eq("campaign_id", access.campaignId)
    .eq("claim_status", "unclaimed");

  if (error) {
    throw new Error(error.message);
  }

  redirect("/onboarding");
}