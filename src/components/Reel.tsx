import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { Symbol } from '@/store/useGameStore';

interface ReelProps {
  symbols: Symbol[];
  colIndex: number;
  isSpinning: boolean;
  winningCells: [number, number][];
  onAnimationComplete?: () => void;
}

const Reel = ({ symbols, colIndex, isSpinning, winningCells, onAnimationComplete }: ReelProps) => {
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isSpinning) return;

    const els = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    
    gsap.fromTo(
      els,
      { y: -200, filter: 'blur(8px)', opacity: 0 },
      {
        y: 0,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(1.4)',
        delay: colIndex * 0.25,
        onComplete: () => {
          if (colIndex === 2 && onAnimationComplete) {
            onAnimationComplete();
          }
        },
      }
    );
  }, [isSpinning, symbols, colIndex, onAnimationComplete]);

  // Bounce winning cells
  useEffect(() => {
    if (winningCells.length === 0) return;

    winningCells.forEach(([row, col]) => {
      if (col === colIndex && cellRefs.current[row]) {
        gsap.fromTo(
          cellRefs.current[row],
          { scale: 1 },
          {
            scale: 1.25,
            duration: 0.3,
            yoyo: true,
            repeat: 3,
            ease: 'power2.inOut',
          }
        );
      }
    });
  }, [winningCells, colIndex]);

  return (
    <div className="flex flex-col gap-1">
      {symbols.map((symbol, rowIndex) => {
        const isWinning = winningCells.some(
          ([r, c]) => r === rowIndex && c === colIndex
        );
        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            ref={(el) => { cellRefs.current[rowIndex] = el; }}
            className={`
              slot-cell flex items-center justify-center text-5xl sm:text-6xl
              w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]
              rounded-lg select-none
              ${isWinning ? 'slot-cell-winning' : ''}
            `}
          >
            <span className="drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]">
              {symbol}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Reel;
