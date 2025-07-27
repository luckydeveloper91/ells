import React, { useEffect } from 'react';
import { Prize } from '../types';

interface LuckyDrawItemProps {
  prize: Prize;
  isHighlighted: boolean;
  isWinner: boolean;
}

const LuckyDrawItem_Old: React.FC<LuckyDrawItemProps> = ({ prize, isHighlighted, isWinner }) => {
  useEffect(() => {
    if (isWinner) {
      // Could trigger additional win effects
    }
  }, [isWinner]);

  return (
    <div 
      className={`
        aspect-square relative rounded-xl overflow-hidden
        border-2 flex flex-col items-center justify-center p-2 text-center
        transition-all duration-300 transform
        ${isHighlighted ? 'scale-105 border-amber-400 shadow-amber-300 shadow-lg z-10' : 'border-white'}
        ${isWinner ? 'scale-110 border-amber-500 shadow-amber-400 shadow-xl animate-pulse' : ''}
        bg-white
      `}
    >
      {prize.image ? (
        <div className="w-full h-1/2 flex items-center justify-center mb-1">
          <img 
            src={prize.image} 
            alt={prize.name}
            className="max-h-full max-w-full object-contain animate-heartbeat"
          />
        </div>
      ) : (
        <div className="w-full h-1/2 bg-amber-100 flex items-center justify-center mb-1 rounded">
          <span className="text-amber-800 text-lg font-semibold">🎁</span>
        </div>
      )}
      
      <h3 className="font-bold text-amber-800 text-sm md:text-base truncate w-full">
        {prize.name}
      </h3>
      
      {prize.description && (
        <p className="text-amber-600 text-xs truncate w-full mt-1">
          {prize.description}
        </p>
      )}
      
      {/* Visual effects for highlighted/winning state */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-amber-400 opacity-20 animate-pulse"></div>
      )}
      
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 opacity-30 animate-pulse"></div>
      )}
    </div>
  );
};

export default LuckyDrawItem_Old;