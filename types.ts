
export interface MoveData {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  
  // Costs & Actions
  pp: string;
  pd: string; // Added PD field
  duration: string;
  range: string;
  distance: string; 
  actionType: string;
  
  // Hit Mechanics
  hasHit: boolean;
  hitProf: boolean;
  hitAttributes: {
    FOR: boolean;
    AGI: boolean;
    INT: boolean;
    PRE: boolean;
    VIG: boolean;
    ATR: boolean;
  };
  
  // DT Mechanics
  hasDT: boolean;
  dtProf: boolean;
  dtAttributes: {
    FOR: boolean;
    AGI: boolean;
    INT: boolean;
    PRE: boolean;
    VIG: boolean;
    ATR: boolean;
  };

  // Stats displayed in description
  stats: {
    FOR: boolean;
    AGI: boolean;
    INT: boolean;
    PRE: boolean;
    VIG: boolean;
    ATR: boolean;
  };
  
  // Content
  conditions: string[];
  description: string;
  
  // Scaling
  hasScaling: boolean;
  addAtrToScaling: boolean; // Renamed from addAttToScaling
  lvl1: string;
  lvl5: string;
  lvl10: string;
  lvl15: string;

  // Image Controls
  imageOffsetY: number;
  imageOffsetX: number; // Added X Offset
  imageScale: number;
  
  // Visual Effects
  isShiny: boolean;
  isFoil: boolean;
}

export const INITIAL_MOVE_DATA: MoveData = {
  id: "fire-blast",
  name: "Fire Blast",
  type: "fire",
  imageUrl: "",
  pp: "3",
  pd: "20", 
  duration: "Instantânea",
  range: "Curto",
  distance: "", 
  actionType: "Ação Padrão",
  hasHit: true,
  hitProf: false,
  hitAttributes: { FOR: false, AGI: false, INT: true, PRE: false, VIG: false, ATR: false },
  hasDT: true,
  dtProf: true,
  dtAttributes: { FOR: false, AGI: true, INT: false, PRE: false, VIG: false, ATR: false },
  stats: { FOR: false, AGI: false, INT: true, PRE: false, VIG: false, ATR: false },
  conditions: ["Queimado"],
  description: "Lança uma rajada de fogo concentrada no alvo.",
  hasScaling: true,
  addAtrToScaling: false,
  lvl1: "Base",
  lvl5: "+1d6",
  lvl10: "+2d6",
  lvl15: "+3d6",
  imageOffsetY: 50,
  imageOffsetX: 50,
  imageScale: 100,
  isShiny: false,
  isFoil: false
};

// --- MONSTER DATA ---
export interface Passive {
  title: string;
  description: string;
}

export interface MonsterMove {
  title: string;
  content: string;
}

export interface MonsterAttributeRow {
  title: string; // Added Title
  FOR: string;
  AGI: string;
  INT: string;
  PRE: string;
  VIG: string;
}

export interface MonsterData extends Omit<MoveData, 'conditions' | 'description' | 'actionType' | 'stats' | 'range' | 'distance' | 'hasScaling' | 'addAtrToScaling' | 'lvl1' | 'lvl5' | 'lvl10' | 'lvl15' | 'duration'> {
  hitDie: string; // Maps to UI Label "D"
  pd: string;     // New UI Label "PD"
  vd: string;     // Maps to UI Label "HP"
  speeds: string[]; // Replaces Duration
  attributes: MonsterAttributeRow[]; // Array of rows, each having 5 fixed attributes
  secondaryType?: string;
  vulnerabilities: string[]; // List of ELEMENT IDs
  resistances: string[];    // List of ELEMENT IDs
  immunities: string[];     // List of ELEMENT IDs
  passives: Passive[];      // Array of passives
  moves: MonsterMove[];     // Array of moves/levels
  imageOffsetY: number;     // Vertical offset percentage for image (0-100)
  imageOffsetX: number;     // Horizontal offset percentage
  imageScale: number;       // Scale percentage (100 = 1x)
  isShiny: boolean;
  isFoil: boolean;
}

export const INITIAL_MONSTER_DATA: MonsterData = {
  ...INITIAL_MOVE_DATA,
  id: "monster-template",
  name: "Monstro Template",
  hitDie: "1d6", // D
  pd: "0",       // PD
  vd: "30",      // HP
  speeds: ["30ft. walking"],
  secondaryType: undefined,
  attributes: [
    { title: "Lvl 1", FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" },
    { title: "Lvl 2", FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" },
    { title: "Lvl 3", FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" },
    { title: "Lvl 4", FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" },
    { title: "Lvl 5", FOR: "0", AGI: "0", INT: "0", PRE: "0", VIG: "0" }
  ],
  // @ts-ignore
  conditions: undefined, 
  // @ts-ignore
  description: undefined,
  // @ts-ignore
  actionType: undefined,
  // @ts-ignore
  stats: undefined,
  // @ts-ignore
  range: undefined,
  // @ts-ignore
  distance: undefined,
  // @ts-ignore
  hasScaling: undefined,
  // @ts-ignore
  addAtrToScaling: undefined,
  // @ts-ignore
  lvl1: undefined,
  // @ts-ignore
  lvl5: undefined,
  // @ts-ignore
  lvl10: undefined,
  // @ts-ignore
  lvl15: undefined,
  // @ts-ignore
  duration: undefined,
  vulnerabilities: [],
  resistances: [],
  immunities: [],
  passives: [
    { title: "Habilidade Passiva", description: "Descrição do efeito passivo." }
  ],
  moves: [
    { title: "Starting", content: "Tackle, Growl" },
    { title: "Level 5", content: "Ember" }
  ],
  imageOffsetY: 50, // Default center
  imageOffsetX: 50,
  imageScale: 100,
  isShiny: false,
  isFoil: false
};

export interface SavedMoveCard {
  id: string;
  data: MoveData;
  timestamp: number;
}

export interface SavedMonsterCard {
  id: string;
  data: MonsterData;
  timestamp: number;
}

export const ELEMENT_TYPES = [
  { id: 'normal', label: 'Normal', color: '#A8A77A' },
  { id: 'fire', label: 'Fogo', color: '#EE8130' },
  { id: 'water', label: 'Água', color: '#6390F0' },
  { id: 'electric', label: 'Elétrico', color: '#F7D02C' },
  { id: 'grass', label: 'Grama', color: '#7AC74C' },
  { id: 'ice', label: 'Gelo', color: '#96D9D6' },
  { id: 'fighting', label: 'Lutador', color: '#C22E28' },
  { id: 'poison', label: 'Venenoso', color: '#A33EA1' },
  { id: 'ground', label: 'Terra', color: '#E2BF65' },
  { id: 'flying', label: 'Voador', color: '#A98FF3' },
  { id: 'psychic', label: 'Psíquico', color: '#F95587' },
  { id: 'bug', label: 'Inseto', color: '#A6B91A' },
  { id: 'rock', label: 'Pedra', color: '#B6A136' },
  { id: 'ghost', label: 'Fantasma', color: '#735797' },
  { id: 'dragon', label: 'Dragão', color: '#6F35FC' },
  { id: 'steel', label: 'Aço', color: '#B7B7CE' },
  { id: 'dark', label: 'Sombrio', color: '#705746' },
  { id: 'fairy', label: 'Fada', color: '#D685AD' },
];

export const CONDITIONS_LIST = [
  { id: 'burn', label: 'Queimado', color: '#EE8130' },
  { id: 'freeze', label: 'Congelado', color: '#96D9D6' },
  { id: 'para', label: 'Paralisado', color: '#F7D02C' },
  { id: 'psn', label: 'Envenenado', color: '#A33EA1' },
  { id: 'slp', label: 'Dormindo', color: '#606060' },
  { id: 'conf', label: 'Confuso', color: '#F95587' },
  { id: 'blind', label: 'Cego', color: '#334155' },
  { id: 'fear', label: 'Amedrontado', color: '#735797' },
];
