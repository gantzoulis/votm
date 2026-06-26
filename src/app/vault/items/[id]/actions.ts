"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import { logItemEvent } from "@/lib/logging/item-events";

export async function increaseCharges(
  itemId: string,
  current: number,
  max: number,
) {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  const supabase = await createClient();
  const nextValue = Math.min(current + 1, max);

  const { data: item, error: readError } = await supabase
    .from("items")
    .select("id, campaign_id, name, display_name, charges_current, charges_max")
    .eq("id", itemId)
    .single();

  if (readError || !item) {
    throw new Error(readError?.message ?? "Item not found");
  }

  const { error } = await supabase
    .from("items")
    .update({ charges_current: nextValue })
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await logItemEvent({
    campaignId: item.campaign_id,
    itemId: item.id,
    actorProfileId: access.profileId,
    eventType: "charges_changed",
    summary: `${access.displayName} changed charges for ${
      item.name || item.display_name
    } from ${item.charges_current ?? "—"}/${item.charges_max ?? "—"} to ${nextValue}/${
      item.charges_max ?? "—"
    }`,
    beforeData: {
      charges_current: item.charges_current,
      charges_max: item.charges_max,
    },
    afterData: {
      charges_current: nextValue,
      charges_max: item.charges_max,
    },
  });

  revalidatePath("/vault");
  revalidatePath(`/vault/items/${itemId}`);
}

export async function decreaseCharges(itemId: string, current: number) {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  const supabase = await createClient();
  const nextValue = Math.max(current - 1, 0);

  const { data: item, error: readError } = await supabase
    .from("items")
    .select("id, campaign_id, name, display_name, charges_current, charges_max")
    .eq("id", itemId)
    .single();

  if (readError || !item) {
    throw new Error(readError?.message ?? "Item not found");
  }

  const { error } = await supabase
    .from("items")
    .update({ charges_current: nextValue })
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await logItemEvent({
    campaignId: item.campaign_id,
    itemId: item.id,
    actorProfileId: access.profileId,
    eventType: "charges_changed",
    summary: `${access.displayName} changed charges for ${
      item.name || item.display_name
    } from ${item.charges_current ?? "—"}/${item.charges_max ?? "—"} to ${nextValue}/${
      item.charges_max ?? "—"
    }`,
    beforeData: {
      charges_current: item.charges_current,
      charges_max: item.charges_max,
    },
    afterData: {
      charges_current: nextValue,
      charges_max: item.charges_max,
    },
  });

  revalidatePath("/vault");
  revalidatePath(`/vault/items/${itemId}`);
}

export async function toggleHiddenItem(itemId: string, currentState: boolean) {
  const access = await getCampaignAccess();

  if (!access?.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();
  const nextState = !currentState;

  const { data: item, error: readError } = await supabase
    .from("items")
    .select("id, campaign_id, name, display_name, is_hidden")
    .eq("id", itemId)
    .single();

  if (readError || !item) {
    throw new Error(readError?.message ?? "Item not found");
  }

  const { error } = await supabase
    .from("items")
    .update({ is_hidden: nextState })
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await logItemEvent({
    campaignId: item.campaign_id,
    itemId: item.id,
    actorProfileId: access.profileId,
    eventType: nextState ? "item_hidden" : "item_unhidden",
    summary: `${access.displayName} ${nextState ? "hid" : "unhid"} ${
      item.name || item.display_name
    }`,
    beforeData: { is_hidden: item.is_hidden },
    afterData: { is_hidden: nextState },
  });

  revalidatePath("/vault");
  revalidatePath(`/vault/items/${itemId}`);
}

export async function softDeleteItem(itemId: string) {
  const access = await getCampaignAccess();

  if (!access?.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { data: item, error: readError } = await supabase
    .from("items")
    .select("id, campaign_id, name, display_name")
    .eq("id", itemId)
    .single();

  if (readError || !item) {
    throw new Error(readError?.message ?? "Item not found");
  }

  const { error } = await supabase
    .from("items")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by_profile_id: access.profileId,
    })
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await logItemEvent({
    campaignId: item.campaign_id,
    itemId: item.id,
    actorProfileId: access.profileId,
    eventType: "item_deleted",
    summary: `${access.displayName} deleted ${item.name || item.display_name}`,
    beforeData: { deleted_at: null },
    afterData: { deleted_at: "now" },
  });

  redirect("/vault");
}

export async function toggleIdentify(itemId: string, currentState: boolean) {
  const access = await getCampaignAccess();

  if (!access?.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();
  const nextState = !currentState;

  const { data: item, error: readError } = await supabase
    .from("items")
    .select("id, campaign_id, name, display_name, is_identified")
    .eq("id", itemId)
    .single();

  if (readError || !item) {
    throw new Error(readError?.message ?? "Item not found");
  }

  const { error } = await supabase
    .from("items")
    .update({ is_identified: nextState })
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  await logItemEvent({
    campaignId: item.campaign_id,
    itemId: item.id,
    actorProfileId: access.profileId,
    eventType: nextState ? "item_identified" : "item_unidentified",
    summary: `${access.displayName} ${
      nextState ? "revealed" : "hid the identity of"
    } ${item.name || item.display_name}`,
    beforeData: { is_identified: item.is_identified },
    afterData: { is_identified: nextState },
  });

  revalidatePath("/vault");
  revalidatePath(`/vault/items/${itemId}`);
}