import { JuryMember } from '@/config/juries';

export type AppStage = 'landing' | 'selecting' | 'experience' | 'results';

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  allowUndecided: boolean;
}

export interface AppContextType {
  // Jury data
  allJuries: JuryMember[];
  selectedJuries: JuryMember[];
  setSelectedJuries: (juries: JuryMember[]) => void;

  // Page navigation
  stage: AppStage;
  setStage: (stage: AppStage) => void;

  // Current session
  currentQuestion: string;
  setCurrentQuestion: (q: string) => void;

  discussionResult: DiscussionResult | null;
  setDiscussionResult: (result: DiscussionResult | null) => void;

  isAIProcessing: boolean;
  setIsAIProcessing: (bool: boolean) => void;

  // API & Security
  apiKey: string | null;
  setApiKey: (key: string | null) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export interface DiscussionResult {
  discussion?: JuryVote[];
  summary?: string;
  verdict_narrative?: string;
  votes?: Record<string, number>;
  error?: string;
  details?: string;
}

export interface JuryVote {
  name: string;
  stance: 'Option A' | 'Option B' | 'Undecided';
  reason: string;
  quote: string;
}

// Character Generator Types
export type CharacterGeneratorStep = 'draft' | 'refine' | 'images' | 'select' | 'mesh' | 'review';

export interface CharacterDraft {
  name: string;
  age?: number;
  profession?: string;
  gender?: string;
  bio: string;
  color: string;
}

export interface RefinedCharacter {
  id: string;
  name: string;
  pronouns: string;
  age: number;
  location: string;
  profession: string;
  bio: string;
  color: string;
  silhouette: string;
}

export interface GeneratedImages {
  urls: string[]; // Array of 4 image URLs or base64 strings
  selectedIndex?: number; // Index of selected image (0-3)
}

export interface GeneratedMesh {
  glbData: ArrayBuffer | string; // GLB file data or URL
  textureData?: string; // Texture image URL or base64
}

export interface CharacterGeneratorState {
  currentStep: CharacterGeneratorStep;
  setCurrentStep: (step: CharacterGeneratorStep) => void;

  draftCharacter: CharacterDraft | null;
  setDraftCharacter: (draft: CharacterDraft | null) => void;

  refinedCharacter: RefinedCharacter | null;
  setRefinedCharacter: (character: RefinedCharacter | null) => void;

  generatedImages: GeneratedImages | null;
  setGeneratedImages: (images: GeneratedImages | null) => void;

  generatedMesh: GeneratedMesh | null;
  setGeneratedMesh: (mesh: GeneratedMesh | null) => void;

  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  resetGenerator: () => void;
}
