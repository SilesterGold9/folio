export const STORAGE_KEYS = {
  ONBOARDED: 'notes_onboarded',
  PREFS: 'notes_prefs',
  NOTES: 'notes_data',
  FOLDERS: 'notes_folders',
};

export const THEMES = [
  { id: 'dusk', name: 'Dusk', color: '#4F46E5', description: 'Deep indigo for focused writing' },
  { id: 'forest', name: 'Forest', color: '#2D6A4F', description: 'Natural greens for calm thoughts' },
  { id: 'terracotta', name: 'Terracotta', color: '#E07A5F', description: 'Warm earth tones' },
  { id: 'ocean', name: 'Ocean', color: '#028090', description: 'Cool teal for clarity' },
  { id: 'berry', name: 'Berry', color: '#9D4EDD', description: 'Vibrant purple for creativity' },
  { id: 'rose', name: 'Rose', color: '#E11D48', description: 'Bold and passionate' },
  { id: 'amber', name: 'Amber', color: '#D97706', description: 'Warm and inviting' },
  { id: 'slate', name: 'Slate', color: '#475569', description: 'Professional and neutral' },
  { id: 'emerald', name: 'Emerald', color: '#059669', description: 'Fresh and energetic' },
  { id: 'midnight', name: 'Midnight', color: '#1E293B', description: 'Dark and sophisticated' },
];

export const DEFAULT_PREFS = {
  name: '',
  themeColor: THEMES[0].color,
  themeId: THEMES[0].id,
  darkMode: false,
  language: 'en' as const,
  fontSize: 'medium' as const,
  enableAI: true,
  showSplash: true,
  aiProvider: 'gemini' as const,
};
