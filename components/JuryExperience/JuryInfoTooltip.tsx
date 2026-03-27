'use client';

import React from 'react';
import { JuryVote } from '@/types/app';

interface JuryInfoTooltipProps {
  name: string;
  age: number;
  gender: string;
  profession: string;
  bio?: string;
  vote?: JuryVote;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const JuryInfoTooltip: React.FC<JuryInfoTooltipProps> = ({
  name,
  age,
  gender,
  profession,
  bio,
  vote,
  position,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Add extra vertical offset on mobile to prevent overlap with top UI
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const topOffset = isMobile ? position.y + 40 : position.y + 10;

  return (
    <div
      className="fixed z-40 rounded-lg border shadow-lg text-xs pointer-events-none"
      style={{
        left: `${position.x + 10}px`,
        top: `${topOffset}px`,
        backgroundColor: '#FFFFFF',
        borderColor: '#CCCCCC',
        borderWidth: '2px',
        padding: '8px 12px',
        maxWidth: '250px',
        color: '#1a1a1a',
      }}
    >
      <p className="font-bold" style={{ color: '#9B0808' }}>
        {name}
      </p>
      <p className="text-xs" style={{ color: '#4a4a4a' }}>
        {age} • {gender} • {profession}
      </p>

      {bio && (
        <p className="mt-1 text-xs" style={{ color: '#4a4a4a' }}>
          {bio}
        </p>
      )}

      {vote && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: '#CCCCCC' }}>
          <p style={{ color: '#9B0808' }}>
            <strong>Chose: {vote.stance}</strong>
          </p>
          <p className="mt-1 text-xs" style={{ color: '#1a1a1a' }}>
            {vote.reason}
          </p>
          {vote.quote && (
            <p className="mt-1 text-xs italic" style={{ color: '#4a4a4a' }}>
              "{vote.quote}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
