interface TextTileProps {
  text: string;
}

export default function TextTile({ text }: TextTileProps) {
  return (
    <div className="p-4 min-h-[160px] text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
      {text}
    </div>
  );
}
