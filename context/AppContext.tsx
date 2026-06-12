'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { juries, JuryMember } from '@/config/juries';
import { APP_CONSTANTS } from '@/config/constants';
import {
  AppContextType,
  AppStage,
  AppSettings,
  DiscussionResult,
} from '@/types/app';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allJuries] = useState(juries);
  const [selectedJuries, setSelectedJuries] = useState<JuryMember[]>([]); // Default 0, select up to 9
  const [stage, setStage] = useState<AppStage>('landing');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [discussionResult, setDiscussionResult] = useState<DiscussionResult | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  // The '__env__' sentinel is resolved to the server-side key in /api/jury,
  // so visitors never enter a key. A custom key set via the settings menu
  // (persisted in sessionStorage) overrides it on mount.
  const [apiKey, setApiKey] = useState<string | null>('__env__');
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    theme: 'light',
    allowUndecided: false,
  });

  // Restore a custom key from sessionStorage on mount. Reading an external
  // store can't happen during render without a hydration mismatch.
  useEffect(() => {
    const stored = sessionStorage.getItem(APP_CONSTANTS.API_KEY_SESSION_KEY);
    if (stored && stored !== '__env__') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time sync from sessionStorage
      setApiKey(stored);
    }
  }, []);

  // Persist custom keys only — the hosted-key sentinel needs no storage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (apiKey && apiKey !== '__env__') {
      sessionStorage.setItem(APP_CONSTANTS.API_KEY_SESSION_KEY, apiKey);
    } else {
      sessionStorage.removeItem(APP_CONSTANTS.API_KEY_SESSION_KEY);
    }
  }, [apiKey]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const value: AppContextType = {
    allJuries,
    selectedJuries,
    setSelectedJuries,
    stage,
    setStage,
    currentQuestion,
    setCurrentQuestion,
    discussionResult,
    setDiscussionResult,
    isAIProcessing,
    setIsAIProcessing,
    apiKey,
    setApiKey,
    settings,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
