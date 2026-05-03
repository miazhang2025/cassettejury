'use client';

import React, { useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { div } from 'three/src/nodes/tsl/TSLBase.js';

interface InputBoxProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  style?: React.CSSProperties;
  showResults?: boolean;
  submittedQuestion?: string | null;
  onResetQuestion?: () => void;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, isLoading, style, showResults, submittedQuestion: externalSubmittedQuestion, onResetQuestion }) => {
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0));

  // Use external submitted question if provided, otherwise use local state
  const currentSubmittedQuestion = externalSubmittedQuestion !== undefined ? externalSubmittedQuestion : submittedQuestion;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, APP_CONSTANTS.MAX_QUESTION_LENGTH);
    setQuestion(value);
    setCharCount(value.length);
  };

  const handleSubmit = () => {
    if (question.trim()) {
      setSubmittedQuestion(question);
      onSubmit(question);
    }
  };

  const handleAskNewQuestion = () => {
    setSubmittedQuestion(null);
    setQuestion('');
    setCharCount(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && question.trim() && !submittedQuestion) {
      handleSubmit();
    }
  };

  // Show textarea if no question submitted yet, otherwise show submitted question text
  const showTextarea = !currentSubmittedQuestion;

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 w-11/12 sm:w-full max-w-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: '#cccccc00',
        top: isMobile ? 'calc(80px + 1rem)' : 'calc(30px + 1rem)',
        zIndex: 30,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      <div className="p-3 sm:p-4 md:p-6">
        {/* Show textarea before submission */}
        {showTextarea ? (
          <>
            <textarea
              value={question}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Describe the creative decision you're stuck on..."
              className="w-full px-3 py-2 border backdrop-blur-xs rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 resize-none"
              style={{
                borderColor: '#cccccc',
                backgroundColor: '#d0d0d031',
                color: '#ffffff',
                '--tw-ring-color': '#ffffff',
                minHeight: '90px',
                fontFamily: "'IBM Plex Mono', monospace",
              } as React.CSSProperties}
              disabled={isLoading}
            />

            <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs" style={{ color: '#ffffff74' }}>
                {charCount}/{APP_CONSTANTS.MAX_QUESTION_LENGTH}
              </span>

              <button
                onClick={handleSubmit}
                disabled={!question.trim() || isLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-3xl font-medium border text-white text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95"
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
          </>
        ) : (
          <>
            {/* Show submitted question as text after submission */}
            <h3
              style={{
                color: '#ffffff',
                fontFamily: "'IBM Plex Mono', monospace",
                margin: 0,
                marginLeft: '20px',
                fontSize: '1rem',
                lineHeight: '1.5',
              }}
            >
              {currentSubmittedQuestion}
            </h3>
          </>
        )}
      </div>
    </div>
  );
};
