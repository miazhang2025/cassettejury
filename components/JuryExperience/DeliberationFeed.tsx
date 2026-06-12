'use client';

import React from 'react';
import { JuryVote } from '@/types/app';
import { getJuryById } from '@/config/juries';
import { juryThumb } from '@/utils/assets';
import { useIsMobile } from '@/hooks/useIsMobile';

interface DeliberationFeedProps {
  votes: JuryVote[];
  visible: boolean;
}

// Live transcript of the deliberation: each juror's take appears the moment
// it streams in, while the blobs are still brawling behind it.
export const DeliberationFeed: React.FC<DeliberationFeedProps> = ({ votes, visible }) => {
  const isMobile = useIsMobile();

  if (!visible || votes.length === 0) return null;

  const recent = votes.slice(isMobile ? -2 : -3);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Jury deliberation"
      className="absolute flex flex-col gap-2"
      style={
        isMobile
          ? // Clear the fixed "Cassette Jury" wordmark at the bottom of the
            // viewport (h-20 + bottom-7 + mb-4 ≈ 124px)
            { left: 8, right: 8, bottom: 148, zIndex: 25, pointerEvents: 'none' }
          : { left: 16, bottom: 16, width: 360, zIndex: 25, pointerEvents: 'none' }
      }
    >
      {recent.map((vote) => {
        const jury = vote.id ? getJuryById(vote.id) : undefined;
        const accent = jury?.color ?? '#9B0808';
        return (
          <div
            key={vote.id ?? vote.name}
            className="feed-bubble flex gap-3 items-start rounded-lg"
            style={{
              backgroundImage: 'url(/blobcard.webp)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              // Generous padding (especially vertical) keeps text inside the
              // card art's usable area; extra left clears the spine.
              padding: '28px 26px 30px 52px',
              minHeight: '96px',
            }}
          >
            {jury && (
              <img
                src={juryThumb(jury.id)}
                alt=""
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
                style={{ backgroundColor: '#E5E5E1', border: `2px solid ${accent}` }}
              />
            )}
            <div className="min-w-0">
              <p className="text-xs">
                <span style={{ fontFamily: "'Blaka', serif", color: accent, fontSize: '14px' }}>
                  {vote.name}
                </span>
                <span
                  className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide"
                  style={{ backgroundColor: accent, color: '#FFFFFF' }}
                >
                  {vote.stance}
                </span>
              </p>
              <p className="text-xs mt-1" style={{ color: '#333333', lineHeight: 1.4, fontStyle: 'italic' }}>
                “{vote.quote}”
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
