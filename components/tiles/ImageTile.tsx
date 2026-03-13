interface ImageTileProps {
  imageData: string;
}

export default function ImageTile({ imageData }: ImageTileProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageData}
      alt="Image tile"
      className="w-full object-cover"
      loading="lazy"
    />
  );
}
