import { useState, useEffect, useCallback } from 'react';
import { Folder } from '../types';
import { safeLocalStorage } from '../utils';
import { STORAGE_KEYS } from '../constants';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const savedFolders = safeLocalStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (e) {
        setFolders([]);
      }
    }
  }, []);

  const saveFolders = useCallback((newFolders: Folder[]) => {
    setFolders(newFolders);
    safeLocalStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(newFolders));
  }, []);

  const createFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 9),
      name
    };
    setFolders(prev => {
      const updated = [...prev, newFolder];
      safeLocalStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(updated));
      return updated;
    });
    return newFolder.id;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => {
      const updated = prev.filter(f => f.id !== id);
      safeLocalStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    folders,
    setFolders,
    saveFolders,
    createFolder,
    deleteFolder,
  };
}
