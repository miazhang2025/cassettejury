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
import { MobileJuryStage } from './MobileJuryStage';
import { APP_CONSTANTS } from '@/config/constants';
import { playSound, stopSound, stopAllSounds, playRandomSound } from '@/utils/audio';
import { SOUND_FOLDERS, VOLUME_DEFAULTS, AUDIO_FILES } from '@/config/sounds';
import { useRandomGibberish } from '@/hooks/useRandomGibberish';

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
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0))
  );
  const [fightingAudioFiles, setFightingAudioFiles] = useState<string[]>([]);
  const [resultAudioFiles, setResultAudioFiles] = useState<string[]>([]);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  
  // Audio refs
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentFightingAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRefsRef = useRef<HTMLAudioElement[]>([]);
  const fightingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update isMobile on resize / orientation change
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768 ||
        ('ontouchstart' in window && navigator.maxTouchPoints > 0)
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load audio files from folders on mount
  useEffect(() => {
    const loadAudioFiles = async () => {
      try {
        // Load fighting sounds
        const fightingRes = await fetch(`/api/list-audio-files?folder=${encodeURIComponent(SOUND_FOLDERS.FIGHTING)}`);
        if (fightingRes.ok) {
          const data = await fightingRes.json();
          setFightingAudioFiles(data.files || []);
        }

        // Load result sounds
        const resultRes = await fetch(`/api/list-audio-files?folder=${encodeURIComponent(SOUND_FOLDERS.RESULT)}`);
        if (resultRes.ok) {
          const data = await resultRes.json();
          setResultAudioFiles(data.files || []);
        }
      } catch (error) {
        // Silently fail - audio is optional for app functionality
        console.debug('Audio files unavailable');
      }
    };

    loadAudioFiles();
  }, []);

  // Play ambient gibberish during results
  useRandomGibberish({
    folderPath: SOUND_FOLDERS.GIBBERISH,
    enabled: settings.soundEnabled && showResults && discussionResult !== null,
  });

  // Manage audio lifecycle: music -> fighting -> results
  useEffect(() => {
    if (!settings.soundEnabled) {
      // Stop all audio if sound is disabled
      stopSound(musicRef.current);
      stopSound(currentFightingAudioRef.current);
      stopAllSounds(resultAudioRefsRef.current);
      return;
    }

    // Normal state: play music, stop fighting/results
    if (!triggerFight && !showResults) {
      // Stop fighting and result sounds
      stopSound(currentFightingAudioRef.current);
      currentFightingAudioRef.current = null;
      stopAllSounds(resultAudioRefsRef.current);
      resultAudioRefsRef.current = [];

      // Play/continue music
      if (!musicRef.current) {
        musicRef.current = playSound(AUDIO_FILES.MUSIC.main, {
          loop: true,
          volume: VOLUME_DEFAULTS.MUSIC,
        });
      } else if (musicRef.current.paused) {
        musicRef.current.play().catch((err) => console.warn('Failed to resume music:', err));
      }
    }
    // Fighting state: play fighting sounds, stop music
    else if (triggerFight && !showResults) {
      // Stop music
      stopSound(musicRef.current);
      musicRef.current = null;

      // Stop result sounds
      stopAllSounds(resultAudioRefsRef.current);
      resultAudioRefsRef.current = [];

      // Play fighting sounds (looping random selection)
      const playNextFightingSound = () => {
        if (!triggerFight || showResults || fightingAudioFiles.length === 0) return;

        currentFightingAudioRef.current = playRandomSound(fightingAudioFiles, {
          loop: true,
          volume: VOLUME_DEFAULTS.FIGHTING,
        });

        // Continue looping until state changes
      };

      // Only play if we have audio files and haven't already started fighting audio
      if (!currentFightingAudioRef.current && fightingAudioFiles.length > 0) {
        playNextFightingSound();
      }
    }
    // Results state: play result sounds, stop fighting
    else if (showResults && discussionResult) {
      // Stop fighting sounds
      stopSound(currentFightingAudioRef.current);
      currentFightingAudioRef.current = null;

      // Play all result sounds in parallel (only once)
      if (resultAudioRefsRef.current.length === 0 && resultAudioFiles.length > 0) {
        resultAudioFiles.forEach((audioFile) => {
          const audio = playSound(audioFile, {
            loop: false,
            volume: VOLUME_DEFAULTS.RESULT,
          });
          if (audio) {
            resultAudioRefsRef.current.push(audio);
          }
        });
      }
    }

    // Cleanup fighting timeout
    return () => {
      if (fightingTimeoutRef.current) {
        clearTimeout(fightingTimeoutRef.current);
        fightingTimeoutRef.current = null;
      }
    };
  }, [triggerFight, showResults, discussionResult, settings.soundEnabled, fightingAudioFiles, resultAudioFiles]);

  // Cleanup all audio on unmount
  useEffect(() => {
    return () => {
      stopSound(musicRef.current);
      stopSound(currentFightingAudioRef.current);
      stopAllSounds(resultAudioRefsRef.current);
      if (fightingTimeoutRef.current) {
        clearTimeout(fightingTimeoutRef.current);
      }
    };
  }, []);

  const handleResetQuestion = () => {
    setSubmittedQuestion(null);
    setShowResults(false);
    setDiscussionResult(null);
    setCurrentQuestion('');
  };

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

    setSubmittedQuestion(question);
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
          allowUndecided: settings.allowUndecided,
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

  const handleBackToSelection = () => {
    setStage('landing');
    router.push('/');
  };

  return (
    <div
      className="overflow-hidden flex flex-col full-dvh"
      style={{ 
        width: '100vw', 
        backgroundColor: 'transparent', 
        border: '20px solid #E5E5E1',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <TopBar onMenuClick={() => setMenuOpen(!menuOpen)} style={{ zIndex: 10 }} />

      {/* Main Content Area - Full screen canvas */}
      <div className="flex-1 w-full overflow-hidden" style={{ minHeight: 0, position: 'relative' }}>
        {/* Jury Stage (Canvas with Three.js) - fills entire area, z-index 0 */}
        {isMobile ? (
          <MobileJuryStage
            triggerFight={triggerFight}
            onFightComplete={handleFightComplete}
            showResults={showResults}
            discussionResult={discussionResult}
            isProcessing={isAIProcessing}
          />
        ) : (
          <JuryStage
            triggerFight={triggerFight}
            onFightComplete={handleFightComplete}
            showResults={showResults}
            discussionResult={discussionResult}
            isProcessing={isAIProcessing}
          />
        )}

        {/* Input or Result Box (floating, overlaid on canvas, z-index 30) */}
        <InputBox onSubmit={handleSubmitQuestion} isLoading={isAIProcessing} showResults={showResults} submittedQuestion={submittedQuestion} onResetQuestion={handleResetQuestion} />
        {showResults && discussionResult && (
          <ResultBox
            result={discussionResult}
            showResult={showResults}
            onRetry={handleResetQuestion}
            onBackToSelection={handleBackToSelection}
          />
        )}
      </div>

      {/* Control Bar - z-index 20 */}
      <StatusBar
        isProcessing={isAIProcessing}
        showResults={showResults}
        discussionResult={discussionResult}
        style={{ zIndex: 36 }}
      />

      {/* Side Menu - z-index 50 */}
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} style={{ zIndex: 50 }} />
    </div>
  );
};
