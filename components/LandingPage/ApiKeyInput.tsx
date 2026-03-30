'use client';

import React, { useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { playSound } from '@/utils/audio';
import { AUDIO_FILES, VOLUME_DEFAULTS } from '@/config/sounds';
import { useApp } from '@/context/AppContext';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isValid: boolean;
  selectedCount: number;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySubmit,
  isValid,
  selectedCount,
}) => {
  const { settings, apiKey: contextApiKey } = useApp();
  // TEMPORARY: when server env key is active, treat as pre-filled
  const usingEnvKey = contextApiKey === '__env__';
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateApiKey = (key: string): boolean => {
    return key.startsWith(APP_CONSTANTS.API_KEY_PREFIX) && key.length > 20;
  };

  const handleSubmit = () => {
    // TEMPORARY: skip all validation when using the server env key
    if (usingEnvKey) {
      if (selectedCount !== APP_CONSTANTS.SELECTED_JURIES_COUNT) {
        setError(`Please select exactly ${APP_CONSTANTS.SELECTED_JURIES_COUNT} jurors`);
        return;
      }
      if (settings.soundEnabled) {
        playSound(AUDIO_FILES.SFX.click, { volume: VOLUME_DEFAULTS.SFX });
      }
      setError('');
      setIsLoading(true);
      onApiKeySubmit('__env__');
      return;
    }
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setError('Invalid API key format. Should start with sk-ant-');
      return;
    }

    if (selectedCount !== APP_CONSTANTS.SELECTED_JURIES_COUNT) {
      setError(`Please select exactly ${APP_CONSTANTS.SELECTED_JURIES_COUNT} jurors`);
      return;
    }

    // Play click sound
    if (settings.soundEnabled) {
      playSound(AUDIO_FILES.SFX.click, {
        volume: VOLUME_DEFAULTS.SFX,
      });
    }

    setError('');
    setIsLoading(true);
    onApiKeySubmit(apiKey);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && selectedCount === APP_CONSTANTS.SELECTED_JURIES_COUNT) {
      handleSubmit();
    }
  };

  const canProceed =
    (usingEnvKey || isValid) && selectedCount === APP_CONSTANTS.SELECTED_JURIES_COUNT && !isLoading;

  return (
    <div
      className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-6 flex flex-col gap-2 items-center justify-center"
      style={{ borderColor: '#CCCCCC', minHeight: '10vh' }}
      suppressHydrationWarning
    >


      <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center">
              <div className="flex items-center gap-2">
        <label className="block text-xs sm:text-sm font-medium whitespace-nowrap" style={{ color: '#1a1a1a' }}>
          API Key
        </label>
        <div className="relative group cursor-help">
          <span 
            className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#9B0808', color: '#FFFFFF' }}
          >
            ?
          </span>
          <div 
            className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-3 py-2 z-50"
            style={{ maxWidth: '250px', whiteSpace: 'normal' }}
          >
            Visit <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">claude.ai</a> → Account → API Keys to create and copy your key. Or send an email to miazhang2025@gmail.com saying something nice and mia will give you a key to play :)
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgb(31, 41, 55)',
              }}
            ></div>
          </div>
        </div>
      </div>
        {usingEnvKey ? (
          // TEMPORARY: show locked indicator when server env key is active
          <div
            className="max-w-sm px-3 py-2 border rounded-md text-sm flex items-center gap-2"
            style={{ borderColor: '#CCCCCC', backgroundColor: '#F5F5F2', color: '#4a4a4a' }}
          >
            <span>&#128274;</span>
            <span>Hosted key in use, choose character directly</span>
          </div>
        ) : (
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="Paste your API key (starts with sk-ant-)"
            className="max-w-sm px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: error ? '#E63946' : '#CCCCCC',
              backgroundColor: '#FFFFFF',
              color: '#1a1a1a',
              '--tw-ring-color': '#9B0808',
            } as React.CSSProperties}
            disabled={isLoading}
            suppressHydrationWarning
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="px-8 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md whitespace-nowrap"
          style={{
            backgroundColor: canProceed ? '#9B0808' : '#CCCCCC',
            color: '#FFFFFF',
          }}
          suppressHydrationWarning
        >
          {isLoading ? 'Loading...' : 'Summon the Jury'}
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: '#E63946' }}>
          {error}
        </p>
      )}

      <div className="flex flex-row gap-4 items-center justify-center">
        <p className="text-xs" style={{ color: '#4a4a4a' }}>
          Keys stored in session only and cleared when you close the browser.
        </p>

        <div className="text-xs text-center" style={{ color: '#4a4a4a' }}>
          {selectedCount}/{APP_CONSTANTS.SELECTED_JURIES_COUNT} jurors selected
        </div>
      </div>
    </div>
  );
};
