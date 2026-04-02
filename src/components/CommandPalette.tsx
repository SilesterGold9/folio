import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Settings, Moon, Sun, Plus, Hash, Folder as FolderIcon } from 'lucide-react';
import { t } from '../i18n';
import { useFolio } from '../context/FolioContext';

export const CommandPalette = () => {
  const {
    isCommandPaletteOpen: isOpen,
    setIsCommandPaletteOpen,
    notes,
    prefs,
    createNote,
    setActiveNoteId,
    activeFolderId,
    activeTag,
    setView,
    savePrefs
  } = useFolio();

  const onClose = () => setIsCommandPaletteOpen(false);

  const onSelectNote = (id: string) => {
    setActiveNoteId(id);
    setView('main');
    onClose();
  };

  const onCreateNote = () => {
    const id = createNote(activeFolderId, activeTag);
    setActiveNoteId(id);
    setView('main');
    onClose();
  };

  const onOpenSettings = () => {
    setView('settings');
    onClose();
  };

  const onToggleTheme = () => {
    if (prefs) {
      savePrefs({ ...prefs, darkMode: !prefs.darkMode });
    }
  };

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    if (!prefs) return [];
    const query = search.toLowerCase();
    const items: any[] = [];

    // Commands
    if ('new note'.includes(query) || query === '') {
      items.push({ type: 'command', id: 'new-note', title: 'Create New Note', icon: Plus, action: onCreateNote });
    }
    if ('settings preferences'.includes(query) || query === '') {
      items.push({ type: 'command', id: 'settings', title: 'Open Settings', icon: Settings, action: onOpenSettings });
    }
    if ('theme dark light mode'.includes(query) || query === '') {
      items.push({ type: 'command', id: 'theme', title: `Toggle ${prefs.darkMode ? 'Light' : 'Dark'} Mode`, icon: prefs.darkMode ? Sun : Moon, action: onToggleTheme });
    }

    // Notes
    const matchingNotes = notes.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));
    matchingNotes.slice(0, 10).forEach(n => {
      items.push({ type: 'note', id: n.id, title: n.title || 'Untitled Note', icon: FileText, action: () => onSelectNote(n.id) });
    });

    return items;
  }, [search, notes, prefs?.darkMode, onCreateNote, onOpenSettings, onToggleTheme, onSelectNote]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen || !prefs) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col"
        >
          <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)]">
            <Search className="w-5 h-5 text-[var(--text-faint)] mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search notes or type a command..."
              className="flex-1 bg-transparent border-none outline-none text-[16px] text-[var(--text-main)] placeholder:text-[var(--text-faint)]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-[10px] font-bold text-[var(--text-faint)] tracking-widest uppercase">
              ESC
            </div>
          </div>

          <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--text-faint)] text-[14px]">
                No results found for "{search}"
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => { item.action(); onClose(); }}
                    className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[var(--bg-secondary)] text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                  >
                    <item.icon className={`w-4 h-4 mr-3 ${isSelected ? 'text-[var(--text-main)]' : 'text-[var(--text-faint)]'}`} style={isSelected ? { color: prefs.themeColor } : {}} />
                    <span className="flex-1 text-[14px] font-medium truncate">{item.title}</span>
                    {item.type === 'command' && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-faint)] ml-2 bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">Command</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
