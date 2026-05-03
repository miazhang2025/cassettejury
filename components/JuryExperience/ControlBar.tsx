'use client';

import React from 'react';
import { DiscussionResult } from '@/types/app';

interface StatusBarProps {
  isProcessing: boolean;
  showResults: boolean;
  discussionResult?: DiscussionResult | null;
  style?: React.CSSProperties;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isProcessing,
  showResults,
  discussionResult,
  style,
}) => {
  let statusText = 'Cassette Jury';
  
  if (showResults && discussionResult) {
    statusText = 'Jury Made Decision';
  } else if (isProcessing || showResults) {
    statusText = 'Jury Deciding';
  }

  return (
    <div
      className="h-20 md:h-24 flex items-center justify-center bg-transparent fixed bottom-7 md:bottom-5 left-0 right-0 w-full mb-4 md:mb-6"
      style={style}
    >
      {/* Double-layer text: stroke span behind, fill span on top.
           Replaces `paint-order: stroke fill` which Safari does not support on HTML elements. */}
      <h1 className="text-6xl sm:text-2xl md:text-8xl text-center" style={{ position: 'relative' }}>
        {/* Stroke layer (behind) */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            fontFamily: "'Blaka', cursive",
            WebkitTextStroke: isProcessing ? 'clamp(2px, 1vw, 20px) #9B0808' : 'clamp(2px, 1vw, 20px) #E5E5E1',
            color: 'transparent',
          }}
        >
          {statusText}
        </span>
        {/* Fill layer (on top) */}
        <span style={{ color: isProcessing ? '#e5e5e1' : '#9B0808', position: 'relative', fontFamily: "'Blaka', cursive" }}>
          {statusText}
        </span>
      </h1>
    </div>
  );
};
