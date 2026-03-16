'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { juries } from '@/config/juries';
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
  const [selectedJuries, setSelectedJuries] = useState(juries.slice(0, 9)); // Default first 9
  const [stage, setStage] = useState<AppStage>('landing');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [discussionResult, setDiscussionResult] = useState<DiscussionResult | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    theme: 'light',
  });

  // Log initialization
  useEffect(() => {
    console.log('AppContext initialized with selectedJuries:', selectedJuries.map(j => j.id));
  }, []);

  // Load API key from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(APP_CONSTANTS.API_KEY_SESSION_KEY);
      if (stored) {
        console.log('Loaded API key from sessionStorage');
        setApiKey(stored);
      }
    }
  }, []);

  // Save API key to sessionStorage when it changes
  useEffect(() => {
    if (apiKey && typeof window !== 'undefined') {
      sessionStorage.setItem(APP_CONSTANTS.API_KEY_SESSION_KEY, apiKey);
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
