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
          minWidth: '220px',
          maxWidth: '300px',
          marginBottom: '10px',
        }}
      >
        {/* Header - Name */}
        <h3
          className=" text-lg"
          style={{
            fontFamily: "'Blaka', serif",
            color: juryMember.color,
            fontSize: '18px',
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
            <p style={{ lineHeight: '1.3', marginTop: '4px' }}>
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
                <p style={{ lineHeight: '1.3', marginTop: '4px' }}>
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
