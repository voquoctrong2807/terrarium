
export interface TerrariumConfig {
  shape: string;
  frame: string;
  theme: string;
  hardscape: string;
  plants: string[];
  density: number;
  gundamFocus: boolean;
  lighting: string;
  mood: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  notes: string;
}

export interface RenderResult {
  front: string;
  left: string;
  low: string;
  top: string;
  basePrompt: string;
}

export enum LoadingPhase {
  IDLE = 'IDLE',
  GENERATING_PROMPT = 'GENERATING_PROMPT',
  RENDERING = 'RENDERING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}