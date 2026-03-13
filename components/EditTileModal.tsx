'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronDown, X, Check } from 'lucide-react';
import type { Tile, Folder } from '@/lib/types';

interface EditTileModalProps {
  tile: Tile;
  folders: Folder[];
  onUpdate: (patch: Partial<Tile>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditTileModal({
  tile,
  folders,
  onUpdate,
  onDelete,
  onClose,
}: EditTileModalProps) {
  const [copy, setCopy] = useState(tile.copy);
  const [folderIds, setFolderIds] = useState<string[]>(
    tile.folderIds ?? (tile.folderId ? [tile.folderId] : [])
  );
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const toggleFolder = (id: string) =>
    setFolderIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  useEffect(() => {
    if (!folderDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(e.target as Node)) {
        setFolderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [folderDropdownOpen]);
  const [draftThumbnail, setDraftThumbnail] = useState<string | undefined>(tile.screenshotUrl);

  const handleThumbnailFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setDraftThumbnail(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    onUpdate({
      copy,
      folderIds: folderIds.length ? folderIds : undefined,
      folderId: undefined,
      ...(tile.type === 'url' ? { screenshotUrl: draftThumbnail } : {}),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white border border-border rounded-2xl w-full max-w-sm mx-4 shadow-xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium capitalize text-neutral-700">
            Edit
          </span>
          <button
            className="text-neutral-300 hover:text-neutral-700 text-lg leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Thumbnail upload — URL tiles only */}
          {tile.type === 'url' && (
            <label className="block cursor-pointer group/thumb">
              {draftThumbnail ? (
                <div className="relative w-full h-32 overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draftThumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      Replace thumbnail
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-1.5 text-sm text-neutral-300 hover:border-neutral-300 hover:text-neutral-400 transition-colors">
                  <Plus size={14} strokeWidth={1.75} />
                  Upload thumbnail
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleThumbnailFile(f); }}
              />
            </label>
          )}

          <textarea
            autoFocus
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none h-24 resize-none placeholder:text-neutral-300"
            placeholder="Add a note or caption..."
            value={copy}
            onChange={e => setCopy(e.target.value)}
          />

          {folders.length > 0 && (
            <div ref={folderRef}>
              {/* Selected chips */}
              {folderIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {folderIds.map(id => {
                    const f = folders.find(fo => fo.id === id);
                    return f ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md"
                      >
                        {f.name}
                        <button
                          type="button"
                          onClick={() => toggleFolder(id)}
                          className="flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setFolderDropdownOpen(o => !o)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 text-left flex items-center justify-between text-neutral-400 hover:border-neutral-300 transition-colors focus:outline-none"
              >
                <span>Add to folder…</span>
                <motion.div animate={{ rotate: folderDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} strokeWidth={1.75} />
                </motion.div>
              </button>

              {/* Inline folder list */}
              <AnimatePresence>
                {folderDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="mt-1 border border-border rounded-lg overflow-y-auto max-h-48"
                  >
                    {folders.map((f, i) => {
                      const sel = folderIds.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFolder(f.id)}
                          className={`w-full text-left text-xs px-3 py-2.5 flex items-center justify-between transition-colors ${
                            i > 0 ? 'border-t border-border' : ''
                          } ${sel ? 'text-neutral-900 bg-neutral-50' : 'text-neutral-500 hover:bg-neutral-50'}`}
                        >
                          {f.name}
                          {sel && <Check size={12} strokeWidth={2.5} className="text-neutral-700 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <motion.button
              className="flex-1 text-xs font-semibold bg-red-50 text-red-500 py-2.5 rounded-lg hover:bg-red-100 transition-colors"
              whileTap={{ scale: 0.97 }}
              onClick={handleDelete}
            >
              Delete
            </motion.button>
            <motion.button
              className="flex-1 text-xs font-semibold bg-neutral-900 text-white py-2.5 rounded-lg hover:bg-neutral-700 transition-colors"
              whileTap={{ scale: 0.97 }}
              onClick={save}
            >
              Save
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
