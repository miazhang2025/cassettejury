'use client';

import { useEffect, useRef, useState } from 'react';
import { playRandomSound, stopSound, getRandomGap } from '@/utils/audio';
import { SOUND_TIMING, VOLUME_DEFAULTS } from '@/config/sounds';

interface UseRandomGibberishOptions {
  folderPath: string;
  enabled: boolean;
  minGapSeconds?: number;
  maxGapSeconds?: number;
  volume?: number;
}

/**
 * Custom hook for playing random sounds from a folder with gaps
 * Used for ambient gibberish playback during landing page and results
 */
export function useRandomGibberish({
  folderPath,
  enabled,
  minGapSeconds = SOUND_TIMING.GIBBERISH_MIN_GAP_SECONDS,
  maxGapSeconds = SOUND_TIMING.GIBBERISH_MAX_GAP_SECONDS,
  volume = VOLUME_DEFAULTS.GIBBERISH,
}: UseRandomGibberishOptions) {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load audio files from folder
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(
          `/api/list-audio-files?folder=${encodeURIComponent(folderPath)}`
        );
        if (response.ok) {
          const data = await response.json();
          setAudioFiles(data.files || []);
        }
      } catch (error) {
        console.error(`Error loading audio files from ${folderPath}:`, error);
      }
    };

    loadFiles();
  }, [folderPath]);

  // Handle playback scheduling
  useEffect(() => {
    if (!enabled || audioFiles.length === 0) {
      // Stop any current playback if disabled
      stopSound(currentAudioRef.current);
      currentAudioRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Play random sound and schedule next one
    const playNextSound = () => {
      if (!enabled || audioFiles.length === 0) return;

      const randomIndex = Math.floor(Math.random() * audioFiles.length);
      const audioPath = audioFiles[randomIndex];

      currentAudioRef.current = playRandomSound([audioPath], {
        volume,
        loop: false,
      });

      // Schedule next sound after this one ends + random gap
      const gap = getRandomGap(minGapSeconds, maxGapSeconds);
      timeoutRef.current = setTimeout(playNextSound, gap);
    };

    // Start immediately
    playNextSound();

    // Cleanup on unmount or when disabled
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopSound(currentAudioRef.current);
      currentAudioRef.current = null;
    };
  }, [enabled, audioFiles, minGapSeconds, maxGapSeconds, volume]);
}
