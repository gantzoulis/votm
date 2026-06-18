"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import { logItemEvent } from "@/lib/logging/item-events";

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


  const { data: existingItem, error: existingItemError } = await supabase
  .from("items")
  .select("id, campaign_id, name, display_name, charges_current, charges_max")
  .eq("id", itemId)
  .single();

  if (existingItemError || !existingItem) {
    throw new Error(existingItemError?.message ?? "Item not found");
  }

  const access = await getCampaignAccess();

  const nextChargesCurrent = toNullableNumber(formData.get("chargesCurrent"));
  const nextChargesMax = toNullableNumber(formData.get("chargesMax"));

  const payload = {
    module_id: toNullableString(formData.get("moduleId")),

    name: String(formData.get("name") ?? "").trim(),
    display_name: String(formData.get("displayName") ?? "").trim(),

    category: String(formData.get("category") ?? "Wondrous Item").trim(),
    rarity: String(formData.get("rarity") ?? "Unknown").trim(),

    public_description: String(formData.get("publicDescription") ?? "").trim(),
    secret_description: toNullableString(formData.get("secretDescription")),
    discovery_note: toNullableString(formData.get("discoveryNote")),
    holder_character_id: toNullableString(formData.get("holderCharacterId")),

    is_identified: formData.get("isIdentified") === "on",
    is_cursed: formData.get("isCursed") === "on",
    requires_attunement: formData.get("requiresAttunement") === "on",
    revealed_description: toNullableString(formData.get("revealedDescription")),

    //charges_current: toNullableNumber(formData.get("chargesCurrent")),
    //charges_max: toNullableNumber(formData.get("chargesMax")),
    charges_current: nextChargesCurrent,
    charges_max: nextChargesMax,
    recharges_on: toNullableString(formData.get("rechargesOn")),

    unidentified_image_url: toNullableString(formData.get("unidentifiedImageUrl")),
    identified_image_url: toNullableString(formData.get("identifiedImageUrl")),

    is_container: formData.get("isContainer") === "on",
    parent_item_id: toNullableString(formData.get("parentItemId")),
    
  };


    const chargesChanged =
      existingItem.charges_current !== nextChargesCurrent ||
      existingItem.charges_max !== nextChargesMax;

    if (chargesChanged) {
      const itemName = existingItem.name || existingItem.display_name;
      const actorName = access?.displayName ?? "Unknown user";

      await logItemEvent({
        campaignId: existingItem.campaign_id,
        itemId: existingItem.id,
        actorProfileId: access?.profileId,

        eventType: "charges_changed",

        summary: `${actorName} changed charges for ${itemName} from ${
          existingItem.charges_current ?? "—"
        }/${existingItem.charges_max ?? "—"} to ${
          nextChargesCurrent ?? "—"
        }/${nextChargesMax ?? "—"}`,

        beforeData: {
          charges_current: existingItem.charges_current,
          charges_max: existingItem.charges_max,
        },

        afterData: {
          charges_current: nextChargesCurrent,
          charges_max: nextChargesMax,
        },
      });
    }


  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/vault/items/${itemId}`);
}