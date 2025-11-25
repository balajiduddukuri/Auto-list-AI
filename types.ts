export interface ProductListing {
  title: string;
  bullets: string[];
  description: string;
  keywords: string[];
  suggestedPrice: string;
}

export interface TrendItem {
  id: string;
  name: string;
  growth: number;
  volume: number;
  category: string;
  image: string;
  status?: 'idle' | 'processing' | 'completed';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  STUDIO = 'STUDIO',
  SETTINGS = 'SETTINGS'
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: ProductListing | null;
}

export interface StoryboardScene {
  sceneNumber: number;
  startFramePrompt: string;
  endFramePrompt: string;
  videoMotionPrompt: string;
  startImage?: string; // base64
  endImage?: string;   // base64
  isGenerating?: boolean;
}

export type AutomationStatus = 'IDLE' | 'ANALYZING' | 'DRAFTING' | 'BRAINSTORMING' | 'STORYBOARDING' | 'RENDERING' | 'COMPLETE';

export interface ProductProject {
  productName: string;
  listing: ProductListing | null;
  marketingConcepts: string[];
  selectedConcept: string | null;
  storyboard: StoryboardScene[];
  status: AutomationStatus;
  progress: number; // 0-100
}