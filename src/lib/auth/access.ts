import { createClient } from "@/lib/supabase/server";

export type CampaignAccess = {
  userId: string;
  profileId: string;
  displayName: string;
  campaignId: string;
  role: "dm" | "player";
  isDm: boolean;
  isPlayer: boolean;
  characterId?: string | null;
  characterName?: string | null;
  hasApprovedCharacter: boolean;
};

export async function getCampaignAccess(
  campaignSlug = "dinner-with-the-devil",
): Promise<CampaignAccess | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("campaign_members")
    .select(`
      role,
      campaigns (
        id,
        slug
      ),
      profiles (
        id,
        display_name
      )
    `)
    .eq("profile_id", user.id)
    .eq("campaigns.slug", campaignSlug)
    .single();

  if (error || !data) {
    console.error("Campaign access error:", error);
    return null;
  }

  const campaign = Array.isArray(data.campaigns)
    ? data.campaigns[0]
    : data.campaigns;

  const profile = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;

  if (!campaign || !profile) {
    return null;
  }

  //console.log("access data", data);

  const { data: ownedCharacter } = await supabase
  .from("characters")
  .select("id, name")
  .eq("campaign_id", campaign.id)
  .eq("owner_profile_id", profile.id)
  .eq("claim_status", "approved")
  .maybeSingle();

  return {
    userId: user.id,
    profileId: profile.id,
    displayName: profile.display_name,
    campaignId: campaign.id,
    role: data.role,
    isDm: data.role === "dm",
    isPlayer: data.role === "player",
    characterId: ownedCharacter?.id ?? null,
    characterName: ownedCharacter?.name ?? null,
    hasApprovedCharacter: Boolean(ownedCharacter),
  };
}