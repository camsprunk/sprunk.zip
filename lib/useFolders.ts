'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Folder } from './types';
import { loadState, fetchState, saveState } from './storage';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    fetchState().then(state => {
      setFolders(state.folders);
    });
  }, []);

  const addFolder = useCallback((name: string): Folder => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => {
      const next = [...prev, folder];
      const current = loadState();
      saveState({ ...current, folders: next });
      return next;
    });
    return folder;
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => {
      const next = prev.map(f => (f.id === id ? { ...f, name: name.trim() } : f));
      const current = loadState();
      saveState({ ...current, folders: next });
      return next;
    });
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => {
      const next = prev.filter(f => f.id !== id);
      const current = loadState();
      saveState({ ...current, folders: next });
      return next;
    });
  }, []);

  return { folders, addFolder, renameFolder, deleteFolder };
}
