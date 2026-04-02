import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Heading1, Heading2, List, CheckSquare, Quote, Code, 
  Image as ImageIcon, Sparkles, Trash2, Info, Minus,
  Table as TableIcon, Type
} from 'lucide-react';

export const SlashCommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden min-w-[240px] p-1.5 animate-in fade-in zoom-in duration-150 max-h-[400px] overflow-y-auto custom-scrollbar">
      <div className="px-3 py-2 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-[0.2em]">Basic Blocks</div>
      {props.items.map((item: any, index: number) => (
        <button
          key={index}
          onClick={() => selectItem(index)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${index === selectedIndex ? 'bg-[var(--bg-secondary)] shadow-sm' : 'hover:bg-[var(--bg-secondary)]'}`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color || 'bg-[var(--bg-secondary)]'} ${item.textColor || 'text-[var(--text-main)]'}`}>
            <item.icon className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text-main)]">{item.title}</span>
            <span className="text-[10px] text-[var(--text-faint)]">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandList.displayName = 'SlashCommandList';

export const getSlashCommandItems = (t: any, lang: string) => [
  {
    title: t('editor.slash.text.title', lang),
    description: t('editor.slash.text.desc', lang),
    icon: Type,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('paragraph').run();
    },
    color: 'bg-gray-500/10',
    textColor: 'text-gray-500',
  },
  {
    title: t('editor.slash.h1.title', lang),
    description: t('editor.slash.h1.desc', lang),
    icon: Heading1,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
    color: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  },
  {
    title: t('editor.slash.h2.title', lang),
    description: t('editor.slash.h2.desc', lang),
    icon: Heading2,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
    color: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  },
  {
    title: t('editor.slash.list.title', lang),
    description: t('editor.slash.list.desc', lang),
    icon: List,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
    color: 'bg-purple-500/10',
    textColor: 'text-purple-500',
  },
  {
    title: t('editor.slash.todo.title', lang),
    description: t('editor.slash.todo.desc', lang),
    icon: CheckSquare,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
    color: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
  },
  {
    title: t('editor.slash.quote.title', lang),
    description: t('editor.slash.quote.desc', lang),
    icon: Quote,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
    color: 'bg-amber-500/10',
    textColor: 'text-amber-500',
  },
  {
    title: t('editor.slash.callout.title', lang),
    description: t('editor.slash.callout.desc', lang),
    icon: Info,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('callout').run();
    },
    color: 'bg-indigo-500/10',
    textColor: 'text-indigo-500',
  },
  {
    title: t('editor.slash.table.title', lang),
    description: t('editor.slash.table.desc', lang),
    icon: TableIcon,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
    color: 'bg-cyan-500/10',
    textColor: 'text-cyan-500',
  },
  {
    title: t('editor.slash.divider.title', lang),
    description: t('editor.slash.divider.desc', lang),
    icon: Minus,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
    color: 'bg-gray-500/10',
    textColor: 'text-gray-500',
  },
  {
    title: t('editor.slash.code.title', lang),
    description: t('editor.slash.code.desc', lang),
    icon: Code,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
    color: 'bg-slate-500/10',
    textColor: 'text-slate-500',
  },
  {
    title: t('editor.slash.image.title', lang),
    description: t('editor.slash.image.desc', lang),
    icon: ImageIcon,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      window.dispatchEvent(new CustomEvent('open-image-modal'));
    },
    color: 'bg-orange-500/10',
    textColor: 'text-orange-500',
  },
  {
    title: t('editor.slash.magic.title', lang),
    description: t('editor.slash.magic.desc', lang),
    icon: Sparkles,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      window.dispatchEvent(new CustomEvent('trigger-magic'));
    },
    color: 'bg-pink-500/10',
    textColor: 'text-pink-500',
  },
  {
    title: t('editor.slash.toc.title', lang),
    description: t('editor.slash.toc.desc', lang),
    icon: List,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      window.dispatchEvent(new CustomEvent('toggle-toc'));
    },
    color: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
  },
];
