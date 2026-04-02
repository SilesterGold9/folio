import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../types';
import { safeLocalStorage, calculateStreak } from '../utils';
import { STORAGE_KEYS } from '../constants';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const savedNotes = safeLocalStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    safeLocalStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
  }, []);

  const createNote = useCallback((activeFolderId: string | null, activeTag: string | null) => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      content: '',
      folderId: activeFolderId,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      tags: activeTag ? [activeTag] : []
    };
    setNotes(prev => {
      const updated = [newNote, ...prev];
      safeLocalStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return updated;
    });
    return newNote.id;
  }, []);

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      updated.sort((a, b) => b.updatedAt - a.updatedAt);
      safeLocalStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      safeLocalStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const streak = useMemo(() => calculateStreak(notes), [notes]);
  const allTags = useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags || []))), [notes]);

  return {
    notes,
    setNotes,
    saveNotes,
    createNote,
    updateNote,
    deleteNote,
    streak,
    allTags,
  };
}
