'use client';

import React from 'react';
import { DiscussionResult } from '@/types/app';

interface ResultBoxProps {
  result: DiscussionResult | null;
  showResult: boolean;
}

export const ResultBox: React.FC<ResultBoxProps> = ({ result, showResult }) => {
  if (!showResult || !result) return null;

  // Handle error results
  if (result.error) {
    return (
      <div
        className="fixed left-1/2 transform -translate-x-1/2 w-11/12 md:w-full max-w-2xl rounded-lg border-2 shadow-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ffb3b3',
          top: 'calc(60px + 1.5rem)',
          zIndex: 30,
          pointerEvents: 'auto',
        }}
      >
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#9B0808' }}>
            Error
          </h2>
          <p className="text-sm mb-4" style={{ color: '#c00000' }}>
            {result.error}
          </p>
          {result.details && (
            <details className="text-xs" style={{ color: '#666666' }}>
              <summary>Details</summary>
              <pre style={{ overflow: 'auto', marginTop: '8px' }}>{result.details}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Calculate vote percentages
  const totalVotes = Object.values(result.votes || {}).reduce((sum, val) => sum + val, 0);
  const votePercentages = Object.entries(result.votes || {}).map(([option, count]) => ({
    option,
    count,
    percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
  }));

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 w-11/12 md:w-full max-w-2xl rounded-lg border-2 shadow-lg"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#CCCCCC',
        top: 'calc(60px + 1.5rem)',
        zIndex: 30,
        pointerEvents: 'auto',
      }}
    >
      <div className="p-4 md:p-6">
        {/* Summary */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: '#4a4a4a' }}>
            The jury has decided:
          </p>
          <p className="text-lg md:text-xl font-bold" style={{ color: '#9B0808' }}>
            {result.summary}
          </p>
        </div>

        {/* Verdict narrative */}
        {result.verdict_narrative && (
          <p className="text-sm mb-4" style={{ color: '#1a1a1a' }}>
            {result.verdict_narrative}
          </p>
        )}

        {/* Vote breakdown */}
        <div className="border-t pt-3 pb-3" style={{ borderColor: '#CCCCCC' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#4a4a4a' }}>
            Jury breakdown:
          </p>
          <div className="flex flex-wrap gap-4">
            {votePercentages.map(({ option, percentage, count }) => (
              <div key={option} className="text-xs">
                <span style={{ color: '#1a1a1a' }}>
                  {percentage}% ({count}) chose {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover hint */}
        <p className="text-xs text-center mt-3" style={{ color: '#8a8a8a' }}>
          Hover over blobs to see individual jury member verdicts →
        </p>
      </div>
    </div>
  );
};
