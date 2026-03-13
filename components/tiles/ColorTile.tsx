interface ColorTileProps {
  color: string;
}

export default function ColorTile({ color }: ColorTileProps) {
  return (
    <div
      className="w-full h-44"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
