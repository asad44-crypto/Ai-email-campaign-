
export interface Campaign {
  subject: string;
  body: string;
  imageUrl: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  CHATTING = 'CHATTING',
  ERROR = 'ERROR'
}
