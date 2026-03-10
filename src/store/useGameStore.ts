import { create } from 'zustand';

// 9 premium zodiac symbols matching the sprite assets in /public/assets/sprites/
export type Symbol = '🐉' | '🧧' | '🏮' | '🐂' | '🌸' | '💰' | '🐒' | '🐍' | '🐯';

interface GameState {
  coins: number;
  betAmount: number;
  isSpinning: boolean;
  grid: Symbol[][];
  lastWin: number;
  winningCells: [number, number][];
  setBetAmount: (amount: number) => void;
  spin: () => void;
  setGrid: (grid: Symbol[][]) => void;
  addWin: (amount: number, cells: [number, number][]) => void;
  setSpinning: (val: boolean) => void;
  clearWin: () => void;
}

const SYMBOLS: Symbol[] = ['🐉', '🧧', '🏮', '🐂', '🌸', '💰', '🐒', '🐍', '🐯'];

const randomSymbol = (): Symbol => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const generateGrid = (): Symbol[][] => [
  [randomSymbol(), randomSymbol(), randomSymbol()],
  [randomSymbol(), randomSymbol(), randomSymbol()],
  [randomSymbol(), randomSymbol(), randomSymbol()],
];

export const useGameStore = create<GameState>((set) => ({
  coins: 12966,
  betAmount: 10,
  isSpinning: false,
  grid: generateGrid(),
  lastWin: 0,
  winningCells: [],
  setBetAmount: (amount) => set({ betAmount: amount }),
  spin: () =>
    set((state) => ({
      coins: state.coins - state.betAmount,
      isSpinning: true,
      lastWin: 0,
      winningCells: [],
    })),
  setGrid: (grid) => set({ grid }),
  addWin: (amount, cells) =>
    set((state) => ({
      coins: state.coins + amount,
      lastWin: amount,
      winningCells: cells,
    })),
  setSpinning: (val) => set({ isSpinning: val }),
  clearWin: () => set({ lastWin: 0, winningCells: [] }),
}));
