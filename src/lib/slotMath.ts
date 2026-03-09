import type { Symbol } from '@/store/useGameStore';

const SYMBOLS: Symbol[] = ['🐉', '🧧', '🏮', '🐂', '🌸', '💰', '🐒'];

// Symbol multipliers
const MULTIPLIERS: Record<Symbol, number> = {
  '🐉': 10,
  '💰': 8,
  '🧧': 6,
  '🏮': 5,
  '🐂': 4,
  '🌸': 3,
  '🐒': 2,
};

// Weighted random — dragon/money rarer
const WEIGHTS: number[] = [5, 10, 12, 15, 18, 8, 20];

function weightedRandom(): Symbol {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

export function generateGrid(): Symbol[][] {
  return [
    [weightedRandom(), weightedRandom(), weightedRandom()],
    [weightedRandom(), weightedRandom(), weightedRandom()],
    [weightedRandom(), weightedRandom(), weightedRandom()],
  ];
}

// 5 paylines: 3 horizontal rows + 2 diagonals
// Grid is [row][col]
type Payline = [number, number][];

const PAYLINES: Payline[] = [
  [[0, 0], [0, 1], [0, 2]], // top row
  [[1, 0], [1, 1], [1, 2]], // mid row
  [[2, 0], [2, 1], [2, 2]], // bot row
  [[0, 0], [1, 1], [2, 2]], // diagonal TL-BR
  [[2, 0], [1, 1], [0, 2]], // diagonal BL-TR
];

export interface WinResult {
  totalMultiplier: number;
  winningCells: [number, number][];
}

export function evaluateWins(grid: Symbol[][]): WinResult {
  let totalMultiplier = 0;
  const winningCells: Set<string> = new Set();

  for (const line of PAYLINES) {
    const symbols = line.map(([r, c]) => grid[r][c]);
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      totalMultiplier += MULTIPLIERS[symbols[0]];
      line.forEach(([r, c]) => winningCells.add(`${r},${c}`));
    }
  }

  return {
    totalMultiplier,
    winningCells: Array.from(winningCells).map((s) => {
      const [r, c] = s.split(',').map(Number);
      return [r, c] as [number, number];
    }),
  };
}
