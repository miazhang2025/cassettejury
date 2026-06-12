'use client';

import { useEffect, useState } from 'react';

const matches = () =>
  window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0);

// Shared mobile detection that stays in sync on resize / orientation change.
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && matches()
  );

  useEffect(() => {
    const onResize = () => setIsMobile(matches());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
