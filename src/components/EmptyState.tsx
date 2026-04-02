import React from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, Hash, Plus, Command } from 'lucide-react';
import { t } from '../i18n';
import { UserPreferences } from '../types';

import { useFolio } from '../context/FolioContext';

export const EmptyState: React.FC = () => {
  const { 
    prefs, 
    createNote, 
    setActiveNoteId, 
    activeFolderId, 
    activeTag, 
    setIsCommandPaletteOpen 
  } = useFolio();

  if (!prefs) return null;

  const handleCreateNote = () => {
    const id = createNote(activeFolderId, activeTag);
    setActiveNoteId(id);
  };
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="relative mb-10">
        <motion.div 
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-[3rem] bg-[var(--bg-secondary)] flex items-center justify-center shadow-2xl relative z-10"
        >
          <FileText className="w-16 h-16 text-[var(--text-faint)]" strokeWidth={1.5} />
        </motion.div>
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center animate-bounce">
          <Sparkles className="w-6 h-6" style={{ color: prefs.themeColor }} />
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center animate-pulse">
          <Hash className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4 font-display tracking-tight">
        {t('main.empty.title', prefs.language)}
      </h2>
      <p className="text-[var(--text-muted)] max-w-md mb-10 leading-relaxed font-medium">
        {t('main.empty.desc', prefs.language)}
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button 
          onClick={handleCreateNote}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] transition-all group premium-card"
        >
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" style={{ color: prefs.themeColor }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('main.new_note', prefs.language)}</span>
        </button>
        
        <button 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] transition-all group premium-card"
        >
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Command className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('main.search', prefs.language)}</span>
        </button>
      </div>

      <div className="mt-16 flex items-center gap-6 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-[0.2em]">
        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Local First</span>
        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> AI Powered</span>
        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Zen Mode</span>
      </div>
    </motion.div>
  );
};
