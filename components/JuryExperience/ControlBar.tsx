'use client';

import React from 'react';

interface StatusBarProps {
  isProcessing: boolean;
  showResults: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isProcessing,
  showResults,
}) => {
  let statusText = 'Jury Waiting';
  
  if (isProcessing) {
    statusText = 'Jury Deciding';
  } else if (showResults) {
    statusText = 'Jury Made Decision';
  }

  return (
    <div
      className="h-24 md:h-32 flex items-center justify-center mb-5"
      style={{ borderColor: '#E5E5E1' }}
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
