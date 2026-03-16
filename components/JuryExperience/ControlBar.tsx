'use client';

import React from 'react';
import { DiscussionResult } from '@/types/app';

interface StatusBarProps {
  isProcessing: boolean;
  showResults: boolean;
  discussionResult?: DiscussionResult | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isProcessing,
  showResults,
  discussionResult,
}) => {
  let statusText = 'Cassette Jury';
  
  if (isProcessing || showResults) {
    statusText = 'Jury Deciding';
  } else if (discussionResult) {
    statusText = 'Jury Made Decision';
  }

  return (
    <div
      className="h-24 md:h-20 flex items-center justify-center bg-transparent fixed bottom-5 left-0 right-0 w-full mb-6"
    >
      <h1
        className="text-4xl md:text-8xl text-center"
        style={{
          color: '#9B0808',
          WebkitTextStroke: '20px #E5E5E1',
          paintOrder: 'stroke fill',
        }}
      >
        {statusText}
      </h1>
    </div>
  );
};
