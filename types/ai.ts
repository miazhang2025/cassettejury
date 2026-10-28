export interface QuestionImage {
  data: string; // base64, no data: prefix
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
}

export interface AIRequest {
  question: string;
  juryIds: string[];
  apiKey: string;
  allowUndecided?: boolean;
  image?: QuestionImage;
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
