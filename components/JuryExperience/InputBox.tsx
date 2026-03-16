'use client';

import React, { useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { div } from 'three/src/nodes/tsl/TSLBase.js';

interface InputBoxProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, APP_CONSTANTS.MAX_QUESTION_LENGTH);
    setQuestion(value);
    setCharCount(value.length);
  };

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && question.trim()) {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 w-11/12 md:w-full max-w-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: '#cccccc00',
        top: 'calc(60px + 1.5rem)',
        zIndex: 30,
        pointerEvents: 'auto',
      }}
    >
      <div className="p-4 md:p-6">


        <textarea
          value={question}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Describe the creative decision you're stuck on..."
          className="w-full px-3 py-2 border backdrop-blur-xs rounded-md text-sm focus:outline-none focus:ring-1 resize-none"
          style={{
            borderColor: '#cccccc',
             backgroundColor: '#d0d0d031',
            color: '#ffffff',
            '--tw-ring-color': '#ffffff',
            minHeight: '100px',
            fontFamily: "'IBM Plex Mono', monospace",
          } as React.CSSProperties}
          disabled={isLoading}
        />

        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs" style={{ color: '#ffffff74' }}>
            {charCount}/{APP_CONSTANTS.MAX_QUESTION_LENGTH}
          </span>

          <button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="px-4 py-2 rounded-3xl font-medium border text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95"
            style={{
              backgroundColor: question.trim() && !isLoading ? '#c9c9c927' : '#CCCCCC',
              fontFamily: "'IBM Plex Mono', monospace",
              borderColor: '#D9D9D9',
              transition: 'all 0.2s ease-out',
            } as React.CSSProperties}
          >
            {isLoading ? 'Jury Deciding...' : 'Put it to the Jury'}
          </button>
        </div>
      </div>
    </div>
  );
};
