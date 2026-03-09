import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateGrid, evaluateWins } from '@/lib/slotMath';
import Reel from '@/components/Reel';
import { Volume2, VolumeX } from 'lucide-react';

const BET_OPTIONS = [1, 5, 10, 50, 100];

const ZodiacGame = () => {
  const {
    coins,
    betAmount,
    isSpinning,
    grid,
    lastWin,
    winningCells,
    setBetAmount,
    spin,
    setGrid,
    addWin,
    setSpinning,
  } = useGameStore();

  const [muted, setMuted] = useState(true);
  const [showWinBanner, setShowWinBanner] = useState(false);

  const handleSpin = useCallback(() => {
    if (isSpinning || coins < betAmount) return;

    spin();

    // After delay, resolve the spin
    setTimeout(() => {
      const newGrid = generateGrid();
      setGrid(newGrid);

      // Evaluate after a short delay for animation
      setTimeout(() => {
        const result = evaluateWins(newGrid);
        if (result.totalMultiplier > 0) {
          const winAmount = betAmount * result.totalMultiplier;
          addWin(winAmount, result.winningCells);
        }
        setSpinning(false);
      }, 800);
    }, 600);
  }, [isSpinning, coins, betAmount, spin, setGrid, addWin, setSpinning]);

  useEffect(() => {
    if (lastWin > 0) {
      setShowWinBanner(true);
      const t = setTimeout(() => setShowWinBanner(false), 2500);
      return () => clearTimeout(t);
    }
  }, [lastWin]);

  const handleMax = () => {
    const max = Math.min(coins, 100);
    setBetAmount(max);
  };

  return (
    <div className="zodiac-bg min-h-screen flex flex-col items-center justify-between py-4 px-2 relative overflow-hidden select-none">
      {/* Stars */}
      <div className="stars-container" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex w-full max-w-md items-center justify-between px-2 z-10">
        <button
          onClick={() => setMuted(!muted)}
          className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
        >
          {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>

        {/* HUD */}
        <div className="hud-panel flex items-center gap-3 px-4 py-2 rounded-xl text-sm">
          <div className="flex flex-col items-end">
            <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">Moedas</span>
            <span className="zodiac-gold-text font-bold text-lg tabular-nums">
              {coins.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-8 bg-yellow-500/20" />
          <div className="flex flex-col items-start">
            <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">RTP</span>
            <span className="text-emerald-400 font-semibold text-sm">96.8%</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="z-10 mt-2">
        <h1 className="zodiac-title text-3xl sm:text-4xl font-bold tracking-wide text-center">
          ZODIAC FORTUNE
        </h1>
        <p className="text-yellow-500/40 text-center text-xs tracking-[0.3em] mt-1">EPIC SLOTS</p>
      </div>

      {/* Win banner */}
      {showWinBanner && (
        <div className="win-banner z-20">
          <span className="zodiac-gold-text text-2xl font-bold">
            🎉 +{lastWin.toLocaleString()} MOEDAS!
          </span>
        </div>
      )}

      {/* Slot Grid */}
      <div className="slot-frame z-10 p-3 sm:p-4 rounded-2xl mt-4">
        <div className="flex gap-1 sm:gap-2">
          {[0, 1, 2].map((colIndex) => (
            <Reel
              key={colIndex}
              symbols={[grid[0][colIndex], grid[1][colIndex], grid[2][colIndex]]}
              colIndex={colIndex}
              isSpinning={isSpinning}
              winningCells={winningCells}
            />
          ))}
        </div>
      </div>

      {/* Bet Selector */}
      <div className="z-10 flex flex-col items-center gap-3 mt-4 w-full max-w-md px-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400/50 text-xs uppercase tracking-wider">Aposta</span>
          <div className="flex gap-2">
            {BET_OPTIONS.map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                disabled={isSpinning}
                className={`
                  bet-btn w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-bold
                  transition-all duration-200
                  ${betAmount === amt ? 'bet-btn-active' : 'bet-btn-inactive'}
                  disabled:opacity-40
                `}
              >
                {amt}
              </button>
            ))}
            <button
              onClick={handleMax}
              disabled={isSpinning}
              className={`
                bet-btn px-3 h-10 sm:h-12 rounded-full text-xs font-bold uppercase tracking-wider
                transition-all duration-200 bet-btn-inactive
                disabled:opacity-40
              `}
            >
              Max
            </button>
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || coins < betAmount}
          className="spin-btn w-full py-4 rounded-2xl text-lg font-black uppercase tracking-wider
            transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-95"
        >
          {isSpinning ? '⏳ GIRANDO...' : `🐉 SPIN — ${betAmount} moedas`}
        </button>
      </div>

      {/* Footer */}
      <p className="text-yellow-500/20 text-[10px] z-10 mt-2">
        Jogo de simulação • Sem valor monetário real
      </p>
    </div>
  );
};

export default ZodiacGame;
