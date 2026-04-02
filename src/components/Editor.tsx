import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Trash2, Maximize, Minimize, Bold, Italic, Underline, List, 
  ListOrdered, CheckSquare, Download, CheckCircle2, Loader2, Sparkles, 
  Image as ImageIcon, Upload, Link as LinkIcon, Undo2, Redo2, AlignLeft, 
  AlignCenter, AlignRight, Code, Quote, Highlighter, Clock, FileText, 
  Hash, Info, MoreVertical, Share2, Smile, Image as ImageLucide, 
  Plus as PlusIcon, Type, List as ListIcon, CheckSquare as CheckSquareIcon, 
  Table as TableIcon, Layout, Quote as QuoteIcon, Code as CodeIcon,
  ListTree, Calendar, User, ChevronRight, Search, X, Folder as FolderIcon, Feather
} from 'lucide-react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
// @ts-ignore
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Suggestion from '@tiptap/suggestion';
import { Mark, mergeAttributes, markInputRule, Extension, Node } from '@tiptap/core';
import tippy from 'tippy.js';

const Hashtag = Mark.create({
  name: 'hashtag',
  priority: 1000,
  inclusive: false,
  addAttributes() {
    return {
      class: {
        default: 'hashtag',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span.hashtag',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'hashtag' }), 0]
  },
  addInputRules() {
    return [
      markInputRule({
        find: /(?:^|\s)(#[\w-]+)$/,
        type: this.type,
      }),
    ]
  },
})

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      type: {
        default: 'info',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout', class: 'callout-block' }), 0]
  },
})

const Commands = Extension.create({
  name: 'commands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

import { Note } from '../types';
import { extractTags, getStats, vibrate, stripHtml, compressImage } from '../utils';
import { Modal } from './Modal';
import { Tooltip } from './Tooltip';
import { t } from '../i18n';
import { useFolio } from '../context/FolioContext';
import { generateNoteMetadata } from '../services/ai';
import { SlashCommandList, getSlashCommandItems } from './SlashCommand';

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
};

const ToolbarButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  icon: Icon, 
  tooltip,
  themeColor
}: { 
  onClick: () => void, 
  active?: boolean, 
  disabled?: boolean, 
  icon: any, 
  tooltip: string,
  themeColor?: string
}) => (
  <Tooltip content={tooltip} position="top">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${active ? 'bg-[var(--text-main)] text-[var(--bg-primary)] shadow-sm' : 'bg-transparent text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </button>
  </Tooltip>
);

export const Editor = ({ 
  note, 
  onBack, 
}: { 
  note?: Note, 
  onBack: () => void, 
}) => {
  const {
    updateNote,
    deleteNote,
    folders,
    prefs,
    isZenMode,
    setIsZenMode,
    setActiveFolderId,
    showToast
  } = useFolio();

  const onToggleZenMode = () => setIsZenMode(!isZenMode);

  const [title, setTitle] = useState(note?.title || '');
  const [icon, setIcon] = useState(note?.icon || '');
  const [cover, setCover] = useState(note?.cover || '');
  const [showTOC, setShowTOC] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const lang = prefs?.language || 'en';
  const noteRef = useRef(note);
  const titleRef = useRef(title);
  const iconRef = useRef(icon);
  const coverRef = useRef(cover);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const onSaveRef = useRef(updateNote);
  
  useEffect(() => {
    onSaveRef.current = updateNote;
  }, [updateNote]);

  const [isCoverInputOpen, setIsCoverInputOpen] = useState(false);
  const [isIconInputOpen, setIsIconInputOpen] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [iconEmojiInput, setIconEmojiInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension.configure(),
      TaskList.configure(),
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: t('editor.placeholder.slash', lang) }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-sm max-w-full my-6 border border-[var(--border-subtle)]',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow.configure(),
      TableHeader.configure(),
      TableCell.configure(),
      Hashtag,
      Callout,
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return getSlashCommandItems(t, lang)
              .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
              .slice(0, 10)
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(SlashCommandList, {
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },

              onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                popup.setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },

              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup.hide()
                  return true
                }
                return component.ref?.onKeyDown(props)
              },

              onExit() {
                popup.destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      setSavingState('saving');
    },
  });

  useEffect(() => {
    const handleOpenImageModal = () => setImageModalOpen(true);
    window.addEventListener('open-image-modal', handleOpenImageModal);
    return () => window.removeEventListener('open-image-modal', handleOpenImageModal);
  }, []);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    noteRef.current = note;
    titleRef.current = title;
    iconRef.current = icon;
    coverRef.current = cover;
  }, [note, title, icon, cover]);

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (noteRef.current && editorRef.current) {
        const html = editorRef.current.getHTML();
        const tags = extractTags(html);
        onSaveRef.current({ 
          ...noteRef.current, 
          title: titleRef.current, 
          content: html, 
          tags, 
          icon: iconRef.current,
          cover: coverRef.current,
          updatedAt: Date.now() 
        });
      }
    };
  }, []); // Only run on mount/unmount

  // Debounced auto-save
  useEffect(() => {
    if (!note || savingState !== 'saving') return;
    const timer = setTimeout(() => {
      const html = editor?.getHTML() || '';
      const tags = extractTags(html);
      onSaveRef.current({ 
        ...note, 
        title, 
        content: html, 
        tags, 
        icon,
        cover,
        updatedAt: Date.now() 
      });
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 2000);
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [title, icon, cover, note, editor, savingState]);

  // Also trigger save when title, icon or cover changes
  useEffect(() => {
    if (note && (title !== note.title || icon !== note.icon || cover !== note.cover)) {
      setSavingState('saving');
    }
  }, [title, icon, cover, note]);

  // Zen Mode & Save Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onToggleZenMode();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editorRef.current && noteRef.current) {
          const html = editorRef.current.getHTML();
          const tags = extractTags(html);
          onSaveRef.current({ ...noteRef.current, title: titleRef.current, content: html, tags, updatedAt: Date.now() });
          setSavingState('saved');
          setTimeout(() => setSavingState('idle'), 2000);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleTriggerMagic = () => handleMagic();
    const handleToggleTOC = () => setShowTOC(prev => !prev);
    
    window.addEventListener('trigger-magic', handleTriggerMagic);
    window.addEventListener('toggle-toc', handleToggleTOC);
    
    return () => {
      window.removeEventListener('trigger-magic', handleTriggerMagic);
      window.removeEventListener('toggle-toc', handleToggleTOC);
    };
  }, [editor, prefs]);

  const handleMagic = async () => {
    if (!editor || isMagicLoading) return;
    
    const provider = prefs.aiProvider || 'gemini';
    let apiKey = (provider === 'gemini' ? (prefs.geminiApiKey || (process.env.GEMINI_API_KEY as string)) : prefs.openaiApiKey);
    
    // Ensure apiKey is a string and not a placeholder
    if (typeof apiKey !== 'string' || !apiKey || apiKey.trim() === '' || apiKey === 'YOUR_API_KEY') {
      vibrate(50);
      showToast(t('settings.magic.key_required', lang), 'error');
      return;
    }

    const content = stripHtml(editor.getHTML());
    if (!content.trim()) return;

    setIsMagicLoading(true);
    vibrate([30, 50, 30]);

    try {
      const result = await generateNoteMetadata(content, apiKey, provider);
      
      if (result.title) {
        setTitle(result.title);
        showToast('Title and tags generated!', 'success');
      }
      if (result.tags && result.tags.length > 0) {
        const currentHtml = editor.getHTML();
        const tagsString = result.tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
        editor.commands.setContent(currentHtml + `<p>${tagsString}</p>`);
      }
      vibrate(100);
    } catch (error: any) {
      console.error("Magic failed:", error);
      showToast(error.message || 'AI generation failed', 'error');
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    // Simple HTML to Markdown conversion (basic)
    let md = editor?.getText() || '';
    if (title) md = `# ${title}\n\n${md}`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'untitled'}.md`;
    a.click();
  };

  const addImage = () => {
    setImageModalOpen(true);
  };

  const handleImageConfirm = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setImageModalOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File is too large. Please select an image smaller than 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          const compressed = await compressImage(base64);
          editor.chain().focus().setImage({ src: compressed }).run();
          setImageModalOpen(false);
        } catch (err) {
          console.error('Image compression failed:', err);
          const result = event.target?.result as string;
          editor.chain().focus().setImage({ src: result }).run();
          setImageModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File is too large. Please select an image smaller than 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          const compressed = await compressImage(base64);
          setCover(compressed);
          setIsCoverInputOpen(false);
        } catch (err) {
          console.error('Cover compression failed:', err);
          const result = event.target?.result as string;
          setCover(result);
          setIsCoverInputOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const stats = useMemo(() => getStats(note?.content || ''), [note?.content]);
  const fontSizeClass = prefs.fontSize === 'small' ? 'text-[15px]' : prefs.fontSize === 'large' ? 'text-[21px]' : 'text-[18px]';

  const activeFolder = useMemo(() => folders.find(f => f.id === note?.folderId), [folders, note?.folderId]);

  const headings = useMemo(() => {
    if (!editor) return [];
    const items: { text: string, level: number, pos: number }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        items.push({
          text: node.textContent,
          level: node.attrs.level,
          pos
        });
      }
    });
    return items;
  }, [editor?.state.doc]);

  if (!prefs) return null;
  if (!note) return <div className="flex flex-col h-full bg-[var(--bg-primary)]" />;

  return (
    <div className={`flex-1 flex flex-col h-full bg-[var(--bg-card)] transition-all duration-700 ${isZenMode ? 'fixed inset-0 z-50' : 'relative'}`}>
      <Modal 
        isOpen={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        title={t('editor.delete.title', lang)}
        actions={
          <>
            <button onClick={() => setConfirmDeleteOpen(false)} className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-all">{t('editor.delete.cancel', lang)}</button>
            <button onClick={() => deleteNote(note.id)} className="px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 bg-red-500 hover:bg-red-600">{t('editor.delete.confirm', lang)}</button>
          </>
        }
      >
        <p className="text-[var(--text-muted)] leading-relaxed">{t('editor.delete.desc', lang)}</p>
      </Modal>
      <Modal 
        isOpen={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        title={t('editor.delete.title', lang)}
        actions={
          <>
            <button onClick={() => setConfirmDeleteOpen(false)} className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-all">{t('editor.delete.cancel', lang)}</button>
            <button onClick={() => deleteNote(note.id)} className="px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 bg-red-500 hover:bg-red-600">{t('editor.delete.confirm', lang)}</button>
          </>
        }
      >
        <p className="text-[var(--text-muted)] leading-relaxed">{t('editor.delete.desc', lang)}</p>
      </Modal>

      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title={t('editor.image.title', lang)}
        actions={
          <>
            <button onClick={() => setImageModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-all">{t('editor.image.cancel', lang)}</button>
            <button onClick={handleImageConfirm} disabled={!imageUrl} className="px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale" style={imageUrl ? { backgroundColor: prefs.themeColor } : {}}>{t('editor.image.confirm', lang)}</button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <LinkIcon className="w-3 h-3" />
              {t('editor.image.url', lang)}
            </label>
            <input 
              type="text" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-5 py-4 rounded-lg bg-[var(--bg-secondary)] border border-transparent text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--theme-color)] focus:bg-[var(--bg-card)] transition-all font-medium"
              style={{ '--theme-color': prefs.themeColor } as any}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="bg-[var(--bg-card)] px-4 text-[var(--text-faint)]">Or</span>
            </div>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 rounded-lg border border-dashed border-[var(--border-subtle)] hover:border-[var(--theme-color)] hover:bg-[var(--bg-secondary)] transition-all flex flex-col items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-main)] group"
            style={{ '--theme-color': prefs.themeColor } as any}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-tight">{t('editor.image.upload', lang)}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
        </div>
      </Modal>

      {/* Header */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-4 py-2 bg-[var(--bg-card)]/80 backdrop-blur-xl z-10 sticky top-0 border-b border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-1">
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)] group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </button>
              
              <div className="flex items-center gap-0.5 text-[13px] font-medium">
                <div 
                  onClick={() => { onBack(); setActiveFolderId(null); }}
                  className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-[var(--bg-secondary)]"
                >
                  <Feather className="w-3.5 h-3.5" style={{ color: prefs.themeColor }} />
                  <span className="font-display font-bold tracking-tight">Folio</span>
                </div>
                <ChevronRight className="w-3 h-3 text-[var(--text-faint)]" />
                {activeFolder && (
                  <>
                    <div 
                      onClick={() => { onBack(); setActiveFolderId(activeFolder.id); }}
                      className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-[var(--bg-secondary)]"
                    >
                      <FolderIcon className="w-3.5 h-3.5" />
                      <span>{activeFolder.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[var(--text-faint)]" />
                  </>
                )}
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[var(--text-main)] font-bold truncate max-w-[200px]">
                  {icon && <span className="text-sm">{icon}</span>}
                  <span>{title || 'Untitled'}</span>
                </div>
              </div>
              
              <div className="w-px h-4 bg-[var(--border-subtle)] mx-2" />

              <AnimatePresence mode="wait">
                {savingState !== 'idle' ? (
                  <motion.div 
                    key={savingState}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center text-[10px] font-bold uppercase tracking-widest"
                  >
                    {savingState === 'saving' ? (
                      <span className="text-[var(--text-faint)] flex items-center"><Loader2 className="w-2.5 h-2.5 mr-1.5 animate-spin" /> {t('editor.saving', lang)}</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center"><CheckCircle2 className="w-2.5 h-2.5 mr-1.5" /> {t('editor.saved', lang)}</span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5" /> {formatDate(note.updatedAt)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-0.5">
              {prefs.enableAI && (
                <Tooltip content="Magic Metadata" position="bottom">
                  <button 
                    onClick={handleMagic}
                    disabled={isMagicLoading}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--theme-color)] hover:bg-[var(--bg-secondary)] transition-all active:scale-90 disabled:opacity-50"
                    style={{ '--theme-color': prefs.themeColor } as any}
                  >
                    {isMagicLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Table of Contents" position="bottom">
                <button 
                  onClick={() => setShowTOC(!showTOC)} 
                  className={`p-2 rounded-lg transition-all active:scale-90 ${showTOC ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                  style={showTOC ? { color: prefs.themeColor } : {}}
                >
                  <ListTree className="w-4.5 h-4.5" strokeWidth={2} />
                </button>
              </Tooltip>
              <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
              <Tooltip content="Export Markdown" position="bottom">
                <button onClick={() => { vibrate(); handleExportMarkdown(); }} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all active:scale-90">
                  <Download className="w-4.5 h-4.5" strokeWidth={2} />
                </button>
              </Tooltip>
              <Tooltip content="Zen Mode (Cmd/Ctrl + /)" position="bottom">
                <button onClick={() => { vibrate(); onToggleZenMode(); }} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all active:scale-90">
                  <Maximize className="w-4.5 h-4.5" strokeWidth={2} />
                </button>
              </Tooltip>
              <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
              <Tooltip content="Delete" position="bottom">
                <button onClick={() => { vibrate(); setConfirmDeleteOpen(true); }} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-600 transition-all active:scale-90">
                  <Trash2 className="w-4.5 h-4.5" strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Exit Button */}
      <AnimatePresence>
        {isZenMode && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.2, y: 0 }}
            whileHover={{ opacity: 0.8 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => { vibrate(); onToggleZenMode(); }}
            className="fixed top-10 right-10 z-[60] p-4 bg-[var(--bg-card)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-lg border border-[var(--border-subtle)] transition-all active:scale-90 group backdrop-blur-xl"
            title="Exit Zen Mode (Cmd/Ctrl + /)"
          >
            <Minimize className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-y-auto flex flex-col transition-all duration-700 custom-scrollbar ${isZenMode ? 'py-40 bg-[var(--bg-primary)]' : ''}`}>
          <div className={`w-full flex flex-col h-full ${isZenMode ? 'max-w-3xl mx-auto px-8' : ''}`}>
            
            {/* Cover Image */}
            {!isZenMode && (
              <div className="relative group/cover w-full h-[35vh] min-h-[250px] bg-[var(--bg-secondary)] overflow-hidden border-b border-[var(--border-subtle)]">
                {cover ? (
                  <>
                    <img 
                      src={cover} 
                      alt="Cover" 
                      className="w-full h-full object-cover transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
                    {!isCoverInputOpen ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsCoverInputOpen(true); }}
                        className="flex items-center gap-3 px-5 py-2.5 bg-[var(--bg-card)] rounded-xl shadow-sm text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-all active:scale-95"
                      >
                        <ImageLucide className="w-4 h-4" /> Add Cover Image
                      </button>
                    ) : (
                    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-card)] rounded-lg shadow-xl max-w-md w-full mx-4 z-20 border border-[var(--border-subtle)]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Cover Image Source</div>
                        
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => coverInputRef.current?.click()}
                            className="w-full py-4 rounded-lg border border-dashed border-[var(--border-subtle)] hover:border-[var(--theme-color)] hover:bg-[var(--bg-secondary)] transition-all flex flex-col items-center justify-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-main)] group"
                            style={{ '--theme-color': prefs.themeColor } as any}
                          >
                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold">Upload from device</span>
                          </button>
                          <input 
                            type="file" 
                            ref={coverInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleCoverUpload} 
                          />
                          
                          <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-[var(--border-subtle)]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-faint)]">Or URL</span>
                            </div>
                          </div>

                          <input 
                            type="text"
                            value={coverUrlInput}
                            onChange={(e) => setCoverUrlInput(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[var(--bg-secondary)] rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 transition-all border border-[var(--border-subtle)]"
                            style={{ '--tw-ring-color': prefs.themeColor } as any}
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => {
                              if (coverUrlInput) setCover(coverUrlInput);
                              setIsCoverInputOpen(false);
                              setCoverUrlInput('');
                            }}
                            className="flex-1 py-3 rounded-lg bg-[var(--text-main)] text-[var(--bg-primary)] font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setIsCoverInputOpen(false)}
                            className="flex-1 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-main)] font-bold text-sm transition-all hover:bg-[var(--bg-card)] active:scale-95 border border-[var(--border-subtle)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {cover && !isCoverInputOpen && (
                  <div className="absolute bottom-6 right-10 opacity-0 group-hover/cover:opacity-100 transition-opacity flex gap-3 z-10">
                    <button 
                      onClick={() => {
                        setCoverUrlInput(cover);
                        setIsCoverInputOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[var(--bg-card)] rounded-lg text-[11px] font-bold text-[var(--text-main)] shadow-md hover:bg-[var(--bg-secondary)] transition-all border border-[var(--border-subtle)]"
                    >
                      Change
                    </button>
                    <button 
                      onClick={() => setCover('')}
                      className="px-3 py-1.5 bg-red-500 rounded-lg text-[11px] font-bold text-white shadow-md hover:bg-red-600 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="max-w-4xl mx-auto w-full px-16 relative">
              {/* Page Icon */}
              {!isZenMode && (
                <div className="relative -mt-16 mb-10 group/icon inline-block z-20">
                  {!isIconInputOpen ? (
                    <div 
                      className={`w-32 h-32 bg-[var(--bg-card)] rounded-lg shadow-lg flex items-center justify-center text-6xl cursor-pointer hover:scale-105 transition-all border-4 border-[var(--bg-card)] ${!icon ? 'border-dashed border-[var(--border-subtle)] opacity-50' : ''}`}
                      onClick={() => setIsIconInputOpen(true)}
                    >
                      {icon || <Smile className="w-14 h-14 text-[var(--text-faint)]" />}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/icon:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-card)] px-3 py-1 rounded-full shadow-sm border border-[var(--border-subtle)]">Edit Icon</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-0 left-0 z-30 flex flex-col gap-3 p-4 bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-subtle)] w-56">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Select Emoji</div>
                      <input 
                        type="text"
                        value={iconEmojiInput}
                        onChange={(e) => setIconEmojiInput(e.target.value)}
                        placeholder="✨"
                        className="w-full bg-[var(--bg-secondary)] rounded-lg py-3 outline-none text-center text-4xl border border-[var(--border-subtle)]"
                        autoFocus
                        maxLength={2}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (iconEmojiInput) setIcon(iconEmojiInput);
                            setIsIconInputOpen(false);
                            setIconEmojiInput('');
                          }}
                          className="flex-1 py-2 bg-[var(--text-main)] text-[var(--bg-primary)] font-bold rounded-lg text-xs transition-all hover:opacity-90"
                        >
                          Set
                        </button>
                        <button 
                          onClick={() => setIsIconInputOpen(false)}
                          className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-main)] font-bold rounded-lg text-xs border border-[var(--border-subtle)] hover:bg-[var(--bg-card)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {icon && !isIconInputOpen && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIcon(''); }}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              <input
                type="text"
                placeholder={t('editor.placeholder', lang)}
                className="text-5xl font-bold tracking-tight text-[var(--text-main)] outline-none mb-2 placeholder:text-[var(--text-faint)] bg-transparent font-display w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              
              <div className="flex flex-col gap-2 mb-12 border-t border-[var(--border-subtle)] pt-8">
                <div className="grid grid-cols-[120px_1fr] items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-2 text-[var(--text-faint)] font-bold uppercase tracking-widest text-[10px] font-display">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created</span>
                  </div>
                  <div className="text-[var(--text-muted)] font-medium">
                    {formatDate(note.createdAt)}
                  </div>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-2 text-[var(--text-faint)] font-bold uppercase tracking-widest text-[10px] font-display">
                    <User className="w-3.5 h-3.5" />
                    <span>Author</span>
                  </div>
                  <div className="text-[var(--text-muted)] font-medium">
                    {prefs.name || 'Anonymous'}
                  </div>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-2 text-[var(--text-faint)] font-bold uppercase tracking-widest text-[10px] font-display">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('editor.stats.stats', lang)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[var(--text-muted)] font-medium">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 opacity-50" /> {stats.words} {t('editor.stats.words', lang)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-50" /> 
                      {stats.words > 0 
                        ? (stats.readingTime > 1 
                            ? t('editor.reading_time', lang, { min: stats.readingTime })
                            : t('editor.stats.quick_read', lang))
                        : `0 ${t('editor.stats.read', lang)}`}
                    </span>
                  </div>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4 text-[13px]">
                    <div className="flex items-center gap-2 text-[var(--text-faint)] font-bold uppercase tracking-widest text-[10px] font-display">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{t('editor.tags.label', lang)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 cursor-text pb-32" onClick={() => editor?.commands.focus()} style={{ '--theme-color': prefs.themeColor } as React.CSSProperties}>
                {editor && (
                  <BubbleMenu editor={editor} options={{ duration: 100 } as any} className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-full shadow-xl backdrop-blur-xl z-50">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded-full transition-all ${editor.isActive('bold') ? 'bg-[var(--bg-secondary)] text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded-full transition-all ${editor.isActive('italic') ? 'bg-[var(--bg-secondary)] text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={`p-1.5 rounded-full transition-all ${editor.isActive('underline') ? 'bg-[var(--bg-secondary)] text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-[var(--border-subtle)] mx-0.5"></div>
                    <button
                      onClick={() => editor.chain().focus().toggleHighlight().run()}
                      className={`p-1.5 rounded-full transition-all ${editor.isActive('highlight') ? 'bg-[var(--bg-secondary)] text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      <Highlighter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      className={`p-1.5 rounded-full transition-all ${editor.isActive('code') ? 'bg-[var(--bg-secondary)] text-[var(--theme-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </BubbleMenu>
                )}
                <EditorContent editor={editor} className={`h-full ${fontSizeClass} text-[var(--text-main)] leading-relaxed font-sans prose prose-lg dark:prose-invert max-w-none`} />
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents Sidebar */}
        <AnimatePresence>
          {showTOC && !isZenMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-[0.2em] font-display">{t('editor.toc', lang)}</h3>
                  <button 
                    onClick={() => setShowTOC(false)}
                    className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-0.5">
                  {headings.length > 0 ? (
                    headings.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          editor?.commands.focus(h.pos);
                          const element = editor?.view.nodeDOM(h.pos) as HTMLElement;
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-all hover:bg-[var(--bg-card)] hover:shadow-sm group flex items-start gap-2 ${h.level === 1 ? 'font-bold text-[var(--text-main)]' : 'text-[var(--text-muted)] font-medium'}`}
                        style={{ paddingLeft: `${(h.level - 1) * 1 + 0.75}rem` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-faint)] mt-0.5">#</span>
                        <span className="truncate">{h.text}</span>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                        <ListTree className="w-6 h-6 text-[var(--text-faint)]" />
                      </div>
                      <p className="text-[11px] text-[var(--text-faint)] italic max-w-[160px]">{t('editor.toc.empty', lang)}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Formatting Toolbar */}
      <AnimatePresence>
        {!isZenMode && editor && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: '-50%' }} 
            animate={{ y: 0, opacity: 1, x: '-50%' }} 
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="absolute bottom-10 left-1/2 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1.5 flex items-center gap-1 shadow-lg rounded-full z-50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-1 px-1 border-r border-[var(--border-subtle)] mr-1">
              <ToolbarButton 
                onClick={() => { vibrate(10); editor.chain().focus().undo().run(); }}
                disabled={!editor.can().undo()}
                icon={Undo2}
                tooltip={t('editor.undo', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                onClick={() => { vibrate(10); editor.chain().focus().redo().run(); }}
                disabled={!editor.can().redo()}
                icon={Redo2}
                tooltip={t('editor.redo', lang)}
                themeColor={prefs.themeColor}
              />
            </div>

            <div className="flex items-center gap-1 px-1">
              <ToolbarButton 
                active={editor.isActive('bold')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleBold().run(); }}
                icon={Bold}
                tooltip={t('editor.bold', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('italic')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleItalic().run(); }}
                icon={Italic}
                tooltip={t('editor.italic', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('underline')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleUnderline().run(); }}
                icon={Underline}
                tooltip={t('editor.underline', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('highlight')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleHighlight().run(); }}
                icon={Highlighter}
                tooltip={t('editor.highlight', lang)}
                themeColor={prefs.themeColor}
              />
            </div>

            <div className="w-px h-8 bg-[var(--border-subtle)] mx-1"></div>

            <div className="flex items-center gap-1 px-1">
              <ToolbarButton 
                active={editor.isActive({ textAlign: 'left' })}
                onClick={() => { vibrate(10); editor.chain().focus().setTextAlign('left').run(); }}
                icon={AlignLeft}
                tooltip={t('editor.align_left', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive({ textAlign: 'center' })}
                onClick={() => { vibrate(10); editor.chain().focus().setTextAlign('center').run(); }}
                icon={AlignCenter}
                tooltip={t('editor.align_center', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive({ textAlign: 'right' })}
                onClick={() => { vibrate(10); editor.chain().focus().setTextAlign('right').run(); }}
                icon={AlignRight}
                tooltip={t('editor.align_right', lang)}
                themeColor={prefs.themeColor}
              />
            </div>

            <div className="w-px h-8 bg-[var(--border-subtle)] mx-1"></div>

            <div className="flex items-center gap-1 px-1">
              <ToolbarButton 
                active={editor.isActive('bulletList')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleBulletList().run(); }}
                icon={List}
                tooltip={t('editor.bullet_list', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('orderedList')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleOrderedList().run(); }}
                icon={ListOrdered}
                tooltip={t('editor.ordered_list', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('taskList')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleTaskList().run(); }}
                icon={CheckSquare}
                tooltip={t('editor.task_list', lang)}
                themeColor={prefs.themeColor}
              />
            </div>

            <div className="w-px h-8 bg-[var(--border-subtle)] mx-1"></div>

            <div className="flex items-center gap-1 px-1">
              <ToolbarButton 
                active={editor.isActive('codeBlock')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleCodeBlock().run(); }}
                icon={Code}
                tooltip={t('editor.code', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                active={editor.isActive('blockquote')}
                onClick={() => { vibrate(20); editor.chain().focus().toggleBlockquote().run(); }}
                icon={Quote}
                tooltip={t('editor.blockquote', lang)}
                themeColor={prefs.themeColor}
              />
              <ToolbarButton 
                onClick={() => { vibrate(20); addImage(); }}
                icon={ImageIcon}
                tooltip={t('editor.insert_image', lang)}
                themeColor={prefs.themeColor}
              />
            </div>

            {prefs.enableAI && (
              <>
                <div className="w-px h-8 bg-[var(--border-subtle)] mx-1"></div>
                <div className="px-2">
                  <Tooltip content={(!prefs.geminiApiKey && !process.env.GEMINI_API_KEY && prefs.aiProvider === 'gemini') || (!prefs.openaiApiKey && prefs.aiProvider === 'openai') ? t('settings.magic.key_required', lang) : t('editor.magic.generate', lang)} position="top">
                    <button 
                      onClick={handleMagic}
                      disabled={isMagicLoading || ((!prefs.geminiApiKey && !process.env.GEMINI_API_KEY && prefs.aiProvider === 'gemini') || (!prefs.openaiApiKey && prefs.aiProvider === 'openai'))}
                      className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center relative group overflow-hidden ${isMagicLoading ? 'bg-[var(--bg-secondary)]' : 'hover:scale-110 active:scale-90'} ${((!prefs.geminiApiKey && !process.env.GEMINI_API_KEY && prefs.aiProvider === 'gemini') || (!prefs.openaiApiKey && prefs.aiProvider === 'openai')) ? 'grayscale opacity-50 cursor-not-allowed' : 'bg-[var(--text-main)] shadow-md'}`}
                    >
                      <Sparkles className={`w-4 h-4 ${isMagicLoading ? 'text-[var(--text-faint)] animate-pulse' : 'text-[var(--bg-primary)]'}`} />
                    </button>
                  </Tooltip>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
