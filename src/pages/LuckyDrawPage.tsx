import React, { useState, useEffect } from 'react';
import LuckyDrawGrid from '../components/LuckyDrawGrid_Old';
import LuckyDrawSphere from '../components/LuckyDrawSphere';
import WinnerModal from '../components/WinnerModal'; // Your existing WinnerModal
import { Prize, Settings, DrawResult } from '../types';
import { useSettings, usePrizes, performLuckyDraw, verifyPrizeCode } from '../services/apiService';
import { toast } from 'react-toastify';
import { Search, Volume2, VolumeX, X } from 'lucide-react';

const LuckyDrawPage: React.FC = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { prizes, loading: prizesLoading, fetchPrizes } = usePrizes();
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<DrawResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audio] = useState(new Audio());
  
  // Winner modal states
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  
  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  useEffect(() => {
    if (settings.backgroundMusic) {
      audio.src = settings.backgroundMusic;
      audio.loop = true;
    }
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [settings.backgroundMusic, audio]);

  const toggleMute = () => {
    if (isMuted) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast.error('Unable to play background music');
      });
    } else {
      audio.pause();
    }
    setIsMuted(!isMuted);
  };
  
  const handleSpin = async (code?: string): Promise<DrawResult> => {
    try {
      const result = await performLuckyDraw(code);
      
      // Set the result and show the winner modal
      setDrawResult(result);

      setTimeout(() => {
        setShowWinnerModal(true);
      }, 10000);
      
      return result;
    } catch (error) {
      console.error('Error spinning the wheel:', error);
      toast.error('Something went wrong. Please try again.');
      throw error;
    }
  };
  
  const handleCloseWinnerModal = () => {
    setShowWinnerModal(false);
    setDrawResult(null);
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a code');
      return;
    }
    
    setVerifying(true);
    try {
      const result = await verifyPrizeCode(verificationCode);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Invalid or unused code');
      setVerificationResult(null);
    } finally {
      setVerifying(false);
    }
  };

  const closeCodeVerification = () => {
    setShowCodeVerification(false);
    setVerificationCode('');
    setVerificationResult(null);
  };
  
  if (prizesLoading || settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        <p className="mt-4 text-amber-800 text-center">Loading lucky draw...</p>
      </div>
    );
  }
  
  if (prizes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-amber-700">No Prizes Available</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">There are no active prizes in the lucky draw system.</p>
          <p className="text-sm text-gray-500">Please check back later or contact an administrator.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Music Control - Responsive */}
      {settings.backgroundMusic && (
        <button
          onClick={toggleMute}
          className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 sm:p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
          title={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          ) : (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          )}
        </button>
      )}

      <div className="min-h-screen">
        <LuckyDrawSphere 
          prizes={prizes} 
          onSpin={handleSpin}
          settings={settings}
          showWinnerModal={showWinnerModal}
          onCloseWinnerModal={handleCloseWinnerModal}
          drawResult={drawResult}
        />
      </div>
      
      {/* Winner Modal - Your existing component */}
      {drawResult && (
        <WinnerModal
          isOpen={showWinnerModal}
          onClose={handleCloseWinnerModal}
          result={drawResult}
        />
      )}
      
      {/* Code Verification Modal - Mobile Responsive */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity z-50 p-4 ${showCodeVerification ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full animate-fade-in">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">🔍 Verify Prize Code</h3>
            <button
              onClick={closeCodeVerification}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Input section - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter your prize code"
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base font-medium"
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
              />
              <button
                onClick={handleVerifyCode}
                disabled={verifying || !verificationCode.trim()}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium whitespace-nowrap"
              >
                {verifying ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  '🔍 Verify'
                )}
              </button>
            </div>
            
            {/* Results section - Responsive */}
            {verificationResult && (
              <div className={`p-3 sm:p-4 rounded-lg transition-all ${
                verificationResult.isWinner 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className={`font-bold mb-2 text-sm sm:text-base ${
                  verificationResult.isWinner ? 'text-green-700' : 'text-red-700'
                }`}>
                  {verificationResult.isWinner ? '🎉 Valid Prize Code!' : '❌ Invalid Code'}
                </h4>
                
                {verificationResult.isWinner && (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium">Prize:</span> {verificationResult.prizeName}
                    </p>
                    
                    {verificationResult.prizeImage && (
                      <div className="flex justify-center">
                        <img 
                          src={verificationResult.prizeImage} 
                          alt={verificationResult.prizeName}
                          className="w-20 h-20 sm:w-32 sm:h-32 object-contain rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    
                    {verificationResult.prizeDescription && (
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Description:</span> {verificationResult.prizeDescription}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 p-2 sm:p-3 bg-white/50 rounded border-l-4 border-gray-300">
                  {verificationResult.message}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer buttons - Responsive */}
          <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
            <button
              onClick={closeCodeVerification}
              className="px-4 py-2 sm:px-6 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base font-medium"
            >
              Close
            </button>
            {verificationResult && (
              <button
                onClick={() => {
                  setVerificationCode('');
                  setVerificationResult(null);
                }}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Code Verification Button - Mobile Responsive */}
      {settings.searchButton && (
        <button
          onClick={() => setShowCodeVerification(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transform hover:scale-105 transition-transform"
          title="Verify Prize Code"
        >
          <img
            src={settings.searchButton}
            alt="Verify Code"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 hover:opacity-80 transition-opacity animate-heartbeat rounded-full shadow-lg"
          />
        </button>
      )}
      
      {/* Fallback Search Button if no image */}
      {!settings.searchButton && (
        <button
          onClick={() => setShowCodeVerification(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-3 sm:p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all transform hover:scale-105"
          title="Verify Prize Code"
        >
          <Search className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LuckyDrawPage;
