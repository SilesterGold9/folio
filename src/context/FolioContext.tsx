import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Note, Folder, UserPreferences } from '../types';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { useNotes } from '../hooks/useNotes';
import { useFolders } from '../hooks/useFolders';
import { safeLocalStorage, applyTheme } from '../utils';
import { Toast } from '../components/Toast';

interface FolioContextType {
  // Prefs
  prefs: UserPreferences | null;
  showOnboarding: boolean | null;
  showSplash: boolean;
  quotaExceeded: boolean;
  setQuotaExceeded: (val: boolean) => void;
  savePrefs: (prefs: UserPreferences) => void;
  completeOnboarding: (prefs: UserPreferences) => void;
  replayOnboarding: () => void;
  hideSplash: () => void;

  // Notes
  notes: Note[];
  createNote: (folderId: string | null, tag: string | null) => string;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  streak: number;
  allTags: string[];
  saveNotes: (notes: Note[]) => void;

  // Folders
  folders: Folder[];
  saveFolders: (folders: Folder[]) => void;
  createFolder: (name: string) => string;
  deleteFolder: (id: string) => void;

  // UI State
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (val: boolean) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  view: 'main' | 'settings';
  setView: (view: 'main' | 'settings') => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;

  // Data Actions
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteAll: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const FolioContext = createContext<FolioContextType | undefined>(undefined);

export function FolioProvider({ children }: { children: ReactNode }) {
  const userPrefs = useUserPrefs();
  const notesData = useNotes();
  const foldersData = useFolders();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  React.useEffect(() => {
    if (userPrefs.prefs) {
      applyTheme(userPrefs.prefs.themeId, userPrefs.prefs.darkMode);
    }
  }, [userPrefs.prefs]);

  const handleExport = useCallback(() => {
    const data = {
      notes: notesData.notes,
      folders: foldersData.folders,
      prefs: userPrefs.prefs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notesData.notes, foldersData.folders, userPrefs.prefs]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.notes) notesData.saveNotes(data.notes);
        if (data.folders) foldersData.saveFolders(data.folders);
        if (data.prefs) userPrefs.savePrefs(data.prefs);
        alert('Backup restored successfully!');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [notesData.saveNotes, foldersData.saveFolders, userPrefs.savePrefs]);

  const handleDeleteAll = useCallback(() => {
    safeLocalStorage.clear();
    window.location.reload();
  }, []);

  const value = {
    ...userPrefs,
    ...notesData,
    ...foldersData,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    activeNoteId,
    setActiveNoteId,
    activeFolderId,
    setActiveFolderId,
    activeTag,
    setActiveTag,
    view,
    setView,
    isZenMode,
    setIsZenMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleExport,
    handleImport,
    handleDeleteAll,
    showToast,
    toast,
    hideToast
  };

  return (
    <FolioContext.Provider value={value as any}>
      {children}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </FolioContext.Provider>
  );
}

export function useFolio() {
  const context = useContext(FolioContext);
  if (context === undefined) {
    throw new Error('useFolio must be used within a FolioProvider');
  }
  return context;
}
