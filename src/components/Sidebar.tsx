import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Folder as FolderIcon, Hash, Flame, Plus, Trash2, User, LogOut, Sparkles, Search, ChevronRight, PanelLeftClose, MoreVertical, Feather } from 'lucide-react';
import { Folder, UserPreferences, Note } from '../types';
import { getGreeting, shortenName, getLast7DaysActivity } from '../utils';
import { t } from '../i18n';
import { Tooltip } from './Tooltip';

import { useFolio } from '../context/FolioContext';

export const Sidebar = () => {
  const {
    folders,
    createFolder,
    deleteFolder,
    prefs,
    streak,
    allTags,
    notes,
    activeFolderId,
    setActiveFolderId: onSelectFolder,
    activeTag,
    setActiveTag: onSelectTag,
    setView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsCommandPaletteOpen,
    createNote,
    setActiveNoteId
  } = useFolio();

  const onOpenSettings = () => setView('settings');

  if (!prefs) return null;

  const lang = prefs.language;
  const greeting = t(`sidebar.greeting.${getGreeting()}`, lang);
  const shortName = shortenName(prefs.name);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');

  const activity = useMemo(() => getLast7DaysActivity(notes), [notes]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 0 : 256, opacity: isSidebarCollapsed ? 0 : 1 }}
      className="border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col h-full overflow-hidden relative"
    >
      <div className="p-6 flex items-center justify-between">
        <div 
          onClick={() => { onSelectFolder(null); onSelectTag(null); setView('main'); }}
          className="flex items-center gap-2 cursor-pointer group/logo"
        >
          <div 
            className="w-8 h-8 rounded-[0.75rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover/logo:scale-110"
            style={{ backgroundColor: prefs.themeColor, boxShadow: `0 8px 16px -4px ${prefs.themeColor}40` }}
          >
            <Feather className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-[var(--text-main)] font-display">Folio</h1>
        </div>
        {!isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-2 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-faint)] hover:text-[var(--text-main)] transition-all"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 px-4 pb-6 space-y-8 overflow-y-auto custom-scrollbar">
        {/* User Greeting */}
        <div className="px-2">
          <h2 className="text-2xl font-bold text-[var(--text-main)] leading-tight font-display">
            {greeting},<br />
            <span style={{ color: prefs.themeColor }}>{shortName || t('common.user', lang)}</span>
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          <button 
            onClick={() => {
              const newNoteId = createNote(activeFolderId, activeTag);
              setActiveNoteId(newNoteId);
              setView('main');
            }}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--bg-card)] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-medium">{t('sidebar.new_note', lang)}</span>
          </button>

          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all group"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--bg-card)] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-medium">{t('sidebar.search', lang)}</span>
            <div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[9px] font-bold opacity-50">
              <span className="text-[10px]">⌘</span>K
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <button 
            onClick={() => { onSelectFolder(null); onSelectTag(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-md transition-all group ${activeFolderId === null && activeTag === null ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'}`}
          >
            <FolderIcon className="w-4 h-4 mr-3" />
            <span className="text-[13px] font-medium">{t('sidebar.all_notes', lang)}</span>
          </button>
          
          <button 
            onClick={() => setView('settings')}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all group"
          >
            <SettingsIcon className="w-4 h-4 mr-3" />
            <span className="text-[13px] font-medium">{t('sidebar.settings', lang)}</span>
          </button>
        </div>

        {/* Folders Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-3 group/header">
            <h3 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest font-display">{t('sidebar.folders', lang)}</h3>
            <button 
              onClick={() => setIsCreating(true)} 
              className="p-1 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-faint)] hover:text-[var(--text-main)] transition-all opacity-0 group-hover/header:opacity-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-1">
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`group relative w-full flex items-center px-3 py-2 rounded-md cursor-pointer transition-all ${activeFolderId === folder.id ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'}`}
                onClick={() => { onSelectFolder(folder.id); onSelectTag(null); }}
              >
                <FolderIcon className="w-4 h-4 mr-3" style={activeFolderId === folder.id ? { color: prefs.themeColor } : {}} />
                <span className="text-[13px] font-medium truncate pr-6">{folder.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  className="absolute right-2 p-1 rounded-md text-[var(--text-faint)] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {isCreating && (
              <form onSubmit={handleCreateRequest} className="px-3 py-1">
                <input 
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t('sidebar.new_folder.placeholder', lang)}
                  className="w-full outline-none text-[13px] text-[var(--text-main)] placeholder:text-[var(--text-faint)] bg-transparent border-b border-[var(--theme-color)] py-1"
                  autoFocus
                  onBlur={() => {
                    if(!newFolderName.trim()) setIsCreating(false);
                  }}
                  style={{ '--theme-color': prefs.themeColor } as any}
                />
              </form>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="px-3 mb-3">
              <h3 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest font-display">{t('sidebar.tags', lang)}</h3>
            </div>
            <div className="flex flex-wrap gap-2 px-3">
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => { onSelectTag(tag); onSelectFolder(null); }}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${activeTag === tag ? 'bg-[var(--text-main)] text-[var(--bg-primary)] shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-card)] transition-all group cursor-default">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-main)] font-bold text-sm border border-[var(--border-subtle)]">
              {prefs.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[var(--text-main)] font-display">{shortName || t('common.user', lang)}</span>
            </div>
          </div>
          <button 
            onClick={() => setView('settings')}
            className="p-2 rounded-md text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
