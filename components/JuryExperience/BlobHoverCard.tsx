'use client';

import React from 'react';
import { JuryMember } from '@/config/juries';
import { DiscussionResult } from '@/types/app';

interface BlobHoverCardProps {
  juryMember: JuryMember | null;
  position: { x: number; y: number } | null;
  showResults?: boolean;
  discussionResult?: DiscussionResult | null;
}

export const BlobHoverCard: React.FC<BlobHoverCardProps> = ({
  juryMember,
  position,
  showResults = false,
  discussionResult = null,
}) => {
  if (!juryMember || !position) return null;

  // Find this jury member's decision in the discussion results
  const juryVote = discussionResult?.discussion?.find(
    (vote) => vote.name.toLowerCase() === juryMember.name.toLowerCase()
  );

  // Calculate viewport-aware positioning to prevent offscreen tooltips
  const cardWidth = Math.min(350, window.innerWidth - 40);
  const cardHeight = 280;
  let adjustedX = position.x;
  let adjustedY = position.y;

  // Prevent horizontal overflow
  if (position.x + cardWidth / 2 > window.innerWidth - 20) {
    adjustedX = window.innerWidth - cardWidth / 2 - 20;
  }
  if (position.x - cardWidth / 2 < 20) {
    adjustedX = cardWidth / 2 + 20;
  }

  // Prevent vertical overflow
  if (position.y - cardHeight < 20) {
    adjustedY = cardHeight + 40; // Add extra vertical offset for mobile
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        zIndex: 100,
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="rounded-lg p-2 sm:p-3"
        style={{
          backgroundImage: 'url(/blobcard.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minWidth: '300px',
          maxWidth: 'min(350px, 90vw)',
          marginBottom: '10px',
          paddingLeft: '50px',
          paddingRight: '20px',
          paddingBottom: '20px',
          paddingTop: '20px',
        }}
      >
        {/* Header - Name */}
        <h3
          className="text-base sm:text-lg"
          style={{
            fontFamily: "'Blaka', serif",
            color: juryMember.color,
            fontSize: 'clamp(14px, 4vw, 18px)',
          }}
        >
          {juryMember.name}
        </h3>

        <div className="space-y-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#333333' }}>
          {/* Age */}
          <p>
            <span style={{ fontWeight: 600 }}>Age:</span> {juryMember.age}
          </p>

          {/* Profession */}
          <p>
            <span style={{ fontWeight: 600 }}>Role:</span> {juryMember.profession}
          </p>

          {/* Waiting state: Bio */}
          {!showResults && (
            <p style={{ lineHeight: '1.3', marginTop: '4px', fontSize: '10px' }}>
              <span style={{ fontStyle: 'italic' }}>{juryMember.bio}</span>
            </p>
          )}

          {/* Results state: Decision and Reason */}
          {showResults && juryVote && (
            <>
              <div
                style={{
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: `1px solid ${juryMember.color}40`,
                }}
              >
                <p>
                  <span style={{ fontWeight: 600 }}>Vote:</span>{' '}
                  <span
                    style={{
                      color: juryMember.color,
                      fontWeight: 600,
                    }}
                  >
                    {juryVote.stance}
                  </span>
                </p>
                <p style={{ lineHeight: '1.3', marginTop: '4px', fontSize: '9px' }}>
                  <span style={{ fontWeight: 600 }}>Reason:</span> {juryVote.reason}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
