import React, { useEffect } from 'react';
import { DrawResult } from '../types';
import Confetti from 'react-confetti';
import { X } from 'lucide-react';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DrawResult;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, onClose, result }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {result.isWinner && <Confetti recycle={false} numberOfPieces={300} />}
      
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-fade-in">
        {/* Header */}
        <div className={`p-4 ${result.isWinner ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-xl ${result.isWinner ? 'text-white' : 'text-gray-800'}`}>
              {result.isWinner ? '🎉 Congratulations! 🎉' : 'Better luck next time!'}
            </h3>
            <button 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className={`w-6 h-6 ${result.isWinner ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {result.isWinner ? (
            <div className="text-center">
              <div className="mb-4">
                {result.prizeImage ? (
                  <img 
                    src={result.prizeImage} 
                    alt={result.prizeName} 
                    className="max-h-40 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-amber-100 flex items-center justify-center rounded-full mb-4">
                    <span className="text-4xl">🎁</span>
                  </div>
                )}
              </div>
              
              <h4 className="text-2xl font-bold text-amber-700 mb-2">{result.prizeName}</h4>
              <p className="text-gray-600 mb-4">{result.message}</p>
              
              {result.code && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Your prize code:</p>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-lg tracking-wider">
                    {result.code}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gray-100 flex items-center justify-center rounded-full mb-4">
                <span className="text-2xl">😢</span>
              </div>
              <p className="text-gray-600">{result.message}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 text-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-full font-medium ${
              result.isWinner 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;