import React, { useState, useEffect, useCallback } from 'react';
import { Prize, DrawResult } from '../types';
import LuckyDrawItem from './LuckyDrawItem';
import { RotateCw, X } from 'lucide-react';
import WinnerModal from './WinnerModal';
import useSound from 'use-sound';

interface LuckyDrawGridProps {
  prizes: Prize[];
  onSpin: (code?: string) => Promise<DrawResult>; 
  settings: {
    backgroundImage?: string;
    backgroundMusic?: string;
    backgroundInner?: string;
    buttonText: string;
    title: string;
  };
}

const LuckyDrawGrid_Old: React.FC<LuckyDrawGridProps> = ({ 
  prizes, 
  onSpin, 
  settings,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  
  // Sound effects
  const [playSpinSound] = useSound(settings.backgroundMusic || '/sounds/spin.mp3', { volume: 0.5 });
  const [playWinSound] = useSound('/sounds/win.mp3', { volume: 0.7 });
  
  // Grid arrangement - create a 4x4 grid with center button
  const gridOrder = [
    0, 1, 2, 3,
    11, 'button', 'button', 4,
    10, 'button', 'button', 5,
    9, 8, 7, 6
  ];

  console.log(settings);
  
  // Animate through positions function
  const animateSpinning = useCallback((finalIndex: number) => {
    const validPositions = gridOrder.filter(pos => typeof pos === 'number') as number[];
    let currentIndex = 0;
    let speed = 80; // Start fast
    let rounds = 0;
    
    playSpinSound();
    
    const spin = () => {
      setHighlightedIndex(validPositions[currentIndex]);
      currentIndex = (currentIndex + 1) % validPositions.length;
      
      if (currentIndex === 0) rounds++;
      
      if (rounds >= 2) {
        speed += 15;
      }
      
      if (rounds >= 3 && speed > 200) {
        if (Math.abs(validPositions[currentIndex] - finalIndex) < 3) {
          speed += 50;
          
          if (validPositions[currentIndex] === finalIndex) {
            clearTimeout(spinTimeout);
            setTimeout(() => {
              setHighlightedIndex(null);
              setWinningIndex(finalIndex);
              playWinSound();
              setShowModal(true);
              setIsSpinning(false);
            }, 500);
            return;
          }
        }
      }
      
      spinTimeout = setTimeout(spin, speed);
    };
    
    let spinTimeout = setTimeout(spin, speed);
  }, [playSpinSound, playWinSound]);
  
  const handleSpin = async () => {
    if (isSpinning) return;
    setShowCodeInput(true);
  };
  
  const handleDrawWithCode = async () => {
    if (!code.trim()) {
      setCodeError('Please enter a code');
      return;
    }
    
    setCodeError('');
    setShowCodeInput(false);
    setIsSpinning(true);
    setWinningIndex(null);
    
    try {
      const result = await onSpin(code);
      setDrawResult(result);
      
      const winningPrizeIndex = prizes.findIndex(prize => prize.id === result.prizeId);
      if (winningPrizeIndex !== -1) {
        animateSpinning(winningPrizeIndex);
      } else {
        setIsSpinning(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error spinning the wheel:', error);
      setIsSpinning(false);
      setCodeError('Invalid code or error occurred');
      setShowCodeInput(true);
    }
  };
  
  const containerStyle = settings.backgroundInner 
    ? { backgroundImage: `url(${settings.backgroundInner})`, backgroundSize: 'cover' }
    : {};
  
  return (
    <div 
      className="p-4 max-w-4xl mx-auto min-h-[500px] rounded-xl"
      style={containerStyle}
    >
      <h2 className="text-center text-3xl font-bold mb-8 text-amber-700 drop-shadow-md">
        {settings.title}
      </h2>
      
      <div className="grid grid-cols-4 gap-3 relative max-w-3xl mx-auto bg-indigo-900 p-4 rounded-xl">
        {gridOrder.map((position, index) => {
          if (position === 'button') {
            if (index === 5) {
              return (
                <div key="center-button" className="col-span-2 row-span-2 flex items-center justify-center">
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className={`
                      w-full h-full aspect-square bg-gradient-to-r from-red-600 to-amber-500 
                      rounded-xl shadow-lg flex items-center justify-center text-white font-bold 
                      text-2xl transform transition-all duration-300 border-4 border-white
                      ${isSpinning ? 'opacity-70' : 'hover:scale-105 hover:shadow-xl hover:from-red-500 hover:to-amber-400'} 
                    `}
                  >
                    {isSpinning ? (
                      <RotateCw className="w-12 h-12 animate-spin" />
                    ) : (
                      <span className="drop-shadow-md">{settings.buttonText || '立即抽奖'}</span>
                    )}
                  </button>
                </div>
              );
            }
            return null;
          }
          
          const prize = prizes[position];
          return prize ? (
            <LuckyDrawItem 
              key={prize.id}
              prize={prize}
              isHighlighted={highlightedIndex === position}
              isWinner={winningIndex === position}
            />
          ) : null;
        })}
      </div>
      
      {/* Code Input Modal */}
      {showCodeInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Enter Lucky Code</h3>
              <button
                onClick={() => {
                  setShowCodeInput(false);
                  setCode('');
                  setCodeError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError('');
                }}
                placeholder="Enter your lucky code"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  codeError ? 'border-red-400' : 'border-amber-400'
                }`}
              />
              {codeError && (
                <p className="text-red-500 text-sm mt-1">{codeError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCodeInput(false);
                  setCode('');
                  setCodeError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawWithCode}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Draw
              </button>
            </div>
          </div>
        </div>
      )}
      
      {drawResult && (
        <WinnerModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setCode('');
          }}
          result={drawResult}
        />
      )}
    </div>
  );
};

export default LuckyDrawGrid_Old;