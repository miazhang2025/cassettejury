'use client';

import React, { forwardRef } from 'react';
import { DiscussionResult } from '@/types/app';
import { getJuryById } from '@/config/juries';
import { juryThumb } from '@/utils/assets';

interface ShareCardProps {
  result: DiscussionResult;
  question?: string | null;
}

// Off-screen 1080px card rendered to PNG by shareNodeAsPng.
// Deliberately uses only inline styles + embedded fonts so the rasterised
// output matches what's on screen.
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ result, question }, ref) => {
  const votes = Object.entries(result.votes || {});
  const totalVotes = votes.reduce((sum, [, count]) => sum + count, 0);
  const quotes = (result.discussion || []).slice(0, 3);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-10000px',
        top: 0,
        width: '1080px',
        backgroundColor: '#E5E5E1',
        color: '#1a1a1a',
        padding: '72px 80px',
        fontFamily: "'IBM Plex Mono', monospace",
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        borderTop: '24px solid #9B0808',
      }}
    >
      <p style={{ fontFamily: "'Blaka', cursive", fontSize: '44px', color: '#9B0808', margin: 0 }}>
        Cassette Jury
      </p>

      {question && (
        <p style={{ fontSize: '30px', lineHeight: 1.5, color: '#4a4a4a', margin: 0 }}>
          “{question}”
        </p>
      )}

      <div>
        <p style={{ fontSize: '24px', color: '#4a4a4a', margin: 0 }}>The jury has decided:</p>
        <p
          style={{
            fontFamily: "'Blaka', cursive",
            fontSize: '96px',
            color: '#9B0808',
            margin: '8px 0 0',
            lineHeight: 1.05,
          }}
        >
          {result.summary}
        </p>
        {result.verdict_narrative && (
          <p style={{ fontSize: '28px', lineHeight: 1.5, margin: '20px 0 0' }}>
            {result.verdict_narrative}
          </p>
        )}
      </div>

      {/* Vote bar */}
      {totalVotes > 0 && (
        <div>
          <div style={{ display: 'flex', height: '28px', borderRadius: '6px', overflow: 'hidden' }}>
            {votes.map(([option, count], i) => (
              <div
                key={option}
                style={{
                  width: `${(count / totalVotes) * 100}%`,
                  backgroundColor: i === 0 ? '#9B0808' : i === 1 ? '#1a1a1a' : '#8a8a8a',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            {votes.map(([option, count]) => (
              <span key={option} style={{ fontSize: '22px', fontWeight: 600 }}>
                {option} — {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Juror quotes with portraits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {quotes.map((vote) => {
          const jury = vote.id ? getJuryById(vote.id) : undefined;
          const accent = jury?.color ?? '#9B0808';
          return (
            <div
              key={vote.id ?? vote.name}
              style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
            >
              {jury && (
                <img
                  src={juryThumb(jury.id)}
                  alt=""
                  width={88}
                  height={88}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: `5px solid ${accent}`,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              )}
              <div style={{ borderLeft: `8px solid ${accent}`, paddingLeft: '20px' }}>
                <p style={{ fontSize: '24px', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                  “{vote.quote}”
                </p>
                <p style={{ fontSize: '20px', color: '#4a4a4a', margin: '6px 0 0' }}>
                  — {vote.name}, voted {vote.stance}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: the full panel + tagline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          borderTop: '2px solid rgba(155, 8, 8, 0.15)',
          paddingTop: '32px',
        }}
      >
        <div style={{ display: 'flex' }}>
          {(result.discussion || []).map((vote, i) => {
            const jury = vote.id ? getJuryById(vote.id) : undefined;
            if (!jury) return null;
            return (
              <img
                key={jury.id}
                src={juryThumb(jury.id)}
                alt=""
                width={56}
                height={56}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${jury.color}`,
                  backgroundColor: '#FFFFFF',
                  marginLeft: i === 0 ? 0 : '-14px',
                }}
              />
            );
          })}
        </div>
        <p style={{ fontSize: '20px', color: '#8a8a8a', margin: 0, textAlign: 'right' }}>
          An AI jury for creative deadlocks
        </p>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
