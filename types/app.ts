import { JuryMember } from '@/config/juries';

export type AppStage = 'landing' | 'selecting' | 'experience' | 'results';

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
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
