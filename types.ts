export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  ARCANE = 'Arcane'
}

export enum GameView {
  MENU = 'MENU',
  INVENTORY = 'INVENTORY',
  CASE_OPENER = 'CASE_OPENER',
  TRAINING = 'TRAINING'
}

export enum WeaponCategory {
  RIFLE = 'Rifle',
  PISTOL = 'Pistol',
  SNIPER = 'Sniper',
  SMG = 'SMG',
  HEAVY = 'Heavy',
  KNIFE = 'Knife'
}

export interface Sticker {
  id: string;
  name: string;
  icon: string; // Emoji or character for simplicity
  rarity: Rarity;
}

export interface Skin {
  id: string;
  name: string;
  weapon: string; // e.g. "AKR", "M4"
  category: WeaponCategory;
  rarity: Rarity;
  imageColor: string; 
  price: number; 
}

export interface InventoryItem extends Skin {
  uid: string;
  acquiredAt: number;
  stickers: Sticker[]; // Max 4
}

export interface WeaponStats {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: number;
  fireRate: number; // ms delay
  magazine: number;
}

export enum BotDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface GameMap {
  id: string;
  name: string;
  color: string;
  difficultyMod: number;
}
