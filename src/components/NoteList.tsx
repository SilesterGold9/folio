import React, { useMemo, useState, memo } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, X, Folder as FolderIcon, Trash2, Clock } from 'lucide-react';
import { Note, Folder, UserPreferences } from '../types';
import { formatDate, stripHtml } from '../utils';
import { Tooltip } from './Tooltip';
import { t } from '../i18n';
import { useDebounce } from '../hooks/useDebounce';

const NoteCard = memo(({ 
  note, 
  isActive, 
  onSelect, 
  onDelete, 
  themeColor, 
  folderName, 
  lang 
}: { 
  note: Note; 
  isActive: boolean; 
  onSelect: (id: string) => void; 
  onDelete: (id: string) => void; 
  themeColor: string; 
  folderName?: string;
  lang: string;
}) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onSelect(note.id)}
    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${isActive ? 'bg-[var(--bg-card)] shadow-md z-10' : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border-transparent'}`}
    style={isActive ? { borderColor: themeColor } : {}}
  >
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-bold text-[15px] leading-tight transition-colors font-display ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-main)]/80 group-hover:text-[var(--text-main)]'}`}>
          {note.title || t('common.untitled', lang as any)}
        </h3>
      </div>
      
      <p className="text-[var(--text-muted)] text-[12px] line-clamp-2 leading-relaxed font-medium">
        {stripHtml(note.content) || 'No content...'}
      </p>
      
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-3 text-[9px] font-bold text-[var(--text-faint)] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatDate(note.updatedAt)}
          </span>
          {folderName && (
            <span className="flex items-center gap-1 max-w-[80px]">
              <FolderIcon className="w-2.5 h-2.5" />
              <span className="truncate">{folderName}</span>
            </span>
          )}
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map(tag => (
              <div key={tag} className="w-1 h-1 rounded-full" style={{ backgroundColor: themeColor }} />
            ))}
          </div>
        )}
      </div>
    </div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(note.id);
      }}
      className="absolute -top-1.5 -right-1.5 p-1.5 rounded-lg bg-red-500 text-white shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-20"
    >
      <Trash2 className="w-3 h-3" strokeWidth={2.5} />
    </button>
  </motion.div>
));

NoteCard.displayName = 'NoteCard';

import { useFolio } from '../context/FolioContext';

export const NoteList = () => {
  const {
    notes,
    folders,
    deleteNote,
    prefs,
    activeFolderId,
    activeTag,
    activeNoteId,
    setActiveNoteId: onSelectNote,
    createNote,
    setView
  } = useFolio();

  const onCreateNote = () => {
    const id = createNote(activeFolderId, activeTag);
    onSelectNote(id);
    setView('main');
  };

  if (!prefs) return null;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const lang = prefs.language;

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (activeFolderId) {
      filtered = filtered.filter(n => n.folderId === activeFolderId);
    }
    if (activeTag) {
      filtered = filtered.filter(n => n.tags && n.tags.includes(activeTag));
    }
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(s) || 
        n.content.toLowerCase().includes(s) ||
        (n.tags && n.tags.some(tag => tag.toLowerCase().includes(s)))
      );
    }
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, activeFolderId, activeTag, debouncedSearch]);

  const folderName = activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : null;

  return (
    <div className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col h-full overflow-hidden">
      <div className="p-6 flex flex-col gap-6 bg-[var(--bg-primary)]/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-2xl text-[var(--text-main)] font-display tracking-tight">
              {activeTag ? activeTag : folderName ? folderName : t('main.all_notes', lang)}
            </h2>
            <p className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-[0.2em] mt-1">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
            </p>
          </div>
          <Tooltip content="New Note (Cmd/Ctrl + N)" position="bottom">
            <button 
              onClick={onCreateNote}
              className="w-9 h-9 rounded-xl text-white shadow-md transition-all active:scale-90 flex items-center justify-center hover:brightness-110"
              style={{ backgroundColor: prefs.themeColor }}
            >
              <Plus className="w-4.5 h-4.5" strokeWidth={3} />
            </button>
          </Tooltip>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-[var(--text-faint)] group-focus-within:text-[var(--theme-color)] transition-colors" style={{ '--theme-color': prefs.themeColor } as any} />
          </div>
          <input 
            id="global-search-input"
            type="text" 
            placeholder={`${t('main.search', lang)}...`}
            className="w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-[var(--text-main)] placeholder:text-[var(--text-faint)] outline-none focus:bg-[var(--bg-card)] focus:border-[var(--theme-color)] focus:shadow-sm transition-all font-medium"
            style={{ '--theme-color': prefs.themeColor } as any}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute inset-y-0 right-3 flex items-center px-1 text-[var(--text-faint)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 opacity-50">
              <Search className="w-8 h-8 text-[var(--text-faint)]" />
            </div>
            <p className="text-[var(--text-main)] font-bold text-lg mb-1">{t('main.search.empty', lang, { search: '' }).replace('"', '').replace('"', '').trim()}</p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {search ? `No results found for "${search}"` : t('folder.empty.desc', lang)}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard 
              key={note.id}
              note={note}
              isActive={activeNoteId === note.id}
              onSelect={onSelectNote}
              onDelete={deleteNote}
              themeColor={prefs.themeColor}
              folderName={note.folderId && !activeFolderId ? folders.find(f => f.id === note.folderId)?.name : undefined}
              lang={lang}
            />
          ))
        )}
      </div>
    </div>
  );
};
