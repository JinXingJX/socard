export interface CardStats {
  attack: number;
  defense: number;
}

export interface CardVarList {
  sourceWork?: string;
  sourceMedia?: string;
  stylePoints?: string[];
  characterName?: string;
  characterTitle?: string;
  appearancePoints?: string[];
  weaponProps?: string;
  actionPose?: string;
  skillName?: string;
  visualEffects?: string;
  [key: string]: any;
}

export interface CardData {
  id: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  stats: CardStats;
  imageUrl: string;
  visualPrompt: string;
  varList: CardVarList;
}

export interface GenerationStatus {
  step: 'idle' | 'analyzing' | 'painting' | 'complete' | 'error';
  message: string;
}
