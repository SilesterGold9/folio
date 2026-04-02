import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from './types';
import { safeLocalStorage } from './utils';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { SplashScreen } from './components/SplashScreen';
import { CommandPalette } from './components/CommandPalette';
import { EmptyState } from './components/EmptyState';
import { Feather, Loader2 } from 'lucide-react';
import { t } from './i18n';

// Lazy load Editor
const Editor = lazy(() => import('./components/Editor').then(module => ({ default: module.Editor })));

import { EditorSkeleton, SidebarSkeleton, NoteListSkeleton } from './components/Skeleton';

// Context
import { useFolio } from './context/FolioContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { PanelLeftOpen } from 'lucide-react';

type ViewState = 'main' | 'settings';

export default function App() {
  const {
    prefs,
    notes,
    folders,
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
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    showOnboarding,
    showSplash,
    hideSplash,
    quotaExceeded,
    setQuotaExceeded,
    createNote,
    deleteNote,
    updateNote,
    savePrefs,
    replayOnboarding,
    streak,
    allTags,
    handleExport,
    handleImport,
    handleDeleteAll,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useFolio();

  const handleCreateNote = useCallback(() => {
    const newNoteId = createNote(activeFolderId, activeTag);
    setActiveNoteId(newNoteId);
    setView('main');
  }, [createNote, activeFolderId, activeTag, setActiveNoteId, setView]);

  const handleToggleSettings = useCallback(() => {
    setView(view === 'settings' ? 'main' : 'settings');
  }, [view, setView]);

  const handleFocusSearch = useCallback(() => {
    const searchInput = document.getElementById('global-search-input');
    searchInput?.focus();
  }, []);

  const handleToggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(!isCommandPaletteOpen);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useKeyboardShortcuts({
    onNewNote: handleCreateNote,
    onToggleSettings: handleToggleSettings,
    onFocusSearch: handleFocusSearch,
    onToggleCommandPalette: handleToggleCommandPalette,
  });

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId), [notes, activeNoteId]);
  const shouldShowSplash = useMemo(() => showSplash && prefs?.showSplash, [showSplash, prefs?.showSplash]);

  // Wait for initial load
  if (showOnboarding === null || !prefs) {
    return (
      <div className="h-screen w-screen bg-[var(--bg-primary)] flex overflow-hidden">
        <SidebarSkeleton />
        <NoteListSkeleton />
        <EditorSkeleton />
      </div>
    );
  }

  return (
    <div className={prefs.darkMode ? 'dark' : ''}>
      <CommandPalette />
      <div className="h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans transition-colors duration-700 overflow-hidden flex">
        <AnimatePresence mode="wait">
          {quotaExceeded && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="bg-white/20 p-1 rounded-full">
                <Feather className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{t('app.quota.title', prefs.language)}</span>
                <span className="text-xs opacity-90">{t('app.quota.desc', prefs.language)}</span>
              </div>
              <button 
                onClick={() => setQuotaExceeded(false)}
                className="ml-4 hover:bg-white/10 p-1 rounded-lg transition-colors"
              >
                <Feather className="w-4 h-4 rotate-45" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {shouldShowSplash ? (
          <SplashScreen key="splash" onComplete={hideSplash} themeColor={prefs.themeColor} />
        ) : showOnboarding ? (
          <Onboarding key="onboarding" />
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full w-full"
          >
            {!isZenMode && (
              <Sidebar />
            )}

            {isSidebarCollapsed && !isZenMode && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsSidebarCollapsed(false)}
                className="fixed top-4 left-4 z-[60] p-2 rounded-xl bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-sm transition-all"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </motion.button>
            )}

            {!isZenMode && (
              <NoteList />
            )}

            <div className={`flex-1 flex flex-col relative bg-[var(--bg-card)] ${isZenMode ? 'z-[100]' : ''}`}>
              <AnimatePresence mode="wait">
                {view === 'settings' ? (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="absolute inset-0 z-50 bg-[var(--bg-primary)]"
                  >
                    <Settings 
                      onBack={() => setView('main')}
                    />
                  </motion.div>
                ) : activeNote ? (
                  <motion.div
                    key={`editor-${activeNote.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-40 bg-[var(--bg-primary)]"
                  >
                    <Suspense fallback={<EditorSkeleton />}>
                      <Editor 
                        note={activeNote} 
                        onBack={() => setActiveNoteId(null)}
                      />
                    </Suspense>
                  </motion.div>
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
