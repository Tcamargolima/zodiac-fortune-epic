import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { useGameStore } from '@/store/useGameStore';
import { EMOJI_SYMBOL_MAP } from '@/config/zodiacConfig';
import { useGameStage } from '@/components/GameStage';
import type { Symbol } from '@/store/useGameStore';

// ── Grid constants ───────────────────────────────────────────────────────────

const CELL_SIZE = 90;
const CELL_GAP = 8;
const COLS = 3;
const ROWS = 3;
const GRID_W = COLS * CELL_SIZE + (COLS - 1) * CELL_GAP;
const GRID_H = ROWS * CELL_SIZE + (ROWS - 1) * CELL_GAP;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the PIXI.Texture for a given emoji symbol using the preloaded asset
 * registered in zodiacConfig.ts. Falls back to PIXI.Texture.WHITE when the
 * texture is not yet available (graceful degradation).
 */
function getTexture(emoji: Symbol): PIXI.Texture {
  const cfg = EMOJI_SYMBOL_MAP[emoji];
  if (cfg) {
    try {
      const tex = PIXI.Assets.get<PIXI.Texture>(cfg.assetKey);
      if (tex && tex !== PIXI.Texture.EMPTY) return tex;
    } catch {
      // fall through to WHITE
    }
  }
  return PIXI.Texture.WHITE;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * ReelEngine
 *
 * PIXI.js-powered sprite renderer for the 3×3 slot grid.
 *
 * Features:
 * – Renders zodiac sprites loaded via PIXI.Assets (see zodiacConfig.ts).
 * – Applies a golden BlurFilter "Glow" halo on winning symbols during
 *   the win highlight, simulating the studio-quality glow effect.
 * – Handles the spin entrance animation for each column.
 *
 * The component creates its own PIXI.Application on a canvas that is
 * positioned absolutely within the parent slot-frame container, overlaying
 * the emoji-fallback grid. Pointer-events are disabled on the canvas so
 * underlying React controls remain interactive.
 */
const ReelEngine = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spritesRef = useRef<PIXI.Sprite[][]>([]);
  const glowLayerRef = useRef<PIXI.Container | null>(null);
  const prevSpinRef = useRef(false);

  const { assetsLoaded } = useGameStage();
  const { grid, isSpinning, winningCells } = useGameStore();

  // ── Initialise PIXI app ────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !assetsLoaded) return;

    const app = new PIXI.Application({
      backgroundAlpha: 0,
      width: GRID_W,
      height: GRID_H,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    appRef.current = app;

    const canvas = app.view as HTMLCanvasElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2';
    mount.appendChild(canvas);

    // Glow layer sits below the sprites so glows don't cover the artwork
    const glowLayer = new PIXI.Container();
    app.stage.addChild(glowLayer);
    glowLayerRef.current = glowLayer;

    // Sprite grid
    const sprites: PIXI.Sprite[][] = [];
    for (let row = 0; row < ROWS; row++) {
      sprites[row] = [];
      for (let col = 0; col < COLS; col++) {
        const sprite = new PIXI.Sprite(getTexture(grid[row][col]));
        sprite.width = CELL_SIZE;
        sprite.height = CELL_SIZE;
        sprite.x = col * (CELL_SIZE + CELL_GAP);
        sprite.y = row * (CELL_SIZE + CELL_GAP);
        app.stage.addChild(sprite);
        sprites[row].push(sprite);
      }
    }
    spritesRef.current = sprites;

    return () => {
      app.destroy(true, { children: true, texture: false });
      appRef.current = null;
      spritesRef.current = [];
      glowLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetsLoaded]);

  // ── Update textures when grid changes ─────────────────────────────────────
  useEffect(() => {
    if (!assetsLoaded) return;
    const sprites = spritesRef.current;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (sprites[row]?.[col]) {
          sprites[row][col].texture = getTexture(grid[row][col]);
        }
      }
    }
  }, [grid, assetsLoaded]);

  // ── Spin entrance animation ───────────────────────────────────────────────
  useEffect(() => {
    if (!assetsLoaded) return;
    const sprites = spritesRef.current;
    if (!sprites.length) return;

    // Trigger on spin start (isSpinning transitions false → true)
    if (isSpinning && !prevSpinRef.current) {
      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const sprite = sprites[row]?.[col];
          if (!sprite) continue;
          const targetY = row * (CELL_SIZE + CELL_GAP);
          gsap.fromTo(
            sprite,
            { y: -CELL_SIZE, alpha: 0 },
            {
              y: targetY,
              alpha: 1,
              duration: 0.5,
              delay: col * 0.22 + Math.random() * 0.08,
              ease: 'back.out(1.3)',
            },
          );
        }
      }
    }

    prevSpinRef.current = isSpinning;
  }, [isSpinning, assetsLoaded]);

  // ── Glow filter on winning symbols ────────────────────────────────────────
  useEffect(() => {
    const glowLayer = glowLayerRef.current;
    if (!glowLayer || !assetsLoaded) return;

    // Clear previous glow halos
    while (glowLayer.children.length) {
      glowLayer.removeChildAt(0).destroy();
    }

    if (winningCells.length === 0) return;

    const sprites = spritesRef.current;

    winningCells.forEach(([row, col]) => {
      const sprite = sprites[row]?.[col];
      if (!sprite) return;

      // Draw a blurred golden rectangle behind the winning symbol
      const halo = new PIXI.Graphics();
      halo.beginFill(0xffd700, 0.55);
      halo.drawRoundedRect(
        col * (CELL_SIZE + CELL_GAP) - 8,
        row * (CELL_SIZE + CELL_GAP) - 8,
        CELL_SIZE + 16,
        CELL_SIZE + 16,
        14,
      );
      halo.endFill();
      // BlurFilter simulates the Glow filter effect
      halo.filters = [new PIXI.filters.BlurFilter(12)];
      glowLayer.addChild(halo);

      // Pulse scale animation on the winning sprite
      gsap.fromTo(
        sprite.scale,
        { x: 1, y: 1 },
        {
          x: 1.18,
          y: 1.18,
          duration: 0.28,
          yoyo: true,
          repeat: 5,
          ease: 'power2.inOut',
        },
      );
    });
  }, [winningCells, assetsLoaded]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ReelEngine;
