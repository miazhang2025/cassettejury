/**
 * Sound configuration and folder mappings
 * Defines available sounds for each category and their default settings
 */

export const SOUND_FOLDERS = {
  SFX: '/sfx',
  MUSIC: '/music',
  FIGHTING: '/fighting',
  GIBBERISH: '/gibberish',
  RESULT: '/result',
} as const;

/**
 * Known audio files in each folder
 * Since Next.js doesn't allow runtime directory scanning,
 * we maintain explicit lists of available sounds
 */
export const AUDIO_FILES = {
  SFX: {
    paper: `${SOUND_FOLDERS.SFX}/paper.wav`,
    click: `${SOUND_FOLDERS.SFX}/click.wav`,
  },
  MUSIC: {
    // Added dynamically if files exist in /public/music
    main: `${SOUND_FOLDERS.MUSIC}/Ziv%20Grinberg%20-%20A%20Scary%20Ferris%20Wheel%20Ride.mp3`,
  },
  // FIGHTING, GIBBERISH, and RESULT files will be loaded dynamically
  FIGHTING: [] as string[],
  GIBBERISH: [] as string[],
  RESULT: [] as string[],
};

/**
 * Default volume levels for different sound types
 */
export const VOLUME_DEFAULTS = {
  MUSIC: 0.5,
  SFX: 0.8,
  GIBBERISH: 0.4,
  FIGHTING: 0.6,
  RESULT: 0.7,
} as const;

/**
 * Timing configuration
 */
export const SOUND_TIMING = {
  GIBBERISH_MIN_GAP_SECONDS: 5,
  GIBBERISH_MAX_GAP_SECONDS: 7,
} as const;

/**
 * Helper to get all available audio files for a folder
 * This fetches from a dynamic API endpoint that lists files
 */
export async function loadAudioFilesForFolder(folderPath: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/list-audio-files?folder=${encodeURIComponent(folderPath)}`);
    if (!response.ok) {
      console.warn(`Could not fetch audio files from ${folderPath}`);
      return [];
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.warn(`Error loading audio files from ${folderPath}:`, error);
    return [];
  }
}

/**
 * Initialize dynamic audio file lists
 * Call this once during app startup
 */
export async function initializeAudioFiles(): Promise<void> {
  try {
    AUDIO_FILES.FIGHTING = await loadAudioFilesForFolder(SOUND_FOLDERS.FIGHTING);
    AUDIO_FILES.GIBBERISH = await loadAudioFilesForFolder(SOUND_FOLDERS.GIBBERISH);
    AUDIO_FILES.RESULT = await loadAudioFilesForFolder(SOUND_FOLDERS.RESULT);
  } catch (error) {
    console.error('Error initializing audio files:', error);
  }
}
