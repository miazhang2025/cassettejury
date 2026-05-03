'use client';

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, duration = 2200 }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const steps = 60;
    const intervalMs = (duration - 500) / steps;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 100 / steps;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#9B0808',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <h1
        className="text-6xl md:text-8xl mb-10 tracking-widest text-center px-6"
        style={{ color: '#E5E5E1' }}
      >
        Cassette Jury
      </h1>

      {/* Tape spool progress bar */}
      <div className="w-64 md:w-96 flex flex-col items-center gap-3">
        <div
          className="w-full h-px"
          style={{ backgroundColor: 'rgba(229, 229, 225, 0.25)' }}
        >
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              backgroundColor: '#E5E5E1',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <span
          className="text-xs tracking-widest"
          style={{ color: 'rgba(229, 229, 225, 0.5)' }}
        >
          LOADING
        </span>
      </div>
    </div>
  );
};
