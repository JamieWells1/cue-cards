export enum Rarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
  FUSION = "fusion",
  ULTRA_FUSION = "ultra_fusion",
  MYTHIC = "mythic",
}

export enum CardType {
  STANDARD = "standard",
  LIMITED = "limited",
}

export enum Trigger {
  DRAW = "draw",
  PLAY = "play",
  RETURN = "return",
  START = "start",
}

export enum Album {
  PALEONTOLOGY = "paleontology",
  HISTORY = "history",
  OCEANS_AND_SEAS = "oceans_and_seas",
  LIFE_ON_LAND = "life_on_land",
  SPACE = "space",
  ARTS_AND_CULTURE = "arts_and_culture",
  SCIENCE = "science",
}

export interface CueCard {
  name: string;
  energy: number | null;
  power: number | null;
  rarity: Rarity | null;
  type: CardType | null;
  album: Album | null;
  collection: string | null;
  ability_triggers: Trigger[];
  ability_descriptions: string[];
  imageUrl: string | null;
}