'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscussionResult } from '@/types/app';
import { getJuryById } from '@/config/juries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { shareNodeAsPng } from '@/utils/shareCard';
import { ShareCard } from './ShareCard';

interface ResultBoxProps {
  result: DiscussionResult | null;
  showResult: boolean;
  question?: string | null;
  onRetry?: () => void;
  onBackToSelection?: () => void;
  style?: React.CSSProperties;
}

const ActionButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="result-action-btn w-full px-4 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base"
  >
    {children}
  </button>
);

export const ResultBox: React.FC<ResultBoxProps> = ({
  result,
  showResult,
  question,
  onRetry,
  onBackToSelection,
  style,
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!showResult || !result) return null;

  const handleShareCard = async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      await shareNodeAsPng(shareCardRef.current, `cassette-jury-${Date.now()}.png`);
    } catch (error) {
      console.error('Share card failed:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyVerdict = async () => {
    const lines = [
      question ? `Q: ${question}` : null,
      `The jury has decided: ${result.summary}`,
      result.verdict_narrative ?? null,
      ...Object.entries(result.votes || {}).map(([option, count]) => `${option}: ${count}`),
      '— Cassette Jury',
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleBack = () => {
    if (onBackToSelection) onBackToSelection();
    else router.push('/');
  };

  const containerClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 overflow-y-auto flex flex-col shadow-lg'
    : 'fixed right-0 top-0 h-screen w-80 overflow-y-auto flex flex-col shadow-lg';

  const containerStyle: React.CSSProperties = {
    backgroundImage: 'url(/sidebar.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: result.error ? 50 : 40,
    pointerEvents: 'auto',
    animation: isMobile
      ? 'slideInFromBottom 0.5s ease-out forwards'
      : 'slideInFromRight 0.5s ease-out forwards',
    ...(result.error
      ? {}
      : isMobile
        ? { borderTop: '2px solid #CCCCCC', height: '45vh' }
        : { borderLeft: '2px solid #CCCCCC', height: '100vh' }),
    ...style,
  };

  const bodyClass = isMobile ? 'pt-8 pb-8 px-14 space-y-6 flex-1' : 'p-10 space-y-6 flex-1';
  const footerClass = isMobile ? 'pt-6 pb-6 px-14 space-y-3 border-t' : 'p-10 space-y-3 border-t';

  // Error state
  if (result.error) {
    return (
      <div className={containerClass} style={containerStyle} role="alert">
        <div className={bodyClass}>
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

        <div className={footerClass} style={{ borderColor: '#CCCCCC' }}>
          <ActionButton onClick={onRetry}>Ask Again</ActionButton>
          <ActionButton onClick={handleBack}>Back</ActionButton>
        </div>
      </div>
    );
  }

  // Vote percentages
  const totalVotes = Object.values(result.votes || {}).reduce((sum, val) => sum + val, 0);
  const votePercentages = Object.entries(result.votes || {}).map(([option, count]) => ({
    option,
    count,
    percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
  }));

  return (
    <div className={containerClass} style={containerStyle} aria-label="Jury verdict">
      <div className={bodyClass}>
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
        <div className="pt-2">
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

        {/* Full deliberation — every juror's take, readable without hovering */}
        {result.discussion && result.discussion.length > 0 && (
          <div className="pt-2">
            <p className="text-xs sm:text-sm font-medium mb-3" style={{ color: '#4a4a4a' }}>
              The deliberation:
            </p>
            <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {result.discussion.map((vote) => {
                const jury = vote.id ? getJuryById(vote.id) : undefined;
                const accent = jury?.color ?? '#9B0808';
                return (
                  <li key={vote.id ?? vote.name} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>
                    <p className="text-xs" style={{ color: '#1a1a1a', margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>{vote.name}</span>
                      <span
                        className="ml-2 px-1 py-0.5 rounded text-[10px] uppercase tracking-wide"
                        style={{ backgroundColor: accent, color: '#FFFFFF' }}
                      >
                        {vote.stance}
                      </span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#1a1a1a', fontStyle: 'italic' }}>
                      “{vote.quote}”
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#4a4a4a', lineHeight: 1.5 }}>
                      {vote.reason}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Button Footer */}
      <div className={footerClass} style={{ borderColor: '#CCCCCC' }}>
        <ActionButton onClick={onRetry}>Ask Again</ActionButton>
        <ActionButton onClick={handleShareCard} disabled={sharing}>
          {sharing ? 'Rendering…' : 'Save Verdict Card'}
        </ActionButton>
        <ActionButton onClick={handleCopyVerdict}>{copied ? 'Copied!' : 'Copy Verdict'}</ActionButton>
        <ActionButton onClick={handleBack}>Back</ActionButton>
      </div>

      {/* Off-screen share card rendered to PNG on demand */}
      <ShareCard ref={shareCardRef} result={result} question={question} />
    </div>
  );
};
