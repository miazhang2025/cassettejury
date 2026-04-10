export interface AIRequest {
  question: string;
  juryIds: string[];
  apiKey: string;
  allowUndecided?: boolean;
}

export interface AIResponse {
  discussion: AIJuryResponse[];
  summary: string;
  verdict_narrative: string;
  votes: Record<string, number>;
}

export interface AIJuryResponse {
  name: string;
  stance: string;
  reason: string;
  quote: string;
}

export interface AIError {
  error: string;
  details?: string;
}
