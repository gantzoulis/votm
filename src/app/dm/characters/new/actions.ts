"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";

function toNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}


export async function createCharacter(formData: FormData) {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

  const name = String(formData.get("name") ?? "").trim();
  const portraitUrl = toNullableString(formData.get("portraitUrl"));
  const race = toNullableString(formData.get("race"));

    const className = String(formData.get("className") ?? "").trim();

    const subclassName = toNullableString(
    formData.get("subclassName"),
    );

    const classLevel =
    toNullableNumber(formData.get("classLevel")) ?? 1;

    const currentXp =
    toNullableNumber(formData.get("currentXp")) ?? 0;

    const nextLevelXp =
    toNullableNumber(formData.get("nextLevelXp"));

  if (!name) {
    throw new Error("Character name is required.");
  }

  const supabase = await createClient();

  const { data: character, error: characterError } = await supabase
  .from("characters")
  .insert({
    campaign_id: access.campaignId,
    name,
    portrait_url: portraitUrl,
    race,
    current_xp: currentXp,
    next_level_xp: nextLevelXp,
    claim_status: "unclaimed",
    claimed_by_profile_id: null,
    owner_profile_id: null,
    claim_rejection_reason: null,
    created_by_profile_id: access.profileId,
  })
  .select("id")
  .single();

if (characterError || !character) {
  throw new Error(
    characterError?.message ?? "Character could not be created.",
  );
}

if (className) {
  const { error: classError } = await supabase
    .from("character_classes")
    .insert({
      character_id: character.id,
      class_name: className,
      subclass_name: subclassName,
      class_level: classLevel,
    });

  if (classError) {
    // Καθαρίζουμε τον character ώστε να μη μείνει μισή εγγραφή.
    await supabase
      .from("characters")
      .delete()
      .eq("id", character.id);

    throw new Error(classError.message);
  }
}

  redirect("/dm/characters");
}