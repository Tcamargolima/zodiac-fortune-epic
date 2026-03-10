import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HUDProps {
  coins: number;
  lastWin: number;
}

/**
 * HUD – Heads-Up Display
 *
 * The coin counter uses gsap.to to tween the displayed number from its
 * previous value to the new value whenever `coins` changes, giving a smooth
 * "counting up / counting down" animation after every spin result.
 */
const HUD = ({ coins, lastWin }: HUDProps) => {
  const coinDisplayRef = useRef<HTMLSpanElement>(null);
  const tweenObj = useRef<{ value: number }>({ value: coins });

  useEffect(() => {
    const obj = tweenObj.current;
    gsap.killTweensOf(obj);
    gsap.to(obj, {
      value: coins,
      duration: 1.2,
      ease: 'power1.out',
      onUpdate() {
        if (coinDisplayRef.current) {
          coinDisplayRef.current.textContent = Math.round(obj.value).toLocaleString('pt-BR');
        }
      },
    });
  }, [coins]);

  return (
    <div className="hud-panel flex items-center gap-3 px-4 py-2 rounded-xl text-sm">
      <div className="flex flex-col items-end">
        <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">Moedas</span>
        <span
          ref={coinDisplayRef}
          className="zodiac-gold-text font-bold text-lg tabular-nums"
        >
          {coins.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="w-px h-8 bg-yellow-500/20" />

      <div className="flex flex-col items-start">
        <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">RTP</span>
        <span className="text-emerald-400 font-semibold text-sm">96.8%</span>
      </div>

      {lastWin > 0 && (
        <>
          <div className="w-px h-8 bg-yellow-500/20" />
          <div className="flex flex-col items-start">
            <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">Ganho</span>
            <span className="text-yellow-400 font-bold text-sm animate-pulse">
              +{lastWin.toLocaleString('pt-BR')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default HUD;
