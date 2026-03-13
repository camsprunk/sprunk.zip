'use client';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X, Check } from 'lucide-react';
import type { Tile, Folder, TileType } from '@/lib/types';

interface AddTileModalProps {
  folders: Folder[];
  activeFolderId: string | null;
  onAdd: (tile: Tile) => void;
  onClose: () => void;
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

const TYPES: { id: TileType; label: string }[] = [
  { id: 'url', label: 'URL' },
  { id: 'image', label: 'Image' },
  { id: 'color', label: 'Color' },
  { id: 'text', label: 'Text' },
  { id: 'tweet', label: 'Tweet' },
];

export default function AddTileModal({
  folders,
  activeFolderId,
  onAdd,
  onClose,
}: AddTileModalProps) {
  const [type, setType] = useState<TileType>('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [folderIds, setFolderIds] = useState<string[]>(activeFolderId ? [activeFolderId] : []);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const toggleFolder = (id: string) =>
    setFolderIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const [urlInput, setUrlInput] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('#e5e7eb');
  const [textInput, setTextInput] = useState('');
  const [tweetUrlInput, setTweetUrlInput] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      setContentHeight(h);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-focus the relevant input when switching tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (type === 'url' || type === 'tweet') urlInputRef.current?.focus();
      else if (type === 'text') textareaRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [type]);

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

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setImagePreviews(prev => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError('');

    if (type === 'url' && !urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (type === 'image' && !imagePreviews.length) {
      setError('Please select an image');
      return;
    }
    if (type === 'text' && !textInput.trim()) {
      setError('Please enter some text');
      return;
    }
    if (type === 'tweet' && !tweetUrlInput.trim()) {
      setError('Please enter a tweet URL');
      return;
    }

    setLoading(true);
    try {
      const tilefolderIds = folderIds.length ? folderIds : undefined;

      if (type === 'url') {
        const res = await fetch(`/api/screenshot?url=${encodeURIComponent(urlInput.trim())}`);
        const data = await res.json();
        onAdd(
          makeTile({
            type: 'url',
            url: urlInput.trim(),
            screenshotUrl: data.screenshotUrl ?? undefined,
            title: data.title ?? undefined,
            favicon: data.favicon ?? undefined,
            folderIds: tilefolderIds,
          })
        );
      } else if (type === 'image') {
        imagePreviews.forEach(imageData =>
          onAdd(makeTile({ type: 'image', imageData, folderIds: tilefolderIds }))
        );
      } else if (type === 'color') {
        onAdd(makeTile({ type: 'color', color: colorInput, folderIds: tilefolderIds }));
      } else if (type === 'text') {
        onAdd(makeTile({ type: 'text', text: textInput.trim(), folderIds: tilefolderIds }));
      } else if (type === 'tweet') {
        const res = await fetch(`/api/tweet?url=${encodeURIComponent(tweetUrlInput.trim())}`);
        const data = await res.json();
        onAdd(
          makeTile({
            type: 'tweet',
            tweetUrl: tweetUrlInput.trim(),
            tweetHtml: data.html ?? '',
            folderIds: tilefolderIds,
          })
        );
      }
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/10 flex items-start justify-center pt-[28vh] z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white border border-border rounded-2xl w-full max-w-sm mx-4 shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — static, never animated */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">Add tile</span>
          <button
            className="text-neutral-300 hover:text-neutral-700 text-lg leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Height-animated wrapper — drives card expansion without affecting header */}
        <motion.div
          animate={{ height: contentHeight }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
        <div ref={contentRef} className="p-4">
          {/* Type tabs */}
          <div className="flex gap-1 mb-3">
            {TYPES.map(t => (
              <button
                key={t.id}
                className="relative text-xs px-2.5 py-1 rounded"
                onClick={() => setType(t.id)}
              >
                {type === t.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-neutral-900 rounded"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${
                  type === t.id ? 'text-white' : 'text-neutral-400 hover:text-neutral-700'
                }`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Type-specific inputs — all kept mounted, each animates its own height+opacity */}

          {/* URL / Tweet */}
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            animate={{
              height: (type === 'url' || type === 'tweet') ? 'auto' : 0,
              opacity: (type === 'url' || type === 'tweet') ? 1 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="relative">
              <input
                ref={urlInputRef}
                className="block w-full text-sm border border-border rounded-lg px-4 py-2 focus:outline-none placeholder:text-transparent bg-transparent relative z-10"
                value={type === 'url' ? urlInput : tweetUrlInput}
                onChange={e => type === 'url' ? setUrlInput(e.target.value) : setTweetUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                tabIndex={(type === 'url' || type === 'tweet') ? 0 : -1}
              />
              <AnimatePresence mode="wait" initial={false}>
                {!(type === 'url' ? urlInput : tweetUrlInput) && (type === 'url' || type === 'tweet') && (
                  <motion.span
                    key={type}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-300 pointer-events-none select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {type === 'url' ? 'https://example.com' : 'https://x.com/user/status/...'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: type === 'image' ? 'auto' : 0,
              opacity: type === 'image' ? 1 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-1.5">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreviews(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} strokeWidth={2.5} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label
                className={`flex w-full border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-neutral-300 transition-[height] duration-200 items-center justify-center ${
                  imagePreviews.length > 0 ? 'h-9' : 'h-32'
                }`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  Array.from(e.dataTransfer.files)
                    .filter(f => f.type.startsWith('image/'))
                    .forEach(handleImageFile);
                }}
              >
                <span className="text-xs text-neutral-300 select-none">
                  {imagePreviews.length > 0 ? 'Add more…' : 'Click or drag images here'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => {
                    Array.from(e.target.files ?? []).forEach(handleImageFile);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </motion.div>

          {/* Color */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: type === 'color' ? 'auto' : 0,
              opacity: type === 'color' ? 1 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-border block flex-shrink-0 appearance-none p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[7px] [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-[7px]"
                tabIndex={type === 'color' ? 0 : -1}
              />
              <input
                className="flex-1 text-sm border border-border rounded-lg px-4 py-2 focus:outline-none"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                placeholder="#e5e7eb"
                tabIndex={type === 'color' ? 0 : -1}
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: type === 'text' ? 'auto' : 0,
              opacity: type === 'text' ? 1 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <textarea
              ref={textareaRef}
              className="block w-full text-sm border border-border rounded-lg px-4 py-2 focus:outline-none h-28 resize-none placeholder:text-neutral-300"
              placeholder="Your note…"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              tabIndex={type === 'text' ? 0 : -1}
            />
          </motion.div>

          {/* Folder picker */}
          {folders.length > 0 && (
            <div ref={folderRef} className="mt-3 mb-3">
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
                className="w-full text-sm border border-border rounded-lg px-4 py-2 text-left flex items-center justify-between text-neutral-400 hover:border-neutral-300 transition-colors focus:outline-none"
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

          {error && <p className="text-xs text-red-400 mt-3 mb-3">{error}</p>}

          <div className="mt-3 flex gap-2">
            <motion.button
              className="flex-1 text-xs font-semibold bg-neutral-900 text-white py-2.5 rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors"
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? 'Adding…' : 'Add'}
            </motion.button>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
