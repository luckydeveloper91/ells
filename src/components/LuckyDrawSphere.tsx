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
  const [prizes] = useState(() => generateSphereFromDBPrizes(dbPrizes.length > 0 ? dbPrizes : [
    { id: 1, name: "Prize 1", description: "First Prize", color: "#FF6B6B", image: null },
    { id: 2, name: "Prize 2", description: "Second Prize", color: "#4ECDC4", image: null },
    { id: 3, name: "Prize 3", description: "Third Prize", color: "#45B7D1", image: null },
    { id: 4, name: "Prize 4", description: "Fourth Prize", color: "#96CEB4", image: null },
    { id: 5, name: "Prize 5", description: "Fifth Prize", color: "#FFEAA7", image: null }
  ]));
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [winningIndex, setWinningIndex] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [sphereRotation, setSphereRotation] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef();
  const containerRef = useRef();

  // Detect mobile device and set responsive state
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           window.innerWidth < 768 ||
                           ('ontouchstart' in window);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized sphere size and settings
  const getSphereSettings = () => {
    if (isMobile) {
      return { 
        radius: 120, 
        containerSize: 280,
        prizeCount: 30, // Reduced for mobile performance
        cardWidth: 40,
        cardHeight: 40,
        starCount: 25 // Reduced stars for mobile
      };
    }
    return { 
      radius: 280, 
      containerSize: 500,
      prizeCount: 60,
      cardWidth: 64,
      cardHeight: 64,
      starCount: 200
    };
  };

  const sphereSettings = getSphereSettings();

  // Use only subset of prizes for mobile
  const activePrizes = isMobile ? prizes.slice(0, sphereSettings.prizeCount) : prizes;

  // Optimized sphere positions with better mobile distribution
  const getSpherePositions = () => {
    const positions = [];
    const count = activePrizes.length;
    
    // Use simpler grid distribution for mobile
    if (isMobile) {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Fibonacci constant

      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2; // range from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y); // radius of circle at y
        const theta = goldenAngle * i;
    
        const x = Math.cos(theta) * radiusAtY * sphereSettings.radius;
        const z = Math.sin(theta) * radiusAtY * sphereSettings.radius;
        const yPos = y * sphereSettings.radius;
    
        positions.push({ x, y: yPos, z });
      }
    } else {
      // Use Fibonacci spiral for desktop
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;
        
        const x = Math.cos(theta) * radiusAtY * sphereSettings.radius;
        const z = Math.sin(theta) * radiusAtY * sphereSettings.radius;
        const yPos = y * sphereSettings.radius;
        
        positions.push({ x, y: yPos, z });
      }
    }
    
    return positions;
  };

  const spherePositions = getSpherePositions();

  // Mobile-optimized animation with reduced frame rate
  useEffect(() => {
    if (!isSpinning) {
      let lastTime = 0;
      const targetFPS = isMobile ? 30 : 60; // Reduced FPS for mobile
      const interval = 1000 / targetFPS;
      
      const animate = (currentTime) => {
        if (currentTime - lastTime >= interval) {
          setSphereRotation(prev => ({
            x: prev.x + (isMobile ? 0.5 : 0.2),
            y: prev.y + (isMobile ? 0.8 : 0.3)
          }));
          lastTime = currentTime;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, isMobile]);

  // Reset spinning state when modal is shown
  useEffect(() => {
    if (showWinnerModal) {
      setIsSpinning(false);
    }
  }, [showWinnerModal]);

  // Mobile-optimized spinning animation
  const animateSpinning = useCallback((finalIndex, result) => {
    let currentIndex = 0;
    let speed = isMobile ? 60 : 40; // Slower for mobile
    let rounds = 0;
    let rotationSpeed = isMobile ? 4 : 8; // Reduced rotation for mobile
    
    const spin = () => {
      setHighlightedIndex(currentIndex);
      setSphereRotation(prev => ({
        x: prev.x + rotationSpeed,
        y: prev.y + rotationSpeed * 0.8
      }));
      
      currentIndex = (currentIndex + 1) % activePrizes.length;
      
      if (currentIndex === 0) rounds++;
      
      // Gradual speed adjustment
      if (rounds >= 2) {
        speed += isMobile ? 20 : 15;
        rotationSpeed *= 0.95;
      }
      
      // Final targeting phase
      if (rounds >= (isMobile ? 3 : 4) && speed > (isMobile ? 250 : 300)) {
        if (currentIndex === finalIndex) {
          setTimeout(() => {
            setHighlightedIndex(null);
            setWinningIndex(finalIndex);
            setIsSpinning(false);
          }, 1000);
          return;
        }
      }
      
      setTimeout(spin, speed);
    };
    
    spin();
  }, [activePrizes.length, isMobile]);

  const handleSpin = useCallback((e) => {
    if (isSpinning) return;
    
    // Prevent default touch behaviors
    e.preventDefault();
    e.stopPropagation();
    
    setShowCodeInput(true);
  }, [isSpinning]);

  const handleDrawWithCode = async () => {
    if (!code.trim()) {
      setCodeError('Please enter a code');
      return;
    }
    
    setCodeError('');
    setShowCodeInput(false);
    setIsSpinning(true);
    setWinningIndex(null);
    
    if (onSpin) {
      try {
        const result = await onSpin(code);
        console.log("API Result:", result);
        
        let sphereWinnerIndex = 0;
        
        if (result.isWinner && result.prizeId) {
          const originalPrizeIndex = dbPrizes.findIndex(prize => 
            prize.id === result.prizeId || prize.id === parseInt(result.prizeId)
          );
          
          if (originalPrizeIndex !== -1) {
            const foundIndex = activePrizes.findIndex(prize => {
              const originalId = prize.id.toString().split('-')[0];
              return originalId == (originalPrizeIndex + 1) || originalId == result.prizeId;
            });
            if (foundIndex !== -1) {
              sphereWinnerIndex = foundIndex;
            }
          }
        } else {
          sphereWinnerIndex = Math.floor(Math.random() * activePrizes.length);
        }
        
        animateSpinning(sphereWinnerIndex, result);
        
      } catch (error) {
        console.error('Error spinning:', error);
        setIsSpinning(false);
        setCodeError('Invalid code or error occurred');
        setShowCodeInput(true);
      }
    } else {
      // Simulate API call
      setTimeout(() => {
        const randomWinner = Math.floor(Math.random() * activePrizes.length);
        const mockResult = {
          isWinner: true,
          prizeName: activePrizes[randomWinner].name,
          prizeDescription: activePrizes[randomWinner].description,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Optimized Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(sphereSettings.starCount)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Simplified Nebula Effect for mobile */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-96 sm:h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-28 h-28 sm:w-80 sm:h-80 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-24 h-24 sm:w-72 sm:h-72 bg-gradient-radial from-pink-500/20 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10 flex flex-col justify-center min-h-screen">
        {/* Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 sm:mb-6 drop-shadow-lg">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Lucky Draw
          </span>
        </h1>
        
        {/* 3D Sphere Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="perspective-1000">
            <div 
              ref={containerRef}
              className="relative"
              style={{
                width: `${sphereSettings.containerSize}px`,
                height: `${sphereSettings.containerSize}px`,
                transformStyle: 'preserve-3d',
                transform: `rotateX(${sphereRotation.x}deg) rotateY(${sphereRotation.y}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              {/* Prize Items */}
              {activePrizes.map((prize, index) => {
                const position = spherePositions[index];
                const isHighlighted = highlightedIndex === index;
                const isWinner = winningIndex === index;
                
                // Simplified scaling for mobile
                const distance = Math.sqrt(position.x * position.x + position.y * position.y + (position.z + 400) * (position.z + 400));
                const scale = isMobile ? 
                  Math.max(0.4, Math.min(0.8, (600 / distance) * 0.7)) : 
                  Math.max(0.3, Math.min(1.0, (800 / distance) * 0.8));
                
                return (
                  <div
                    key={prize.id}
                    className={`absolute transition-all duration-300 ${
                      isHighlighted ? 'z-30' : 'z-10'
                    } ${isWinner ? 'animate-bounce' : ''}`}
                    style={{
                      width: `${sphereSettings.cardWidth}px`,
                      height: `${sphereSettings.cardHeight}px`,
                      transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) scale(${scale})`,
                      transformStyle: 'preserve-3d',
                      left: '50%',
                      top: '50%',
                      marginLeft: `-${sphereSettings.cardWidth/2}px`,
                      marginTop: `-${sphereSettings.cardHeight/2}px`,
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <div 
                      className={`w-full h-full rounded-lg shadow-lg border border-white/40 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden text-center transition-all duration-300 ${
                        isHighlighted ? 'border-yellow-400 shadow-yellow-400/80 scale-110' : ''
                      } ${isWinner ? 'border-green-400 shadow-green-400/80' : ''}`}
                      style={{
                        background: `linear-gradient(135deg, ${prize.color}CC, ${prize.color}FF)`,
                        boxShadow: isHighlighted 
                          ? `0 0 20px ${prize.color}AA` 
                          : `0 2px 8px rgba(0,0,0,0.4)`,
                        willChange: 'transform'
                      }}
                    >
                      {/* Prize Image */}
                      {prize.image ? (
                        <div className="h-4 sm:h-6 mb-1 relative">
                          <img 
                            src={prize.image} 
                            alt={prize.name}
                            className="h-full rounded-t-lg"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center text-xs">
                            🎁
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-4 sm:h-6 mb-1 flex items-center justify-center text-xs">
                          🎁
                        </div>
                      )}
                      
                      {/* Prize Text */}
                      <div className="flex-1 flex flex-col justify-center px-1">
                        <div className="text-white text-[6px] sm:text-[8px] font-bold leading-tight mb-0.5">{prize.name}</div>
                        <div className="text-white text-[5px] sm:text-[6px] opacity-90 leading-tight">{prize.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Mobile-optimized Spin Button */}
        <div className="text-center pb-4 sm:pb-8">
          <button
            onClick={handleSpin}
            onTouchStart={handleSpin}
            disabled={isSpinning}
            className={`
              w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 
              shadow-xl flex items-center justify-center text-white font-bold
              transform transition-all duration-300 border-2 border-white/30 mb-2 sm:mb-4
              ${isSpinning ? 'animate-spin opacity-70' : 'hover:scale-105 active:scale-95'} 
              touch-manipulation select-none
            `}
            style={{
              boxShadow: isSpinning 
                ? '0 0 30px rgba(168, 85, 247, 0.8)'
                : '0 0 15px rgba(168, 85, 247, 0.6)',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {isSpinning ? (
              <div className="flex flex-col items-center">
                <RotateCw className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 mb-1" />
                <span className="text-[6px] sm:text-[8px] md:text-xs">SPINNING</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-lg md:text-xl mb-1">🎲</span>
                <span className="text-[6px] sm:text-[8px] md:text-xs">START</span>
              </div>
            )}
          </button>
          
          <div className="text-center">
            <p className="text-white/90 text-xs sm:text-base font-medium">Click to Start Your Lucky Draw!</p>
            <p className="text-white/70 text-[10px] sm:text-sm mt-1">
              {dbPrizes.length || 5} unique prizes • {isMobile ? 'Mobile optimized' : 'Desktop version'}
            </p>
          </div>
        </div>
      </div>

      {/* Code Input Modal */}
      {showCodeInput && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4">
          <div className="relative bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-purple-300/50 shadow-2xl rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-xl font-bold text-white">🎯 Enter Lucky Code</h3>
              <button
                onClick={closeCodeInput}
                className="text-white hover:text-red-400 transition p-1 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="w-5 h-5" />
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
                placeholder="Enter your lucky code..."
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base font-medium bg-white/90 text-gray-800 shadow-inner focus:outline-none focus:ring-2 transition-all ${
                  codeError ? 'border-2 border-red-400 focus:ring-red-400' : 'border-2 border-purple-400 focus:ring-purple-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleDrawWithCode()}
              />
              {codeError && <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>{codeError}
              </p>}
            </div>

            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={closeCodeInput}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-transparent border border-white/50 text-white hover:bg-white/10 transition-all text-xs sm:text-sm touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDrawWithCode}
                disabled={!code.trim()}
                className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                🚀 Launch!
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
        .touch-manipulation {
          touch-action: manipulation;
        }
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default LuckyDrawSphere;
