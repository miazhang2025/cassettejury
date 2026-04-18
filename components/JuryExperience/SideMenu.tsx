'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, style }) => {
  const { apiKey, setApiKey, settings, updateSettings } = useApp();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [newKey, setNewKey] = useState('');

  const maskedKey = apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-10)}` : '';

  const handleUpdateKey = () => {
    if (newKey.trim()) {
      setApiKey(newKey);
      setNewKey('');
      setShowKeyInput(false);
    }
  };

  const handleClearKey = () => {
    setApiKey(null);
    setShowKeyInput(false);
    window.location.href = '/';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed left-0 top-0 h-screen w-full sm:w-64 md:w-72 bg-white shadow-lg z-50 overflow-y-auto flex flex-col transition-transform"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transitionDuration: '300ms',
          backgroundColor: '#E5E5E1',
          borderRight: '2px solid #CCCCCC',
          ...style,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#CCCCCC' }}>
          <h1 className="text-2xl" style={{ color: '#1a1a1a' }}>
            Settings
          </h1>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1a1a1a' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* API Key Management */}
          <div>
            <h3 className="text-xl mb-3" style={{ color: '#1a1a1a' }}>
              API Key
            </h3>
            {!showKeyInput ? (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: '#4a4a4a' }}>
                  {apiKey ? `Stored: ${maskedKey}` : 'No API key stored'}
                </p>
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="text-xs px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                  style={{ color: '#1a1a1a' }}
                >
                  {apiKey ? 'Update Key' : 'Add Key'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Paste new key..."
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{ borderColor: '#CCCCCC', backgroundColor: '#FFFFFF', color: '#1a1a1a' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateKey}
                    className="flex-1 text-xs px-2 py-1 rounded font-medium text-white"
                    style={{ backgroundColor: '#9B0808' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowKeyInput(false)}
                    className="flex-1 text-xs px-2 py-1 rounded border"
                    style={{ borderColor: '#CCCCCC', backgroundColor: '#FFFFFF', color: '#1a1a1a' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <div>
            <h3 className="text-xl mb-3" style={{ color: '#1a1a1a' }}>
              Sound
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs" style={{ color: '#4a4a4a' }}>
                Enable jury reactions
              </span>
            </label>
          </div>

          {/* Allow Undecided Toggle */}
          <div>
            <h3 className="text-xl mb-3" style={{ color: '#1a1a1a' }}>
              Jury Discussion
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowUndecided}
                onChange={(e) => updateSettings({ allowUndecided: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs" style={{ color: '#4a4a4a' }}>
                Allow juries to remain undecided
              </span>
            </label>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xl mb-3" style={{ color: '#1a1a1a' }}>
              About
            </h3>
            <p className="text-xs" style={{ color: '#4a4a4a' }}>
              Cassette Jury is a creative decision-support toy. It is a panel of 11 AI-simulated characters — each with their own job, taste, and agenda — who act as your on-demand jury when you hit a creative deadlock. Submit an open-ended question, watch them deliberate, get a verdict.

            </p>
            <p className="text-xs mt-2" style={{ color: '#4a4a4a' }}>
                It is not a serious research tool. It is a delightful, slightly absurd alternative to running user tests or polling colleagues when you have no time or budget to do so. The product sits at the intersection of creative tooling and playful entertainment.
            </p>
            <p className="text-xs mt-2" style={{ color: '#4a4a4a' }}>
              Built by Mia & Ingrid.
            </p>
            <p className="text-xs mt-2" style={{ color: '#4a4a4a' }}>
              See more at{' '}
              <a
                href="https://cabbageblame.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#9B0808', textDecoration: 'underline' }}
              >
                cabbageblame.me
              </a>
            </p>
          </div>

          {/* Write-up */}
          <div>
            <a
              href="/writeup"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs px-3 py-2 rounded transition text-center font-medium text-white"
              style={{ backgroundColor: '#9B0808' }}
            >
              Project Write-up ↗
            </a>
          </div>
        </div>

        {/* Footer */}
        {apiKey && (
          <div className="p-6 border-t" style={{ borderColor: '#CCCCCC' }}>
            <button
              onClick={handleClearKey}
              className="w-full text-xs px-3 py-2 rounded font-medium text-white"
              style={{ backgroundColor: '#9B0808' }}
            >
              Clear & Return to Landing
            </button>
          </div>
        )}
      </div>
    </>
  );
};
