/**
 * Audio utility functions for sound management
 * Handles playback, state management, and folder scanning
 */

export interface PlaySoundOptions {
  loop?: boolean;
  volume?: number;
  onEnded?: () => void;
}

export interface RandomSoundOptions extends PlaySoundOptions {
  minGap?: number;
  maxGap?: number;
}

/**
 * Fetch all audio files from a public folder
 * Supports: .mp3, .wav, .ogg
 */
export async function loadAudioFiles(folderPath: string): Promise<string[]> {
  try {
    // Since we can't directly scan the file system at runtime in Next.js,
    // we define known audio files per folder
    // This is set in the sounds.ts config
    return [];
  } catch (error) {
    console.error(`Error loading audio files from ${folderPath}:`, error);
    return [];
  }
}

/**
 * Play a single audio file
 * Returns the audio element for further control
 */
export function playSound(
  audioPath: string,
  options: PlaySoundOptions = {}
): HTMLAudioElement | null {
  try {
    if (!audioPath) return null;

    const audio = new Audio(audioPath);
    audio.loop = options.loop ?? false;
    audio.volume = options.volume ?? 0.5;

    if (options.onEnded) {
      audio.addEventListener('ended', options.onEnded, { once: true });
    }

    audio.play().catch((err) => {
      console.warn(`Failed to play audio ${audioPath}:`, err);
    });

    return audio;
  } catch (error) {
    console.error(`Error creating audio element for ${audioPath}:`, error);
    return null;
  }
}

/**
 * Stop audio playback and cleanup
 */
export function stopSound(audioRef: HTMLAudioElement | null | undefined): void {
  if (audioRef) {
    audioRef.pause();
    audioRef.currentTime = 0;
    // Remove all event listeners
    audioRef.replaceWith(audioRef.cloneNode(true) as HTMLAudioElement);
  }
}

/**
 * Stop all sounds in an array of audio refs
 */
export function stopAllSounds(audioRefs: (HTMLAudioElement | null)[]): void {
  audioRefs.forEach((ref) => stopSound(ref));
}

/**
 * Fade audio volume over time
 */
export function fadeAudio(
  audioRef: HTMLAudioElement | null | undefined,
  targetVolume: number,
  duration: number = 2000
): Promise<void> {
  return new Promise((resolve) => {
    if (!audioRef) {
      resolve();
      return;
    }

    const startVolume = audioRef.volume;
    const startTime = Date.now();

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audioRef.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        clearInterval(fadeInterval);
        resolve();
      }
    }, 50);
  });
}

/**
 * Play random sound from a list of audio files
 * With option for gap between plays
 */
export function playRandomSound(
  audioFiles: string[],
  options: RandomSoundOptions = {}
): HTMLAudioElement | null {
  if (audioFiles.length === 0) {
    console.warn('No audio files provided for random sound');
    return null;
  }

  const randomIndex = Math.floor(Math.random() * audioFiles.length);
  const audioPath = audioFiles[randomIndex];

  return playSound(audioPath, {
    loop: options.loop ?? false,
    volume: options.volume ?? 0.5,
    onEnded: options.onEnded,
  });
}

/**
 * Get random gap in milliseconds between min and max
 */
export function getRandomGap(minSeconds: number, maxSeconds: number): number {
  const min = minSeconds * 1000;
  const max = maxSeconds * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
