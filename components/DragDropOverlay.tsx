'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import type { Tile, Folder } from '@/lib/types';

interface DragDropOverlayProps {
  folders: Folder[];
  activeFolderId: string | null;
  onAddTile: (tile: Tile) => void;
}

function makeTile(overrides: Partial<Tile>): Tile {
  return {
    id: crypto.randomUUID(),
    type: 'url',
    createdAt: new Date().toISOString(),
    tags: [],
    copy: '',
    ...overrides,
  };
}

export default function DragDropOverlay({
  activeFolderId,
  onAddTile,
}: DragDropOverlayProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // Only clear when cursor leaves the browser window entirely
    if (e.relatedTarget === null) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const dt = e.dataTransfer;
      if (!dt) return;

      const folderIds = activeFolderId ? [activeFolderId] : undefined;

      // File drop — handle all dropped images
      if (dt.files.length > 0) {
        const imageFiles = Array.from(dt.files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
              onAddTile(
                makeTile({
                  type: 'image',
                  imageData: ev.target?.result as string,
                  folderIds,
                })
              );
            };
            reader.readAsDataURL(file);
          });
          return;
        }
      }

      // URL drop
      const uriList = dt.getData('text/uri-list');
      const plain = dt.getData('text/plain');
      const urlString = (uriList || plain || '').trim();

      if (!urlString) return;

      // Tweet auto-detection
      if (/twitter\.com|x\.com/.test(urlString)) {
        try {
          const res = await fetch(
            `/api/tweet?url=${encodeURIComponent(urlString)}`
          );
          const data = await res.json();
          onAddTile(
            makeTile({
              type: 'tweet',
              tweetUrl: urlString,
              tweetHtml: data.html ?? '',
              folderIds,
            })
          );
        } catch {
          // Fallback to URL tile
          onAddTile(makeTile({ type: 'url', url: urlString, folderIds }));
        }
        return;
      }

      // Generic URL — fetch screenshot
      try {
        const res = await fetch(
          `/api/screenshot?url=${encodeURIComponent(urlString)}`
        );
        const data = await res.json();
        onAddTile(
          makeTile({
            type: 'url',
            url: urlString,
            screenshotUrl: data.screenshotUrl ?? undefined,
            title: data.title ?? undefined,
            favicon: data.favicon ?? undefined,
            folderIds,
          })
        );
      } catch {
        // Add without preview on failure
        onAddTile(makeTile({ type: 'url', url: urlString, folderIds }));
      }
    },
    [activeFolderId, onAddTile]
  );

  useEffect(() => {
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      animate={{ opacity: isDragOver ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 bg-white/80" />
      <motion.div
        className="absolute inset-4 border-2 border-dashed border-neutral-200 rounded-lg"
        animate={{ scale: isDragOver ? 1 : 0.97 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <p className="relative text-sm text-neutral-400 select-none">Drop to add</p>
    </motion.div>
  );
}
