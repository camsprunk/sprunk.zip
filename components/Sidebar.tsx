'use client';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Folder } from '@/lib/types';
import FlowerLogo from '@/components/FlowerLogo';

interface SidebarProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export default function Sidebar({
  folders,
  activeFolderId,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
}: SidebarProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const commitAdd = () => {
    if (newName.trim()) onAddFolder(newName.trim());
    setNewName('');
    setAdding(false);
  };

  const commitRename = () => {
    if (renamingId && renameDraft.trim()) {
      onRenameFolder(renamingId, renameDraft.trim());
    }
    setRenamingId(null);
  };

  const navItemClass = (active: boolean) =>
    `w-full text-left py-0.5 text-sm transition-colors ${
      active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
    }`;

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* ── Logo — single fixed element, always visible at all breakpoints ── */}
      <div className="fixed top-4 left-5 z-50 select-none">
        <FlowerLogo className="h-6 w-auto text-neutral-400" />
      </div>

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-[200px] flex-shrink-0 h-full flex-col overflow-y-auto px-5">
        {/* Spacer so nav clears the fixed logo above */}
        <div className="pt-14" />

        <nav className="flex-1 space-y-0">
          <button
            className={navItemClass(activeFolderId === null)}
            onClick={() => onSelectFolder(null)}
          >
            All
          </button>

          {sortedFolders.map(folder => (
            <div key={folder.id} className="group flex items-center">
              {renamingId === folder.id ? (
                <input
                  autoFocus
                  className="flex-1 text-sm py-1 border-b border-neutral-300 focus:outline-none bg-transparent"
                  value={renameDraft}
                  onChange={e => setRenameDraft(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                />
              ) : (
                <>
                  <button
                    className={navItemClass(activeFolderId === folder.id) + ' flex-1 truncate'}
                    onClick={() => onSelectFolder(folder.id)}
                  >
                    {folder.name}
                  </button>
                  <div className="hidden group-hover:flex gap-1 flex-shrink-0">
                    <button
                      className="text-neutral-300 hover:text-neutral-600 transition-colors p-0.5"
                      title="Rename"
                      onClick={() => {
                        setRenamingId(folder.id);
                        setRenameDraft(folder.name);
                      }}
                    >
                      <Pencil size={13} strokeWidth={1.75} />
                    </button>
                    <button
                      className="text-neutral-300 hover:text-red-400 transition-colors p-0.5"
                      title="Delete folder"
                      onClick={() => onDeleteFolder(folder.id)}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="pb-6 pt-3">
          {adding ? (
            <input
              autoFocus
              className="w-full text-sm bg-transparent border-b border-neutral-300 py-1 focus:outline-none placeholder:text-neutral-300"
              placeholder="Folder name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={commitAdd}
              onKeyDown={e => {
                if (e.key === 'Enter') commitAdd();
                if (e.key === 'Escape') {
                  setAdding(false);
                  setNewName('');
                }
              }}
            />
          ) : (
            <button
              className="text-sm text-neutral-700 hover:text-neutral-500 transition-colors"
              onClick={() => setAdding(true)}
            >
              + New folder
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile floating menu (hidden on md+) ── */}
      <div className="md:hidden">
        <motion.button
          onClick={() => setMobileOpen(v => !v)}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-neutral-700"
          style={{ backgroundColor: '#F7F7F7' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          aria-label="Open navigation"
        >
          <motion.svg
            width="17" height="17" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeLinecap="round"
            strokeWidth="1.75"
          >
            {/* Top line → first X diagonal */}
            <motion.line
              animate={mobileOpen
                ? { x1: 18, y1: 6, x2: 6, y2: 18 }
                : { x1: 4,  y1: 6, x2: 20, y2: 6  }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* Middle line → fades out */}
            <motion.line
              x1="4" y1="12" x2="20" y2="12"
              animate={{ opacity: mobileOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Bottom line → second X diagonal */}
            <motion.line
              animate={mobileOpen
                ? { x1: 6,  y1: 6, x2: 18, y2: 18 }
                : { x1: 4,  y1: 18, x2: 20, y2: 18 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Dismiss backdrop */}
              <motion.div
                className="fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                className="fixed top-16 right-4 z-50 bg-white border border-neutral-100 rounded-xl shadow-lg px-4 py-3 min-w-[160px]"
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <nav className="space-y-0">
                  <button
                    className={navItemClass(activeFolderId === null)}
                    onClick={() => { onSelectFolder(null); setMobileOpen(false); }}
                  >
                    All
                  </button>
                  {sortedFolders.map(folder => (
                    <button
                      key={folder.id}
                      className={navItemClass(activeFolderId === folder.id) + ' truncate block max-w-[180px]'}
                      onClick={() => { onSelectFolder(folder.id); setMobileOpen(false); }}
                    >
                      {folder.name}
                    </button>
                  ))}
                </nav>

                <div className="pt-2 mt-1 border-t border-neutral-100">
                  {adding ? (
                    <input
                      autoFocus
                      className="w-full text-sm bg-transparent border-b border-neutral-300 py-1 focus:outline-none placeholder:text-neutral-300"
                      placeholder="Folder name"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onBlur={commitAdd}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitAdd();
                        if (e.key === 'Escape') {
                          setAdding(false);
                          setNewName('');
                        }
                      }}
                    />
                  ) : (
                    <button
                      className="text-sm text-neutral-700 hover:text-neutral-500 transition-colors"
                      onClick={() => setAdding(true)}
                    >
                      + New folder
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
