'use client';
import { useState } from 'react';
import { useTiles } from '@/lib/useTiles';
import { useFolders } from '@/lib/useFolders';
import Sidebar from '@/components/Sidebar';
import Grid from '@/components/Grid';
import AddTileModal from '@/components/AddTileModal';
import EditTileModal from '@/components/EditTileModal';
import DragDropOverlay from '@/components/DragDropOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

export default function Page() {
  const { tiles, addTile, updateTile, deleteTile, mounted } = useTiles();
  const { folders, addFolder, renameFolder, deleteFolder } = useFolders();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTileId, setEditingTileId] = useState<string | null>(null);

  const editingTile = editingTileId
    ? tiles.find(t => t.id === editingTileId) ?? null
    : null;

  const visibleTiles = activeFolderId
    ? tiles.filter(t =>
        t.folderIds
          ? t.folderIds.includes(activeFolderId)
          : t.folderId === activeFolderId
      )
    : tiles;

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    // Unassign tiles that belonged to this folder (handles both legacy folderId and new folderIds)
    tiles
      .filter(t => t.folderIds ? t.folderIds.includes(id) : t.folderId === id)
      .forEach(t => updateTile(t.id, {
        folderIds: t.folderIds?.filter(f => f !== id),
        folderId: undefined,
      }));
    if (activeFolderId === id) setActiveFolderId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setActiveFolderId}
        onAddFolder={addFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <main className="flex-1 overflow-y-auto relative bg-white">
        {/* Show skeleton until localStorage is hydrated to avoid flicker */}
        {!mounted ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-neutral-200 select-none">Loading…</span>
          </div>
        ) : (
          <Grid
            tiles={visibleTiles}
            folders={folders}
            onEditTile={setEditingTileId}
            onUpdateTile={updateTile}
            modalOpen={isModalOpen}
          />
        )}

        <DragDropOverlay
          folders={folders}
          activeFolderId={activeFolderId}
          onAddTile={addTile}
        />

        {/* Floating add button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md hover:bg-neutral-700 transition-colors z-40"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          aria-label="Add tile"
        >
          <Plus size={18} strokeWidth={2} />
        </motion.button>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <AddTileModal
            folders={folders}
            activeFolderId={activeFolderId}
            onAdd={addTile}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingTile && (
          <EditTileModal
            tile={editingTile}
            folders={folders}
            onUpdate={patch => updateTile(editingTile.id, patch)}
            onDelete={() => deleteTile(editingTile.id)}
            onClose={() => setEditingTileId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
