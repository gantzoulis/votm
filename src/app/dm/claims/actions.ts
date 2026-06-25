"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";

export async function approveClaim(characterId: string) {
  const access = await getCampaignAccess();

  if (!access?.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { data: character, error: readError } = await supabase
    .from("characters")
    .select("claimed_by_profile_id")
    .eq("id", characterId)
    .eq("campaign_id", access.campaignId)
    .eq("claim_status", "pending")
    .single();

  if (readError || !character?.claimed_by_profile_id) {
    throw new Error(readError?.message ?? "Claim not found");
  }

  const { error } = await supabase
    .from("characters")
    .update({
      owner_profile_id: character.claimed_by_profile_id,
      claim_status: "approved",
    })
    .eq("id", characterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dm/claims");
}

export async function rejectClaim(characterId: string) {
  const access = await getCampaignAccess();

  if (!access?.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("characters")
    .update({
      claimed_by_profile_id: null,
      claim_status: "unclaimed",
    })
    .eq("id", characterId)
    .eq("campaign_id", access.campaignId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dm/claims");
}