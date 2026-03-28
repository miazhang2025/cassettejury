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
      className="h-20 md:h-24 flex items-center justify-center bg-transparent fixed bottom-3 md:bottom-5 left-0 right-0 w-full mb-4 md:mb-6"
      style={style}
    >
      <h1
        className="text-2xl sm:text-4xl md:text-8xl text-center"
        style={{
          color: isProcessing  ? '#e5e5e1' : '#9B0808',
          WebkitTextStroke: isProcessing ? 'clamp(2px, 1vw, 20px) #9B0808' : 'clamp(2px, 1vw, 20px) #E5E5E1',
          paintOrder: 'stroke fill',
        }}
      >
        {statusText}
      </h1>
    </div>
  );
};
