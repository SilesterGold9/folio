import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewNote: () => void;
  onToggleSettings: () => void;
  onFocusSearch: () => void;
  onToggleCommandPalette: () => void;
}

export function useKeyboardShortcuts({
  onNewNote,
  onToggleSettings,
  onFocusSearch,
  onToggleCommandPalette,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + N for New Note
      if (isCmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        onNewNote();
      }
      // Cmd/Ctrl + , for Settings
      if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        onToggleSettings();
      }
      // Cmd/Ctrl + F for Search
      if (isCmdOrCtrl && e.key === 'f') {
        e.preventDefault();
        onFocusSearch();
      }
      // Cmd/Ctrl + K for Command Palette
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        onToggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewNote, onToggleSettings, onFocusSearch, onToggleCommandPalette]);
}
