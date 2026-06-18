import { createClient } from "@/lib/supabase/server";

type LogItemEventInput = {
  campaignId: string;
  itemId?: string;
  actorProfileId?: string;

  eventType: string;
  summary: string;

  beforeData?: unknown;
  afterData?: unknown;
};

export async function logItemEvent(
  input: LogItemEventInput,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("item_events")
    .insert({
      campaign_id: input.campaignId,
      item_id: input.itemId,
      actor_profile_id: input.actorProfileId,

      event_type: input.eventType,
      summary: input.summary,

      before_data: input.beforeData,
      after_data: input.afterData,
    });

  if (error) {
    console.error("Failed to write item event", error);
  }
}