"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleIdentify(
  itemId: string,
  currentState: boolean
) {
  const supabase = await createClient();

  await supabase
    .from("items")
    .update({
      is_identified: !currentState,
    })
    .eq("id", itemId);

  revalidatePath("/vault");
  revalidatePath(`/vault/items/${itemId}`);
}

export async function increaseCharges(
  itemId: string,
  current: number,
  max: number
) {
  const supabase = await createClient();

  const nextValue = Math.min(current + 1, max);

  await supabase
    .from("items")
    .update({
      charges_current: nextValue,
    })
    .eq("id", itemId);

  revalidatePath(`/vault/items/${itemId}`);
  revalidatePath("/vault");
}

export async function decreaseCharges(
  itemId: string,
  current: number
) {
  const supabase = await createClient();

  const nextValue = Math.max(current - 1, 0);

  await supabase
    .from("items")
    .update({
      charges_current: nextValue,
    })
    .eq("id", itemId);

  revalidatePath(`/vault/items/${itemId}`);
  revalidatePath("/vault");
}