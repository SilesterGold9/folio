export type Note = {
  id: string;
  title: string;
  content: string; // HTML content
  folderId: string | null;
  updatedAt: number;
  createdAt: number;
  tags?: string[];
  icon?: string;
  cover?: string;
};

export type Folder = {
  id: string;
  name: string;
};

export type UserPreferences = {
  name: string;
  themeColor: string;
  themeId: string;
  darkMode: boolean;
  language: 'en' | 'pt';
  fontSize: 'small' | 'medium' | 'large';
  enableAI: boolean;
  showSplash: boolean;
  aiProvider: 'gemini' | 'openai';
  geminiApiKey?: string;
  openaiApiKey?: string;
};
