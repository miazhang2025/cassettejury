'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopBar } from './TopBar';
import { InputBox } from './InputBox';
import { ResultBox } from './ResultBox';
import { StatusBar } from './ControlBar';
import { SideMenu } from './SideMenu';
import { JuryStage } from './JuryStage';
import { APP_CONSTANTS } from '@/config/constants';

export const ExperienceContainer: React.FC = () => {
  const router = useRouter();
  const {
    selectedJuries,
    currentQuestion,
    setCurrentQuestion,
    discussionResult,
    setDiscussionResult,
    isAIProcessing,
    setIsAIProcessing,
    apiKey,
    setStage,
    settings,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [triggerFight, setTriggerFight] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Manage background music based on sound settings
  useEffect(() => {
    // Create audio element once and reuse it
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = '/music/Ziv%20Grinberg%20-%20A%20Scary%20Ferris%20Wheel%20Ride.mp3';
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    if (settings.soundEnabled) {
      // Try to play, with error handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Audio playback failed:', error);
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset to start when paused
    }

    return () => {
      // Don't pause on unmount to keep audio persistent
    };
  }, [settings.soundEnabled]);

  const handleSubmitQuestion = async (question: string) => {
    // Check if API key exists
    if (!apiKey) {
      console.error('API key not set. Please go back and enter your Anthropic API key.');
      setIsAIProcessing(false);
      return;
    }

    // Check if selected juries exist
    if (!selectedJuries || selectedJuries.length === 0) {
      console.error('No juries selected. selectedJuries:', selectedJuries);
      setIsAIProcessing(false);
      return;
    }

    setCurrentQuestion(question);
    setIsAIProcessing(true);
    setTriggerFight(true); // Start fight animation

    try {
      // Wait briefly before calling API to let fight animation start
      await new Promise((resolve) => setTimeout(resolve, 500));

      const juryIds = selectedJuries.map((j) => j.id);
      console.log('Submitting question with:', {
        question,
        juryIds,
        juryCount: selectedJuries.length,
        apiKeyExists: !!apiKey,
      });

      // Call API to get jury discussion
      const response = await fetch('/api/jury', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          juryIds,
          apiKey,
        }),
      });

      console.log('API response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        let errorData: any = {};
        
        try {
          const contentType = response.headers.get('content-type');
          console.log('Response content-type:', contentType);
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            console.log('Parsed JSON error:', errorData);
            if (errorData.error) {
              errorMessage = `Error: ${errorData.error}`;
              if (errorData.status) {
                errorMessage += ` (${errorData.status})`;
              }
            }
          } else {
            const text = await response.text();
            console.log('Response text:', text);
            if (text) {
              errorMessage = `API Error: ${text}`;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        console.error('API Error Status:', response.status);
        console.error('API Error Data:', errorData);
        console.error('Final error message:', errorMessage);
        
        // Update discussion result with error to display to user
        setDiscussionResult({
          error: errorMessage,
          details: errorData.details,
        } as any);
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API response successful:', result);
      setDiscussionResult(result);
    } catch (error) {
      console.error('Error getting jury response:', error);
      setIsAIProcessing(false);
      setTriggerFight(false);
      // Error already set in discussionResult via setDiscussionResult above
      setShowResults(true);
    }
  };

  const handleFightComplete = () => {
    setTriggerFight(false);
    setShowResults(true);
    setIsAIProcessing(false);
  };

  const handleRetry = () => {
    setShowResults(false);
    setDiscussionResult(null);
    setCurrentQuestion('');
  };

  const handleBackToSelection = () => {
    setStage('landing');
    router.push('/');
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col rounded-lg"
      style={{ backgroundColor: '#9B0808', border: '20px solid #E5E5E1' }}
    >
      {/* Top Bar */}
      <TopBar onMenuClick={() => setMenuOpen(!menuOpen)} />

      {/* Main Content Area - Full screen canvas */}
      <div className="flex-1 w-full absolute overflow-hidden" style={{ minHeight: 0, position: 'relative', zIndex: 0 }}>
        {/* Jury Stage (Canvas with Three.js) - fills entire area, z-index 0 */}
        <JuryStage
          triggerFight={triggerFight}
          onFightComplete={handleFightComplete}
          showResults={showResults}
          discussionResult={discussionResult}
        />

        {/* Input or Result Box (floating, overlaid on canvas, z-index 30) */}
        {!showResults && <InputBox onSubmit={handleSubmitQuestion} isLoading={isAIProcessing} />}
        {showResults && (
          <ResultBox
            result={discussionResult}
            showResult={showResults}
            onRetry={handleRetry}
            onBackToSelection={handleBackToSelection}
          />
        )}
      </div>

      {/* Control Bar - z-index 20 */}
      <StatusBar
        isProcessing={isAIProcessing}
        showResults={showResults}
        discussionResult={discussionResult}
      />

      {/* Side Menu - z-index 50 */}
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};
