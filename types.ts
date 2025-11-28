export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  digit: string | number;
  confidence: string; // High, Medium, Low inference
  explanation: string;
}

export interface DragState {
  isDragging: boolean;
}

export interface User {
  name: string;
  email: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  imageData: string; // Base64
  digit: string | number;
  confidence: string;
  explanation: string;
}