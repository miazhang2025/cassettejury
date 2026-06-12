'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  /**
   * Real loading progress, 0–1. When provided, the bar tracks actual asset
   * loading and the screen completes when progress reaches 1 (with a short
   * minimum display so it never flashes). When omitted, falls back to a
   * fixed-duration splash.
   */
  progress?: number;
  duration?: number;
}

const MIN_DISPLAY_MS = 600;
const FADE_MS = 500;
// Safety net: never trap the user behind the loader if an asset stalls.
const MAX_WAIT_MS = 12000;

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, progress, duration = 2200 }) => {
  const driven = progress !== undefined;
  const [timerProgress, setTimerProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const mountedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (mountedAtRef.current === null) {
      mountedAtRef.current = Date.now();
    }
  }, []);

  // Fallback timer mode (no real progress available)
  useEffect(() => {
    if (driven) return;

    const steps = 60;
    const intervalMs = (duration - FADE_MS) / steps;

    const interval = setInterval(() => {
      setTimerProgress((prev) => Math.min(prev + 100 / steps, 100));
    }, intervalMs);

    const fadeTimer = setTimeout(() => setFading(true), duration - FADE_MS);
    const completeTimer = setTimeout(() => onCompleteRef.current(), duration);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, driven]);

  // Real-progress mode: complete when assets are in (or the safety net fires)
  useEffect(() => {
    if (!driven || finishedRef.current) return;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setFading(true);
      setTimeout(() => onCompleteRef.current(), FADE_MS);
    };

    if (progress! >= 1) {
      const elapsed = Date.now() - (mountedAtRef.current ?? Date.now());
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const t = setTimeout(finish, wait);
      return () => clearTimeout(t);
    }

    const safetyNet = setTimeout(finish, MAX_WAIT_MS);
    return () => clearTimeout(safetyNet);
  }, [driven, progress]);

  const barPercent = driven ? Math.round(Math.min(progress!, 1) * 100) : timerProgress;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      role="status"
      aria-label={`Loading, ${Math.round(barPercent)} percent`}
      style={{
        backgroundColor: '#9B0808',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
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
              width: `${barPercent}%`,
              backgroundColor: '#E5E5E1',
              transition: 'width 0.2s ease-out',
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
