export type CampaignModule = {
  id: string;
  campaign_id: string;
  title: string;
  player_title: string;
  module_order: number;
  status: "hidden" | "active" | "completed";
  completed_at: string | null;
  cover_image_url: string | null;
};

export type Item = {
  id: string;
  campaign_id: string;
  module_id: string | null;
  name: string;
  display_name: string;
  category: string;
  rarity: string;
  public_description: string;
  secret_description: string | null;
  discovery_note: string | null;
  is_identified: boolean;
  is_cursed: boolean;
  requires_attunement: boolean;
  holder_character_id: string | null;
  charges_current: number | null;
  charges_max: number | null;
  recharges_on: string | null;
  unidentified_image_url: string | null;
  identified_image_url: string | null;
  revealed_description: string | null;
   holder?: {
    id: string;
    name: string;
  } | null;
  is_container: boolean;
  parent_item_id: string | null;

  container?: {
    id: string;
    name: string;
    display_name: string;
    is_identified: boolean;
  } | null;
};

export type Character = {
  id: string;
  campaign_id: string;
  name: string;
  portrait_url: string | null;
};