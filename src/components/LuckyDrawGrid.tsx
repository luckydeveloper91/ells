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
    spinButton?: string;
    buttonText: string;
    title: string;
  };
}

const LuckyDrawGrid: React.FC<LuckyDrawGridProps> = ({ 
  prizes, 
  onSpin, 
  settings,
}) => {
  const [isPulling, setIsPulling] = useState(false);
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

  console.log(settings)
  
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

  const handleDragSpin = async () => {
    if (isSpinning) return;
  
    if (settings.spinButton) {
      setIsPulling(true);
      setTimeout(() => setIsPulling(false), 400); // match animation duration
    }
  
    setShowCodeInput(true);
  };
  
  
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
    ? { backgroundImage: `url(${settings.backgroundInner})`, backgroundSize: 'contain' }
    : {};
  
  return (
    <div 
      className="p-4 max-w-4xl mx-auto min-h-[500px] rounded-xl"
      style={containerStyle}
    >
      <h2 className="text-center text-3xl font-bold mb-8 text-amber-700 drop-shadow-md">
        {settings.title}
      </h2>
      
      <div className="grid grid-cols-4 gap-3 relative max-w-3xl mx-auto bg-rose-900 p-4 rounded-xl">
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
                      ${settings.spinButton ? 'bg-none p-0 border-none' : ''}
                    `}
                    style={settings.spinButton ? { background: 'none' } : {}}
                  >
                    {isSpinning ? (
                      <RotateCw className="w-12 h-12 animate-spin" />
                    ) : settings.spinButton ? (
                      <img
                        src={settings.spinButton}
                        alt="Spin"
                        className={`w-full h-full object-contain transition-transform duration-300 ease-in-out ${isPulling ? 'animate-pull' : ''}`}
                      />

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
      
      {showCodeInput && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="relative bg-white/30 backdrop-blur-lg border border-amber-300 shadow-2xl rounded-3xl p-8 w-full max-w-md mx-4 animate-slideUp">
            {/* Decorative Glow Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white drop-shadow-sm tracking-wide">🎉 Enter Your Lucky Code</h3>
              <button
                onClick={() => {
                  setShowCodeInput(false);
                  setCode('');
                  setCodeError('');
                }}
                className="text-white hover:text-red-400 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError('');
                }}
                placeholder="ABC123"
                className={`w-full px-5 py-3 rounded-xl text-lg font-medium bg-white/80 text-gray-800 shadow-inner backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  codeError ? 'border border-red-400 focus:ring-red-400' : 'border border-amber-400 focus:ring-amber-500'
                }`}
              />
              {codeError && <p className="text-red-400 text-sm mt-2">{codeError}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCodeInput(false);
                  setCode('');
                  setCodeError('');
                }}
                className="px-4 py-2 rounded-xl bg-transparent border border-white text-white hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawWithCode}
                className="px-6 py-2 rounded-xl bg-amber-500 text-white font-semibold shadow-md hover:bg-amber-600 transition"
              >
                Try Your Luck
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

export default LuckyDrawGrid;