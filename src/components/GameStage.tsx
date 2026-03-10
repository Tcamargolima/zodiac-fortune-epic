import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { ASSET_MANIFEST } from '@/config/zodiacConfig';

// ── Context ─────────────────────────────────────────────────────────────────

interface GameStageContextValue {
  /** The shared PIXI.Application (available after assets are loaded). */
  app: PIXI.Application | null;
  /** True once all 9 premium assets have finished loading. */
  assetsLoaded: boolean;
  /**
   * Screen shake: animates the main game container with a GSAP x/y offset,
   * triggering whenever the reels stop abruptly.
   */
  triggerShake: () => void;
  /**
   * Coin particle explosion: bursts golden coins from the screen centre
   * whenever totalWin > 0.
   */
  triggerCoinExplosion: () => void;
}

const GameStageContext = createContext<GameStageContextValue>({
  app: null,
  assetsLoaded: false,
  triggerShake: () => {},
  triggerCoinExplosion: () => {},
});

export const useGameStage = () => useContext(GameStageContext);

// ── Component ────────────────────────────────────────────────────────────────

interface GameStageProps {
  children: ReactNode;
}

/**
 * GameStage
 *
 * Responsibilities:
 * 1. Creates a full-screen, transparent PIXI.Application for visual effects.
 * 2. Preloads all 9 premium assets via PIXI.Assets.add() and shows a real
 *    progress bar while loading.
 * 3. Provides triggerShake() – GSAP x/y shake on the wrapper div.
 * 4. Provides triggerCoinExplosion() – PIXI.Graphics coin particles burst from
 *    the centre of the canvas on every win.
 * 5. Exposes context values via GameStageContext so child components can
 *    access the app and trigger effects.
 */
const GameStage = ({ children }: GameStageProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const effectsMountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particleLayerRef = useRef<PIXI.Container | null>(null);

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // ── Initialize PIXI effects canvas ────────────────────────────────────────
  useEffect(() => {
    const mount = effectsMountRef.current;
    if (!mount) return;

    const app = new PIXI.Application({
      backgroundAlpha: 0,
      resizeTo: mount,
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
    mount.appendChild(canvas);

    // Dedicated layer for coin particles (always on top)
    const particleLayer = new PIXI.Container();
    app.stage.addChild(particleLayer);
    particleLayerRef.current = particleLayer;

    // ── Load all 9 premium assets ─────────────────────────────────────────
    const loadAssets = async () => {
      try {
        // Register every asset with its URL-safe path
        for (const { alias, src } of ASSET_MANIFEST) {
          PIXI.Assets.add({ alias, src });
        }

        await PIXI.Assets.load(
          ASSET_MANIFEST.map((a) => a.alias),
          (progress: number) => setLoadProgress(Math.round(progress * 100)),
        );

        setLoadProgress(100);
        setAssetsLoaded(true);
      } catch (err) {
        // Graceful degradation: proceed even if sprites fail to load
        console.error('[GameStage] Asset loading failed:', err);
        setAssetsLoaded(true);
      }
    };

    loadAssets();

    return () => {
      app.destroy(true, { children: true, texture: false });
      appRef.current = null;
      particleLayerRef.current = null;
    };
  }, []);

  // ── Screen Shake ──────────────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      x: 10,
      y: 5,
      duration: 0.05,
      repeat: 7,
      yoyo: true,
      ease: 'none',
      onComplete() {
        gsap.set(el, { x: 0, y: 0 });
      },
    });
  }, []);

  // ── Coin Particle Explosion ───────────────────────────────────────────────
  const triggerCoinExplosion = useCallback(() => {
    const layer = particleLayerRef.current;
    const app = appRef.current;
    if (!layer || !app) return;

    const cx = app.renderer.width / 2;
    const cy = app.renderer.height / 2;
    const COIN_COUNT = 28;

    for (let i = 0; i < COIN_COUNT; i++) {
      // Draw a golden coin using PIXI.Graphics
      const coin = new PIXI.Graphics();
      coin.beginFill(0xffd700);
      coin.drawCircle(0, 0, 9);
      coin.endFill();
      coin.beginFill(0xffa500, 0.7);
      coin.drawCircle(-2, -2, 5);
      coin.endFill();
      coin.lineStyle(1.5, 0xffe066);
      coin.drawCircle(0, 0, 9);
      coin.x = cx;
      coin.y = cy;
      layer.addChild(coin);

      // Spread coins in a full circle with upward bias
      const angle = (Math.PI * 2 * i) / COIN_COUNT + (Math.random() - 0.5) * 0.4;
      const speed = 160 + Math.random() * 220;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 130;

      gsap.to(coin, {
        x: cx + vx * 0.55,
        y: cy + vy * 0.55 + 90,
        alpha: 0,
        duration: 0.75 + Math.random() * 0.45,
        ease: 'power2.out',
        delay: i * 0.018,
        onComplete() {
          if (coin.parent) coin.parent.removeChild(coin);
          coin.destroy();
        },
      });
    }
  }, []);

  return (
    <GameStageContext.Provider
      value={{
        app: appRef.current,
        assetsLoaded,
        triggerShake,
        triggerCoinExplosion,
      }}
    >
      {/* Outer wrapper that gets shaken via GSAP */}
      <div ref={wrapperRef} style={{ position: 'relative', willChange: 'transform' }}>
        {/* PIXI effects canvas (full size, pointer-events: none overlay) */}
        <div
          ref={effectsMountRef}
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />

        {/* Loading overlay – shown until all 9 assets are ready */}
        {!assetsLoaded && (
          <div
            style={{ zIndex: 50 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/90"
          >
            <p className="text-yellow-400 font-bold text-sm mb-4 uppercase tracking-widest animate-pulse">
              ✨ Carregando Assets Premium...
            </p>
            <div className="w-56 h-3 bg-yellow-900/40 rounded-full overflow-hidden border border-yellow-700/40">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-200 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-yellow-500/60 text-xs mt-2 tabular-nums">{loadProgress}%</p>
            <p className="text-yellow-700/50 text-[10px] mt-1 uppercase tracking-widest">
              9 símbolos do zodíaco
            </p>
          </div>
        )}

        {/* React game UI */}
        {children}
      </div>
    </GameStageContext.Provider>
  );
};

export default GameStage;
export { GameStageContext };
