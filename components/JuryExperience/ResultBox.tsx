'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DiscussionResult } from '@/types/app';

interface ResultBoxProps {
  result: DiscussionResult | null;
  showResult: boolean;
  onRetry?: () => void;
  onBackToSelection?: () => void;
}

const slideInStyle: React.CSSProperties = {
  animation: 'slideInFromRight 0.5s ease-out forwards',
};

export const ResultBox: React.FC<ResultBoxProps> = ({
  result,
  showResult,
  onRetry,
  onBackToSelection,
}) => {
  const router = useRouter();
  if (!showResult || !result) return null;

  // Add keyframes style to document
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle error results
  if (result.error) {
    return (
      <div
        className="fixed inset-0 md:inset-auto md:right-0 h-screen w-full md:w-80 overflow-y-auto flex flex-col shadow-lg"
        style={{
          backgroundImage: 'url(/sidebar.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderLeft: '2px solid #ffb3b3',
          zIndex: 30,
          pointerEvents: 'auto',
          ...slideInStyle,
          top: 'auto',
        }}
      >
        <div className="p-6 sm:p-10 space-y-4 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#9B0808' }}>
            Error
          </h2>
          <p className="text-sm sm:text-base" style={{ color: '#c00000' }}>
            {result.error}
          </p>
          {result.details && (
            <details className="text-xs sm:text-sm" style={{ color: '#666666' }}>
              <summary>Details</summary>
              <pre style={{ overflow: 'auto', marginTop: '8px', fontSize: '11px' }}>{result.details}</pre>
            </details>
          )}
        </div>

        {/* Button Footer */}
        <div className="p-6 sm:p-10 space-y-3 border-t" style={{ borderColor: '#CCCCCC' }}>
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base transition-colors"
            style={{
              backgroundColor: '#9B0808',
              color: '#E5E5E1',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#7A0606';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#9B0808';
            }}
          >
            Ask Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base transition-colors"
            style={{
              backgroundColor: '#9B0808',
              color: '#E5E5E1',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#7A0606';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#9B0808';
            }}
          >
            Back
          </button>
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
      className="fixed inset-0 md:inset-auto md:right-0 md:top-0 h-screen w-full md:w-80 overflow-y-auto flex flex-col shadow-lg"
      style={{
        backgroundImage: 'url(/sidebar.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderLeft: '2px solid #CCCCCC',
        zIndex: 30,
        pointerEvents: 'auto',
        ...slideInStyle,
      }}
    >
      <div className="p-6 sm:p-10 space-y-6 flex-1">
        {/* Summary */}
        <div>
          <p className="text-xs sm:text-sm" style={{ color: '#4a4a4a' }}>
            The jury has decided:
          </p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#9B0808' }}>
            {result.summary}
          </p>
        </div>

        {/* Verdict narrative */}
        {result.verdict_narrative && (
          <p className="text-sm sm:text-base" style={{ color: '#1a1a1a', lineHeight: '1.6' }}>
            {result.verdict_narrative}
          </p>
        )}

        {/* Vote breakdown */}
        <div className=" pt-4" >
          <p className="text-xs sm:text-sm font-medium mb-3" style={{ color: '#4a4a4a' }}>
            Jury breakdown:
          </p>
          <div className="space-y-2">
            {votePercentages.map(({ option, percentage, count }) => (
              <div key={option} className="text-xs sm:text-sm flex justify-between items-center">
                <span style={{ color: '#1a1a1a' }}>{option}</span>
                <span style={{ color: '#9B0808', fontWeight: 600 }}>
                  {percentage}% ({count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover hint */}
        <p className="text-xs sm:text-sm text-center" style={{ color: '#8a8a8a' }}>
          👆 Hover over blobs to see individual jury member verdicts
        </p>
      </div>

      {/* Button Footer */}
      <div className="p-6 sm:p-10 space-y-3 border-t" style={{ borderColor: '#CCCCCC' }}>
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base transition-colors"
          style={{
            backgroundColor: '#9B0808',
            color: '#E5E5E1',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#7A0606';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#9B0808';
          }}
        >
          Ask Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base transition-colors"
          style={{
            backgroundColor: '#9B0808',
            color: '#E5E5E1',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#7A0606';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#9B0808';
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};
