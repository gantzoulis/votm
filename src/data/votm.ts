export type ModuleStatus = "hidden" | "active" | "completed";

export type Module = {
  id: string;
  title: string; // true title, DM/completed
  playerTitle: string; // title shown while active
  order: number;
  status: ModuleStatus;
  completedAt?: string;
  coverImageUrl?: string;
};

export type Item = {
    id: string;
    name: string;
    displayName: string;
    category: string;
    rarity: string;
    moduleId: string;
    holder: string | null;
    isIdentified: boolean;
    isCursed: boolean;
    requiresAttunement: boolean;
    publicDescription: string;
    secretDescription?: string;
    discoveryNote?: string;
    chargesCurrent?: number;
    chargesMax?: number;
    rechargesOn?: string;
    unidentifiedImageUrl?: string;
    identifiedImageUrl?: string;
};

export const modules: Module[] = [
  {
    id: "cos-1",
    title: "Curse of Strahd Part I",
    playerTitle: "The Devil’s Invitation",
    order: 1,
    status: "completed",
    completedAt: "2025-01-01",
  },
  {
    id: "notwd",
    title: "Night of the Walking Dead",
    playerTitle: "The One with the Undead",
    order: 2,
    status: "completed",
    completedAt: "2025-01-01",
  },
  {
    id: "tod",
    title: "Touch of Death",
    playerTitle: "The One with the Desert",
    order: 3,
    status: "completed",
    completedAt: "2025-01-01",
  },
  {
    id: "hotk",
    title: "Hour of the Knife",
    playerTitle: "The One with Parridon",
    order: 4,
    status: "active",
  },
  {
    id: "custom",
    title: "Custom Chapter",
    playerTitle: "The Nameless Interlude",
    order: 5,
    status: "hidden",
  },
  {
    id: "evil-eye",
    title: "The Evil Eye",
    playerTitle: "The One with the child",
    order: 6,
    status: "hidden",
  },
  {
    id: "black-roses",
    title: "Where Black Roses Bloom",
    playerTitle: "The One with our Home",
    order: 7,
    status: "hidden",
  },
  {
    id: "cos-2",
    title: "Curse of Strahd Part II",
    playerTitle: "Return to the Devil’s Land",
    order: 8,
    status: "hidden",
  },
  {
    id: "cos-3",
    title: "Curse of Strahd Part III",
    playerTitle: "The Final Supper",
    order: 9,
    status: "hidden",
  },
];

export const items: Item[] = [
  {
    id: "lantern-watchers",
    name: "Lantern of the Watchers",
    displayName: "Tarnished Iron Lantern",
    category: "Wondrous Item",
    rarity: "Rare",
    moduleId: "hotk",
    holder: null,
    isIdentified: false,
    isCursed: false,
    requiresAttunement: true,
    chargesCurrent:5,
    chargesMax:5,
    rechargesOn: "Dawn",
    
    publicDescription:
      "A cold iron lantern that glows with a pale, sickly green light.",
    secretDescription:
      "Undead within 60 feet cannot benefit from invisibility. The lantern may attract things from the Mists.",
    discoveryNote:
      "Found during the current chapter, beneath the streets of a city that should not exist.",
  },
];