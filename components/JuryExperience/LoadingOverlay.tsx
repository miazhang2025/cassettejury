'use client';

import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'The jury is debating...',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
        zIndex: 40,
      }}
    >
      <div className="text-center">
        {/* Spinner */}
        <div className="mb-4 flex justify-center">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              borderWidth: '4px',
              borderStyle: 'solid',
              borderColor: 'rgba(155, 8, 8, 0.2)',
              borderTopColor: '#9B0808',
            }}
          />
        </div>

        {/* Message */}
        <p className="text-white text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
