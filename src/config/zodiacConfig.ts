/**
 * Zodiac Fortune Epic – Symbol & Asset Configuration
 *
 * Maps zodiac symbols to their corresponding sprite files.
 * Original asset file names had spaces (e.g., 'Moedas da Prosperidade (Porco).png').
 * All files have been renamed to URL-safe versions (e.g., 'moedas_porco.png')
 * so that PIXI.Assets.add() loads them correctly without encoding errors.
 */

export type SymbolId =
  | 'dragao'
  | 'porco'
  | 'coelho'
  | 'boi'
  | 'tigre'
  | 'cavalo'
  | 'rato'
  | 'serpente'
  | 'macaco';

export interface ZodiacSymbolConfig {
  id: SymbolId;
  /** Human-readable display name */
  label: string;
  /** Emoji fallback for non-PIXI rendering */
  emoji: string;
  /** PIXI asset key – no spaces, URL-safe, unique */
  assetKey: string;
  /** Path relative to /public (served at root by Vite) */
  assetPath: string;
  /** Payout multiplier for 3-of-a-kind */
  multiplier: number;
  /** Higher weight = more common in weighted random */
  weight: number;
  isWild?: boolean;
}

/** 9 premium zodiac symbols – each mapped to a URL-safe sprite file */
export const ZODIAC_SYMBOLS: ZodiacSymbolConfig[] = [
  {
    id: 'dragao',
    label: 'Dragão Celestial',
    emoji: '🐉',
    assetKey: 'dragao',
    assetPath: '/assets/sprites/dragao_celestial.png',
    multiplier: 10,
    weight: 5,
  },
  {
    id: 'macaco',
    label: 'Joia do Macaco (Wild)',
    emoji: '🐒',
    assetKey: 'macaco',
    assetPath: '/assets/sprites/joia_macaco_wild.png',
    multiplier: 7,
    weight: 6,
    isWild: true,
  },
  {
    id: 'porco',
    label: 'Moedas da Prosperidade',
    emoji: '💰',
    assetKey: 'porco',
    assetPath: '/assets/sprites/moedas_porco.png',
    multiplier: 8,
    weight: 8,
  },
  {
    id: 'coelho',
    label: 'Lanterna do Coelho',
    emoji: '🏮',
    assetKey: 'coelho',
    assetPath: '/assets/sprites/lanterna_coelho.png',
    multiplier: 6,
    weight: 10,
  },
  {
    id: 'boi',
    label: 'Saco do Boi',
    emoji: '🐂',
    assetKey: 'boi',
    assetPath: '/assets/sprites/saco_boi.png',
    multiplier: 5,
    weight: 12,
  },
  {
    id: 'tigre',
    label: 'Tigre Imperial',
    emoji: '🐯',
    assetKey: 'tigre',
    assetPath: '/assets/sprites/tigre_imperial.png',
    multiplier: 4,
    weight: 15,
  },
  {
    id: 'serpente',
    label: 'Amuleto da Serpente',
    emoji: '🐍',
    assetKey: 'serpente',
    assetPath: '/assets/sprites/amuleto_serpente.png',
    multiplier: 3,
    weight: 14,
  },
  {
    id: 'cavalo',
    label: 'Flor do Cavalo',
    emoji: '🌸',
    assetKey: 'cavalo',
    assetPath: '/assets/sprites/flor_cavalo.png',
    multiplier: 2,
    weight: 18,
  },
  {
    id: 'rato',
    label: 'Envelope do Rato',
    emoji: '🧧',
    assetKey: 'rato',
    assetPath: '/assets/sprites/envelope_rato.png',
    multiplier: 2,
    weight: 20,
  },
];

/**
 * Asset manifest for PIXI.Assets.add() preloading.
 * Contains all 9 premium sprites with URL-safe paths.
 */
export const ASSET_MANIFEST = ZODIAC_SYMBOLS.map((s) => ({
  alias: s.assetKey,
  src: s.assetPath,
}));

/** Emoji → symbol config lookup (for backward-compatible emoji rendering) */
export const EMOJI_SYMBOL_MAP: Record<string, ZodiacSymbolConfig> = Object.fromEntries(
  ZODIAC_SYMBOLS.map((s) => [s.emoji, s])
);

/** Get symbol config by asset key */
export function getSymbolByKey(assetKey: string): ZodiacSymbolConfig | undefined {
  return ZODIAC_SYMBOLS.find((s) => s.assetKey === assetKey);
}

/** Get symbol config by emoji */
export function getSymbolByEmoji(emoji: string): ZodiacSymbolConfig | undefined {
  return EMOJI_SYMBOL_MAP[emoji];
}
