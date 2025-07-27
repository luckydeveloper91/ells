import React, { useEffect } from 'react';
import { Prize } from '../types';

interface LuckyDrawItemProps {
  prize: Prize;
  isHighlighted: boolean;
  isWinner: boolean;
}

const LuckyDrawItem: React.FC<LuckyDrawItemProps> = ({ prize, isHighlighted, isWinner }) => {
  useEffect(() => {
    if (isWinner) {
      // Could trigger additional win effects
    }
  }, [isWinner]);

  return (
    <div
      className={`
        aspect-square relative rounded-2xl overflow-hidden
        border-[3px] flex flex-col items-center justify-center p-3 text-center
        transition-all duration-500 transform
        ${isHighlighted ? 'scale-105 border-yellow-300 shadow-lg z-10' : 'border-white'}
        ${isWinner ? 'scale-110 border-yellow-400 shadow-xl animate-pulse' : ''}
        bg-black
      `}
    >
      {/* Galaxy background */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
        <div className="absolute w-full h-full animate-galaxy bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:30px_30px] opacity-40 blur-[1px]" />

        {/* Bright stars (blink-blink) */}
        <span className="absolute top-[20%] left-[30%] w-[3px] h-[3px] bg-white rounded-full animate-blink" />
        <span className="absolute top-[60%] left-[70%] w-[3px] h-[3px] bg-yellow-200 rounded-full animate-blink delay-200" />
        <span className="absolute top-[35%] left-[50%] w-[2px] h-[2px] bg-white rounded-full animate-blink delay-1000" />
        <span className="absolute top-[80%] left-[20%] w-[2px] h-[2px] bg-yellow-100 rounded-full animate-blink delay-500" />
      </div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-2xl z-0 pointer-events-none" />

      {/* Prize image */}
      {prize.image ? (
        <div className="w-full h-1/2 flex items-center justify-center mb-1 z-10">
          <img
            src={prize.image}
            alt={prize.name}
            className="max-h-full max-w-full object-contain animate-heartbeat"
          />
        </div>
      ) : (
        <div className="w-full h-1/2 bg-indigo-800 flex items-center justify-center mb-1 rounded z-10">
          <span className="text-white text-lg font-semibold">🎁</span>
        </div>
      )}

      {/* Prize info */}
      <h3 className="font-bold text-white text-sm md:text-base truncate w-full z-10">
        {prize.name}
      </h3>
      {prize.description && (
        <p className="text-indigo-100 text-xs truncate w-full mt-1 z-10">
          {prize.description}
        </p>
      )}

      {/* Highlight/winner overlays */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-yellow-200 opacity-10 animate-pulse rounded-2xl z-0"></div>
      )}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-200 to-amber-100 opacity-20 animate-pulse rounded-2xl z-0"></div>
      )}
    </div>


  );
};

export default LuckyDrawItem;