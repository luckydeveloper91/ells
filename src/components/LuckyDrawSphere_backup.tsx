import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCw, X } from 'lucide-react';

// Function to duplicate prizes to create a full sphere
const generateSphereFromDBPrizes = (dbPrizes) => {
  const targetCount = 60; // Number needed for proper sphere
  const duplicatedPrizes = [];
  
  for (let i = 0; i < targetCount; i++) {
    const originalPrize = dbPrizes[i % dbPrizes.length];
    duplicatedPrizes.push({
      ...originalPrize,
      id: `${originalPrize.id}-${Math.floor(i / dbPrizes.length)}`, // Unique ID for duplicates
      duplicateIndex: Math.floor(i / dbPrizes.length) // Track which duplicate this is
    });
  }
  
  return duplicatedPrizes;
};

const LuckyDrawSphere = ({ 
  prizes: dbPrizes = [], 
  onSpin, 
  settings = {},
  showWinnerModal = false,
  onCloseWinnerModal,
  drawResult = null
}) => {
  const [prizes] = useState(() => generateSphereFromDBPrizes(dbPrizes));
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [winningIndex, setWinningIndex] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [sphereRotation, setSphereRotation] = useState({ x: 0, y: 0 });
  const animationRef = useRef();

  // Calculate sphere positions for better distribution
  const getSpherePositions = () => {
    const positions = [];
    const radius = 280;
    const count = prizes.length;
    
    // Use Fibonacci spiral for even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // Range from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radiusAtY * radius;
      const z = Math.sin(theta) * radiusAtY * radius;
      const yPos = y * radius;
      
      positions.push({ x, y: yPos, z });
    }
    
    return positions;
  };

  const spherePositions = getSpherePositions();

  // Auto-rotation effect
  useEffect(() => {
    if (!isSpinning) {
      const animate = () => {
        setSphereRotation(prev => ({
          x: prev.x + 0.3,
          y: prev.y + 0.5
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning]);

  // Reset spinning state when modal is shown
  useEffect(() => {
    if (showWinnerModal) {
      setIsSpinning(false);
    }
  }, [showWinnerModal]);

  const animateSpinning = useCallback((finalIndex, result) => {
    let currentIndex = 0;
    let speed = 30;
    let rounds = 0;
    let rotationSpeed = 15;
    
    const spin = () => {
      setHighlightedIndex(currentIndex);
      setSphereRotation(prev => ({
        x: prev.x + rotationSpeed,
        y: prev.y + rotationSpeed * 1.3
      }));
      
      currentIndex = (currentIndex + 1) % prizes.length;
      
      if (currentIndex === 0) rounds++;
      
      if (rounds >= 3) {
        speed += 25;
        rotationSpeed *= 0.92;
      }
      
      if (rounds >= 6 && speed > 400) {
        if (currentIndex === finalIndex) {
          clearTimeout(spinTimeout);
          setTimeout(() => {
            setHighlightedIndex(null);
            setWinningIndex(finalIndex);
            // The parent component will handle showing the modal
            setIsSpinning(false);
          }, 1500);
          return;
        }
      }
      
      const spinTimeout = setTimeout(spin, speed);
    };
    
    spin();
  }, [prizes.length]);

  const handleSpin = () => {
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
    
    // Use the onSpin prop if provided
    if (onSpin) {
      try {
        const result = await onSpin(code);
        console.log("API Result:", result);
        
        // Find the winning prize index from the original DB prizes
        let sphereWinnerIndex = 0; // Default fallback
        
        if (result.isWinner && result.prizeId) {
          // Try to find matching prize by ID
          const originalPrizeIndex = dbPrizes.findIndex(prize => 
            prize.id === result.prizeId || prize.id === parseInt(result.prizeId)
          );
          
          if (originalPrizeIndex !== -1) {
            // Find a duplicate of this prize in our sphere
            const foundIndex = prizes.findIndex(prize => {
              const originalId = prize.id.toString().split('-')[0];
              return originalId == (originalPrizeIndex + 1) || originalId == result.prizeId;
            });
            if (foundIndex !== -1) {
              sphereWinnerIndex = foundIndex;
            }
          }
        } else {
          // If not a winner or no specific prize, show a random position
          sphereWinnerIndex = Math.floor(Math.random() * prizes.length);
        }
        
        animateSpinning(sphereWinnerIndex, result);
        
      } catch (error) {
        console.error('Error spinning:', error);
        setIsSpinning(false);
        setCodeError('Invalid code or error occurred');
        setShowCodeInput(true);
      }
    } else {
      // Simulate API call for demo
      setTimeout(() => {
        const randomWinner = Math.floor(Math.random() * prizes.length);
        const mockResult = {
          isWinner: true,
          prizeName: prizes[randomWinner].name,
          prizeDescription: prizes[randomWinner].description,
          message: "Congratulations! You've won a prize!",
          code: code
        };
        animateSpinning(randomWinner, mockResult);
      }, 500);
    }
  };

  const closeCodeInput = () => {
    setShowCodeInput(false);
    setCode('');
    setCodeError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
      </div>

      {/* Nebula Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-radial from-pink-500/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10 flex flex-col justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-center text-white mb-6 drop-shadow-lg">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            3D Lucky Draw Sphere
          </span>
        </h1>
        
        {/* 3D Sphere Container - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="perspective-1000">
            <div 
              className="relative w-[500px] h-[500px] transform-gpu transition-transform duration-75"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${sphereRotation.x}deg) rotateY(${sphereRotation.y}deg)`
              }}
            >
              {/* Prize Items */}
              {prizes.map((prize, index) => {
                const position = spherePositions[index];
                const isHighlighted = highlightedIndex === index;
                const isWinner = winningIndex === index;
                
                // Calculate distance from camera for size scaling
                const distance = Math.sqrt(position.x * position.x + position.y * position.y + (position.z + 400) * (position.z + 400));
                const scale = Math.max(0.4, Math.min(1.2, 800 / distance));
                
                // Get original prize info (remove duplicate suffix from name if exists)
                const displayName = prize.name;
                const displayDescription = prize.description;
                const prizeImage = prize.image; // Get the image URL from database
                
                return (
                  <div
                    key={prize.id}
                    className={`absolute w-16 h-16 transform-gpu transition-all duration-200 ${
                      isHighlighted ? 'z-30' : 'z-10'
                    } ${isWinner ? 'animate-bounce' : ''}`}
                    style={{
                      transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateY(${-sphereRotation.y}deg) rotateX(${-sphereRotation.x}deg) scale(${scale})`,
                      transformStyle: 'preserve-3d',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-32px',
                      marginTop: '-32px'
                    }}
                  >
                    <div 
                      className={`w-full h-full rounded-xl shadow-2xl border border-white/40 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden text-center transition-all duration-300 ${
                        isHighlighted ? 'border-yellow-400 shadow-yellow-400/80 scale-150' : ''
                      } ${isWinner ? 'border-green-400 shadow-green-400/80' : ''}`}
                      style={{
                        background: `linear-gradient(135deg, ${prize.color}CC, ${prize.color}FF)`,
                        boxShadow: isHighlighted 
                          ? `0 0 40px ${prize.color}AA, 0 0 20px ${prize.color}CC` 
                          : `0 4px 15px rgba(0,0,0,0.4)`
                      }}
                    >
                      {/* Prize Image */}
                      {prizeImage ? (
                        <div className="h-8 mb-1 relative">
                          <img 
                            src={prizeImage} 
                            alt={displayName}
                            className="h-full rounded-t-lg"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback emoji if image fails */}
                          <div className="hidden w-full h-full items-center justify-center text-lg">
                            🎁
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-8 mb-1 flex items-center justify-center text-lg">
                          🎁
                        </div>
                      )}
                      
                      {/* Prize Text */}
                      <div className="flex-1 flex flex-col justify-center px-1">
                        <div className="text-white text-[6px] font-bold leading-tight mb-0.5">{displayName}</div>
                        <div className="text-white text-[5px] opacity-90 leading-tight">{displayDescription}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Spin Button at Bottom */}
        <div className="text-center pb-8">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              w-28 h-28 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 
              shadow-2xl flex items-center justify-center text-white font-bold text-lg
              transform transition-all duration-300 border-4 border-white/30 mb-4
              ${isSpinning ? 'animate-spin opacity-70' : 'hover:scale-110 hover:shadow-purple-400/50 hover:border-white/50'} 
            `}
            style={{
              boxShadow: isSpinning 
                ? '0 0 50px rgba(168, 85, 247, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3)'
                : '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
            }}
          >
            {isSpinning ? (
              <div className="flex flex-col items-center">
                <RotateCw className="w-8 h-8 mb-1" />
                <span className="text-xs">SPINNING</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xl mb-1">🎲</span>
                <span className="text-xs">START DRAW</span>
              </div>
            )}
          </button>
          
          <div className="text-center">
            <p className="text-white/90 text-base font-medium">Click to Start Your Lucky Draw!</p>
            <p className="text-white/70 text-sm mt-1">
              {dbPrizes.length} unique prizes • Distributed across {prizes.length} positions
            </p>
          </div>
        </div>
      </div>

      {/* Code Input Modal */}
      {showCodeInput && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="relative bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-xl border border-purple-300/50 shadow-2xl rounded-3xl p-8 w-full max-w-md mx-4">
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white drop-shadow-sm">🎯 Enter Lucky Code</h3>
              <button
                onClick={closeCodeInput}
                className="text-white hover:text-red-400 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError('');
                }}
                placeholder="Enter your lucky code..."
                className={`w-full px-5 py-4 rounded-xl text-lg font-medium bg-white/90 text-gray-800 shadow-inner backdrop-blur-sm focus:outline-none focus:ring-2 transition-all ${
                  codeError ? 'border-2 border-red-400 focus:ring-red-400' : 'border-2 border-purple-400 focus:ring-purple-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleDrawWithCode()}
              />
              {codeError && <p className="text-red-400 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>{codeError}
              </p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeCodeInput}
                className="px-6 py-3 rounded-xl bg-transparent border-2 border-white/50 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawWithCode}
                disabled={!code.trim()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Launch Draw!
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LuckyDrawSphere;