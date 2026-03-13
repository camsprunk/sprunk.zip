'use client';
import { motion } from 'motion/react';
import type { Tile as TileData, Folder } from '@/lib/types';
import Tile from './Tile';

interface GridProps {
  tiles: TileData[];
  folders: Folder[];
  onEditTile: (id: string) => void;
  onUpdateTile: (id: string, patch: Partial<TileData>) => void;
  modalOpen?: boolean;
}

export default function Grid({ tiles, onEditTile, onUpdateTile, modalOpen }: GridProps) {
  if (tiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 select-none pointer-events-none">
        <p className={`text-sm text-neutral-200 transition-opacity duration-150 ${modalOpen ? 'opacity-0' : 'opacity-100'}`}>Drop anything here, or press +</p>
      </div>
    );
  }

  return (
    <div
      style={{
        columns: '260px',
        columnGap: '6px',
        padding: '6px',
      }}
    >
      {tiles.map(tile => (
        <motion.div
          key={tile.id}
          style={{ breakInside: 'avoid', marginBottom: '6px', display: 'block' }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Tile
            tile={tile}
            onEdit={() => onEditTile(tile.id)}
            onUpdateCopy={copy => onUpdateTile(tile.id, { copy })}
          />
        </motion.div>
      ))}
    </div>
  );
}
