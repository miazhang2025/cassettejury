'use client';

import React from 'react';
import { JuryMember } from '@/config/juries';

interface BlobHoverCardProps {
  juryMember: JuryMember | null;
  position: { x: number; y: number } | null;
}

export const BlobHoverCard: React.FC<BlobHoverCardProps> = ({ juryMember, position }) => {
  if (!juryMember || !position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 100,
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="rounded-lg shadow-xl backdrop-blur-sm p-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderLeft: `4px solid ${juryMember.color}`,
          minWidth: '200px',
          maxWidth: '280px',
          marginBottom: '10px',
        }}
      >
        <h3
          className="font-bold text-sm mb-1"
          style={{
            fontFamily: "'Blaka', serif",
            color: juryMember.color,
            fontSize: '14px',
          }}
        >
          {juryMember.name}
        </h3>

        <div className="space-y-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#333333' }}>
          <p>
            <span style={{ fontWeight: 600 }}>Role:</span> {juryMember.profession}
          </p>
          <p>
            <span style={{ fontWeight: 600 }}>Age:</span> {juryMember.age}
          </p>
          <p style={{ lineHeight: '1.3' }}>
            {juryMember.bio}
          </p>
        </div>
      </div>
    </div>
  );
};
