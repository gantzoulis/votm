"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCampaignAccess } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export async function unclaimCharacter(characterId: string) {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select(`
      id,
      campaign_id,
      name,
      claim_status,
      owner_profile_id,
      claimed_by_profile_id
    `)
    .eq("id", characterId)
    .eq("campaign_id", access.campaignId)
    .single();

  if (characterError || !character) {
    throw new Error(characterError?.message ?? "Character not found.");
  }

  const { data: updatedCharacter, error: updateError } = await supabase
  .from("characters")
  .update({
    owner_profile_id: null,
    claimed_by_profile_id: null,
    claim_status: "unclaimed",
    claim_rejection_reason: null,
  })
  .eq("id", character.id)
  .eq("campaign_id", access.campaignId)
  .select(`
    id,
    claim_status,
    owner_profile_id,
    claimed_by_profile_id
  `)
  .single();

if (updateError || !updatedCharacter) {
  throw new Error(
    updateError?.message ?? "Character could not be unclaimed.",
  );
}

  revalidatePath("/vault");
  revalidatePath("/onboarding");
  revalidatePath("/dm/characters");
  revalidatePath(`/dm/characters/${characterId}`);
  revalidatePath(`/characters/${characterId}`);

  redirect("/dm/characters");
}