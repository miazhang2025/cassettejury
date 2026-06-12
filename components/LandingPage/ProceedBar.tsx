'use client';

import React, { useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { playSound } from '@/utils/audio';
import { AUDIO_FILES, VOLUME_DEFAULTS } from '@/config/sounds';
import { useApp } from '@/context/AppContext';

interface ProceedBarProps {
  onProceed: () => void;
  selectedCount: number;
}

// The hosted server key handles Claude access, so there's nothing to type —
// just pick your jurors and go. (A custom API key can still be set from the
// in-experience settings menu.)
export const ProceedBar: React.FC<ProceedBarProps> = ({ onProceed, selectedCount }) => {
  const { settings } = useApp();
  const targetCount = APP_CONSTANTS.SELECTED_JURIES_COUNT;
  const [isLoading, setIsLoading] = useState(false);

  const canProceed = selectedCount === targetCount && !isLoading;

  const handleSubmit = () => {
    if (!canProceed) return;
    if (settings.soundEnabled) {
      playSound(AUDIO_FILES.SFX.click, { volume: VOLUME_DEFAULTS.SFX });
    }
    setIsLoading(true);
    onProceed();
  };

  return (
    <div
      className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-6 flex flex-col gap-2 items-center justify-center"
      style={{ borderColor: '#CCCCCC', minHeight: '10vh' }}
    >
      <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center">
        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="px-8 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md whitespace-nowrap"
          style={{
            backgroundColor: canProceed ? '#9B0808' : '#CCCCCC',
            color: '#FFFFFF',
          }}
        >
          {isLoading ? 'Summoning…' : 'Summon the Jury'}
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: '#4a4a4a' }}>
        {selectedCount}/{targetCount} jurors selected
      </p>
    </div>
  );
};
