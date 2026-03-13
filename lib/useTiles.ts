'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Tile } from './types';
import { loadState, fetchState, saveState } from './storage';

export function useTiles() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchState().then(state => {
      setTiles(state.tiles);
      setMounted(true);
    });
  }, []);

  const addTile = useCallback((tile: Tile) => {
    setTiles(prev => {
      const next = [tile, ...prev];
      const current = loadState();
      saveState({ ...current, tiles: next });
      return next;
    });
  }, []);

  const updateTile = useCallback((id: string, patch: Partial<Tile>) => {
    setTiles(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t));
      const current = loadState();
      saveState({ ...current, tiles: next });
      return next;
    });
  }, []);

  const deleteTile = useCallback((id: string) => {
    setTiles(prev => {
      const next = prev.filter(t => t.id !== id);
      const current = loadState();
      saveState({ ...current, tiles: next });
      return next;
    });
  }, []);

  return { tiles, addTile, updateTile, deleteTile, mounted };
}
