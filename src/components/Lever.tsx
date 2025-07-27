import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import './lever.css'; // Create this for animation

interface LeverProps {
  isSpinning: boolean;
  onPull: () => void;
}

const Lever: React.FC<LeverProps> = ({ isSpinning, onPull }) => {
  const [isPulled, setIsPulled] = useState(false);

  const handleClick = () => {
    if (isSpinning || isPulled) return;
    setIsPulled(true);

    // Simulate lever pull down and bounce up
    setTimeout(() => {
      setIsPulled(false);
      onPull();
    }, 600); // duration of animation
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`lever-base ${isPulled ? 'lever-pull' : ''}`}
        onClick={handleClick}
      >
        {isSpinning ? (
          <RotateCw className="w-10 h-10 text-white animate-spin" />
        ) : (
          <div className="lever-stick" />
        )}
      </div>
    </div>
  );
};

export default Lever;
