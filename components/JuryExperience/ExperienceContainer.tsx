'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopBar } from './TopBar';
import { InputBox } from './InputBox';
import { ResultBox } from './ResultBox';
import { StatusBar } from './ControlBar';
import { SideMenu } from './SideMenu';
import { JuryStage } from './JuryStage';
import { MobileJuryStage } from './MobileJuryStage';
import { DeliberationFeed } from './DeliberationFeed';
import { LoadingScreen } from '@/components/LandingPage/LoadingScreen';
import { playSound, stopSound, stopAllSounds, playRandomSound } from '@/utils/audio';
import { SOUND_FOLDERS, VOLUME_DEFAULTS, AUDIO_FILES } from '@/config/sounds';
import { useRandomGibberish } from '@/hooks/useRandomGibberish';
import { useIsMobile } from '@/hooks/useIsMobile';
import { JuryVote, DiscussionResult } from '@/types/app';

interface StreamVerdict {
  summary?: string;
  verdict_narrative?: string;
  votes?: Record<string, number>;
}

export const ExperienceContainer: React.FC = () => {
  const router = useRouter();
  const {
    selectedJuries,
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
  const isMobile = useIsMobile();
  const [fightingAudioFiles, setFightingAudioFiles] = useState<string[]>([]);
  const [resultAudioFiles, setResultAudioFiles] = useState<string[]>([]);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [liveDiscussion, setLiveDiscussion] = useState<JuryVote[]>([]);

  // Real asset loading state, reported by the Three.js scene
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetProgress, setAssetProgress] = useState(0);

  // Audio refs
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentFightingAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRefsRef = useRef<HTMLAudioElement[]>([]);

  // No jurors selected (e.g. direct link or page refresh) — go back to selection.
  useEffect(() => {
    if (!selectedJuries || selectedJuries.length === 0) {
      router.replace('/');
    }
  }, [selectedJuries, router]);

  // Load audio files from folders on mount
  useEffect(() => {
    const loadAudioFiles = async () => {
      try {
        const fightingRes = await fetch(`/api/list-audio-files?folder=${encodeURIComponent(SOUND_FOLDERS.FIGHTING)}`);
        if (fightingRes.ok) {
          const data = await fightingRes.json();
          setFightingAudioFiles(data.files || []);
        }

        const resultRes = await fetch(`/api/list-audio-files?folder=${encodeURIComponent(SOUND_FOLDERS.RESULT)}`);
        if (resultRes.ok) {
          const data = await resultRes.json();
          setResultAudioFiles(data.files || []);
        }
      } catch {
        // Audio is optional for app functionality
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
      stopSound(musicRef.current);
      stopSound(currentFightingAudioRef.current);
      stopAllSounds(resultAudioRefsRef.current);
      return;
    }

    // Normal state: play music, stop fighting/results
    if (!triggerFight && !showResults) {
      stopSound(currentFightingAudioRef.current);
      currentFightingAudioRef.current = null;
      stopAllSounds(resultAudioRefsRef.current);
      resultAudioRefsRef.current = [];

      if (!musicRef.current) {
        musicRef.current = playSound(AUDIO_FILES.MUSIC.main, {
          loop: true,
          volume: VOLUME_DEFAULTS.MUSIC,
        });
      } else if (musicRef.current.paused) {
        musicRef.current.play().catch(() => {});
      }
    }
    // Fighting state: play fighting sounds, stop music
    else if (triggerFight && !showResults) {
      stopSound(musicRef.current);
      musicRef.current = null;
      stopAllSounds(resultAudioRefsRef.current);
      resultAudioRefsRef.current = [];

      if (!currentFightingAudioRef.current && fightingAudioFiles.length > 0) {
        currentFightingAudioRef.current = playRandomSound(fightingAudioFiles, {
          loop: true,
          volume: VOLUME_DEFAULTS.FIGHTING,
        });
      }
    }
    // Results state: play result sounds, stop fighting
    else if (showResults && discussionResult) {
      stopSound(currentFightingAudioRef.current);
      currentFightingAudioRef.current = null;

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
  }, [triggerFight, showResults, discussionResult, settings.soundEnabled, fightingAudioFiles, resultAudioFiles]);

  // Cleanup all audio on unmount
  useEffect(() => {
    return () => {
      stopSound(musicRef.current);
      stopSound(currentFightingAudioRef.current);
      stopAllSounds(resultAudioRefsRef.current);
    };
  }, []);

  const handleResetQuestion = () => {
    setSubmittedQuestion(null);
    setShowResults(false);
    setDiscussionResult(null);
    setCurrentQuestion('');
    setLiveDiscussion([]);
  };

  const failWithError = (message: string) => {
    setDiscussionResult({ error: message });
    setIsAIProcessing(false);
    setTriggerFight(false);
    setShowResults(true);
  };

  const handleSubmitQuestion = async (question: string) => {
    if (!apiKey) {
      failWithError('No API key set. Open the menu to add your Anthropic API key.');
      return;
    }
    if (!selectedJuries || selectedJuries.length === 0) {
      router.replace('/');
      return;
    }

    setSubmittedQuestion(question);
    setCurrentQuestion(question);
    setIsAIProcessing(true);
    setTriggerFight(true);
    setLiveDiscussion([]);

    try {
      const response = await fetch('/api/jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          juryIds: selectedJuries.map((j) => j.id),
          apiKey,
          allowUndecided: settings.allowUndecided,
        }),
      });

      if (!response.ok || !response.body) {
        let message = `API Error: ${response.status} ${response.statusText}`;
        try {
          const data = await response.json();
          if (data.error) message = data.error;
        } catch {
          // keep the status-based message
        }
        throw new Error(message);
      }

      // Consume the NDJSON stream: juror verdicts appear live as they generate.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const discussion: JuryVote[] = [];
      let verdict: StreamVerdict | null = null;
      let streamError: string | null = null;
      let lineBuffer = '';

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let evt: Record<string, unknown>;
        try {
          evt = JSON.parse(trimmed);
        } catch {
          return;
        }
        if (evt.type === 'juror') {
          discussion.push({
            id: typeof evt.id === 'string' ? evt.id : undefined,
            name: String(evt.name ?? ''),
            stance: String(evt.stance ?? ''),
            reason: String(evt.reason ?? ''),
            quote: String(evt.quote ?? ''),
          });
          setLiveDiscussion([...discussion]);
        } else if (evt.type === 'verdict') {
          verdict = evt as StreamVerdict;
        } else if (evt.type === 'error') {
          streamError = String(evt.error ?? 'Unknown error');
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';
        lines.forEach(processLine);
      }
      processLine(lineBuffer);

      if (streamError) throw new Error(streamError);
      const finalVerdict = verdict as StreamVerdict | null;
      if (!finalVerdict || discussion.length === 0) {
        throw new Error('The jury never reached a verdict. Please try again.');
      }

      const result: DiscussionResult = {
        discussion,
        summary: finalVerdict.summary,
        verdict_narrative: finalVerdict.verdict_narrative,
        votes: finalVerdict.votes,
      };
      setDiscussionResult(result);
    } catch (error) {
      console.error('Error getting jury response:', error);
      failWithError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
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

  const handleAssetProgress = useCallback((progress: number, done: boolean) => {
    setAssetProgress((prev) => Math.max(prev, progress));
    if (done) setAssetsReady(true);
  }, []);

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
      {/* Loading overlay driven by real asset progress */}
      {!assetsReady && (
        <LoadingScreen progress={assetProgress} onComplete={() => setAssetsReady(true)} />
      )}

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
            onAssetProgress={handleAssetProgress}
          />
        ) : (
          <JuryStage
            triggerFight={triggerFight}
            onFightComplete={handleFightComplete}
            showResults={showResults}
            discussionResult={discussionResult}
            isProcessing={isAIProcessing}
            onAssetProgress={handleAssetProgress}
          />
        )}

        {/* Live deliberation transcript while the jury argues */}
        <DeliberationFeed votes={liveDiscussion} visible={isAIProcessing && !showResults} />

        {/* Input or Result Box (floating, overlaid on canvas, z-index 30) */}
        <InputBox onSubmit={handleSubmitQuestion} isLoading={isAIProcessing} showResults={showResults} submittedQuestion={submittedQuestion} onResetQuestion={handleResetQuestion} />
        {showResults && discussionResult && (
          <ResultBox
            result={discussionResult}
            showResult={showResults}
            question={submittedQuestion}
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
