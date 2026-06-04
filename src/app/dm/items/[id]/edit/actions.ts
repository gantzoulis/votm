"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function updateItem(itemId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    module_id: toNullableString(formData.get("moduleId")),

    name: String(formData.get("name") ?? "").trim(),
    display_name: String(formData.get("displayName") ?? "").trim(),

    category: String(formData.get("category") ?? "Wondrous Item").trim(),
    rarity: String(formData.get("rarity") ?? "Unknown").trim(),

    public_description: String(formData.get("publicDescription") ?? "").trim(),
    secret_description: toNullableString(formData.get("secretDescription")),
    discovery_note: toNullableString(formData.get("discoveryNote")),

    is_identified: formData.get("isIdentified") === "on",
    is_cursed: formData.get("isCursed") === "on",
    requires_attunement: formData.get("requiresAttunement") === "on",
    revealed_description: toNullableString(formData.get("revealedDescription")),

    charges_current: toNullableNumber(formData.get("chargesCurrent")),
    charges_max: toNullableNumber(formData.get("chargesMax")),
    recharges_on: toNullableString(formData.get("rechargesOn")),

    unidentified_image_url: toNullableString(formData.get("unidentifiedImageUrl")),
    identified_image_url: toNullableString(formData.get("identifiedImageUrl")),
  };

  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/vault/items/${itemId}`);
}