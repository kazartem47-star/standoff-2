import { Rarity, Skin, WeaponCategory, WeaponStats, GameMap, Sticker, BotDifficulty } from './types';

export const COLORS = {
  [Rarity.COMMON]: '#b0c3d9',
  [Rarity.UNCOMMON]: '#5e98d9',
  [Rarity.RARE]: '#4b69ff',
  [Rarity.EPIC]: '#8847ff',
  [Rarity.LEGENDARY]: '#d32ce6',
  [Rarity.ARCANE]: '#eb4b4b',
};

export const WEAPON_STATS: Record<string, WeaponStats> = {
  'AKR': { id: 'AKR', name: 'AKR', category: WeaponCategory.RIFLE, damage: 35, fireRate: 150, magazine: 30 },
  'M4': { id: 'M4', name: 'M4', category: WeaponCategory.RIFLE, damage: 28, fireRate: 120, magazine: 30 },
  'AWM': { id: 'AWM', name: 'AWM', category: WeaponCategory.SNIPER, damage: 100, fireRate: 1200, magazine: 10 },
  'USP': { id: 'USP', name: 'USP', category: WeaponCategory.PISTOL, damage: 20, fireRate: 250, magazine: 12 },
  'G22': { id: 'G22', name: 'G22', category: WeaponCategory.PISTOL, damage: 18, fireRate: 200, magazine: 20 },
  'Deagle': { id: 'Deagle', name: 'Deagle', category: WeaponCategory.PISTOL, damage: 60, fireRate: 500, magazine: 7 },
  'P90': { id: 'P90', name: 'P90', category: WeaponCategory.SMG, damage: 15, fireRate: 80, magazine: 50 },
  'MP7': { id: 'MP7', name: 'MP7', category: WeaponCategory.SMG, damage: 17, fireRate: 90, magazine: 30 },
  'FAMAS': { id: 'FAMAS', name: 'FAMAS', category: WeaponCategory.RIFLE, damage: 25, fireRate: 110, magazine: 25 },
  'Knife': { id: 'Knife', name: 'Knife', category: WeaponCategory.KNIFE, damage: 50, fireRate: 600, magazine: 0 },
};

export const MAPS: GameMap[] = [
  { id: 'sandstone', name: 'Sandstone', color: '#e6cca0', difficultyMod: 1.0 },
  { id: 'rust', name: 'Rust', color: '#8b5a2b', difficultyMod: 1.2 },
  { id: 'province', name: 'Province', color: '#778899', difficultyMod: 1.5 },
];

export const STICKERS: Sticker[] = [
  { id: 's_skull', name: 'Skull', icon: '💀', rarity: Rarity.EPIC },
  { id: 's_fire', name: 'Fire', icon: '🔥', rarity: Rarity.RARE },
  { id: 's_star', name: 'Star', icon: '⭐', rarity: Rarity.UNCOMMON },
  { id: 's_crown', name: 'Crown', icon: '👑', rarity: Rarity.LEGENDARY },
  { id: 's_bio', name: 'Biohazard', icon: '☣️', rarity: Rarity.ARCANE },
  { id: 's_happy', name: 'Smile', icon: '🙂', rarity: Rarity.COMMON },
];

// Mock Data for Skins
export const SKINS_DB: Skin[] = [
  { id: 'akr_carbon', name: 'Carbon', weapon: 'AKR', category: WeaponCategory.RIFLE, rarity: Rarity.RARE, imageColor: '#2a2a2a', price: 15 },
  { id: 'm4_samurai', name: 'Samurai', weapon: 'M4', category: WeaponCategory.RIFLE, rarity: Rarity.LEGENDARY, imageColor: '#8a1c1c', price: 450 },
  { id: 'awm_sport', name: 'Sport V2', weapon: 'AWM', category: WeaponCategory.SNIPER, rarity: Rarity.ARCANE, imageColor: '#e67e22', price: 2100 },
  { id: 'usp_pisces', name: 'Pisces', weapon: 'USP', category: WeaponCategory.PISTOL, rarity: Rarity.UNCOMMON, imageColor: '#3498db', price: 5 },
  { id: 'g22_scale', name: 'Scale', weapon: 'G22', category: WeaponCategory.PISTOL, rarity: Rarity.COMMON, imageColor: '#95a5a6', price: 1 },
  { id: 'kv_buls', name: 'Buls', weapon: 'Knife', category: WeaponCategory.KNIFE, rarity: Rarity.ARCANE, imageColor: '#f1c40f', price: 3500 },
  { id: 'p90_ghoul', name: 'Ghoul', weapon: 'P90', category: WeaponCategory.SMG, rarity: Rarity.EPIC, imageColor: '#8e44ad', price: 120 },
  { id: 'famas_hull', name: 'Hull', weapon: 'FAMAS', category: WeaponCategory.RIFLE, rarity: Rarity.RARE, imageColor: '#2ecc71', price: 25 },
  { id: 'mp7_banana', name: 'Banana', weapon: 'MP7', category: WeaponCategory.SMG, rarity: Rarity.UNCOMMON, imageColor: '#f1c40f', price: 8 },
  { id: 'deagle_dragon', name: 'Dragon', weapon: 'Deagle', category: WeaponCategory.PISTOL, rarity: Rarity.LEGENDARY, imageColor: '#c0392b', price: 600 },
];

export const INITIAL_GOLD = 1000;
export const CASE_COST = 100;
