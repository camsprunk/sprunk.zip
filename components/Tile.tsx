'use client';
import { useState, useRef } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { Tile as TileData } from '@/lib/types';
import UrlTile from './tiles/UrlTile';
import ImageTile from './tiles/ImageTile';
import ColorTile from './tiles/ColorTile';
import TextTile from './tiles/TextTile';
import TweetTile from './tiles/TweetTile';

interface TileProps {
  tile: TileData;
  onEdit: () => void;
  onUpdateCopy: (copy: string) => void;
}

function getTileLabel(tile: TileData): string {
  if (tile.copy) return tile.copy;
  if (tile.type === 'url') return tile.title ?? tile.url ?? '';
  if (tile.type === 'color') return tile.color ?? '';
  if (tile.type === 'text') return tile.text?.split('\n')[0]?.slice(0, 60) ?? '';
  if (tile.type === 'image') return 'Image';
  if (tile.type === 'tweet') return 'Tweet';
  return '';
}

export default function Tile({ tile, onEdit, onUpdateCopy }: TileProps) {
  const label = getTileLabel(tile);
  const [editingLabel, setEditingLabel] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(tile.copy);
    setEditingLabel(true);
    // focus happens via autoFocus
  };

  const commitEdit = () => {
    onUpdateCopy(draft);
    setEditingLabel(false);
  };

  return (
    <div className="group">
      {/* Content */}
      <div className="overflow-hidden bg-white transition-shadow duration-200 group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        {tile.type === 'url' && (
          <UrlTile
            url={tile.url!}
            screenshotUrl={tile.screenshotUrl}
            title={tile.title}
            favicon={tile.favicon}
          />
        )}
        {tile.type === 'image' && <ImageTile imageData={tile.imageData!} />}
        {tile.type === 'color' && <ColorTile color={tile.color!} />}
        {tile.type === 'text' && <TextTile text={tile.text!} />}
        {tile.type === 'tweet' && (
          <TweetTile tweetHtml={tile.tweetHtml!} tweetUrl={tile.tweetUrl} />
        )}
      </div>

      {/* Label below tile */}
      <div className="flex items-start gap-1.5 pt-1.5 px-0.5 min-h-[24px]">
        <div className="flex-1 min-w-0">
          {editingLabel ? (
            <input
              ref={inputRef}
              autoFocus
              className="w-full text-xs text-neutral-600 bg-transparent border-b border-neutral-300 focus:outline-none leading-snug py-0"
              value={draft}
              placeholder="Add a title…"
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') setEditingLabel(false);
              }}
            />
          ) : (
            <p
              className="text-[12px] text-neutral-400 leading-snug truncate cursor-text hover:text-neutral-600 transition-colors"
              onClick={startEdit}
            >
              {label || <span className="text-neutral-200">Add a title…</span>}
            </p>
          )}
          {tile.tags.length > 0 && !editingLabel && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {tile.tags.map(tag => (
                <span key={tag} className="text-[10px] text-neutral-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3-dot menu */}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-300 hover:text-neutral-600 flex-shrink-0 mt-0.5"
          onClick={onEdit}
          title="More options"
        >
          <MoreHorizontal size={13} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
