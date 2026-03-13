export type TileType = 'url' | 'image' | 'color' | 'text' | 'tweet';

export interface Tile {
  id: string;
  type: TileType;
  createdAt: string;
  folderId?: string;     // legacy field — kept for migration
  folderIds?: string[];
  tags: string[];
  copy: string;
  // url tile
  url?: string;
  screenshotUrl?: string;
  title?: string;
  favicon?: string;
  // image tile (base64 data URL — persists across sessions unlike blob URLs)
  imageData?: string;
  // color tile
  color?: string;
  // text tile
  text?: string;
  // tweet tile
  tweetUrl?: string;
  tweetHtml?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppState {
  tiles: Tile[];
  folders: Folder[];
}
