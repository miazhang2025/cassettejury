'use client';

import React, { useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';

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
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateApiKey = (key: string): boolean => {
    return key.startsWith(APP_CONSTANTS.API_KEY_PREFIX) && key.length > 20;
  };

  const handleSubmit = () => {
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
    isValid && selectedCount === APP_CONSTANTS.SELECTED_JURIES_COUNT && !isLoading;

  return (
    <div
      className="px-6 md:px-12 py-4 md:py-6 flex flex-col gap-2 items-center justify-center"
      style={{ borderColor: '#CCCCCC', minHeight: '10vh' }}
      suppressHydrationWarning
    >


      <div className="w-full flex flex-row gap-3 items-center justify-center">
              <label className="block text-xs font-medium" style={{ color: '#1a1a1a' }}>
        Anthropic Claude API Key
      </label>
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
